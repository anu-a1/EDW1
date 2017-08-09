import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Button, ControlLabel} from 'react-bootstrap';
import _ from 'lodash';

import CompactSearch from './Compact';
import SimpleSearch from './Simple';

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
        searchValue: '',
        isSearchToggled: false
    };

    toggleSearch = () => e => {
        e.preventDefault();
        !this.props.isTreeEmpty && this.setState((state) => ({
            isSearchToggled: !state.isSearchToggled
        }));
    };

    onSearchValueChange = e => {
        this.setState({
            searchValue: e.target.value
        });
        this.props.searchChangeHandler(e.target.value);
    };

    onSearchClear = () => this.setState({searchValue: ''});

    onSearchByChange = (searchBy) => {
        this.props.onSearchByChange(this.state.searchValue, searchBy);
    };

    render() {
        const itemsFound = _.map(this.props.foundedList, (item, key) => _.toNumber(key) || key);
        itemsFound.sort(this.props.compareFoundedIds);

        const itemsFoundCount = itemsFound.length;
        const activeHighlightedPos = this.props.activeHighlighted && itemsFound.indexOf(this.props.activeHighlighted);

        const SearchComponent = {
            'compact': CompactSearch
        }[this.props.searchType] || SimpleSearch;

        return (
            <div className={this.props.searchWrapClass}>
                {this.props.searchType !== "compact" && <ControlLabel>Search</ControlLabel>}
                <SearchComponent searchValue={this.state.searchValue}
                                 clearSearch={() => {
                                     this.onSearchClear();
                                     this.props.resetTreeSearch();
                                 }}
                                 toggleSearch={this.toggleSearch}
                                 searchBy={this.props.searchBy}
                                 isCollapseAllowed={this.props.isCollapseAllowed}
                                 isExpandAllowed={this.props.isExpandAllowed}
                                 clearSelected={this.props.clearSelected}
                                 onDeselect={this.props.onDeselect}
                                 isTreeEmpty={this.props.isTreeEmpty}
                                 isSelectedEmpty={this.props.isSelectedEmpty}
                                 displaySearchInput={this.props.displaySearchInput}
                                 onSearchByChange={this.onSearchByChange}
                                 expandAll={this.props.expandAll}
                                 collapseAll={this.props.collapseAll}
                                 isSearchToggled={this.state.isSearchToggled}
                                 onExpandCollapse={this.props.onExpandCollapse}
                                 onSearchValueChange={this.onSearchValueChange}/>
                {
                    this.props.displaySearchNav ?
                        <div className="search-results-block">
                            <span className="search-results-count">Items Found: {itemsFoundCount}</span>
                            { itemsFoundCount ?
                                <div style={{display: 'inline-block'}}>
                                    <Button onClick={this.props.setActiveSearchItem("prev")}
                                            disabled={activeHighlightedPos === 0}
                                            className="btn-dark">
                                        <span className="icon-arrow-up"/>
                                    </Button>
                                    <Button onClick={this.props.setActiveSearchItem("next")}
                                            disabled={activeHighlightedPos === itemsFound.length - 1}
                                            className="btn-dark">
                                        <span className="icon-arrow-down"/>
                                    </Button>
                                </div> : null
                            }
                        </div>
                        : null
                }

            </div>
        );
    };
}

export default TreeSearch;