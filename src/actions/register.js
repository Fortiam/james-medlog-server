import {API_BASE_URL} from '../config';
import {SubmissionError} from 'redux-form';
/*
'REGISTER_SUCCESS'
    username: action.username,
    firstName : action.firstName,
    lastName : action.lastName,
    email : action.email, 
    useEmailForApi: action.useEmailForApi,
*/
export const registerRequest = () =>({
    type: 'REGISTER_REQUEST'
});
export const registerSuccess = (payload)=>({
    type: 'REGISTER_SUCCESS',
    payload
});
export const registerError = (error)=>({
    type: 'REGISTER_ERROR',
    error
});

export const registerMe = user => dispatch=> {
    dispatch(registerRequest());
    return fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(user)
    })
    .then(badData=> badData.json())
    .then(goodData=> {
        dispatch(registerSuccess(goodData))
    })
    .catch(err=> dispatch(registerError(err)));
};