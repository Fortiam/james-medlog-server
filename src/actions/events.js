export const addEvent = (title, startTime, endTime, patientName, medName)=>({
    type: 'ADD_EVENT',
    title,
    startTime,
    endTime,
    patientName,
    medName,
});
export const fetchAllEvents = ()=> dispatch => {

}

