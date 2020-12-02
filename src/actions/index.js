import {GET_MATCH_FAILURE, GET_MATCHES_SUCCESS, GET_RESULTS_SUCCESS} from "./types";
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const apiUrl = `${API_URL}/xbox/na`;

const matches = new Map();
let fetchedMatchIds = [];
// let fetchedMatches = [];
let fetchedMatchDetails = [];
// const players = [];

export const getMatches = (matchIds) => {
    return (dispatch) => {
        matchIds.forEach(async (matchId) => {
            try {
                const data = await fetchMatch(matchId);

                if(data){
                    dispatch(getResultsSuccess(data.results));
                    dispatch(getMatchesSuccess(data.details));
                }
            } catch (e) {
                console.error(e);
                dispatch(getMatchFailure(e));
            }
        });
    }
}

const fetchMatch = async (matchId) => {
    // dispatch(getMatchPending());
    matches.set(matchId, null);

    if (fetchedMatchIds.indexOf(matchId) === -1) {
        fetchedMatchIds.push(matchId);

        const reqUrl = `${apiUrl}/matches/${matchId}`;

        const mRes = await axios.get(reqUrl);

        let match = mRes.data;

        const results = getResults();

        // let matchTime = new Date(match.attributes.createdAt);

        // only pull ranked matches
        if( !matchesTypeFilter(match.attributes.matchType)){
            matches.delete(matchId);
            return {results: results, details: fetchedMatchDetails};
        }

        /**
         fetchedMatches.push(match);

         matches.set(matchId, match);

         fetchedMatchDetails.push(match);

         console.log('get match');

         if(isLoadingComplete()) {

                        console.log('loading is complete');


                        // console.log(fetchedMatches);
                        const results = getResults();
                        dispatch(getResultsSuccess(results));
                        dispatch(getMatchesSuccess(fetchedMatchDetails));
                    }
         **/
        matches.set(matchId, match);




        if (false) {
            // if(matchesMapFilter(match.attributes.mapName) && matchesDateFilter(matchTime) && matchesModeFilter(match.attributes.gameMode) && matchesTypeFilter(match.attributes.matchType)){

            // let telemetryUrl = match['included'].filter(item => item.type === 'asset' && item.attributes.name === 'telemetry')[0].attributes.url;
            let telemetryUrl = match.relationships.assets[0].attributes.URL;

            const tRes = await axios.get(telemetryUrl);


            let telemetryData = parseTelemetryData(tRes);
            match.telemetryData = telemetryData;

            matches.set(matchId, match);

            fetchedMatchDetails.push(match);

            return {results: results, details: fetchedMatchDetails};

            /**

             if(isLoadingComplete()) {


                                // console.log(fetchedMatches);
                                return {results: results, details: fetchedMatchDetails};
                            }

             **/

        } else {
            fetchedMatchDetails.push(match);

            return {results: results, details: fetchedMatchDetails};

            /**

             if(isLoadingComplete()) {

                             // console.log(fetchedMatches);

                             return {results: results, details: fetchedMatchDetails};
                         }
             **/
        }
    }
}

export const getMatch = (matchId) => {
    return async (dispatch) => {
        try {
            const data = await fetchMatch(matchId);

            if(data){
                dispatch(getResultsSuccess(data.results));
                dispatch(getMatchesSuccess(data.details));
            }

        } catch (e) {
            console.error(e);
            dispatch(getMatchFailure(e));
        }
    }
}

/**
function isLoadingComplete() {

    for (let matchId of matches.keys()) {
        let match = matches.get(matchId);
        if(!match)
            return false;
    }
    return true;
}
 **/

function getParticipants(match){
    let participants = [];
    match.relationships.rosters.forEach(roster => {
        participants = participants.concat(roster.relationships.participants);
    });
    return participants;
}

