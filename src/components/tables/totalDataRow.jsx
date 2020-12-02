import React from 'react'

const TotalDataRow = (props) => {
  let state = props.state;
  return <div className={`row align-items-center`}>
    <div className={`col-1`}><img className={`w-100`} src={`/static/images/ranks/${props.rank.currentTier}-${props.rank.currentSubTier}.png`} alt={`${props.rank.currentTier}-${props.rank.currentSubTier}`}/> </div>
    <div className={`col-3 text-left`}>
      {props.username}<span className={`game-count`}>({(state.matchCount)} games)</span>
    </div>
    <div className={`col-1`}>
      <span className={`font-weight-bold`}>{(state.totalKills + state.totalAssists)}</span>
    </div>
    <div className={`col-1`}>
      <span className={`font-weight-bold`}>{state.totalDamage}</span>
    </div>
    <div className={`col-1`}>
      <span className={`font-weight-bold`}>{state.winCount}</span>
    </div>
    <div className={`col-2`}>
      <span className={`font-weight-bold`}>{Math.round(10 * state.rank.avgRank) / 10}</span>
    </div>
  </div>
}

export default TotalDataRow;
