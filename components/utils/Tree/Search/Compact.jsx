import React, {Component} from 'react';
import _ from 'lodash';
import cx from 'classnames';

import Checkbox from '../../Fields/FormCheckbox';
import Search from './Simple';

class CompactSearch extends Component {

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.searchBy === 'all' && this.props.searchBy !== 'all') {
            this.setState({
                searchBy: {
                    summary: false,
                    children: false
                }
            });
        }
    };

    state = {
        searchBy: {
            summary: false,
            children: false
        }
    };

    onCheckUpdate = item => e => {
        const checkBoxState = e.target.checked;
        const state = this.state;

        let nextSearchBy = {
            summary: item === 'summary' && checkBoxState,
            children: item === 'children' && checkBoxState
        };

        const nextState = {
            state,
            searchBy: nextSearchBy
        };

        this.setState({
            ...nextState
        });

        if (!nextState.searchBy.summary && !nextState.searchBy.children) {
            return this.props.onSearchByChange('all');
        }

        const singleTrueValue = _.keys(nextState.searchBy).filter(item => nextState.searchBy[item]).toString() || 'all';

        this.props.onSearchByChange(singleTrueValue);
    };

    onExpandCollapseClick = action => e => {
        e.preventDefault();
        this.props.onExpandCollapse(action === 'expand');
    };

    render() {
        const {searchValue, onSearchValueChange, clearSearch, isCompact, displaySearchInput, ...props} = this.props;

        return (
            <div className="compact-search">
                <div className="search-action-bar">
                    <a href="#"
                       className={cx("deselect-link", "dashed-link", {
                           "is-disabled": props.isTreeEmpty || props.isSelectedEmpty
                       })}
                       onClick={(e) => {
                           e.preventDefault();
                           props.clearSelected(props.onDeselect);
                       }}>
                        Deselect All
                    </a>
                    <a href="#"
                       className={cx("dashed-link", {
                           "is-disabled": !props.isExpandAllowed || props.isTreeEmpty
                       })}
                       onClick={this.onExpandCollapseClick('expand')}>
                        Expand All
                    </a>
                    <a href="#"
                       className={cx("dashed-link", {
                           "is-disabled": !props.isCollapseAllowed || props.isTreeEmpty
                       })}
                       onClick={this.onExpandCollapseClick('collapse')}>
                        Collapse All
                    </a>
                    <a href="#"
                       className={cx('search-link','pull-left', {
                           'is-open': props.isSearchToggled && displaySearchInput,
                           'is-disabled': !displaySearchInput || props.isTreeEmpty
                       })}
                       onClick={props.toggleSearch()}>
                        <span className="icon-search"/>
                        Search
                    </a>
                </div>
                {
                    props.isSearchToggled &&
                    <Search {...{searchValue, onSearchValueChange, clearSearch, isCompact, displaySearchInput}}/>
                }
                {
                    props.isSearchToggled && displaySearchInput &&
                    <div className="compact-search-options">
                        <Checkbox labelValue="Children only"
                                  defaultValue={this.state.searchBy.children}
                                  defaultChecked={this.state.searchBy.children}
                                  onChange={this.onCheckUpdate('children')}
                                  name="tree-search-option"/>
                        <Checkbox labelValue="Summary only"
                                  onChange={this.onCheckUpdate('summary')}
                                  defaultValue={this.state.searchBy.summary}
                                  defaultChecked={this.state.searchBy.summary}
                                  name="tree-search-option"/>
                    </div>
                }
            </div>
        );
    }
}

export default CompactSearch;