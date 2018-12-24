const initalState = {
    username: null,
    firstName : null,
    lastName : null,
    email : null, 
    useEmailForApi: false,
    loading: false
};

export function registerReducer (state=initalState, action){
    if (action.type === 'REGISTER_REQUEST') {
        return Object.assign({}, state, {
            loading: true,
            error: null
        });
    }
    else if (action.type === 'REGISTER_SUCCESS') {
        return Object.assign({}, state, {
            loading: false,
            username: action.username,
            firstName : action.firstName,
            lastName : action.lastName,
            email : action.email, 
            useEmailForApi: action.useEmailForApi,
        });
    }
    else if (action.type === 'REGISTER_ERROR') {
        return Object.assign({}, state, {
            loading: false,
            error: action.error
        });
    }
    return state;
}
