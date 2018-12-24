import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Header extends Component {
    render(){
        return (<div className='inlineBlock'>
                    <span className='big'>Welcome to MedLog!</span>
                    <Link to="/" className='right'>Return to Home Page</Link>
                </div>);
    }
}
//change me to like a nav bar or a log-in log-out panel, or something