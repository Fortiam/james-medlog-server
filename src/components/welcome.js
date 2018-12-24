import React, { Component } from 'react';
//import {connect} from 'react-redux';
import { Link } from 'react-router-dom';

export default class Welcome extends Component {
    render(){
        return (<div>
                <p>MedLog is an app to help parents keep track of their family members' medical records and schedules.  A person can create a record containing information about which medication(s) and the times they need to be taken, for everyone in the family, including pets.  After filling out the details of each family member, which medicine they are on, a schedule can be viewed for the entire family, to see who needs to take what and when.  A calendar view can show everyone's appointments all together or filtered to just display a single person's schedule or log.  Entries can be added to a person's log when side effects, reactions, or symptoms appear, or if a scheduled appointment was missed. To get started, head to the Registration Page to create a new account!</p>
                <p><Link to="/register" >Click me to go to Registration Page</Link></p>
                <p><Link to="/login" >Click me to go to Log-in Page</Link></p>
            </div>
        );
    }
}