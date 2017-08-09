import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {FormControl, FormGroup, ControlLabel, Button} from 'react-bootstrap';

import Checkbox from '../Fields/FormCheckbox';

const SimpleSearch = ({searchValue, onSearchValueChange}) => (
    <FormGroup>
        <ControlLabel>Search</ControlLabel>
        <FormControl type="text"
                     value={searchValue}
                     placeholder="Searching for..."
                     onChange={onSearchValueChange}/>

    </FormGroup>
);

const CompactSearch = ({searchValue, onSearchValueChange}) => (
    <div className="compact-search">
        <div className="search-action-bar">
            <a href="#" className="dashed-link">Expand All</a>
            <a href="#" className="dashed-link">Collapse All</a>
            <a href="#" className="search-link pull-left">
                <span className="icon-search"></span>
                Search
            </a>
        </div>
        <FormGroup className="form-group-clear">
            <FormControl
                    type="text"
                    value={searchValue}
                    placeholder="Searching for..."
                    onChange={onSearchValueChange} />
            <Button className="btn-clear">
                <span className="icon-clear"></span>
            </Button>
        </FormGroup>

            <Checkbox labelValue="Children only"
                      name="tree-search-option"/>
            <Checkbox labelValue="Summary only"
                      name="tree-search-option"/>
    </div>
);

class TreeSearch extends Component {

    static propTypes = {
        searchWrapClass: PropTypes.string,
        searchChangeHandler: PropTypes.func.isRequired,
        displaySearchNav: PropTypes.bool.isRequired,
        setActiveSearchItem: PropTypes.func.isRequired,
        foundedList: PropTypes.object.isRequired,
        searchType: PropTypes.string
    };

    state = {
        searchValue: ''
    };

    onSearchValueChange = e => {
        this.setState({
            searchValue: e.target.value
        });
        this.props.searchChangeHandler(e.target.value);
    };

    render() {
        const itemsFound = Object.keys(this.props.foundedList).length;
        const SearchComponent = {
            'compact': CompactSearch
        }[this.props.searchType] || SimpleSearch;

        return (
            <div className={this.props.searchWrapClass}>
                <SearchComponent searchValue={this.state.searchValue}
                                 onSearchValueChange={this.onSearchValueChange}/>
                {
                    this.props.displaySearchNav ?
                        <div className="search-results-block">
                            <span className="search-results-count">Items Found: {itemsFound}</span>
                            <Button className="btn-dark" onClick={this.props.setActiveSearchItem("prev")}>
                                <span className="icon-arrow-up"/>
                            </Button>
                            <Button className="btn-dark" onClick={this.props.setActiveSearchItem("next")}>
                                <span className="icon-arrow-down"/>
                            </Button>
                        </div>
                        : null
                }

            </div>
        );
    };
}

export default TreeSearch;