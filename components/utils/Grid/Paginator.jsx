import React, {Component} from 'react';
import {Button, ButtonGroup} from 'react-bootstrap';
import PropTypes from 'prop-types';

class Paginator extends Component {

    static propTypes = {
        pagesCount: PropTypes.array.isRequired,
        currentPage: PropTypes.number.isRequired,
        onPaginatorClick: PropTypes.func.isRequired
    };

    handleButtonClick = (page) => (e) => {
        this.props.onPaginatorClick(page);
    };

    render() {
        const {pagesCount,currentPage} = this.props;
        const prevPage = currentPage > 1? currentPage - 1  : currentPage;
        const nextPage = currentPage < pagesCount.length ? currentPage + 1  : currentPage;

        return (
            <ButtonGroup>
                <Button onClick={this.handleButtonClick(prevPage)}>&lt;</Button>
                {
                    pagesCount.map((page) => {
                        return (
                            <Button className={currentPage === page ? 'active' : ''}
                                    onClick={this.handleButtonClick(page)}
                                    key={page}>
                                {page}
                            </Button>
                        );
                    })
                }
                <Button onClick={this.handleButtonClick(nextPage)}>&gt;</Button>
            </ButtonGroup>
        );
    }
}

export default Paginator;