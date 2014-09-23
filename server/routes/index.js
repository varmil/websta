var fs     = require('fs');
var async  = require('async');
// var mysql  = require('mysql');
// var config = require('../config');
var mongoose = require('mongoose');

// model settings
require('../models/bookmark');
var Bookmark = mongoose.model('Bookmark');

// main

exports.index = function(req, res) {
	// app routes
};

exports.get_bookmark = function(req, res) {
	// fetch data from DB
	new Bookmark().findAll(function(result) {
		console.log('Success: Getting all', result);
		res.send(result);
	});
};

exports.post_bookmark = function(req, res) {
	// save data on DB
	var bookmark = new Bookmark();
	bookmark.url = req.body.url;
	bookmark.title = req.body.title;
	bookmark.comment = req.body.comment;
	bookmark.save(function (err, product, numberAffected) {
		if (err) throw err;
		console.log('Success: product', product);
		res.send(product);
	});
};

exports.put_bookmark = function(req, res) {
	// update data from DB
	var newData = {};
	var key = req.params.type;
	newData[key] = req.body[key]; 
	// modelスキーマそのものを使うので、newしない。
	Bookmark.update({ _id: req.params.bookmarkid }, newData, function (err, numberAffected, raw) {
		if (err) throw err;
		console.log('Successinfo: ', raw);
		res.send('');
	});
};