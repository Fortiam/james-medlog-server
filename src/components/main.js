import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Redirect, Link } from 'react-router-dom';
import Calendar from './calendar';

class Main extends Component {

    buttonClick(value){
             
    }
    render(){
     if(this.props.loggedIn){
         return (<div>
            <h2>Welcome to the Home Page, this needs to be re-styled..</h2>
            <p><Link to="/calendar" >Visit Calendar</Link></p>
            <p><button type="button" >Add/Edit new Family Member/pet</button></p>
            <p><button type="button" >Add/Edit custom Medicine</button></p>
            <p><button type="button" >Edit Account Details/Info</button></p>
            
            </div>)
     }
       else return (<div>hello, please Log in..</div>);
    }
}
const mapStateToProps = state => ({
    loggedIn : state.auth.currentUser !== null,
    whereTo : state.events.whereTo
});

export default connect(mapStateToProps)(Main);