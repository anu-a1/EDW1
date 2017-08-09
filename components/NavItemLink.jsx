import React from 'react';
import {withRouter} from 'react-router-dom';
import {NavItem} from 'react-bootstrap';
import PropTypes from 'prop-types';

const ListItemLink = ({to, children, isDefault, history, location, eventKey}) => {

    const linkClickHandler = path => e => {
        history.push(path);
    };
    const isRootPath = location.pathname === '/' && isDefault;

    return (
        <NavItem active={isRootPath || location.pathname === to}
                 eventKey={eventKey}
                 onClick={linkClickHandler(to)}>{children}</NavItem>
    );
};

ListItemLink.propTypes = {
    to: PropTypes.string.isRequired,
    children: PropTypes.string.isRequired,
    isDefault: PropTypes.bool,
    eventKey: PropTypes.number,
    location: PropTypes.object,
    history: PropTypes.object
};

export default withRouter(ListItemLink);