import {GET_MATCH_FAILURE, GET_MATCH_PENDING, GET_MATCH_SUCCESS} from "./types";
import axios from 'axios';

const apiUrl = 'http://localhost:3000/xbox/na';

const fetchedMatchIds = [];
const fetchedMatches = [];

export const getMatch = (matchId) => {
    return (dispatch) => {
        dispatch(getMatchPending());
        /**
        if(fetchedMatchIds.length === 0 && fetchedMatches.length === 0){
            if(window.localStorage.getItem('storedMatches')){
                fetchedMatches = JSON.parse(window.localStorage.getItem('storedMatches'));
                console.log(`retrieved ${fetchedMatches.length} from local storage`);
                fetchedMatchIds = fetchedMatches.map(match => match.data.id);
            }
        }
         **/

        if (fetchedMatchIds.indexOf(matchId) === -1) {
            fetchedMatchIds.push(matchId);

            axios.get(`${apiUrl}/matches/${matchId}`)
                .then(res => {

                    // window.localStorage.setItem('storedMatches', JSON.stringify(fetchedMatches));
                    let matchTime = new Date(res.data.data.attributes.createdAt);
                    if(matchesDateFilter(matchTime) && matchesTypeFilter(res.data.data.attributes.gameMode)){
                        fetchedMatches.push(res.data);
                        dispatch(getMatchSuccess(res.data));
                    }
                }).catch(err => {
                dispatch(getMatchFailure(err));
            })
        }

    }
}

function matchesTypeFilter(type){
    if (type === 'tdm') return false;

    return true;// type === 'squad';
}

function matchesDateFilter(date){
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

function getRequestParam(name){
    if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(window.location.search))
        return decodeURIComponent(name[1]);
}


const getMatchPending = () => ({
    type: GET_MATCH_PENDING
});

const getMatchSuccess = match => ({
    type: GET_MATCH_SUCCESS,
    payload: {
        match
    }
});

const getMatchFailure = error => ({
    type: GET_MATCH_FAILURE, apiUrl,
    payload: {
        error
    }
});

