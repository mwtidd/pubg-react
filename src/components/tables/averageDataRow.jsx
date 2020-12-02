import React from 'react'
import PropTypes from "prop-types";

const AverageDataRow = (props) => {
  let state = props.state;
  // loading state
  if(!state.rank) return <div></div>;

  const getImageSrc = function(rank){
    if(!rank || !rank.currentTier) return '';
    if(rank.currentTier.toLowerCase() === 'master')
      return `/static/images/ranks/${props.rank.currentTier}.png`;
    return `/static/images/ranks/${props.rank.currentTier}-${props.rank.currentSubTier}.png`;
  }

  const kda = (state.rank.kills + state.rank.assists) / state.rank.roundsPlayed;

  // loaded state
  return <div className={`table-row row align-items-center`}>
    <div className={`col-2 col-md-1`}><img className={`w-75`} src={getImageSrc(props.rank)} alt={`${props.rank.currentTier}-${props.rank.currentSubTier} (${state.rank.currentRankPoint})`}  onClick={props.onShowHistoryModal ? props.onShowHistoryModal: null}/> </div>
    <div className={`col-4 col-md-2 text-left`}>
      <span onClick={props.onShowPlayerModal ? props.onShowPlayerModal: null}><span className={`player-name text-left`}>{props.username}</span></span>
      <br/>
      <span onClick={props.onShowMatchesModal ? props.onShowMatchesModal: null}><span className={`game-count text-left`}>{(state.rank.roundsPlayed)} games</span></span>
    </div>
    <div className={`col-2 col-md-1`}>
      <span className={`font-weight-bold`}>{Math.round(10 * kda) / 10}</span>
    </div>
    <div className={`col-1 d-none d-md-block`}>
      <span className={`font-weight-bold`}>{Math.round(10 * (state.rank.kills / (state.rank.roundsPlayed)))/10}</span>
    </div>
    <div className={`col-1 d-none d-md-block`}>
      <span className={`font-weight-bold`}>{Math.round(10 * (state.rank.assists / (state.rank.roundsPlayed)))/10}</span>
    </div>
    <div className={`col-2 col-md-1`}>
      <span className={`font-weight-bold`}>{Math.round((state.rank.damageDealt / (state.rank.roundsPlayed)))}</span>
    </div>
    <div className={`col-1 d-none d-md-block`}>
      <span className={`font-weight-bold`}>{Math.round(10 * 100*(state.rank.wins / (state.rank.roundsPlayed)))/10}</span>
    </div>
    <div className={`col-1`}>
      <span className={`font-weight-bold`}>{Math.round(10 * state.rank.avgRank) / 10}</span>
    </div>
    <div className={`col-1 d-none d-md-block`}>
      <span className={`font-weight-bold`}>{Math.round(10 * (state.rank.avgRank - kda)) / 10}</span>
    </div>
    <div className={`col-1 d-none d-md-block`}></div>
    <div className={`col-1 d-none d-md-block`}>
      <div className={`${(props.showDelete)?'':'d-none'}`}><div className={`text-white fa fa-trash btn border-white`} onClick={()=> {
        props.onDelete && props.onDelete();
      }}></div></div>
    </div>
  </div>
}

AverageDataRow.propTypes = {
  onShowHistoryModal: PropTypes.func,
  onShowPlayerModal: PropTypes.func,
  onShowMatchesModal: PropTypes.func,
  onDelete: PropTypes.func,
  state: PropTypes.object,
  rank: PropTypes.object,
  show: PropTypes.bool
}

export default AverageDataRow;
