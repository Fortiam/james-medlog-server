import React, { Component } from 'react';
import FullCalendar from 'fullcalendar-reactwrapper';
import 'fullcalendar-reactwrapper/dist/css/fullcalendar.min.css';
import './calendar.css';
import {connect} from 'react-redux';
//import Button from './button';
//import * as actions from './actions';

class Calendar extends Component {
    componentDidMount(){
        
    }
    render() {
        return (
          <div className="main" id='example'>
            <FullCalendar id='james' className="App"
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
    }
}

const mapStateToProps = (state)=>({
    events : state.events,
    timeIsNow : state.timeIsNow
  });
  export default connect(mapStateToProps)(Calendar);