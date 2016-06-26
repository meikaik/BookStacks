var express=  require('express');
var mongoose = require('mongoose');
var router = express.Router();
var async = require('../node_modules/async/dist/async.js');

var Post = mongoose.model('Post');

var fb_courier = require("../modules/fb-courier.js");
var rental_parser = require("../modules/rental-parser.js");
var database_checker = require("../modules/database-checker.js");

// ======================================================================================================

// check the updated_time of the latest post
router.post('/check_latest_post', function(req, res, next){
	var groupid = req.body.groupid;

	Post.findOne({groupid: groupid}, null, {sort: {updated_time: -1}}, function(err, post){
		if(err){console.log(err)};
		//console.log(post);
		// return the latest post date
		if(post){
			res.json(post.updated_time);
		}else{
			// if no posts in db, return an assumed date of March 1, 2016
			var emptydb = new Date("2016-03-01");
			res.json(emptydb);
		}
	});
});

// ======================================================================================================

// parse and save new posts (received from clients)
router.post('/new_posts', function(req, res, next){
	var newPosts = req.body.processed_posts;
	var user_profile = req.body.user_profile;

	// set fb token to use user_profile 
	fb_courier.setFbToken(user_profile);

	// a chain of synchronous functions
	// first checks if the posts exist in db (optional)
	// and parses new posts before saving
	// sync chain: /new_posts > database_checker > rental_parser > rental_extractor > rental_parser > database
	database_checker.checkFeed(newPosts);

	res.json("parsed and saved new posts!");
});

// ======================================================================================================

// return last 150 posts
router.post('/get_posts', function(req, res, next){
	// console.log(req.body);
	var profile = req.body.profile;
	var accessToken = req.body.accessToken;
	var groupid = req.body.groupid;

	// use our modules to process logic
	// log user in database
	fb_courier.logUserInDB(profile, accessToken);

	// return to client the last 150 posts in db
	Post.find({}, null, function(err, posts){
		if(err){return next(err);}
		res.json(posts);
	}).limit(150);
});


// ======================================================================================================


module.exports = router;