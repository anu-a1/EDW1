import React from 'react';
import {Modal, Button} from "react-bootstrap";
import _ from "lodash";

import PopupButton from './_Button';


class RemoveNodes extends React.Component {

    state = {
        srcItems: []
    };

    componentWillMount() {
        const {srcItems} = this.props.getFocusedSource();
        this.setState({srcItems});
    };

    onSubmit = (event) => {
        event.preventDefault();
        this.props.onHide();
        this.props.onConfirm && this.props.onConfirm();
        return false;
    };

    render() {
        const {srcItems} = this.state;

        return (
            <Modal show={this.props.show} onHide={this.props.onHide}
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Remove Node</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-remove-node">
                    <form onSubmit={this.onSubmit}>

                        <p>
                            Are you sure you want to remove:
                            {_.map(srcItems, item => (
                                <span className="text-bold"
                                      key={`delete-${item.id}`}
                                    > {item.name} [{item.code}]</span>
                            ))}
                        </p>

                        <div className="modal-buttons">
                            <Button onClick={this.props.onHide}>Cancel</Button>
                            <Button bsStyle="primary" type="submit">Remove</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        );
    };
}

class RemoveNodesButton extends PopupButton {

    formComponent = RemoveNodes;

    getButton () {
        return (<Button onClick={this.onOpen}
                        className="btn-shadow"
                        disabled={this.props.disabled}
            >Remove</Button>);
    };

}

export default RemoveNodesButton;
