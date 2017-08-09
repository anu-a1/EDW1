import React from 'react';

class Loading extends React.Component {

    static defaultProps = {
        show: false,
        delay: 200,
        immediately: false
    };

    state = {
        show: false
    };

    shouldComponentUpdate(nextProps, nextState) {
        return nextState.show !== this.state.show;
    };

    componentDidMount() {
        this.setupShow(this.props.show);
    };

    componentWillReceiveProps(nextProps) {
        this.setupShow(nextProps.show);
    };

    componentWillUnmount() {
        clearTimeout(this.timeout);
    };

    setupShow = doShow => {
        clearTimeout(this.timeout);
        let {delay, immediately} = this.props;
        const {show} = this.state;
        const waiting = (new Date()).getTime() - this.timeStart;
        const doHide = !doShow && show;

        if (doHide && isNaN(waiting)) {
            immediately = false;
        } else if (doHide && waiting < delay) {
            delay -= waiting;
        } else if (doHide && waiting >= delay) {
            immediately = true;
        }

        if (!delay || immediately) {
            this.setState({show: doShow});
            return;
        }

        this.timeout = setTimeout(() => {
            if (doShow) {
                this.timeStart = (new Date()).getTime();
            }
            this.setState({show: doShow})
        }, delay);
    };

    render() {
        return this.state.show ? (
            <div className="loader-wrapper">
                <div className="loader-content">
                    <div className="sk-cube-grid">
                        <div className="sk-cube sk-cube1"></div>
                        <div className="sk-cube sk-cube2"></div>
                        <div className="sk-cube sk-cube3"></div>
                        <div className="sk-cube sk-cube4"></div>
                        <div className="sk-cube sk-cube5"></div>
                        <div className="sk-cube sk-cube6"></div>
                        <div className="sk-cube sk-cube7"></div>
                        <div className="sk-cube sk-cube8"></div>
                        <div className="sk-cube sk-cube9"></div>
                    </div>
                </div>
            </div>
        ) : null;
    };
}

export default Loading;