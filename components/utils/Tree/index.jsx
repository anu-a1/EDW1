import React, {Component} from 'react';
import _ from 'lodash';
import reactStringReplace from 'react-string-replace';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import TreeLeaf from './TreeLeaf';
import TreeSearch from './Search/index';

class Tree extends Component {

    static propTypes = {
        data: PropTypes.array.isRequired,
        dataTitleKey: PropTypes.oneOfType([
            PropTypes.func,
            PropTypes.string
        ]).isRequired,
        includeSearch: PropTypes.bool,
        displaySearchInput: PropTypes.bool,
        searchType: PropTypes.string,
        searchWrapClass: PropTypes.string,
        treeWrapClass: PropTypes.string,
        useCheckboxes: PropTypes.bool,
        onDrop: PropTypes.func,
        componentDomId: PropTypes.string
    };

    static defaultProps = {
        idAttr: 'id',
        parentAttr: 'parentId',
        childrenAttr: 'childs',
        draggable: false,
        droppable: false,
        useCheckboxes: true,
        useEditIcon: false,
        useDeleteIcon: false,
        includeSearch: true,
        displaySearchInput: true,
        searchWrapClass: "container-blue container-none-border",
        treeWrapClass: "container-tree",
        colors: {
            inserted: '#58C557',
            moved: '#DF67E9',
            merged: 'lightpink',
            cutted: '#929292',
            renamed: '#32CCF0',
            deleted: "#FF8429",
            invalid: "#FF567C"
        }
    };

    state = {
        data: {},
        idTree: [],
        searchBy: 'all',
        expandedCount: 0,
        selected: {},
        founded: {},
        highlighted: {},
        displaySearchNav: false,
        activeHighlighted: null
    };

    get resetSearchState() {
        return {
            founded: {},
            activeHighlighted: null,
            displaySearchNav: false
        };
    };

    treeData = null;
    searchMatch = {};
    toggleUpdates = {};

