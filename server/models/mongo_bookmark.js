var mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1/bookmark');

var Schema = mongoose.Schema
	, ObjectId = Schema.ObjectId;

var Bookmark = new Schema({
	url:  { type: String, default: 'hahaha' }
	, title:  { type: String}
	, done:  { type: Boolean, default: false }
	, created_at:  { type: Date, default: Date.now() }
	, delete_at:  { type: Date, default: Date.now() + 60*60*24*1000 }
	, archive:  { type: Boolean, default: false }
	, comment:  { type: String}
});

// a setter
// Bookmark.path('title').set(function (v) {
  // return v.capitalize();
// });

// middleware
Bookmark.pre('save', function (next) {
	next();
});

/**
 * Methods
 */
Bookmark.methods = {
	findAll: function(cb) {
		console.log('Getting all');

		this.model('Bookmark').find({}, function(err, results) {
			if (err) throw err;
			// 非同期なのでcallbackを使う
			cb(results);
		});
	}
};


mongoose.model('Bookmark', Bookmark);