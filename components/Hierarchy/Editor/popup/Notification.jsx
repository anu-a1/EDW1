import React from 'react';
import {Modal, Button} from "react-bootstrap";

export default ({show, onHide, message, title}) => {
    return (
        <Modal show={show} onHide={onHide}
               aria-labelledby="contained-modal-title-lg">
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-lg">{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-validation-error">
                <p>{message}</p>
                <div className="modal-buttons">
                    <Button onClick={onHide}>Ok</Button>
                </div>
            </Modal.Body>
        </Modal>
    );
}
