import React, {Component} from 'react';
import {Table, Pagination} from 'react-bootstrap';
import _ from 'lodash';
import moment from 'moment';
import cx from 'classnames';
import PropTypes from 'prop-types';

import GridBody from './GridBody'
import Select from '../Fields/Select';
import GridHeader from './GridHeader';

class Grid extends Component {

    static propTypes = {
        data: PropTypes.array.isRequired,
        headerScheme: PropTypes.array.isRequired,
        bodyScheme: PropTypes.array.isRequired,
        pagination: PropTypes.bool,
        enumeration: PropTypes.bool,
        sizesPerPage: PropTypes.array,
        sort: PropTypes.object,
        onDataChange: PropTypes.func,
        justCreatedItemName: PropTypes.string,
        isSelectable: PropTypes.bool,
        isSingleSelect: PropTypes.bool,
        onSelect: PropTypes.func,
        emptyGridHeight: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ])
    };

    static defaultProps = {
        pagination: true,
        enumeration: false,
        sizesPerPage: [20, 30, 40, 50],
        isSelectable: false,
        useDropUpSelect: true,
        wrapperClassName: '',
        sort: {
            column: null,
            order: 'asc'
        },
        colors: {
            inserted: '#58C557',
            moved: '#DF67E9',
            cutted: '#929292',
            renamed: '#32CCF0',
            deleted: "#FF8429",
            invalid: "#FF567C"
        }
    };

    state = {
        data: [],
        selectedList: [],
        selectedIndexes: [],
        currentPage: 1,
        pagesCount: [],
        filters: {},
        highlighted: {},
        sort: this.props.sort,
        headerWidth: ""
    };

    originData = [];
    pageData = [];
    tableData = [];

    static filterPredicate(itemValue, filterValue, type) {
        return {
            'startsWith': _.startsWith(itemValue, filterValue),
            'endsWith': _.endsWith(itemValue, filterValue),
            'contains': itemValue.indexOf(filterValue) >= 0,
            'notContains': itemValue.indexOf(filterValue) < 0,
            'equal': itemValue === filterValue,
            'notEqual': itemValue !== filterValue,
            'notStartsWith': !_.startsWith(itemValue, filterValue),
            'notEndsWith': !_.endsWith(itemValue, filterValue),
            'date': () => {
                const cellValue = moment(itemValue).format('MM/DD/YYYY');
                const from = moment(filterValue.from).format('MM/DD/YYYY');
                const to = moment(filterValue.to).format('MM/DD/YYYY');
                return moment(cellValue).isBetween(from, to);
            }
        }[type];
    };

    componentDidMount() {
        this.defineData(this.props.data);
        window.addEventListener("resize", this.updateHeaderWidth);
    };

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateHeaderWidth);
    };

    componentDidUpdate() {
        clearTimeout(this.widthTimeout);
        this.widthTimeout = setTimeout(this.updateHeaderWidth, 500);
    };

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = this.state !== nextState;
        !shouldUpdate && _.each(['data', 'bodyScheme', 'headerScheme', 'draggable'], name => {
            shouldUpdate = this.props[name] !== nextProps[name] || shouldUpdate;
        });
        return shouldUpdate;
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.defineData(nextProps.data);
        }
    };

    updateHeaderWidth = () => {
        const offsetWidth = this.bodyRef && this.bodyRef.children && this.bodyRef.children[0] && this.bodyRef.children[0].offsetWidth;
        if (offsetWidth && offsetWidth !== this.state.headerWidth) {
            this.setState({headerWidth: offsetWidth});
        }
    };

    defineData(data) {
        console.time('defineData measurment:');

        this.originData = [];
        this.pageData = [];
        this.tableData = [];

        for (let i = 0, len = data.length; i < len; i += 1) {
            this.originData[i] = _.clone(data[i]);
            this.tableData[i] = _.clone(data[i]);
            this.tableData[i].index = i;
        }
        console.timeEnd('defineData measurment:');

        this.getPageData(1);
    };

    getPageData(num) {
        const dataToProceed = this.getFilterData();

        if (!this.props.pagination) {

            this.setState({
                data: dataToProceed
            });

            this.pageData = dataToProceed;

            return;
        }

        const {padStart, padEnd, pagesCount, sizePerPage} = this.getPaginatedOptions(dataToProceed, num);
        const data = dataToProceed.slice(padStart, padEnd);

        this.setState({
            data,
            pagesCount,
            currentPage: num,
            activePageSize: sizePerPage
        });

        this.pageData = data;
    };

    getSelectedState() {
        return this.state.selectedList;
    };

    onSort = (header, key) => {
        if (!header.sortable) {
            return;
        }

        const {sort, currentPage} = this.state;
        const order = sort.order === 'asc' ? -1 : 1;

        this.tableData = this.tableData.sort((n, p) => {
            const result = (n[key] > p[key]) ? 1 : -1;
            return result * order;
        });

        this.setState({
            sort: {
                column: key,
                order: order === -1 ? 'desc' : 'asc'
            }
        });

        this.getPageData(currentPage);
    };

    onCheckAll = (key, value) => {
        const data = this.pageData;

        for (let i = 0, len = data.length; i < len; i += 1) {
            data[i][key] = value;
            const indexToUpdate = data[i].index;
            this.originData[indexToUpdate][key] = value;

            const tableMatch = _.find(this.tableData, {index: indexToUpdate});
            tableMatch[key] = value;
        }

        this.setState({data});
        this.props.onDataChange && this.props.onDataChange();
    };

    onRowSelect = (item) => {
        const isClickedAlreadySelected = this.state.selectedIndexes.indexOf(item.id) >= 0;
        let selectedList = [...this.state.selectedList];
        let selectedIndexes = [...this.state.selectedIndexes];

        if (isClickedAlreadySelected) {
            _.pullAllBy(selectedList, [item], 'id');
            selectedIndexes = _.without(selectedIndexes, item.id);
        } else if (this.props.isSingleSelect) {
            selectedList = [item];
            selectedIndexes = [item.id];
        } else {
            selectedList.push(item);
            selectedIndexes.push(item.id);
        }

        selectedList =  _.uniqBy(selectedList, 'id');
        selectedIndexes =  _.uniq(selectedIndexes);

        this.setState({selectedList, selectedIndexes}, () => {
            const res = this.props.isSingleSelect ? selectedList[0] : selectedList;
            this.props.onSelect && this.props.onSelect(res);
        });
    };

    clearSelected = (callback) => {
        this.setState({
            selectedList: [],
            selectedIndexes: []
        }, callback);
    };

    /**
     * Single interface with Grid
     * @param items
     * @param schemeName
     * @param callback
     */
    highlightItems = (items, schemeName, callback) => {
        let colorMaps = this.state.highlighted;
        items.forEach((entry) => {
            colorMaps[entry.id] = this.props.colors[schemeName];
        });
        this.setState({
            highlighted: colorMaps
        }, callback);
    };

    discardChanges = callback => {
        this.setState({
            highlighted: {},
            selectedList: [],
            selectedIndexes: []
        }, callback);
    };

    onFilter = (key, filterProps) => {
        const filters = this.state.filters;
        this.setState({
            filters: {
                ...filters,
                [key]: {
                    value: filterProps.value,
                    type: filterProps.type
                }
            }
        }, () => this.getPageData(1));
    };

    getFilterData() {
        let filtersToPick = [];
        let filteredData = null;

        _.each(this.state.filters, (filter, key) => {
            !(_.isEmpty(filter.value)) && filtersToPick.push(key);
        });

        if (_.isEmpty(filtersToPick)) {
            return this.tableData;
        }

        filtersToPick.forEach((columnKey) => {
            filteredData = _.filter(filteredData || this.tableData, (item) => {
                if (item[columnKey]) {
                    const itemValue = item[columnKey].toString().toLowerCase();
                    const result = this.constructor.filterPredicate(
                        itemValue,
                        this.state.filters[columnKey].value,
                        this.state.filters[columnKey].type
                    );
                    return _.isFunction(result) ? result() : result;
                }
                return false;
            });
        });

        return filteredData;
    };

    onCellChange = (index, key, value) => {
        this.originData[index][key] = value;

        const tableMatch = _.find(this.tableData, {index});
        tableMatch[key] = value;

        const pageMatch = _.find(this.pageData, {index});
        pageMatch[key] = value;

        this.setState({data: this.pageData});

        this.props.onDataChange && this.props.onDataChange();
    };

    onPaginatorClick = (page) =>  {
        this.getPageData(page);
    };

    onSizePerPageChange = (option) => {
        this.setState({
            activePageSize: option ? option.value : 30
        },() => this.getPageData(1))
    };

    getPaginatedOptions(data, num) {
        const sizePerPage = this.state.activePageSize || this.props.sizesPerPage[0];
        const padStart = (num - 1) * sizePerPage;
        const padEnd = num === 1 ? sizePerPage : sizePerPage * num;
        const pagesCount = Math.ceil(data.length / sizePerPage);
        return {
            padStart,
            padEnd,
            pagesCount,
            sizePerPage
        };
    };

    getTableData() {
        return _.map(this.tableData, (value, index) => {
            return _.omit(value, 'index');
        });
    };

    render() {
        return (
            <div className={this.props.wrapperClassName}>
                <Table striped bordered condensed hover
                       style={{width: this.state.headerWidth}}
                >
                    <GridHeader headerScheme={this.props.headerScheme}
                                sort={this.state.sort}
                                enumeration={this.props.enumeration}
                                data={this.state.data}
                                onSort={this.onSort}
                                onCheckAll={this.onCheckAll}
                                onFilter={this.onFilter}
                    />
                </Table>
                <div ref={node => this.bodyRef = node}
                     className={cx("scrollable-table-body", {
                    "is-empty": !this.state.data || ! this.state.data.length
                })}
                >
                    <Table striped bordered condensed hover

                    >
                        <GridBody draggable={this.props.draggable}
                                  enableDragPreview={this.props.enableDragPreview}
                                  justCreatedItemName={this.props.justCreatedItemName}
                                  isSelectable={this.props.isSelectable}
                                  onRowSelect={this.onRowSelect}
                                  emptyGridHeight={this.props.emptyGridHeight}
                                  highlighted={this.state.highlighted}
                                  bodyScheme={this.props.bodyScheme}
                                  data={this.state.data}
                                  selectedIndexes={this.state.selectedIndexes}
                                  enumeration={this.props.enumeration}
                                  onCellChange={this.onCellChange}
                            />

                    </Table>
                </div>

                {
                    this.props.pagination && this.state.data.length ?
                        <div className="table-paginator">
                            <div className="table-paginator-content">
                                {
                                    (this.state.pagesCount > 1 || _.first(this.props.sizesPerPage) < this.state.activePageSize) &&
                                    <Select name="paginatorEntriesLen"
                                            useDropUpSelect={this.props.useDropUpSelect}
                                            value={this.state.activePageSize}
                                            placeholder="Select entries to display"
                                            options={this.props.sizesPerPage.map((opt) => ({
                                                value: opt,
                                                label: `${opt} per page`
                                            }))}
                                            onChange={this.onSizePerPageChange}
                                            searchable={false}
                                            creatable={false}
                                    />
                                }
                                {
                                    this.state.pagesCount > 1 &&
                                    <Pagination
                                        prev
                                        next
                                        ellipsis
                                        boundaryLinks
                                        items={this.state.pagesCount}
                                        maxButtons={3}
                                        activePage={this.state.currentPage}
                                        onSelect={this.onPaginatorClick}
                                    />
                                }
                            </div>
                        </div>
                        : null
                }
            </div>

        );
    };
}

export default Grid;
