import React from 'react'

const MatchListComponent = ({ matches }) => {
  if(matches){
    return <div>
      <div className={`row header`} key={`matchheader`}>
        <div className={`col-2`}></div>
        <div className={`col-1`}>mode</div>
        <div className={`col-2`}>map</div>
        <div className={`col-1`}>kills</div>
        <div className={`col-1`}>kos</div>
        <div className={`col-1`}>dmg</div>
        <div className={`col-1`}>revs</div>
        <div className={`col-1`}>place</div>
      </div>
      <div>
        {matches.map((match,index) =>
            <div className={`row ${(match.winPlace === 1)?'dinner':''}`} key={match.id}>
              <div className={`col-2`}>{match.date.toLocaleDateString().replace('/2020','')} {match.date.toLocaleTimeString([], {timeStyle: 'short'}).replace(' ', '').toLowerCase().replace('m','')}</div>
              <div className={`col-1`}>{match.gameMode}</div>
              <div className={`col-2`}>{match.mapName}</div>
              <div className={`col-1`}>{match.humanKills} | {match.botKills}</div>
              <div className={`col-1`}>{match.humanKnocks} | {match.botKnocks}</div>
              <div className={`col-1`}>{match.damageDealt}</div>
              <div className={`col-1`}>{match.revives}</div>
              <div className={`col-1`}>{match.winPlace}</div>
            </div>
        )}
      </div>
    </div>;
  } else {
    return <div>...loading basic match stats</div>
  }
}

export default MatchListComponent;
