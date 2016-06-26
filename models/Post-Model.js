// Import dependencies on Mongoose
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Create the Rental post Schema
var PostSchema = new mongoose.Schema({
	id: String,
	content: String,
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

// Indexes this schema in 2dsphere format (critical for running proximity searches)
PostSchema.index({to_coords: '2dsphere'});
PostSchema.index({from_coords: '2dsphere'});

var Post = mongoose.model('Post', PostSchema);

module.exports = Post;
