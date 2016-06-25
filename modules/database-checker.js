// declare dependencies
var express=  require('express');
var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var rental_parser = require("../modules/rental-parser.js");
var async = require('../node_modules/async/dist/async.js');

var exports = module.exports = {};

// check each post in newPostFeed and parse it!
exports.checkFeed = function(newPostFeed) {
	var self = this;
	console.log(newPostFeed.length);

	// load up all the posts to execute one at a time
	// asyncronously execute a function on each post in the feed
	async.eachSeries(newPostFeed, self.check_post, function(){
	    console.log("finished looping through the newPosts feed!");
	    return true;
	});
};

// sync chain for one post at a time
exports.check_post = function(onePost, callback){
	// sync chain: /new_posts > database_checker > rental_parser > rental_extractor > rental_parser > database
	rental_parser.parseAndSavePost(onePost);
	// to finish this loop iteration
	callback();
};
