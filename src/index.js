import React from 'react';
import { render } from 'react-dom';
import './index.css';
import {Provider} from 'react-redux';
import store from './store';
import Home from './components/home';

render(
    <Provider store={store}>
        <Home />
    </Provider>
    ,  document.getElementById('root')
);
