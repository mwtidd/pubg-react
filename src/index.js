import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import * as serviceWorker from './serviceWorker';

import { Provider } from 'react-redux';
import {applyMiddleware, createStore} from 'redux';
import rootReducer from './reducers';
import thunk from "redux-thunk";

import 'font-awesome/css/font-awesome.min.css';

const store = createStore(rootReducer, applyMiddleware(thunk))

const rootElement = document.getElementById('root');ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    rootElement
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
