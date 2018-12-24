import React, { Component } from 'react';
import FullCalendar from 'fullcalendar-reactwrapper';
import 'fullcalendar-reactwrapper/dist/css/fullcalendar.min.css';
import './calendar.css';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom';
//import Button from './button';
//import * as actions from './actions';

class Calendar extends Component {
    componentDidMount(){
       //add get all events for current user here 
    }
    render() {
        if(this.props.loggedId){
        return (
          <div className="main" id='example'>
            <FullCalendar id='calendar' className="App"
            header= {{
              left: 'prev,next today myCustomButton',
              center: 'title',
              right: 'month,basicWeek,basicDay'
            }}
            defaultDate={'2018-12-17'}
            navLinks= {true} // can click day/week names to navigate views
            editable= {true}
            eventLimit= {true} // allow "more" link when too many events
            events = {this.props.events}
            ></FullCalendar>
            </div>
        );
        } else {
            return (<div>Hello there, 
                 <Link to='/login'>please Log-in!</Link>
                </div>)
        }       
    }
}

const mapStateToProps = (state)=>({
    events : state.events,
    timeIsNow : state.timeIsNow,
    whereTo: state.whereTo,
    loggedId : state.auth.currentUser !== null
  });
export default connect(mapStateToProps)(Calendar);