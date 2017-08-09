import React from 'react';
import {Button} from "react-bootstrap";

import PopupButton from './_Button';
import ConfirmAndLock from './ConfirmAndLock';

class EditHierarchyButton extends PopupButton {

    formComponent = ConfirmAndLock;

    onEditClick = () => {
        if (this.props.isLocked) {
            this.props.onClick();
        } else {
            this.onOpen();
        }
    };

    getButton () {
        return (
            <Button className="btn-white-huge btn-icon"
                    onClick={this.onEditClick}
                    disabled={this.props.disabled}>
                <span className="icon-edit-big icon"/>
                <br />
                <span className="btn-text">Edit Hierarchy</span>
            </Button>
        );
    };

}

export default EditHierarchyButton;
