var fs     = require('fs');
var async  = require('async');
var mysql  = require('mysql');
// var config = require('../config');

// main

exports.index = function(req, res) {
	// app routes
};

exports.get_bookmark = function(req, res) {
	// fetch data from DB
	res.status(777);
	res.send('im the home page!');
};

exports.post_bookmark = function(req, res) {
	// fetch data from DB
	res.status(777);
	res.send('im the home page!');
};