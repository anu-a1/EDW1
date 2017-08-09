import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import {FormControl, FormGroup, ControlLabel, HelpBlock} from "react-bootstrap";
import _ from "lodash";
import cx from 'classnames';
import moment from 'moment';

class Comments extends React.Component {

    static defaultProps = {
        asChat: false,
        errorMessage: 'Required field',
        isValidComment: true,
        enableAutoScroll: false,
        scheme: {
            from: "from",
            time: "time",
            text: "text"
        }
    };

    static propTypes = {
        scheme: PropTypes.object,
        userInfo: PropTypes.object.isRequired,
        asChat: PropTypes.bool,
        isValidComment: PropTypes.bool,
        enableAutoScroll: PropTypes.bool
    };

    state = {
        loading: true,
        newComments: [],
        message: "",
        messages: this.props.messages || []
    };

    scrollToBottom = () => {
        const node = ReactDOM.findDOMNode(this.messagesEnd);
        node.scrollIntoView({behavior: "smooth"});
    };

    shouldComponentUpdate(nextProps, nextState) {
        let shouldUpdate = nextProps.messages !== this.props.messages;
        shouldUpdate = this.state !== nextState || shouldUpdate;
        shouldUpdate = nextProps.isValidComment !== this.props.isValidComment || shouldUpdate;

        return shouldUpdate;
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.messages !== this.props.messages) {
            this.setState({messages: nextProps.messages});
        }
    };

    componentDidMount() {
        this.props.enableAutoScroll && this.scrollToBottom();
    }

    componentDidUpdate() {
        this.props.enableAutoScroll && this.scrollToBottom();
    }

    getNewComments = () => {
        return this.props.asChat ? this.state.newComments.join('\n') : this.formRef.elements.comment.value;
    };

    resetCommentArea = () => {
        this.formRef.elements.comment.value = '';
    };

    onPost = event => {
        if (!this.props.asChat) {
            return;
        }
        const keycode = event.keyCode || event.charCode;
        const isNewLine = event.shiftKey || event.ctrlKey;
        const isEnter = keycode === 13 && !isNewLine;
        if (!isEnter) {
            return;
        }
        event.preventDefault();
        const {userName} = this.props.userInfo;
        const messages = [...this.state.messages];
        const newComments = [...this.state.newComments];
        const text = event.target.value;
        const {scheme} = this.props.scheme;
        event.target.value = '';

        messages.push({
            [scheme.text]: text,
            [scheme.from]: userName,
            [scheme.time]: moment().format('MMMM Do YYYY, h:mm:ss A')
        });
        newComments.push(text);

        this.setState({messages, newComments});
    };

    render() {
        const {messages} = this.state;
        const {userName} = this.props.userInfo;
        const {scheme} = this.props;
        return (
            <div className="comments-block">
                <div className="block-collapsible-comments-content">
                    {_.map(messages, (message, index) => {
                        return <div key={`message-${index}`}
                                    className={cx({
                                        "block-user-comment": true,
                                        "is-me": userName === message[scheme.from]
                                    })}
                            >
                            <span className="comment-author">{message[scheme.from]}</span>

                            <div className="comment-text">
                                {_.map(message[scheme.text].split('\n'), (item, key) => {
                                    return <span key={key}>{item}<br/></span>
                                })}
                            </div>
                            <span className="comment-date">{message[scheme.time]}</span>
                        </div>
                    })}
                    <div style={{float:"left", clear: "both"}}
                         ref={el => {this.messagesEnd = el;}}></div>
                </div>
                <form ref={node => this.formRef = node}>
                    <div className="block-user-typing">
                        <FormGroup controlId="addComment"
                                   validationState={this.props.isValidComment ? null : 'error'}
                                   className="form-group-comment">
                            <ControlLabel>Add Comment</ControlLabel>
                            <FormControl componentClass="textarea"
                                         name="comment"
                                         onKeyPress={this.onPost}
                                         placeholder="Type your comment"
                                />
                            <HelpBlock>
                                {!this.props.isValidComment && this.props.errorMessage}
                            </HelpBlock>
                        </FormGroup>
                    </div>
                </form>
            </div>
        );
    };
}

export default Comments;
