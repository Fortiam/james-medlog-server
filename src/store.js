import {createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import {reducer} from './reducers/events';
import {authReducer} from './reducers/auth';
import {registerReducer} from './reducers/register';

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(
    combineReducers({
        events : reducer,
        auth: authReducer,
        signUp : registerReducer
    }),
    composeEnhancers(applyMiddleware(thunk))
);
