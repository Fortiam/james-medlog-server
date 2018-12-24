import React, { Component } from 'react';
import {connect} from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';//Link, NavLink 
import FormRegister from './formRegister';
import Welcome from './welcome';
import FormLogin from './formLogin';
import Header from './header';
import Main from './main';
import Calendar from './calendar';
import Patient from './patient';
import Medicine from './medicine';
import Userinfo from './userinfo';

class Home extends Component {
    render(){
        return (<div>
                <Router>
                    <div>
                    <Header />
                    <Route exact path='/' component={Welcome} />
                    <Route exact path='/register' component={FormRegister} />
                    <Route exact path='/login' component={FormLogin} />
                    <Route exact path='/main' component={Main} />
                    <Route exact path='/calendar' component={Calendar} />
                    <Route exact path='/patient' component={Patient} />
                    <Route exact path='/medicine' component={Medicine} />
                    <Route exact path='/userinfo' component={Userinfo} />
                    </div>
                </Router>
                </div>
        );
    }
}

const mapStateToProps = (state)=>({
    events : state.events,
    timeIsNow : state.timeIsNow
  });
  export default connect(mapStateToProps)(Home);