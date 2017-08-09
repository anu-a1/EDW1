import React from 'react';
import {Button, FormControl} from "react-bootstrap";
import Select from '../../../components/utils/Fields/Select';
import PropTypes from 'prop-types';

const AttributeRow = ({attributeId, onRowAdd, onRowDelete, options, isAddHidden, onAttrSelect, ...props}) => {
    return (
        <div className="panel-edit-search-row">
            <Select name="attrHierarchySelect"
                    placeholder="Select Attribute"
                    value={attributeId}
                    options={options.map(attribute => ({
                        value: attribute.id,
                        label: attribute.name
                    }))}
                    onChange={onAttrSelect}
            />
            <FormControl
                value={props.query}
                type="text"
                onChange={props.onSearchQueryChange}
                placeholder="Searching for..."/>
            <Button className="btn-clear"
                    disabled={props.attributesNames.length <= 1}
                    onClick={onRowDelete}>
                <span className="icon-clear"/>
            </Button>
            {
                !isAddHidden && options.length > 1 && attributeId  && props.query.length >= 3 ?
                <a href="#"
                   className="dashed-link"
                   onClick={onRowAdd}>
                    One More Attribute
                </a> : null
            }
        </div>
    );
};

AttributeRow.propTypes = {
    onRowDelete: PropTypes.func.isRequired,
    onAttrSelect: PropTypes.func.isRequired,
    onRowAdd: PropTypes.func.isRequired,
    options: PropTypes.array.isRequired
};

export default AttributeRow;