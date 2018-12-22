const express = require('express');
const Router = express.Router();

//homepage, no token needed here
Router.get('/', (req, res, next)=>{
    res.status(200).json({"a-": "-ok"});
});

module.exports =  Router ;