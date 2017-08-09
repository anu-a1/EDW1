import React from 'react';
import {Modal, Button} from "react-bootstrap";
import _ from 'lodash';
import Checkbox from '../../../utils/Fields/FormCheckbox';
import PopupButton from './_Button';

class ColumnSetup extends React.Component {

    state = {
        showedColumns: this.props.showedColumns
    };

    onTableToggleRow = item => e => {
        const {showedColumns} = this.state;

        let showed = null;

        if (showedColumns[item.id]) {
            showed = _.omit(showedColumns, item.id);
        } else {
            showed = {
                ...showedColumns,
                [item.id]: item.name
            };
        }

        this.setState({showedColumns: showed});
    };

    onSubmit = (event) => {
        event.preventDefault();
        this.props.onSave && this.props.onSave(this.state.showedColumns);
        this.props.onHide();
        return false;
    };

    render() {
        const {showedColumns} = this.state;
        return (
            <Modal show={this.props.show}
                   onHide={this.props.onHide}
                   aria-labelledby="contained-modal-title-lg">
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-lg">Column Setup</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Show attributes for:</p>
                    {
                        this.props.hierarchyAttributes.map((item, index) => {
                            return (
                                <div key={item.id}>
                                    <Checkbox labelValue={item.name}
                                              defaultValue={!!showedColumns[item.id]}
                                              onChange={this.onTableToggleRow(item)}
                                              id={`${item.name}-${index}`}
                                              name="grid-columns-setup"/>
                                </div>
                            )
                        })
                    }
                    <div className="modal-buttons">
                        <Button onClick={this.props.onHide}>Cancel</Button>
                        <Button bsStyle="primary"
                                onClick={this.onSubmit}>Save</Button>
                    </div>
                </Modal.Body>
            </Modal>
        );
    };
}

class ColumnSetupButton extends PopupButton {

    formComponent = ColumnSetup;

    getButton () {
        return (
            <Button className="btn-dark btn-grid-settings"
                    disabled={this.props.disabled}
                    onClick={this.onOpen}>
                <span className="icon-gear"/>
            </Button>
        );
    };

}

export default ColumnSetupButton;
