import React from 'react';
import isEmpty from 'lodash/isEmpty';
import PropTypes from 'prop-types';

const getYearsRange = (data, currentPage) => {
    if (isEmpty(data)) {
        return new Date().getFullYear();
    }

    const currentPageDataLen = data[currentPage].length;
    return `${data[currentPage][0]} - ${data[currentPage][currentPageDataLen -1]}`;
};

const CalendarHeader = ({data, currentPage, onPageChange, pickerType}) => {

    const nextPage = data[currentPage + 1] ? currentPage + 1 : currentPage;
    const prevPage = data[currentPage - 1] ? currentPage - 1 : currentPage;
    const yearsRange = {
        'months': data[currentPage],
        'years': getYearsRange(data, currentPage)
    }[pickerType];

    return (
        <div className="calendar-header">
            <span className="calendar-header__arrows"
                  onClick={(e) => onPageChange(prevPage)}
                  disabled={prevPage === currentPage}>
                {'<'}
            </span>
            <span className="calendar-header__range">{yearsRange}</span>
            <span className="calendar-header__arrows"
                  disabled={nextPage === currentPage}
                  onClick={(e) => onPageChange(nextPage)}>
                {'>'}
            </span>
        </div>
    );
};

CalendarHeader.propTypes = {
    data: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.object
    ]).isRequired,
    onPageChange: PropTypes.func.isRequired,
    pickerType: PropTypes.string.isRequired
};

export default CalendarHeader;