import jwtDecode from 'jwt-decode';
import {API_BASE_URL} from '../config';
import {SubmissionError} from 'redux-form';

export const setAuthToken = authToken => ({
    type: 'SET_AUTH_TOKEN',
    authToken
});

export const clearAuth = () => ({
    type: 'CLEAR_AUTH'
});

export const authRequest = () => ({
    type: 'AUTH_REQUEST'
});

export const authSuccess = currentUser => ({
    type: 'AUTH_SUCCESS',
    currentUser
});

export const authError = error => ({
    type: 'AUTH_ERROR',
    error
});

const storeAuthInfo = (authToken, dispatch) => {
    const decodedToken = jwtDecode(authToken);
    dispatch(setAuthToken(authToken));//saves to state here.
    dispatch(authSuccess(decodedToken.user));
}

export const login = (username, password) => dispatch => {
    dispatch(authRequest());
    return (
        fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        })
        .then(res => res.json())
        .then(({authToken}) => storeAuthInfo(authToken, dispatch))
        .catch(err => {
            const {code} = err;
            const message =
                code === 401
                    ? 'Incorrect username or password'
                    : 'Unable to login, please try again';
            dispatch(authError(err));
            // Could not authenticate, so return a SubmissionError for Redux
            // Form
            return Promise.reject(
                new SubmissionError({
                    _error: message
                })
            );
        })
);
};