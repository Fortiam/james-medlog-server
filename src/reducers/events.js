import moment from 'moment';
const initalState = {
    events: [],
    timeIsNow: moment().format(),
    whereTo: false
};

export const reducer = (state = initalState, action)=>{
    if (action.type === 'ADD_EVENT') {
        console.log("add event fired");
        let newState = Object.assign({}, state, { 
            events: [ ...state.events, {title: action.title,
                start: action.startTime
            }]
        });
        return newState;
    }
    return state;
}
