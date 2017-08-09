import React, {Component} from 'react';
import {Button, FormGroup, ControlLabel} from "react-bootstrap";

import Select from './utils/Fields/Select';
import LogoIcon from '../../icons/logo.png';

class Login extends Component {

    render() {
        return (
            <div className="app-login">
                <div className="logo-block">
                    <img src={LogoIcon} className="img-responsive" alt="logotype" />
                </div>

                <div className="login-block">
                    <div className="login-block-content">
                        <form>
                            <FormGroup
                                controlId="loginArea">
                                <ControlLabel>Business Area</ControlLabel>
                                <Select name="loginArea"
                                        placeholder="Select Business Area"
                                        options={[]}
                                />
                            </FormGroup>

                            <FormGroup
                                controlId="loginTeam">
                                <ControlLabel>Business Team</ControlLabel>
                                <Select name="loginTeam"
                                        placeholder="Select Business Team"
                                        options={[]}
                                />
                            </FormGroup>

                            <FormGroup
                                controlId="loginRole">
                                <ControlLabel>Role</ControlLabel>
                                <Select name="loginRole"
                                        placeholder="Select Role"
                                        options={[]}
                                />
                            </FormGroup>

                            <Button bsStyle="primary" type="submit">Log In</Button>
                        </form>
                    </div>
                </div>
            </div>
        );
    };
}

export default Login;