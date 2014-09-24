var _ = require('underscore');
var async  = require('async');
var util  = require('../utils/ay');
// var mysql  = require('mysql');

// mongoose model settings
// var mongoose = require('mongoose');
// require('../models/bookmark');
// var Bookmark = mongoose.model('Bookmark');

// redis model settings
var client = require('redis').createClient();

exports.index = function(req, res) {
	// app routes
};

// redis

exports.get_bookmark = function(req, res) {
	var result = [];

	// 文字列からJSオブジェクトに変換して利用する
	client.hgetall('bookmarks', function(err, obj){
		if(err) return console.log(err);

		result = _.map(obj, function(model, id) {
			// modelをobjectに戻す
			return JSON.parse(model);
		});
		console.log(result);
		res.send(result);
	});
};

exports.post_bookmark = function(req, res) {
	var obj = req.body;
	var key = util.createUniqueID();

	// fieldとしてユニークなIDを使う
	obj['id'] = key;
	// JSオブジェクトを文字列に変換してsetする
	client.hset('bookmarks', key, JSON.stringify(obj), function() {
		console.log('posted result', obj);
		res.send(obj);
	});
};

exports.put_bookmark = function(req, res) {
	var obj = req.body;

	client.hset('bookmarks', req.params.bookmarkid, JSON.stringify(obj), function() {
		console.log('put result', obj);
		res.send(obj);
	});
};

exports.delete_bookmark = function(req, res) {
	client.hdel('bookmarks', req.params.bookmarkid, function(err, result) {
		if (err) throw err;
		res.send('');
	});
};

// mongoose
/*
exports.get_bookmark_mongo = function(req, res) {
	// fetch data from DB
	new Bookmark().findAll(function(result) {
		console.log('Success: Getting all', result);
		res.send(result);
	});
};

exports.post_bookmark_mongo = function(req, res) {
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

exports.put_bookmark_mongo = function(req, res) {
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
*/