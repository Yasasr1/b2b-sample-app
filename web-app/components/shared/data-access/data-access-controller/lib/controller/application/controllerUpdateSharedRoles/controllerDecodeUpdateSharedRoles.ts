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

import { commonControllerDecode } from "@teamspace-app/shared/data-access/data-access-common-api-util";
import { Session } from "next-auth";
import { controllerCallUpdateSharedRoles } from "./controllerCallUpdateSharedRoles";
import { PatchBody, RoleValue } from "@teamspace-app/shared/data-access/data-access-common-models-util";
import { PatchMethod } from "@teamspace-app/shared/util/util-common";

export function getSharedRoleAddBody(applicationId: string, patchMethod: PatchMethod, organizationId: string, roles: RoleValue[] | RoleValue): PatchBody {


    const patchBody: any = {
        "applicationId": applicationId,
        "Operations": [
            {
                "op": patchMethod.toLowerCase(),
                "path": `organizations[orgId eq \"${organizationId}\"].roles`,
                "value": roles
            }
        ]
    };

    return patchBody as PatchBody;
}


export function getSharedRoleRemoveBody(applicationId: string, patchMethod: PatchMethod, organizationId: string, roles: RoleValue[] | RoleValue ): PatchBody {
    
    return {
        "applicationId": applicationId,
        "Operations": [
            {
                "op": patchMethod.toLowerCase(),
                "path": `organizations[orgId eq ${organizationId}].roles`,
                "value": roles
            }
        ]
    };
}

export function getSharedRolePatchBody(applicationId: string, patchMethod: PatchMethod, organizationId: string, roles: RoleValue[] | RoleValue) {
   
    switch (patchMethod) {
        case PatchMethod.ADD:
            return getSharedRoleAddBody(applicationId, patchMethod, organizationId, roles);
        case PatchMethod.REMOVE:
            return getSharedRoleRemoveBody(applicationId, patchMethod, organizationId, roles);
        default:
            return;
    }
}

/**
 * 
 * @param session - session object
 * @param applicationId - application id
 * @param patchMethod - patch method to be used
 * @param organizationId - organization id
 * @param roles - roles to be updated
 * 
 * @returns API response for updating shared roles
 */
export async function controllerDecodeUpdateSharedRoles(session: Session, applicationId: string, patchMethod: PatchMethod, organizationId: string, roles: RoleValue[] | RoleValue): Promise<any | null> {

    const patchBody: PatchBody = (getSharedRolePatchBody(applicationId, patchMethod, organizationId, roles) as PatchBody);
    console.log(patchBody);

    const res = (
        await commonControllerDecode(() => controllerCallUpdateSharedRoles(session, patchBody), null) as any | null);

    return res;

}
