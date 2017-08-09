import React, {Component} from 'react';
import {Navbar, Nav, Button, FormControl} from "react-bootstrap";
import {Link, withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';

import NavItemLink from '../components/NavItemLink';
import LogoIcon from '../../icons/logo.png';
import LogOutIcon from '../../icons/svg/log-out.svg';

class Header extends Component {

    static propTypes = {
        menuItems: PropTypes.array.isRequired
    };

    shouldComponentUpdate(nextProps) {
        return nextProps.location.pathname !== this.props.location.pathname;
    }

    render() {
        const {menuItems} = this.props;
        return (
            <Navbar fluid={true} fixedTop={false}>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/">
                            <img src={LogoIcon} className="img-responsive" alt="logotype" />
                        </Link>
                    </Navbar.Brand>
                </Navbar.Header>
                <div className="navbar-content">
                    <Nav>
                        {
                            menuItems.map((item, index) => (
                                <NavItemLink isDefault={item.isDefault} eventKey={index+1} key={index} to={`/${item.path}`}>
                                    {item.title}
                                </NavItemLink>
                            ))
                        }
                    </Nav>
                    <div className="nav-form">
                        <Button bsStyle="primary">
                            <span className="icon-cube"></span> Reprocess Cube
                        </Button>
                        <FormControl componentClass="select" placeholder="select">
                            <option value="select">User Group</option>
                            <option value="other">...</option>
                        </FormControl>
                        <FormControl componentClass="select" placeholder="select">
                            <option value="select">User Role</option>
                            <option value="other">...</option>
                        </FormControl>

                        <Link className="btn-logout" to="/">
                            <img src={LogOutIcon} alt="log out icon" />
                        </Link>
                    </div>
                </div>

            </Navbar>
        );
    }
}

export default withRouter(Header);