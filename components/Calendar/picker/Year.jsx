import React from 'react';
import cx from 'classnames';
import _ from 'lodash';

export default class YearPicker extends React.Component {

    componentDidMount() {
        this.sliceYearsPerPage();
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.dates !== this.props.dates) {
            this.sliceYearsPerPage(nextProps.dates);
        }
    };

    state = {
        yearsPerPage: {
            1: [new Date().getFullYear()]
        },
        currentPage: 1,
        selected: null
    };

    sliceYearsPerPage = (dates) => {
        let years = dates || this.props.dates;
        if (_.isEmpty(years)) {
            return;
        }
        years = this.getYearsList(years.data);
        const pages = Math.ceil(years.length / 12);
        const currentYear = new Date().getFullYear();
        let yearsPerPage = {};
        let currentPage = 1;

        for (let i = 1; i <= pages; i += 1) {
            const padStart = i === 1 ? 0 : 12 * (i - 1);
            yearsPerPage[i] = years.slice(padStart, 12 * i);

            if (yearsPerPage[i].indexOf(currentYear) >= 0) {
                currentPage = i;
            }
        }

        this.setState({
            yearsPerPage,
            currentPage
        });
    };

    getYearsList = (dates) => {
        let years = _.map(dates || [], (date) => (date.year));
        return _.uniq(_.sortBy(years));
    };

    yearClickHandler = year => e => {
        this.setState({
            selected: year
        });
        this.props.onChange({
            value: year,
            format: 'YYYY'
        });
    };

    onPageChange = page => e => {
        this.setState({
            currentPage: page
        });
    };

    getYearsRange = (data) => {
        if (data.length > 1) {
            return `${data[0]}-${data[data.length - 1]}`
        }
        return data[0];
    };

    render() {
        const {yearsPerPage, currentPage, selected} = this.state;
        const data = yearsPerPage[currentPage];
        const yearsPageRange = this.getYearsRange(data);
        const nextPage = yearsPerPage[currentPage + 1] ? currentPage + 1 : currentPage;
        const prevPage = yearsPerPage[currentPage - 1] ? currentPage - 1 : currentPage;

        return (
            <div className="year-picker">
                <div className="picker-header">
                    <span className="icon-arrow-prev" onClick={this.onPageChange(prevPage)}/>
                    <span>{yearsPageRange}</span>
                    <span className="icon-arrow-next" onClick={this.onPageChange(nextPage)}/>
                </div>
                <div className="picker-body">
                    {
                        data.map((year, index) => (
                            <span onClick={this.yearClickHandler(year)}
                                  key={index}
                                  className={cx({
                                      current: selected === year
                                  })}>
                            {year}
                            </span>
                        ))
                    }
                </div>
            </div>
        );
    }
}