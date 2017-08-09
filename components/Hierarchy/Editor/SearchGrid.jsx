import React from 'react';
import Grid from '../../../components/utils/Grid';
import _ from 'lodash';

import ColumnSetup from './popup/ColumnSetup';

const DEFAULT_BODY = [{
    key: 'code'
}, {
    key: 'name'
}];

const DEFAULT_HEADER = [{
    title: 'Code',
    key: 'code',
    subHeader: {
        component: 'Filter'
    }
}, {
    title: 'Name',
    key: 'name',
    subHeader: {
        component: 'Filter'
    }
}];

export default class SearchGrid extends React.Component {

    state = {
        gridData: [],
        showedColumns: [],
        bodyScheme: [{
            key: 'code'
        }, {
            key: 'name'
        }],
        headerScheme: [{
            title: 'Code',
            key: 'code',
            subHeader: {
                component: 'Filter'
            }
        }, {
            title: 'Name',
            key: 'name',
            subHeader: {
                component: 'Filter'
            }
        }]
    };

    componentWillReceiveProps(nextProps) {
        if ((nextProps.data !== this.props.data) || (nextProps.members !== this.props.members)) {
            this.flattenDataAttributes(nextProps.data);
        }
        if ((nextProps.hierarchyAttributes !== this.props.hierarchyAttributes)) {
            this.mergeUpdatedAttributes(nextProps.hierarchyAttributes);
        }
    };

    componentDidMount() {
        this.flattenDataAttributes(this.props.data);
    };

    /**
     * Adds attributes from 'attributeValues' array to the root of member object
     * @param data - 'api/member' response
     * @example
     * {
     *      id: 212,
     *      code: 'Firm',
     *      attributeValues: [{attributeName: 'Liquid'}, ...]
     *      Liquid: {attributeName: 'Liquid',...},
     *      Liquid-attributeName: 'Liquid'
     * }
     */
    flattenDataAttributes(data) {
        if (!data.length) {
            return this.setState({
                gridData: data
            });
        }

        const flattenData = [];
        for(let i = 0, len = data.length; i < len; i += 1) {
            const dataAttributes = data[i].attributeValues;

            let dataItem = _.assign({}, data[i]);

            for(let j = 0, attrLen = dataAttributes.length; j < attrLen; j += 1) {
                const name = dataAttributes[j].attributeName;
                const value = dataAttributes[j].attributeValue;

                if (!name || !value) {
                    continue;
                }

                dataItem[name] = _.assign({}, dataAttributes[j]);

                dataItem = {
                    ...dataItem,
                    [`${name}-attributeName`]: name,
                    [`${name}-attributeValue`]: value
                }
            }

            flattenData.push(dataItem);
        }

        this.setState({
            gridData: flattenData
        });
    };

    onColumnsAdd = (data) => {
        let bodyScheme = DEFAULT_BODY;
        let headerScheme = DEFAULT_HEADER;

        if (_.isEmpty(data)) {
            return this.setState({showedColumns: {}, bodyScheme, headerScheme});
        }

        _.each(data, (val, key) => {
            bodyScheme = bodyScheme.concat({key: `${val}-attributeValue`});
            headerScheme = headerScheme.concat({
                title: val,
                key: `${val}-attributeValue`,
                subHeader: {
                    component: 'Filter'
                }
            });
        });

        this.setState({showedColumns: data, bodyScheme, headerScheme});
    };

    mergeUpdatedAttributes = (attributes) => {
        let updatedColumns = {};
        attributes.forEach(attr => {
            if (this.state.showedColumns[attr.id]) {
                updatedColumns[attr.id] = attr.name;
            }
        });

        this.onColumnsAdd(updatedColumns);
    };

    render() {
        const {refLink, title, onSelect, hierarchyAttributes} = this.props;
        return (
            <div className="hierarchy-search-table">
                <div className="btns-block">
                    <ColumnSetup hierarchyAttributes={hierarchyAttributes}
                                 showedColumns={this.state.showedColumns}
                                 disabled={!hierarchyAttributes.length}
                                 onSave={this.onColumnsAdd}/>
                </div>
                <h3>{title}</h3>
                <Grid
                    sizesPerPage={[10, 20, 50]}
                    data={this.state.gridData}
                    onSelect={onSelect}
                    ref={node => refLink(node)}
                    justCreatedItemName="member"
                    isSelectable={true}
                    bodyScheme={this.state.bodyScheme}
                    headerScheme={this.state.headerScheme}
                />
            </div>
        );
    }
}