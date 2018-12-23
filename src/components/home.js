import React, { Component } from 'react';
import {connect} from 'react-redux';
import Calendar from './calendar';
import { BrowserRouter as Router, Route, Link, NavLink } from 'react-router-dom';

class Home extends Component {
    render(){
        return (<Router>
                    <Calendar />
                </Router>
        );
    }
}

const mapStateToProps = (state)=>({
    events : state.events,
    timeIsNow : state.timeIsNow
  });
  export default connect(mapStateToProps)(Home);