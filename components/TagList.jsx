import React, {Component} from 'react';
import PropTypes from 'prop-types';

class TagList extends Component {

    static defaultProps = {
        show: true
    };

    static propTypes = {
        tags: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object
        ]).isRequired,
        labelKey: PropTypes.string.isRequired,
        comparePredicate: PropTypes.func,
        show: PropTypes.bool
    };

    shouldComponentUpdate(nextProps) {
        return (nextProps.tags !== this.props.tags) || (nextProps.show !== this.props.show);
    };

    render() {
        const {labelKey, tags, show} = this.props;
        return (
            <ul className="list-blocks">
                {
                    show && tags.map((item, index) => (
                        <li key={index}>
                            {
                                labelKey ? item[labelKey] : item
                            }
                        </li>
                    ))
                }
            </ul>
        )
    };

}

export default TagList;