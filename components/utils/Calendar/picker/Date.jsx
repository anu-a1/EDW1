import React from 'react';
import DayPicker from "react-day-picker";
import moment from 'moment';
import "../../../../../../node_modules/react-day-picker/lib/style.css"

function Navbar({
  nextMonth,
  previousMonth,
  onPreviousClick,
  onNextClick,
  className,
  localeUtils,
}) {
  return (
    <div className={className}>
      <span
        className="icon-arrow-prev"
        style={{ float: 'left', cursor: 'pointer' }}
        onClick={() => onPreviousClick()}
      />
      <span
        className="icon-arrow-next"
        style={{ float: 'right', cursor: 'pointer' }}
        onClick={() => onNextClick()}
      />
    </div>
  );
}

export default class DayPickerView extends React.Component {

    state = {
        selectedDay: new Date()
    };

    handleDayClick = (day) => {
        this.props.onChange({
            value: moment(day).format("DD/MM/YYYY"),
            format: "DD/MM/YYYY"
        });

        this.setState({
            selectedDay: day
        });
    };

    render() {
        return (
            <DayPicker
                navbarElement={<Navbar />}
                selectedDays={ this.state.selectedDay }
                onDayClick={ this.handleDayClick }
            />);
    }
}