    componentDidMount() {
        this.defineData();
    }

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = this.state !== nextState;
        !shouldUpdate && _.each(['data', 'useCheckboxes', 'displaySearchInput', 'draggable', 'droppable'], name => {
            shouldUpdate = this.props[name] !== nextProps[name] || shouldUpdate;
        });
        return shouldUpdate;
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.props.data) {
            this.defineData(nextProps.data);
        }
    }

    clearSelected = (callback) => {
        this.setState({
            selected: {}
        }, callback);
    };

    getSelectedState = () => {
        return this.state.selected;
    };


    getItemDescendant = (childs, list) => {
        childs.forEach((item) => {
            list[item] = this.state.data[item];
            if (this.state.data[item] && this.state.data[item].childs.length) {
                this.getItemDescendant(this.state.data[item].childs, list);
            }
        });
    };

    getSelectedDescendants = () => {
        const selected = this.state.selected;
        let descendants = {...selected};
        _.each(selected, value => {
            if (value.childs.length) {
                this.getItemDescendant(value.childs, descendants);
            }
        });

        return descendants;
    };

    getTreeDataState = () => {
        return this.state.data;
    };

    updateState = (data, key, callback) => {
        this.setState({
            [key]: data
        }, callback);
    };

    defineData = (data) => {
        const {lookup, expandedCount} = this.treeify(data || this.props.data);
        this.treeData = lookup;
        const idTree = this.buildIdTree(this.treeData);

        this.setState({
            data: this.treeData,
            totalTogglableCount: expandedCount,
            expandedCount,
            idTree
        }, this.syncStateWithData);
    };

    syncStateWithData = () => {
        let syncFounded = {};
        let syncSelected = {};
        const {founded, selected} = this.state;

        if (_.isEmpty(founded) && _.isEmpty(selected)) {
            return;
        }

        _.keys(founded).forEach(id => {
            if (this.treeData[id]) {
                const originTitle = this.getLeafTitle(this.treeData[id]);
                const query = founded[id].query;
                const foundedItem = founded[id];
                syncFounded[id] = {
                    ...foundedItem,
                    title: reactStringReplace(this.getLeafTitle(this.treeData[id]), query || originTitle, (match, i) => (
                        <span key={i}>{match}</span>
                    ))
                }
            }
        });

        _.keys(selected).forEach(id => {
            if (this.treeData[id])
                syncSelected[id] = this.treeData[id];
        });

        this.setState({
            founded: syncFounded,
            selected: syncSelected
        });
    };

    updateExpandedCounter = (toggled) => {
        let counter = this.state.expandedCount;
        counter = toggled ? counter + 1 : counter - 1;
        return counter;
    };

    /**
     * Used for single tree entry to collapse/expand
     * @param {number} id
     */
    toggleLeaf = (id) => {
        const data = this.state.data;
        const item = data[id];
        const leafState = item.toggled;
        const toggledItem = {...item, toggled: !leafState};
        const toggledData = {...data, [id]: toggledItem};

        const expandedCount = this.updateExpandedCounter(toggledItem.toggled);

        this.setState({
            data: toggledData,
            expandedCount
        });
    };

    /**
     * Used in {@link onTreeSearch} to toggle all the parents of founded item
     * @param {number} id
     */
    toggleParents = id => {
        const parent = this.toggleUpdates[id].parentId;
        // parentId could be null
        if (!parent) {
            return;
        }

        const parentItem = this.toggleUpdates[parent];
        const parentData = {...parentItem, toggled: true};
        const toggleUpdates = this.toggleUpdates;
        this.toggleUpdates = {
            ...toggleUpdates,
            [parent]: parentData
        };

        this.toggleParents(parent);
    };

    /**
     * Returns computed entry title based on activeHighLighted property passed to {@link Tree}
     * @param {object} leaf - Single data entry
     * @returns {string}
     */
    getLeafTitle = leaf => {
        const {dataTitleKey} = this.props;
        return _.isFunction(dataTitleKey) ? dataTitleKey(leaf) : leaf[dataTitleKey];
    };

    getChild = node => {
        if(!node || !node.childs || !node.childs.length) {
            return [];
        }

        let nodeChilds = {};
        this.getItemDescendant(node.childs, nodeChilds);
        return _.values(nodeChilds);
    };

    resetTreeSearch = () => {
        this.setState(this.resetSearchState);
    };

    resetAllSearchState = () => {
        const resetSearchState = this.resetSearchState;
        this.setState({...resetSearchState, searchBy: 'all'});
        this.searchRef.onSearchClear();
    };

    onSearchByChange = (query, type) => {
        this.setState({
            searchBy: type
        }, () => this.onTreeSearch(query));
    };

    /**
     * Finds data matches for query by indexOf
     * For all founded items applies {@link highlightFounded} and {@link toggleParents}
     * @param {string} query
     * @param {string} type - if no type specified, we're applying highlight on query,
     *                        otherwise highlight whole string
     */
    onTreeSearch = (query, type) => {

        if (!query) {
            return this.resetTreeSearch();
        }

        const foundedItems = this.titleSearch(query);

        if (_.isEmpty(foundedItems)) {
            const resetSearchState = this.resetSearchState;
            return this.setState({...resetSearchState, displaySearchNav: true});
        }

        const queryToHighlight = type ? null : query;

        this.applySearchHighlight(foundedItems, queryToHighlight);
    };

    applySearchHighlight = (data, queryToHighlight) => {
        this.searchMatch = {};
        const stateData = this.state.data;
        this.toggleUpdates = {...stateData};

        data.forEach((value, index) => {
            this.highlightFounded(value, queryToHighlight);
            this.toggleParents(value.id);
        });

        const match = this.searchMatch;
        const toggleUpdates = this.toggleUpdates;

        this.setState({
            displaySearchNav: true,
            data: {...toggleUpdates},
            founded: {...match}
        });

    };

    titleSearch = (query) => {
        const {data} = this.state;
        const normalizedQuery = query && query.toLowerCase();

        const filtered = this.props.data.filter((value, idx) => {
            const title = this.getLeafTitle(value);
            const isQueryMatches = title.toLowerCase().indexOf(normalizedQuery) >= 0;
            return {
                'all': isQueryMatches,
                'children': isQueryMatches && !data[value.id].childs.length,
                'summary': isQueryMatches && data[value.id].childs.length
            }[this.state.searchBy];
        });

        return filtered;
    };

    onSearchQueryChange = query => {
        const normalizedQuery = query.length >= 3 ? query.toLowerCase() : '';
        this.onTreeSearch(normalizedQuery);
    };

    /**
     * Replaces search query match in entry title using 'react-string-replace'
     * Applies matched entry to the helper property searchMatch which is used in {@link onTreeSearch}
     * @param {object} entry - Single item from data
     * @param {string} query - Search query
     */
    highlightFounded = (entry, query) => {
        const title = this.getLeafTitle(entry);
        const highlightedTitle = reactStringReplace(title, query || title, (match, i) => (
            <span key={i}>{match}</span>
        ));
        const match = this.searchMatch;
        this.searchMatch = {
            ...match,
            [entry.id]: {
                title: highlightedTitle,
                query
            }
        };
    };

    /**
     * Sets an id of next Up/Down item from founded list
     * Based on type of clicked button
     * @param {string} type
     */
    highlightActive = type => e => {
        const foundedLeafs = _.map(this.state.founded, (val, key) => _.toNumber(key) || key);
        foundedLeafs.sort(this.compareFoundedIds);

        if (!this.state.activeHighlighted) {
            return this.setState({
                activeHighlighted: foundedLeafs[0]
            });
        }

        const nextActive = foundedLeafs.indexOf(this.state.activeHighlighted) + 1;
        const prevActive = foundedLeafs.indexOf(this.state.activeHighlighted) - 1;

        const next = {
            'next': foundedLeafs[nextActive] || this.state.activeHighlighted,
            'prev': foundedLeafs[prevActive] || this.state.activeHighlighted
        }[type];

        this.setState({
            activeHighlighted: next
        });
        this.scrollToHighlightedLeaf(`${next}-leaf`);
    };

    /**
     * Provides item selection based on its id
     * @param {number} id
     */
    onTreeLeafSelect = id => e => {
        const isSelectedExist = this.state.selected[id];
        const selectedData = this.state.data[id];
        const selectCallBack = this.props.onSelect && function(selected) {
            this.props.onSelect(_.keys(selected));
        }.bind(this);

        let data = null;

        if (isSelectedExist) {
            data = _.omit(this.state.selected, id);
            return this.updateState(data, 'selected', selectCallBack && selectCallBack.bind(this, data));
        }

        const stateSelected = this.state.selected;

        data = !this.props.useCheckboxes ? {[id]: selectedData} : {...stateSelected, [id]: selectedData};
        this.updateState(data, 'selected', selectCallBack && selectCallBack.bind(this, data));
    };

    highlightBy = (items, scheme, highlightBy, callback) => {
        let colorMaps = {};

        _.each(items, entry => {
            const mapBy = (highlightBy && entry[highlightBy]) || entry.id;
            colorMaps[mapBy] = this.props.colors[scheme];
        });

        this.setState({
            highlighted: colorMaps
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
            selected: {}
        }, callback);
    };

    /**
     * Transforms single level array into tree object.
     *
     * @param {array} list
     * @param {boolean} toggled
     * @example
     *  // returns {1: {id:1, title: "A"}, 2: {id:2, title: "B"}}
     *  treeify([{id:1, title: "A"}, {id:2, title: "B"}])
     * @returns {object} Single level key-value pairs of list items and their ids
     */
    treeify = (list, toggled=true) => {
        const {idAttr, parentAttr, childrenAttr} = this.props;
        const getIdVal = entry => (_.isFunction(idAttr) ? idAttr(entry) : entry[idAttr]);
        let lookup = {};
        let expandedCount = 0;
        const listLen = list.length;

        for (let i = 0; i < listLen; i++ ) {
            const obj = list[i];
            const idVal = getIdVal(obj);
            lookup[idVal] = {...obj};
            lookup[idVal][childrenAttr] = [];
            lookup[idVal].id = idVal;
            lookup[idVal].__title = this.getLeafTitle(obj)
        }

        for (let j = 0; j < listLen; j++) {
            const obj = list[j];
            const parentId = obj && obj[parentAttr];
            const currentLookup = parentId && lookup[parentId];
            const childrenArray = currentLookup && currentLookup[childrenAttr];
            if (childrenArray && obj.id) {
                childrenArray.push(obj.id);

                if (currentLookup.toggled === undefined) {
                    currentLookup.toggled = toggled;
                    expandedCount++;
                }
            }
        }

        return {lookup, expandedCount};
    };

    getChildIds = (childs, list, data) => {
        _.each(childs, id => {
            list.push(id);
            const entryChilds = data[id][this.props.childrenAttr];
            entryChilds && entryChilds.length && this.getChildIds(entryChilds, list, data);
        });
    };

    compareFoundedIds = (a, b) => {
        // if (a is less than b by some ordering criterion)
        if (this.state.idTree.indexOf(a) < this.state.idTree.indexOf(b)) {
            return -1;
        }
        // if (a is greater than b by the ordering criterion)
        if (this.state.idTree.indexOf(a) > this.state.idTree.indexOf(b)) {
            return 1;
        }

        return 0;
    };

    buildIdTree = (data) => {
        let idTree = [];
        const rootLeafs = _
            .chain(data)
            .filter(value => !value[this.props.parentAttr])
            .map(value => value.id)
            .value();

        _.each(rootLeafs, id => {
            idTree.push(id);
            const entryChilds = data[id][this.props.childrenAttr];
            entryChilds && entryChilds.length && this.getChildIds(entryChilds, idTree, data);
        });

        return idTree;
    };

    onExpandCollapse = (expand) => {
        const modifiedLeafState = expand ? this.treeify(this.props.data, true) : this.treeify(this.props.data, false);
        this.setState({
            data: modifiedLeafState.lookup,
            expandedCount: expand ? modifiedLeafState.expandedCount : 0
        });
    };

    scrollToHighlightedLeaf = (id) => {
        const node = document.getElementById(id);
        const container = this.props.componentDomId && document.getElementById(this.props.componentDomId);

        if (node && container) {
            node.scrollIntoView({ behavior: "smooth" });
            container.scrollTop -= 50;
        }

    };

    render() {
        return (
            <div className="wrapper-tree">
                {
                    this.props.includeSearch ?
                        <TreeSearch searchWrapClass={this.props.searchWrapClass}
                                    ref={search => this.searchRef = search}
                                    searchChangeHandler={this.onSearchQueryChange}
                                    displaySearchNav={this.state.displaySearchNav}
                                    foundedList={this.state.founded}
                                    searchBy={this.state.searchBy}
                                    activeHighlighted={this.state.activeHighlighted}
                                    compareFoundedIds={this.compareFoundedIds}
                                    isCollapseAllowed={this.state.expandedCount > 0}
                                    isExpandAllowed={this.state.expandedCount < this.state.totalTogglableCount }
                                    isTreeEmpty={!this.props.data.length}
                                    isSelectedEmpty={_.isEmpty(this.state.selected)}
                                    clearSelected={this.clearSelected}
                                    onDeselect={this.props.onDeselect}
                                    onSearchByChange={this.onSearchByChange}
                                    onExpandCollapse={this.onExpandCollapse}
                                    displaySearchInput={this.props.displaySearchInput}
                                    searchType={this.props.searchType}
                                    resetTreeSearch={this.resetTreeSearch}
                                    setActiveSearchItem={this.highlightActive}/>
                        : null
                }

                <div className={this.props.treeWrapClass || ''}
                     id={this.props.componentDomId || null}>
                    <div className="tree">
                        <ul>
                            {
                                _.map(this.state.data, value => {
                                    return !value[this.props.parentAttr] || parseInt(value[this.props.parentAttr], 10) <= 0 ?
                                        <TreeLeaf key={value.id || shortid.generate()}
                                                  item={value}
                                                  selectedList={this.state.selected}
                                                  highlighted={this.state.highlighted}
                                                  foundedList={this.state.founded}
                                                  activeHighlighted={this.state.activeHighlighted}
                                                  data={this.state.data}

                                                  childrenAttr={this.props.childrenAttr}
                                                  parentAttr={this.props.parentAttr}
                                                  useCheckboxes={this.props.useCheckboxes}
                                                  useEditIcon={this.props.useEditIcon}
                                                  useDeleteIcon={this.props.useDeleteIcon}
                                                  enableDragPreview={this.props.enableDragPreview}
                                                  draggable={this.props.draggable}
                                                  droppable={this.props.droppable}
                                                  onDrop={this.props.onDrop}
                                                  sourceName={this.props.sourceName}

                                                  onTreeLeafSelect={this.onTreeLeafSelect}
                                                  onLeafToggle={this.toggleLeaf}
                                                  onEdit={this.props.onEdit}
                                                  onDelete={this.props.onDelete}
                                        />
                                        : null
                                })
                            }
                        </ul>
                    </div>

                </div>
            </div>
        );
    };
}


export default Tree;
