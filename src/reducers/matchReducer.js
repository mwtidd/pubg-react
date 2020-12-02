import {GET_MATCH_FAILURE, GET_MATCHES_SUCCESS, GET_RESULTS_SUCCESS} from "../actions/types";

const initialState = {
  loading: false,
  matchData: {matches: []},
  resultData: {results: []}
}

export default function matchReducer(state = initialState, action){
  switch(action.type){
    /**
    case GET_MATCH_PENDING:
      return {
        ...state,
        loading: true
      };
     **/
    case GET_MATCHES_SUCCESS:
      return{
        ...state,
        loading: false,
        matchData: action.payload
      };
    case  GET_MATCH_FAILURE:
      return {
        ...state,
        loading: false
      };
    case GET_RESULTS_SUCCESS:
      return{
        ...state,
        loading: false,
        resultData: action.payload
      };
    default:
      return state;
  }
}
