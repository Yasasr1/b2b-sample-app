/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
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

import { controllerDecodeListAllRoles, controllerDecodePatchRole, controllerDecodeUpdateSharedRoles } from "@teamspace-app/data-access-controller";
import { errorTypeDialog } from "@teamspace-app/shared/ui/ui-components";
import { PatchMethod } from "@teamspace-app/shared/util/util-common";
import { LOADING_DISPLAY_BLOCK, LOADING_DISPLAY_NONE } from "@teamspace-app/shared/util/util-front-end-util";
import { getConfig } from "@teamspace-app/util-application-config-util";
import { Session } from "next-auth";
import type { Dispatch, SetStateAction } from "react";

export const upgradeTier = async (
    session: Session,
    applicationId: string,
    organizationId: string,
    tier: "Business" | "Enterprise", // Tier type
    toaster: any,
    setShowUpgradeModal: (show: boolean) => void,
    setLoadingDisplay?: Dispatch<SetStateAction<{ display: string }>>
): Promise<void> => {
    if (setLoadingDisplay) setLoadingDisplay({ display: LOADING_DISPLAY_BLOCK.display });

    // Determine roles based on the tier
    const roles =
        tier === "Business"
            ? [
                  {
                      displayName: process.env.NEXT_PUBLIC_BASIC_BRANDING_CONFIG_EDITOR_ROLE_NAME,
                      audience: {
                          display: getConfig().BusinessAdminAppConfig.ManagementAPIConfig.SharedApplicationName,
                          type: "application"
                      }
                  }
              ]
            : [
                  {
                      displayName: process.env.NEXT_PUBLIC_IDP_MANAGER_ROLE_NAME,
                      audience: {
                          display: getConfig().BusinessAdminAppConfig.ManagementAPIConfig.SharedApplicationName,
                          type: "application"
                      }
                  },
                  {
                      displayName: process.env.NEXT_PUBLIC_ADVANCED_BRANDING_CONFIG_EDITOR_ROLE_NAME,
                      audience: {
                          display: getConfig().BusinessAdminAppConfig.ManagementAPIConfig.SharedApplicationName,
                          type: "application"
                      }
                  }
              ];

    try {
        // Step 1: Update shared roles
        await controllerDecodeUpdateSharedRoles(session, applicationId, PatchMethod.ADD, organizationId, roles);

        // Step 2: Retry to get the role IDs for the roles
        const maxRetries = 5; // Maximum number of retries
        const retryInterval = 2000; // Time between retries in milliseconds
        let retries = 0;
        let roleIds: string[] = [];

        while (retries < maxRetries) {
            console.log(`Retrying to fetch roles... Attempt ${retries + 1}`);
            const allRoles = await controllerDecodeListAllRoles(session);

            if (!allRoles) {
                console.warn("Failed to fetch roles. Retrying...");
                retries++;
                await new Promise(resolve => setTimeout(resolve, retryInterval)); // Wait before retrying
                continue;
            }

            // Find the IDs for the roles
            roleIds = roles.map(role => {
                const foundRole = allRoles.find(r => r.displayName === role.displayName);
                return foundRole ? foundRole.id : null;
            }).filter(id => id !== null);

            if (roleIds.length === roles.length) {
                break; // All role IDs found, exit the loop
            }

            retries++;
            await new Promise(resolve => setTimeout(resolve, retryInterval)); // Wait before retrying
        }

        if (roleIds.length !== roles.length) {
            throw new Error("Not all roles were found after retries");
        }

        console.log("Role IDs fetched:", roleIds);

        // Step 3: Assign the logged-in user to each role
        for (const roleId of roleIds) {
            const path = "users";
            const value = session.userId;

            await controllerDecodePatchRole(session, roleId, PatchMethod.ADD, path, value);
            console.log(`User ${session.userId} assigned to role ${roleId}`);
        }

        // Show success modal
        setShowUpgradeModal(true);
    } catch (error) {
        console.error(`Error while upgrading ${tier} Plan`, error);
        errorTypeDialog(toaster, "Error Occurred", `Failed to upgrade to ${tier} Plan.`);
    } finally {
        if (setLoadingDisplay) setLoadingDisplay({ display: LOADING_DISPLAY_NONE.display });
    }
};
