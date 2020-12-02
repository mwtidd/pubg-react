import React, {Component} from "react";
import PropTypes from "prop-types";
import {getMatches} from "../actions";
import {connect} from "react-redux";
import axios from 'axios';


const API_URL = process.env.REACT_APP_API_URL;

class PlayerMatchListContainer extends Component {

    render() {
        if(!this.props.matches) return <div></div>;

        const rows = this.props.matches.map(
            match => <tr key={match.id}>
                <td>match</td>
                <td></td>
            </tr>
        );

        return <div>
            <table>
                <thead></thead>
                <tbody>
                {rows}
                </tbody>
            </table>
        </div>;
    }

    componentDidMount(){
        this.serviceUrl = `${API_URL}/${this.props.platform}/${this.props.region}`;
        const reqUrl = `${this.serviceUrl}/players/${encodeURIComponent(this.props.username)}/matches`;

        axios.get(reqUrl)
            .then(res => this.initMatches(res.data))
            .catch(error => {console.error(error);});


    }

    initMatches(matches) {
        let matchIds = matches.map(match => match.id);

        this.props.fetchMatches(matchIds);
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        return true;
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.matches.length !== prevProps.matches.length){
            const matchData = this.props.matches.filter(match => match.data.id === this.props.matchId)[0];
            this.setState({matchData: matchData});
        } else {
            console.log('no new matches');
        }
    }
}

PlayerMatchListContainer.propTypes = {
    platform: PropTypes.string,
    region: PropTypes.string,
    username: PropTypes.string
}

const mapStateToProps = state => {
    return {
        matches: state.matchReducer.matchData.matches
    }
}

const mapDispatchToProps = dispatch => {
    return {
        fetchMatches: (matchIds) => dispatch(getMatches(matchIds))
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PlayerMatchListContainer)