function getResults() {
    // player account id to match count map
    const matchCountMap = new Map();
    fetchedMatchDetails.forEach(match => {

        const participants = getParticipants(match);
        // const participants = match.included.filter(item => item.type === 'participant');

        participants.forEach(player => {
            const playerAccountId = player.attributes.stats.playerId;
            // const playerMatchId = player.id;

            if (matchCountMap.get(playerAccountId) === undefined) {
                matchCountMap.set(playerAccountId, 1);
            } else {
                matchCountMap.set(playerAccountId, matchCountMap.get(playerAccountId) + 1);
            }
        });
    });

    // look for players that player in every match
    for(let playerId of matchCountMap.keys()) {
        if(matchCountMap.get(playerId) < fetchedMatchDetails.length){
            matchCountMap.delete(playerId);
        }
    }

    const teamMap = new Map();


    // player account id to player name map
    const playerNameMap = new Map();
    fetchedMatchDetails.forEach(match => {


        // player match id to player account id map
        const playerAccountIdMap = new Map();
        const playerKillMap = new Map();
        const playerKnockMap = new Map();
        const playerDamageMap = new Map();

        const participants = getParticipants(match);
        // const participants = match.included.filter(item => item.type === 'participant');

        participants.forEach(player => {
            const playerAccountId = player.attributes.stats.playerId;
            const playerMatchId = player.id;

            playerAccountIdMap.set(playerMatchId, playerAccountId);
            playerKillMap.set(playerMatchId, player.attributes.stats.kills);
            playerKnockMap.set(playerMatchId, player.attributes.stats.DBNOs);
            playerDamageMap.set(playerMatchId, player.attributes.stats.damageDealt);

            const playerName = player.attributes.stats.name;
            playerNameMap.set(playerAccountId, playerName);
        });

        const teams = match.relationships.rosters;
        // const teams = match.included.filter(item => !item.type);
        // const rosters = match.data.relationships.rosters.data;
        teams.forEach(team => {
            // get the player by their player match id

            let kills = 0;
            let wins = 0;
            let knocks = 0;
            let damage = 0;

            const rank = team.attributes.stats.rank;
            if (rank === 1) {
                wins = 1;
            }

            let matchData = {};
            matchData.players = [];

            let mates = [];

            team.relationships.participants.forEach(mate => {
                const playerMatchId = mate.id;
                const playerAccountId = playerAccountIdMap.get(playerMatchId);
                const playerName = playerNameMap.get(playerAccountId);

                if(!matchCountMap.has(playerAccountId)) {
                    // player did not play in all matches, they are not eligible
                    return;
                }

                mates.push({
                    id: playerAccountId,
                    name: playerName
                });

                const playerKills = playerKillMap.get(playerMatchId);
                const playerKnocks = playerKnockMap.get(playerMatchId);
                const playerDamage = playerDamageMap.get(playerMatchId);

                matchData.players.push({id: playerAccountId, name: playerName, kills: playerKills, knocks: playerKnocks, damage: playerDamage});

                kills += playerKills;
                knocks += playerKnocks;
                damage += playerDamage;

            });

            matchData.points = (wins * getWinPoints()) + (kills * getKillPoints());
            matchData.wins = wins;
            matchData.kills = kills;
            matchData.knocks = knocks;
            matchData.damage = damage;

            if (mates.length === 0) {
                return;
            }

            let names = mates.map(mate => mate.name);
            names = names.sort();

            const teamName = names.join(' | ');


            if (!teamMap.has(teamName)) {
                teamMap.set(teamName, {matches: [matchData], teamName: teamName});
            } else {
                teamMap.get(teamName).matches.push(matchData);
            }
        });




    });

    let results = [];
    for(let teamName of teamMap.keys()) {
        const matches = teamMap.get(teamName).matches;
        if (matches.length < fetchedMatchDetails.length) {
            teamMap.delete(teamName);
        } else {
            let points = 0;
            let kills = 0;
            let wins = 0;
            let knocks = 0;
            let damage = 0;
            matches.forEach(match => {
                points += match.points;
                kills += match.kills;
                wins += match.wins;
                knocks += match.knocks;
                damage += match.damage;
            });
            teamMap.get(teamName).points = points;
            results.push({name: teamName, points: points, kills: kills, wins: wins, knocks: knocks, damage: damage});
        }
    }

    results = results.sort((a,b) => {
        if(a.points > b.points){
            return -1;
        } else if (b.points > a.points) {
            return 1;
        } else if (a.knocks > b.knocks) {
            return -1;
        } else if(b.knocks > a.knocks) {
            return 1;
        } else if (a.damage > b.damage) {
            return -1;
        } else if(b.damage > a.damage) {
            return 1;
        }
        return 0;
    });

    // console.log(results);

    return results;

}

/**
// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};
 **/

function parseTelemetryData(r) {
    const telemetryData = {
        stateEvents: [],
        killEvents: [],
        knockEvents: [],
        // attackEvents: []
    };

    telemetryData.killEvents = r.data.filter( telemetryEvent => telemetryEvent['_T'] === 'LogPlayerKill' );

    telemetryData.knockEvents = r.data.filter( telemetryEvent => telemetryEvent['_T'] === 'LogPlayerMakeGroggy' );

    // telemetryData.attackEvents = r.data.filter( telemetryEvent => telemetryEvent['_T'] === 'LogPlayerTakeDamage' );

    telemetryData.stateEvents = r.data.filter( telemetryEvent => telemetryEvent['_T'] === 'LogGameStatePeriodic' );

    return telemetryData;
}

function getWinPoints(){
    return Number.parseInt(getRequestParam('winPoints'))
}

function getKillPoints(){
    return Number.parseInt(getRequestParam('killPoints'))
}

function matchesTypeFilter(type){
    return type === 'competitive';
}

/**
function matchesMapFilter(map){
    return map !== 'Range_Main';
}



function matchesModeFilter(mode){
    let matchView = getRequestParam('matchView') === '1';
    if(matchView) return true;

    if (mode === 'tdm') return false;
    // else if (type.indexOf('fpp') > -1) return false;

    return true; // type === 'squad';// ; //type === 'duo';//
}

function matchesDateFilter(date){
    let matchView = getRequestParam('matchView') === '1';
    if(matchView) return true;

    let days = getRequestParam('days');
    if (days) {
        days =  Number.parseInt(days) - 1;
    } else {
        days = 0;
    }

    let today = new Date();
    if (today.getHours() < 6) {
        days++;
    }

    // filter anything within the week
    let pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - days);
    pastDate.setHours(6);
    pastDate.setMinutes(0);

    return date > pastDate;
}
 **/

function getRequestParam(name){
    if(name =(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(window.location.search))
        return decodeURIComponent(name[1]);
}

/**
const getMatchPending = () => ({
    type: GET_MATCH_PENDING
});
**/

const getMatchesSuccess = matches => ({
    type: GET_MATCHES_SUCCESS,
    payload: {
        matches
    }
});

const getResultsSuccess = results => ({
    type: GET_RESULTS_SUCCESS,
    payload: {
        results
    }
});

const getMatchFailure = error => ({
    type: GET_MATCH_FAILURE, apiUrl,
    payload: {
        error
    }
});

