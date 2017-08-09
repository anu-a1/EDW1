import React from 'react';
import {Glyphicon} from 'react-bootstrap';
import PropTypes from 'prop-types';

const GridHeaderTh = ({column, sort, onSort}) => {

    const handleClick = (value, key) => e => {
        onSort(value, key);
    };

    const isSorted = sort.column === column.key;
    const isAsc = isSorted && sort.order === 'asc';
    const isDesc = isSorted && sort.order === 'desc';

    return (
        <th rowSpan={column.rowspan || ''}
            colSpan={column.colspan || ''}
            onClick={handleClick(column, column.key)}>

            {column.title}

            {
                column.sortable ?
                    <span>
                        <Glyphicon className={isAsc ? '' : 'hidden'} glyph="triangle-top"/>
                        <Glyphicon className={isDesc ? '' : 'hidden'} glyph="triangle-bottom"/>
                    </span>
                    : null
            }

        </th>
    );
};

GridHeaderTh.propTypes = {
    column: PropTypes.object.isRequired,
    sort: PropTypes.object,
    onSort: PropTypes.func
};

export default GridHeaderTh;
