import React, {Component} from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import GridHeaderTh from './GridHeaderTh';
import Checkbox from './Fields/CheckBox';
import Filter from './Fields/Filter';
import TextInput from './Fields/TextInput';
import Text from './Fields/Text';

class GridHeader extends Component {

    static propTypes = {
        headerScheme: PropTypes.array.isRequired,
        data: PropTypes.array.isRequired,
        sort: PropTypes.object,
        onSort: PropTypes.func,
        onCheckAll: PropTypes.func,
        onFilter: PropTypes.func
    };

    onChange(key, action, value) {
        if (action === 'Checkbox') {
            this.props.onCheckAll(key, value);
            return;
        }
        if (action === 'Filter') {
            this.props.onFilter(key, value);
            return;
        }
    };

    componentPredefinedValue(key, action) {
        if (action === 'Checkbox') {
            const totals = _.countBy(this.props.data, (item) => item[key] === true ? 'checked' : 'unchecked');
            return totals.checked === this.props.data.length;
        }
    }

    splitHeaderGroups() {
        const isRowSpanExist = _.find(this.props.headerScheme, (col, index) => {
            return col.columns !== undefined;
        });

        let groups = [];
        let header = [];
        let flattenHeader = [];

        if (!isRowSpanExist) {
            return {header: this.props.headerScheme};
        }

        this.props.headerScheme.forEach((col, index) => {

            if (col.columns) {
                header = [...header, ...col.columns];
                groups = [...groups, {...col, colspan: col.columns.length}];
                flattenHeader = [...flattenHeader, ...col.columns];
            } else if (isRowSpanExist) {
                groups = [...groups, {...col, rowspan: 2}];
                flattenHeader = [...flattenHeader, col];
            }

        });

        return {
            header,
            flattenHeader,
            groups
        };
    }

    render() {
        let {groups, header, flattenHeader} = this.splitHeaderGroups();
        flattenHeader = flattenHeader || header;
        const subHeaderNeeded = _.findKey(flattenHeader, 'subHeader');

        return (
            <thead>
            {groups && groups.length ?
                <tr className="table-groups">
                    {this.props.enumeration && <th rowSpan={2}>№</th>}
                    {
                        groups.map((col, index) => {
                            const propsToPass = _.pick(this.props, ['sort', 'onSort']);
                            return <GridHeaderTh key={`${index}${col.title}`} column={col} {...propsToPass}/>
                        })
                    }
                </tr> : null}

            <tr className="table-headers">
                {!groups && this.props.enumeration ? <th/> : null}
                {
                    header.map((col, index) => {
                        const propsToPass = _.pick(this.props, ['sort', 'onSort']);
                        return <GridHeaderTh key={`${index}${col.title}`} column={col} {...propsToPass}/>
                    })
                }
            </tr>

            {subHeaderNeeded && flattenHeader.length ? (
                <tr className="subheader-components">
                    {/* for enumeration purposes*/}
                    {this.props.enumeration && <th/>}
                    {
                        flattenHeader.map((col, index) => {
                            if (!col.subHeader) {
                                return <th key={`${index}${col.title}`}/>;
                            }

                            const Component = {
                                Checkbox,
                                TextInput,
                                Text,
                                Filter
                            }[col.subHeader.component];

                            return (
                                <th key={`${index}${col.title}`}>
                                    {col.subHeader.title}
                                    {
                                        Component && <Component tooltip={{component: `sub-${col.subHeader.component}`}}
                                                                fieldType={col.subHeader.type}
                                                                id={`subHeader-comp-${index}`}
                                                                onChange={this.onChange.bind(this, col.key, col.subHeader.component)}
                                                                value={this.componentPredefinedValue(col.key, col.subHeader.component)}/>
                                    }
                                </th>
                            );
                        })
                    }
                </tr>
            ) : null}

            </thead>
        );
    }
}

export default GridHeader;