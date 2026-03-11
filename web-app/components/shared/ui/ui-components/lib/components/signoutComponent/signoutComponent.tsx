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

import { LOADING_DISPLAY_BLOCK, LOADING_DISPLAY_NONE } from "@teamspace-app/shared/util/util-front-end-util";
import React, { useState } from "react";
import { Button, Loader, Modal } from "rsuite";
import { SignOutComponentProps } from "../../models/signoutComponent/signoutComponent";

export function SignOutComponent(prop: SignOutComponentProps) {
    const { open, onClose, signOutCallback } = prop;

    const [ loadingDisplay, setLoadingDisplay ] = useState(LOADING_DISPLAY_NONE);

    const signOut = async () => {

        setLoadingDisplay(LOADING_DISPLAY_BLOCK);

        signOutCallback();
    };

    return (
        <Modal backdrop="static" role="alertdialog" open={ open } onClose={ onClose } size="sm">
            <Modal.Header>
                <Modal.Title>
                    <b>You are about to logout</b>
                    <br />
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to logout, from your account ?</Modal.Body>
            <Modal.Footer>
                <Button
                    size="lg"
                    appearance="default"
                    type="submit"
                    onClick={ signOut }>
                    Submit
                </Button>
                <Button
                    size="lg"
                    appearance="ghost"
                    type="button"
                    onClick={ onClose }
                >Cancel
                </Button>
            </Modal.Footer>

            <div style={ loadingDisplay }>
                <Loader size="lg" backdrop content="User is logging out" vertical />
            </div>
        </Modal>
    );
}

export default SignOutComponent;
