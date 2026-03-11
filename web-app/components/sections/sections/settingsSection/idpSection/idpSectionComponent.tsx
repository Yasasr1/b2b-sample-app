/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
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

import {
    ApplicationList,
    IdentityProvider,
    IdentityProviderTemplate,
    StandardBasedOidcIdentityProvider,
    StandardBasedSAMLIdentityProvider
} from "@teamspace-app/data-access-common-models-util";
import {
    controllerDecodeListAllIdentityProviders,
    controllerDecodeListCurrentApplicationInRoot
} from "@teamspace-app/data-access-controller";
import {
    EmptySettingsComponent, SettingsTitleComponent, errorTypeDialog, successTypeDialog
} from "@teamspace-app/shared/ui/ui-components";
import AppSelectIcon from "@rsuite/icons/AppSelect";
import { Session } from "next-auth";
import { useCallback, useEffect, useState } from "react";
import { Button, Container, Modal, useToaster } from "rsuite";
import IdentityProviderList from "./otherComponents/identityProviderList";
import IdpCreate from "./otherComponents/idpCreateModal/idpCreate";
import SelectIdentityProvider from "./otherComponents/selectIdentityProvider";
import { checkIfJSONisEmpty, PatchMethod } from "@teamspace-app/shared/util/util-common";
import { LOADING_DISPLAY_NONE } from "@teamspace-app/shared/util/util-front-end-util";
import { signout } from "@teamspace-app/util-authorization-config-util";
import { upgradeTier } from "pages/api/upgrade";

interface IdpSectionComponentProps {
    session: Session
}

/**
 *
 * @param prop - session
 *
 * @returns The idp interface section.
 */
