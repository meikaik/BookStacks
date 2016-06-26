// Import dependencies on Mongoose
var mongoose = require('mongoose');
var User = mongoose.Schema;

// Create the Rental post Schema
var UserSchema = new mongoose.Schema({
	id: String,
	name: String,
	coords: [Number],
	accessed_at: Date
});

UserSchema.pre('save', function(next){
	var currentDate = new Date();

	this.accessed_at = currentDate;
	next();
});

var User = mongoose.model('User', UserSchema);

module.exports = User;