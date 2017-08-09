import React from 'react';
import {Modal, Button} from "react-bootstrap";

export default class ConfirmAndLock extends React.Component {

    onSubmit = (event) => {
        event.preventDefault();

        this.props.onHide();
        this.props.onConfirm && this.props.onConfirm();

        return false;
    };

    render() {
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Edit Hierarchy?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        To procceed with this action the hierarchy should be locked.
                    </p>
                    <form
                        onSubmit={this.onSubmit}
                        ref={(el) => { this.formRef = el; }}>

                        <div className="modal-buttons">
                            <Button onClick={this.props.onHide}>Cancel</Button>
                            <Button bsStyle="primary" type="submit">Lock &amp; Edit</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        );
    };
}