export default function IdpSectionComponent(props: IdpSectionComponentProps) {

    const { session } = props;

    const toaster = useToaster();

    const [ idpList, setIdpList ] = useState<IdentityProvider[]>([]);
    const [ openSelectModal, setOpenSelectModal ] = useState<boolean>(false);
    const [ selectedTemplate, setSelectedTemplate ] = useState<IdentityProviderTemplate>(undefined);
    const [ loadingDisplay, setLoadingDisplay ] = useState(LOADING_DISPLAY_NONE);
    const [ allApplications, setAllApplications ] = useState<ApplicationList>(null);
    const [ showUpgradeModal, setShowUpgradeModal ] = useState(false);
    const [ applicationId, setApplicationId] = useState<string>("");


    const templates: IdentityProviderTemplate[] = [
        StandardBasedOidcIdentityProvider,
        StandardBasedSAMLIdentityProvider
    ];

    const fetchAllIdPs = useCallback(async () => {

        const res = await controllerDecodeListAllIdentityProviders(session);

        if (res) {
            setIdpList(res);
        } else {
            setIdpList([]);
        }

    }, [ session ]);

    useEffect(() => {
        fetchAllIdPs();
    }, [ fetchAllIdPs ]);


    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res: ApplicationList = (await controllerDecodeListCurrentApplicationInRoot(session) as ApplicationList);
                console.log("Applications fetched:", res);
                await setAllApplications(res);
            } catch (error) {
                console.error("Error fetching applications:", error);
            }
        };

        fetchApplications();
    }, [session]);

    useEffect(() => {
        const fetchApplicationId = async () => {
            try {
                if (!checkIfJSONisEmpty(allApplications) && allApplications.totalResults !== 0) {
                    const appId = allApplications.applications[0]?.id;
                    if (appId) {
                        await setApplicationId(appId);
                        console.log("Application ID fetched:", appId);
                    } else {
                        console.error("Application ID is undefined.");
                    }
                } else {
                    console.error("No applications found or applications array is empty.");
                }
            } catch (error) {
                console.error("Error fetching application ID:", error);
            }
        };

        fetchApplicationId();
    }, [allApplications]);

    const signOutCallback = (): void => {
        signout(session);
    };

    const onAddIdentityProviderClick = (): void => {
        setOpenSelectModal(true);
    };

    const onTemplateSelect = (template: IdentityProviderTemplate): void => {
        setOpenSelectModal(false);
        setSelectedTemplate(template);
    };

    const onSelectIdpModalClose = (): void => {
        setOpenSelectModal(false);
    };

    const onCreationDismiss = (): void => {
        setSelectedTemplate(undefined);
    };

    const onIdpCreated = (response: IdentityProvider): void => {
        if (response) {
            successTypeDialog(toaster, "Success", "Identity Provider Created Successfully");

            setIdpList([
                ...idpList,
                response
            ]);

            setOpenSelectModal(false);
            setSelectedTemplate(undefined);
        } else {
            errorTypeDialog(toaster, "Error Occured", "Error occured while creating the identity provider. Try again.");
        }
    };

        const onEnterpriseTierUpgrade = async (): Promise<void> => {
            await upgradeTier(
                session,
                applicationId,
                session.orgId,
                "Enterprise", // Specify the tier
                toaster,
                setShowUpgradeModal,
                setLoadingDisplay
            );
        };

    // Check if the session has the required scope
    const hasIdpCreationScope = session?.scope?.includes("internal_org_idp_create");


    return (
        <Container>
            {hasIdpCreationScope ? (
                <>
                    {/* Identity Provider Management View */}
                    {idpList?.length === 0 ? (
                        <SettingsTitleComponent
                            title="Identity Providers"
                            subtitle="Manage identity providers to allow users to log in to your application through them."
                        />
                    ) : (
                        <SettingsTitleComponent
                            title="Identity Providers"
                            subtitle="Manage identity providers to allow users to log in to your application through them."
                        >
                            <Button
                                appearance="default"
                                onClick={onAddIdentityProviderClick}
                                size="md"
                                style={{ marginTop: "12px" }}
                            >
                                {"+ Identity Provider"}
                            </Button>
                        </SettingsTitleComponent>
                    )}

                    {idpList ? (
                        idpList.length === 0 ? (
                            <EmptySettingsComponent
                                bodyString="There are no identity providers available at the moment."
                                buttonString="Add Identity Provider"
                                icon={<AppSelectIcon style={{ opacity: 0.2 }} width="150px" height="150px" />}
                                onAddButtonClick={onAddIdentityProviderClick}
                            />
                        ) : (
                            <IdentityProviderList
                                fetchAllIdPs={fetchAllIdPs}
                                idpList={idpList}
                                session={session}
                            />
                        )
                    ) : null}

                    {openSelectModal && (
                        <SelectIdentityProvider
                            templates={templates}
                            onClose={onSelectIdpModalClose}
                            openModal={openSelectModal}
                            onTemplateSelected={onTemplateSelect}
                        />
                    )}
                    {selectedTemplate && (
                        <IdpCreate
                            session={session}
                            onIdpCreate={onIdpCreated}
                            onCancel={onCreationDismiss}
                            openModal={!!selectedTemplate}
                            template={selectedTemplate}
                            orgId={session.orgId}
                        />
                    )}
                </>
            ) : (
                <>
                    {/* Upgrade Now Card for Enterprise Plan */}
                    <SettingsTitleComponent
                        title="Identity Providers"
                        subtitle="Manage identity providers to allow users to log in to your application through them."
                    />
                    <div
                        style={{
                            margin: "20px 0",
                            padding: "10px",
                            backgroundColor: "#d9d9d9",
                            borderRadius: "5px",
                            textAlign: "center",
                            color: "#272c36",
                        }}
                    >
                        <p>To bring your identity provider, upgrade your plan.</p>
                    </div>
                    <div style={{ marginBottom: "30px" }}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "20px",
                                padding: "20px",
                                backgroundColor: "#f9f9f9",
                                borderRadius: "10px",
                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            {/* Enterprise Plan */}
                            <div
                                style={{
                                    flex: 1,
                                    textAlign: "center",
                                    padding: "20px",
                                    border: "1px solid #ddd",
                                    borderRadius: "10px",
                                    backgroundColor: "#fff",
                                }}
                            >
                                <h3>Enterprise Plan</h3>
                                <p
                                    style={{
                                        fontSize: "24px",
                                        fontWeight: "bold",
                                        margin: "10px 0",
                                    }}
                                >
                                    $9/user/mo
                                </p>
                                <p>
                                    Identity Providers: <strong>Advanced</strong>
                                </p>
                                <br></br>
                                <Button
                                    appearance="default"
                                    onClick={ onEnterpriseTierUpgrade }
                                >
                                    Upgrade Now
                                </Button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Modal for Upgrade Success */}
            <Modal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} size="sm">
                <Modal.Header>
                    <Modal.Title>Plan Upgrade Successful</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Your subscription plan has been successfully upgraded.</p>
                    <p>The new subscription cost will be reflected in your next billing cycle.</p>
                    <p>Please log out and log back in to apply the changes to your account.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        appearance="default"
                        onClick={ signOutCallback } // Trigger the sign-out functionality
                    >
                        Re-login
                    </Button>
                    <Button
                        appearance="ghost"
                        onClick={() => setShowUpgradeModal(false)} // Close the modal
                    >
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );

}
