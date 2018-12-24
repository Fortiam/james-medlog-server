import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class Main extends Component {

    render(){
     if(this.props.loggedIn){
         return (<div>
            <h2>Welcome to the Home Page, this needs to be re-styled..</h2>
            <p><Link to="/calendar" >Visit Calendar</Link></p>
            <p><Link to='/patient' >Add/Edit new Family Member/pet</Link></p>
            <p><Link to="/medicine" >Add/Edit custom Medicine</Link></p>
            <p><Link to="/userinfo" >Edit Account Details/Info</Link></p>
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