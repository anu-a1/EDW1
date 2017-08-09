import React from 'react';
import {Modal, Button} from "react-bootstrap";

export default class ConfirmDiscardChanges extends React.Component {

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
                    <Modal.Title id="contained-modal-title-lg">Unsaved changes</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-validation-error">

                    <p>You have unsaved changes, are you sure you want to continue?</p>

                    <form onSubmit={this.onSubmit}>
                        <div className="modal-buttons">
                            <Button onClick={this.props.onHide}>Cancel</Button>
                            <Button bsStyle="primary" type="submit">Continue</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        );
    };
}
