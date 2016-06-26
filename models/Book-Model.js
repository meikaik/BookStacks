// Import dependencies on Mongoose
var mongoose = require('mongoose');
var Book = mongoose.Schema;

// Create the Rental post Schema
var BookSchema = new mongoose.Schema({
	courseid: String,
	textbookname: String,
	textbookauthor: String,
	price: Number
});

BookSchema.pre('save', function(next){
	var currentDate = new Date();

	this.accessed_at = currentDate;
	next();
});

var Book = mongoose.model('Book', BookSchema);

module.exports = Book;
