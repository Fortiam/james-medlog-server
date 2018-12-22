const express = require('express');
const Router = express.Router();

//get all events route
Router.get('/', (req, res, next)=>{
    res.status(200).json({"a-": "-ok"});
});

module.exports =  Router ;