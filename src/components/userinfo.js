import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

class Userinfo extends Component {
    render(){
        if(this.props.loggedId){
            return (<div>User Account info details go here...</div>);
        }
        else {
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
export default connect(mapStateToProps)(Userinfo);