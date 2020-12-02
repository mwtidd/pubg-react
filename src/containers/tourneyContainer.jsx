import React, {Component} from "react";
import {connect} from "react-redux";

class TourneyContainer extends Component {

  render() {
    if (this.props.data) {
      return <table className={`table table-dark`}>
        <thead className={`text-uppercase`}>
        <tr>
          <th>rank</th>
          <th>team</th>
          <th>points</th>
          <th>wins</th>
          <th>kills</th>
          <th>knocks</th>
          <th>damage</th>
        </tr>
        </thead>
        <tbody>
          {this.props.data.results.map((result, index) =>
              <tr key={index}>
                <td>#{index + 1}</td>
                <td>{result.name}</td>
                <td>{result.points}</td>
                <td>{result.wins}</td>
                <td>{result.kills}</td>
                <td>{result.knocks}</td>
                <td>{result.damage}</td>
            </tr>)}
        </tbody>
      </table>;
    } else {
      return <div></div>;
    }

  }
}

TourneyContainer.propTypes = {
}

const mapStateToProps = state => {
  return {
    data: state.matchReducer.resultData
  }
}

export default connect(
  mapStateToProps
)(TourneyContainer)
