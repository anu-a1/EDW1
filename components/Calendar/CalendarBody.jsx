import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

const CalendarBody = ({data, months, pickedDate, onPickerChange, pickerType}) => {

    const bodyClickHandler = (year, month=null) => e => {
        onPickerChange(year, month);
    };

    const bodyClasses = cx({
        'calendar-body': true,
        'calendar-years': pickedDate === 'years',
        'calendar-months': pickedDate === 'months'
    });

    return (
        <div className={bodyClasses}>
            {
                pickerType === 'years' ?
                    data.map((year, index) => {
                        return (
                            <span className={`${pickedDate.year === year ? 'active' : ''}`}
                                  onClick={bodyClickHandler(year)}
                                  key={index}>
                                {year}
                            </span>
                        )
                    })
                    :
                    months.map((month, index) => {
                        const isActive = pickedDate.month === month && pickedDate.year === data;
                        return (
                            <span className={`${ isActive ? 'active' : ''}`}
                                  onClick={bodyClickHandler(data, month)}
                                  key={index}>
                                {month}
                            </span>
                        )
                    })
            }
        </div>
    );
};

CalendarBody.propTypes = {
    data: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
        PropTypes.array
    ]).isRequired,
    months: PropTypes.array.isRequired,
    pickedDate: PropTypes.object.isRequired,
    onPickerChange: PropTypes.func.isRequired,
    pickerType: PropTypes.string.isRequired
};

export default CalendarBody;