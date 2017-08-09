import React from 'react';
import moment from 'moment';

const Date = ({value}) => {
    const isDateValid = moment(value).isValid();
    return (
        <span>
            {isDateValid ? moment(value).format("MM/DD/YYYY") : value}
        </span>
    );
};

export default Date;