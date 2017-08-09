import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';

export default class MonthPicker extends React.Component {

    componentDidMount() {
        this.defineYears();
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.dates !== this.props.dates) {
            this.defineYears(nextProps.dates);
        }
    }

    static months = [['Jan', 'Feb', 'Mar', 'Apr'], ['May', 'Jun', 'Jul', 'Aug'], ['Sep', 'Oct', 'Nov', 'Dec']];

    state = {
        currentPage: 0,
        selected: {},
        years: [new Date().getFullYear()]
    };

    defineYears = (dates) => {
        let years = dates || this.props.dates;
        if (_.isEmpty(years)) {
            return;
        }
        years = this.getYearsList(years.data);
        const currentYear = new Date().getFullYear();
        const isCurrentYearInSet = years.indexOf(currentYear);
        const currentPage = isCurrentYearInSet >= 0 ? isCurrentYearInSet : 0 ;

        return this.setState({
            years,
            currentPage
        });
    };

    getYearsList = (dates) => {
        const years = _.map(dates, (date) => (date.year));
        return _.uniq(_.sortBy(years));
    };

    monthClickHandler = (month, year) => e => {
        this.setState({
            selected: {
                month,
                year
            }
        });
        const parsedMonth = moment(month, "MMM").format("MM");
        
        this.props.onChange({
            value: `${parsedMonth}/${year}`,
            format: 'MM/YYYY'
        });
    };

    onPageChange = page => e => {
        this.setState({
            currentPage: page
        });
    };

    render() {
        const {currentPage, selected, years} = this.state;
        const year = years[currentPage];
        const nextPage = years[currentPage + 1] ? currentPage + 1 : currentPage;
        const prevPage = years[currentPage - 1] ? currentPage - 1 : currentPage;

        return (
            <div className="month-picker">
                <div className="picker-header">
                    <span className="icon-arrow-prev" onClick={this.onPageChange(prevPage)}/>
                    <span>{year}</span>
                    <span className="icon-arrow-next" onClick={this.onPageChange(nextPage)}/>
                </div>
                <div className="picker-body">
                    {
                        this.constructor.months.map((row, index) => {
                            return <div className="month-row" key={`${row}-${index}`}>
                                {
                                    row.map((month, idx) => {
                                        return <span onClick={this.monthClickHandler(month, year)}
                                            key={`${month}${idx}`}
                                            className={cx({
                                                active: selected.month === month && selected.year === year
                                            })}>
                                        {month}
                                        </span>
                                    })
                                }
                            </div>
                        })
                    }
                </div>
            </div>
        );
    }
}