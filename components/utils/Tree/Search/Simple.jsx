import React from 'react';
import {FormControl, FormGroup, Button} from 'react-bootstrap';
import cx from 'classnames';

const SearchSimple = ({searchValue, onSearchValueChange, clearSearch, displaySearchInput}) => (
    displaySearchInput ?
        <FormGroup className="form-group-clear">
        <FormControl
            type="text"
            value={searchValue}
            placeholder="Searching for..."
            onChange={onSearchValueChange} />
        <Button className={cx("btn-clear", {hidden: !searchValue.length})}
                onClick={() => clearSearch()}>
            <span className="icon-clear"/>
        </Button>
    </FormGroup> : null
);

export default SearchSimple;