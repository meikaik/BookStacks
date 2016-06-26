// Import dependencies on Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create the Rental post Schema
var PostSchema = new mongoose.Schema({
	id: String,
	content: {type: String, index: true},
	posturl: String,
	userid: String,
	username: String,
	userurl: String,
	userpic: String,
	extracted_at: Date,
	active: Boolean
});

PostSchema.pre('save', function(next){
	var currentDate = new Date();

	this.extracted_at = currentDate;
	next();
});

var Post = mongoose.model('Post', PostSchema);

module.exports = Post;
