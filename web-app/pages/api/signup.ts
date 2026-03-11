/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import type { NextApiRequest, NextApiResponse } from "next";
import { notPostError } from "@teamspace-app/shared/data-access/data-access-common-api-util";
import getToken from "./clientCredentials";
import validateOrgName from "./createTeam/checkName";
import { getConfig } from "@teamspace-app/util-application-config-util";
import createOrg from "./createTeam/addTeam";
import listCurrentApplication from "./settings/application/listCurrentApplication";
import getRole from "./settings/role/getRole";
import switchOrg from "./settings/switchOrg";
import pollForDefaultUserstore from "./helpers/pollUserstore";
import pollForUserCreation from "./helpers/pollUser";
import pollforRolePatching from "./helpers/pollRolePatch";
import listCurrentApplicationInRoot from "./settings/application/listCurrentApplicationInRoot";
import updateSharedRoles from "./settings/application/updateSharedRoles";

/**
 * Helper function to delete an organization (for rollback)
 *
 * @param accessToken - Access token with permissions to delete organizations
 * @param orgId - ID of the organization to delete
 * @returns Promise<boolean> - True if deletion was successful
 */
async function rollbackOrganization(accessToken: string, orgId: string): Promise<boolean> {
  try {

    const response = await fetch(
      `${getConfig().CommonConfig.AuthorizationConfig.BaseOrganizationUrl}/api/server/v1/organizations/${orgId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json"
        }
      }
    );

    const success = response.status === 204 || response.status === 400 || response.ok;

    if (success) {
      console.log("Successfully rolled back organization");
    } else {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: response.statusText };
      }
      console.error(`Failed to roll back organization: ${orgId}`, errorData);
    }

    return success;
  } catch (error) {
    console.error(`Exception during organization rollback for ${orgId}:`, error);
    return false;
  }
}

/**
 * Signup handler to onboard user and team.
 *
 * @param req - request containing user and team details
 * @param res - response
 *
 * @returns success or error response
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return notPostError(res);
  }

  const {
    firstName,
    lastName,
    username,
    email,
    password,
    organizationName,
    orgHandle,
    appName,
    subscription,
    addons,
  } = req.body;

  if (!firstName || !lastName || !username || !email || !password || !organizationName) {
    return res.status(400).json({
      error:
        "All fields are required: Username, Email, Password, First Name, Last Name and Team Name",
    });
  }

  try {
    // Step 1: Get access token
    const tokenData = await getToken();
    const rootAccessToken = tokenData.access_token;

    // Step 2: Validate organization name
    const mockReq = {
      method: "POST",
      body: JSON.stringify({ name: organizationName, accessToken: rootAccessToken }),
    } as unknown as NextApiRequest;

    const mockRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    } as unknown as any;

    await validateOrgName(mockReq, mockRes);

    if (mockRes.statusCode !== 200) {
      return res.status(400).json({
        error: "Organization name validation failed",
        details: mockRes.data,
      });
    }

    // Step 3: Create organization
    const createOrgReq = {
      method: "POST",
      body: JSON.stringify({ name: organizationName, orgHandle, accessToken: rootAccessToken }),
    } as unknown as NextApiRequest;

    const createOrgRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    } as unknown as any;

    await createOrg(createOrgReq, createOrgRes);

    if (createOrgRes.statusCode !== 201) {
      return res.status(createOrgRes.statusCode).json(createOrgRes.data);
    }

    const orgData = createOrgRes.data;
    const orgId = orgData.id;

    // Step 4: Switch to the newly created organization to get a token for that org.
    const switchOrgReq = {
      method: "POST",
      body: JSON.stringify({ subOrgId: orgId, param: rootAccessToken }),
    } as unknown as NextApiRequest;

    const switchOrgRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    } as unknown as any;

    await switchOrg(switchOrgReq, switchOrgRes);

    if (switchOrgRes.statusCode !== 200) {

      if (rootAccessToken && orgId) {
        await rollbackOrganization(rootAccessToken, orgId);
      }

      return res.status(switchOrgRes.statusCode).json({
        error: "Failed to switch to the new organization",
        details: switchOrgRes.data,
        message: "Sign up failed. Please try again.",
      });
    }

    const accessToken = switchOrgRes.data.access_token;

    // Step 5: Check for DEFAULT userstore
    const userstoreName = getConfig().BusinessAdminAppConfig.ManagementAPIConfig.UserStore;
    if (userstoreName === "DEFAULT") {

      const defaultUserstoreExists = await pollForDefaultUserstore(
        accessToken,
        orgId
      );

      if (!defaultUserstoreExists) {

        if (rootAccessToken && orgId) {
          await rollbackOrganization(rootAccessToken, orgId);
        }

        return res.status(408).json({
          error: "Timed out waiting for DEFAULT userstore to be provisioned",
          message:
            "Sign up failed. Please try again.",
        });
      }
    }

    // Step 6: Create user.
    const { success, data, status } = await pollForUserCreation(
      accessToken,
      orgId,
      firstName,
      lastName,
      username,
      email,
      password
    );

    if (!success) {

      if (rootAccessToken && orgId) {
        await rollbackOrganization(rootAccessToken, orgId);
      }

      return res.status(status).json({ error: data.error || "Sign up failed. Please try again." });
    }

    const userData = data;
    const userId = data?.id;

    // Step 7: Get application ID
    const appReq = {
      method: "POST",
      body: JSON.stringify({ accessToken, orgId }),
      query: { appName },
    } as unknown as NextApiRequest;

    const appRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    } as unknown as any;

    await listCurrentApplication(appReq, appRes);

    if (
      appRes.statusCode !== 200 ||
      !appRes.data.applications ||
      appRes.data.applications.length === 0
    ) {

      if (rootAccessToken && orgId) {
        await rollbackOrganization(rootAccessToken, orgId);
      }

      return res
        .status(404)
        .json({ error: `Sign up failed. Application '${appName}' not found` });
    }

    const appId = appRes.data.applications[0].id;

    // Step 8: Get admin role ID using the app ID as the aud value.
    const adminRoleName = process.env.ADMIN_ROLE_NAME;

    const roleReq = {
      method: "POST",
      body: JSON.stringify({ accessToken }),
      query: {
        orgId,
        adminRoleName,
        roleAudienceValue: appId,
      },
    } as unknown as NextApiRequest;

    const roleRes = {
      status: function (code) {
        this.statusCode = code;
        return this;
      },
      json: function (data) {
        this.data = data;
        return this;
      },
    } as unknown as any;

    // Step 9: Get role ID.
    await getRole(roleReq, roleRes);

    if (
      roleRes.statusCode !== 200 ||
      !roleRes.data.Resources ||
      roleRes.data.Resources.length === 0
    ) {

      if (rootAccessToken && orgId) {
        await rollbackOrganization(rootAccessToken, orgId);
      }

      return res.status(404).json({ error: "Sign up failed. Admin role not found" });
    }

    const roleId = roleRes?.data?.Resources[0]?.id;

    // Step 10: Add user to the admin role.
    const { success: rolePatchSuccess, data: rolePatchData, status: rolePatchstatus } = await pollforRolePatching(
      accessToken,
      roleId,
      userId
    );

    if (!rolePatchSuccess) {

      if (rootAccessToken && orgId) {
        await rollbackOrganization(rootAccessToken, orgId);
      }

      return res.status(rolePatchstatus).json({ error: rolePatchData.error || "Sign up failed. Couldn't add user to Admin role." });
    }

    if (rolePatchstatus !== 200) {

      if (rootAccessToken && orgId) {
        await rollbackOrganization(rootAccessToken, orgId);
      }

      return res.status(rolePatchstatus).json(rolePatchData);
    }

    // Step 11: If subscription is business or enterprise, share additional roles and assign user to them

    // Fetch the root application ID using listCurrentApplicationInRoot
    const rootAppReq = {
      method: "POST",
      query: { appName: appName },
    } as unknown as NextApiRequest;

    const rootAppRes = {
      status: function (code) {
          this.statusCode = code;
          return this;
      },
      json: function (data) {
          this.data = data;
          return this;
      },
    } as unknown as any;

    await listCurrentApplicationInRoot(rootAppReq, rootAppRes);

    if (
      rootAppRes.statusCode !== 200 ||
      !rootAppRes.data.applications ||
      rootAppRes.data.applications.length === 0
    ) {
      if (rootAccessToken && orgId) {
          await rollbackOrganization(rootAccessToken, orgId);
      }

      return res
          .status(404)
          .json({ error: `Sign up failed. Root application not found` });
    }

    const rootAppId = rootAppRes.data.applications[0].id;

    // Handle Business Subscription
    if (subscription === "business") {
      const businessRoles = [
          {
              displayName: process.env.NEXT_PUBLIC_BASIC_BRANDING_CONFIG_EDITOR_ROLE_NAME,
              audience: {
                  display: appName,
                  type: "application"
              }
          }
      ];

      const operations = [
        {
            op: "add",
            path: `organizations[orgId eq \"${orgId}\"].roles`,
            value: businessRoles
        }
      ];

      const shareRolesReq = {
          method: "POST",
          body: JSON.stringify( { param :{
            applicationId: rootAppId,
            Operations: operations
          } })
      } as unknown as NextApiRequest;

      const shareRolesRes = {
          status: function (code) {
              this.statusCode = code;
              return this;
          },
          json: function (data) {
              this.data = data;
              return this;
          }
      } as unknown as NextApiResponse;

      await updateSharedRoles(shareRolesReq, shareRolesRes);

      for (const role of businessRoles) {
        const roleReq = {
          method: "POST",
          body: JSON.stringify({ accessToken }),
          query: {
              orgId,
              roleName: role.displayName,
              roleAudienceValue: appId,
          },
        } as unknown as NextApiRequest;

        const roleRes = {
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.data = data;
                return this;
            },
        } as unknown as any;

        await getRole(roleReq, roleRes);

        if (
          roleRes.statusCode !== 200 ||
          !roleRes.data.Resources ||
          roleRes.data.Resources.length === 0
        ) {
            if (rootAccessToken && orgId) {
                await rollbackOrganization(rootAccessToken, orgId);
            }

            return res.status(404).json({ error: "Sign up failed. Business role not found" });
        }

        const businessRoleId = roleRes?.data?.Resources[0]?.id;

        const { success: rolePatchSuccess, data: rolePatchData, status: rolePatchStatus } = await pollforRolePatching(
          accessToken,
          businessRoleId,
          userId
        );

        if (!rolePatchSuccess) {
            if (rootAccessToken && orgId) {
                await rollbackOrganization(rootAccessToken, orgId);
            }

            return res.status(rolePatchStatus).json({
                error: rolePatchData.error || "Sign up failed. Couldn't add user to Business role.",
            });
        }
      }
    }

    // Handle Enterprise Subscription
    if (subscription === "enterprise") {
      const enterpriseRoles = [
          {
              displayName: process.env.NEXT_PUBLIC_IDP_MANAGER_ROLE_NAME,
              audience: {
                  display: appName,
                  type: "application"
              }
          },
          {
              displayName: process.env.NEXT_PUBLIC_ADVANCED_BRANDING_CONFIG_EDITOR_ROLE_NAME,
              audience: {
                  display: appName,
                  type: "application"
              }
          }
      ];

      const operations = [
        {
            op: "add",
            path: `organizations[orgId eq \"${orgId}\"].roles`,
            value: enterpriseRoles
        }
      ];

      const shareRolesReq = {
          method: "POST",
          body: JSON.stringify({param: {
            applicationId: rootAppId,
            Operations: operations
          }})
      } as unknown as NextApiRequest;

      const shareRolesRes = {
          status: function (code) {
              this.statusCode = code;
              return this;
          },
          json: function (data) {
              this.data = data;
              return this;
          }
      } as unknown as NextApiResponse;

      await updateSharedRoles(shareRolesReq, shareRolesRes);

      for (const role of enterpriseRoles) {
        const roleReq = {
          method: "POST",
          body: JSON.stringify({ accessToken }),
          query: {
              orgId,
              roleName: role.displayName,
              roleAudienceValue: appId,
          },
        } as unknown as NextApiRequest;

        const roleRes = {
            status: function (code) {
                this.statusCode = code;
                return this;
            },
            json: function (data) {
                this.data = data;
                return this;
            },
        } as unknown as any;

        await getRole(roleReq, roleRes);

        if (
          roleRes.statusCode !== 200 ||
          !roleRes.data.Resources ||
          roleRes.data.Resources.length === 0
        ) {
            if (rootAccessToken && orgId) {
                await rollbackOrganization(rootAccessToken, orgId);
            }

            return res.status(404).json({ error: `Sign up failed. Enterprise role  ${role.displayName} is not found` });
        }

        const enterpriseRoleId = roleRes?.data?.Resources[0]?.id;

        const { success: rolePatchSuccess, data: rolePatchData, status: rolePatchStatus } = await pollforRolePatching(
          accessToken,
          enterpriseRoleId,
          userId
        );

        if (!rolePatchSuccess) {
            if (rootAccessToken && orgId) {
                await rollbackOrganization(rootAccessToken, orgId);
            }

            return res.status(rolePatchStatus).json({
                error: rolePatchData.error || "Sign up failed. Couldn't add user to Business role.",
            });
        }
      }
    }

    return res.status(201).json({
      success: true,
      organization: orgData,
      user: userData,
      roleAssignment: rolePatchData,
    });
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
    });
  }
}
