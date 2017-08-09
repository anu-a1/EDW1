import React from 'react';
import {Modal, Button} from "react-bootstrap";
import _ from 'lodash';

export default class ValidationErrorOccurred extends React.Component {

    onSubmit = (event) => {
        event.preventDefault();

        this.props.onConfirm && this.props.onConfirm();
        this.props.onHide();

        return false;
    };

    render() {
        const {validationError} = this.props;
        return (
            <Modal show={this.props.show} onHide={this.props.onHide}
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Validation Error Occured</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-validation-error">
                    <p>
                        {_.map((validationError || '').split('\n'), (item, key) => {
                            return <span key={key}>{item}<br/></span>
                        })}
                        {/*Data in the following parent nodes is forbidden:
                        <span className="text-bold"> CapEX</span>*/}
                    </p>

                    <div className="block-link">
                        <span className="icon-info-btn"/>
                        <a href="#" className="dashed-link">Report to Support</a>
                    </div>

                    <div className="modal-buttons">
                        <Button bsStyle="primary"
                                type="submit"
                                onClick={this.props.onHide}
                            >Back to Edit Hierarchy</Button>
                    </div>
                </Modal.Body>
            </Modal>
        );
    };
}
