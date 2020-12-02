import React, {Component} from "react";
import PropTypes from "prop-types";
import {getMatch} from "../actions";
import {connect} from "react-redux";

class MatchContainer extends Component {

  constructor() {
    super();

    this.state = {matchData: null}
  }

  render() {
    return <div></div>;
  }

  componentDidMount(){
    this.props.fetchMatch(this.props.matchId);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(this.props.matches.length !== prevProps.matches.length){
      const matchData = this.props.matches.filter(match => match.data.id === this.props.matchId)[0];
      this.setState({matchData: matchData})
    } else if (this.state.matchData) {
      // console.log(this.state.matchData);
    }
  }
}

MatchContainer.propTypes = {
  matchId: PropTypes.string
}

const mapStateToProps = state => {
  return {
    matches: state.matchReducer.matches
  }
}

const mapDispatchToProps = dispatch => {
  return {
    fetchMatch: (matchId) => dispatch(getMatch(matchId))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MatchContainer)
