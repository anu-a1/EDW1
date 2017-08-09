import React from 'react';
import {Modal, Button, FormControl, FormGroup, ControlLabel, HelpBlock} from "react-bootstrap";
import _ from "lodash";

import PopupButton from './_Button';


class RenameNodes extends React.Component {

    state = {
        srcItems: [],
        errorIds: {}
    };

    componentWillMount() {
        const {srcItems} = this.props.getFocusedSource();
        this.setState({srcItems});
    };

    onSubmit = (event) => {
        event.preventDefault();
        let newNames = [];
        let errorIds = {};
        let elements = this.formRef.elements.name;
        elements = elements.length ? elements : [elements];

        _.each(elements, element => {
            const item = {
                id: element.dataset.id,
                name: element.value
            };
            if (!item.name) {
                errorIds[item.id] = true;
            }
            newNames.push(item);
        });

        if (_.isEmpty(errorIds)) {
            this.props.onHide();
            this.props.onConfirm && this.props.onConfirm(newNames);
        } else {
            this.setState({errorIds});
        }

        return false;
    };

    render() {
        const {srcItems, errorIds} = this.state;

        return (
            <Modal show={this.props.show} onHide={this.props.onHide}
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Rename Node</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-rename-node">
                    <form
                        onSubmit={this.onSubmit}
                        ref={(el) => { this.formRef = el; }}
                        >

                        {_.map(srcItems, item => (
                            <div key={`edit-${item.id}`}>
                                {/* Name */}
                                <FormGroup controlId="name" validationState={errorIds[item.id] ? 'error' : null}>
                                <ControlLabel>Name</ControlLabel>
                                <FormControl
                                    type="text"
                                    data-id={item.id}
                                    defaultValue={item.name}
                                    placeholder="Type name node" />
                                    <HelpBlock>{null}</HelpBlock>
                                </FormGroup>
                                {/* Code */}
                                <p>Code<span className="text-bold">{item.code}</span></p>
                            </div>
                        ))}

                        <div className="modal-buttons">
                            <Button onClick={this.props.onHide}>Cancel</Button>
                            <Button bsStyle="primary" type="submit">Save</Button>
                        </div>
                    </form>
                </Modal.Body>
            </Modal>
        );
    };
}

class RenameNodesButton extends PopupButton {

    formComponent = RenameNodes;

    getButton () {
        return (<Button onClick={this.onOpen}
                        className="btn-shadow"
                        disabled={this.props.disabled}
            >Rename</Button>);
    };

}

export default RenameNodesButton;
