import React from 'react';
import {Modal, Button} from "react-bootstrap";

import PopupButton from './_Button';

class ValidationErrorOccured extends React.Component {

    onSubmit = (event) => {
        event.preventDefault();

        this.props.onConfirm && this.props.onConfirm();
        this.props.onHide();

        return false;
    };

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Validation Error Occured</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-validation-error">
                    <p>
                        Data in the following parent nodes is forbidden:
                        <span className="text-bold"> CapEX</span>
                    </p>

                    <div className="block-link">
                        <span className="icon-info-btn"></span>
                        <a href="#" className="dashed-link">Report to Support</a>
                    </div>

                    <div className="modal-buttons">
                        <Button bsStyle="primary" type="submit">Back to Edit Hierarchy</Button>
                    </div>
                </Modal.Body>
            </Modal>
        );
    };
}

class ValidationErrorOccuredButton extends PopupButton {

    formComponent = ValidationErrorOccured;

    getButton () {
        return (
            <Button className="btn-dark" onClick={this.onOpen}>
                ValidationErrorOccured
            </Button>
        );
    };

}

export default ValidationErrorOccuredButton;
