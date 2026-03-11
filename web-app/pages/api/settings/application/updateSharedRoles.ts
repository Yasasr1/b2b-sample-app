/**
 * Copyright (c) 2025, WSO2 LLC. (https://www.wso2.com).
 *
 * WSO2 LLC. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
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

import { dataNotRecievedError, notPostError } 
    from "@teamspace-app/shared/data-access/data-access-common-api-util";
import { NextApiRequest, NextApiResponse } from "next";
import getToken from "../../clientCredentials";
import { getConfig } from "@teamspace-app/util-application-config-util";

/**
 * backend API call to update shared roles for an shared application
 * 
 * @param req - request
 * @param res - response
 * 
 * @returns success message if the call is successful, else an error message
 */
export default async function updateSharedRoles(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        notPostError(res);
        return;
    }

    try {
        const tokenData = await getToken();
        const rootAccessToken = tokenData.access_token;
        const body = JSON.parse(req.body);
        const patchBody = body.param;

        const fetchData = await fetch(`${getConfig().CommonConfig.AuthorizationConfig.BaseOrganizationUrl}/api/server/v1/applications/share`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${rootAccessToken}`
                },
                body: JSON.stringify(patchBody)
            }
        );

        if (!fetchData.ok) {
            const data = await fetchData.json();  
            console.error("Error updating shared roles:", data);
            throw new Error(`Failed to update shared roles: ${fetchData.statusText}`);
        }

        const data = await fetchData.json();
        res.status(202).json(data);
    } catch (err) {
        console.error("Error updating shared roles:", err);
        return dataNotRecievedError(res);
    }
}
