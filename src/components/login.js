
import React, {Component} from 'react';
import { Field, reduxForm } from 'redux-form';
import { submitAction, registerError } from '../actions/register';
import { login } from '../actions/auth';
import { Redirect } from 'react-router-dom';
import {Input} from './input';
import { required, nonEmpty, legitPassword, stringy } from '../utils/localChecks';
import { connect } from 'react-redux';

class Login extends Component{
    onSubmit(values){
        this.props.dispatch(submitAction(values));
        return this.props.dispatch(login(values.username, values.password));
    }
    
    render(){
        if(this.props.loggedIn){
            return (<Redirect to={{pathname: '/main'}} />);

        }
        let successMessage;
        if (this.props.submitSucceeded) {
            successMessage = (
                <p className="message message-success">
                    Message submitted successfully
                </p>
            );
        }
        let errorMessage;
        if (this.props.error) {
            errorMessage = (
                <p className="message message-error">{this.props.error}</p>
            );
        }
        return (
            <div>
                <div>{successMessage}</div>
                <div>{errorMessage}</div>
                <form 
                onSubmit={this.props.handleSubmit(values => this.onSubmit(values))}>
                    <Field
                        name="username"
                        label="Enter Username: "
                        type="text"
                        component={Input}
                        validate={[required, nonEmpty, stringy]}>
                    </Field>
                    <Field
                        name="password"
                        label="Enter Password: "
                        type="text"
                        component={Input}
                        validate={[required, nonEmpty, stringy, legitPassword]}>
                    </Field>
                    <button type="submit">Submit!</button>
                </form>
            </div>
        );
    }
}
const mapStateToProps = state=> ({
    loggedIn : state.auth.currentUser
});
export default reduxForm({
    form: 'login',
    onSubmitFail: (errors, dispatch) =>
    dispatch(registerError(errors))
})(connect(mapStateToProps)(Login));
