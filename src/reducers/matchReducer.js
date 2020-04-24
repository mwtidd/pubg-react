import {GET_MATCH_FAILURE, GET_MATCH_PENDING, GET_MATCH_SUCCESS} from "../actions/types";

const initialState = {
  loading: false,
  matches: []
}

export default function matchReducer(state = initialState, action){
  switch(action.type){
    case GET_MATCH_PENDING:
      return {
        ...state,
        loading: true
      };
    case GET_MATCH_SUCCESS:
      return{
        ...state,
        loading: false,
        matches: [...state.matches, action.payload]
      };
    case  GET_MATCH_FAILURE:
      return {
        ...state,
        loading: false
      };
    default:
      return state;
  }
}
