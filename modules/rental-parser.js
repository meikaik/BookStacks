// declare dependencies
var express=  require('express');
var mongoose = require('mongoose');
var async = require('../node_modules/async/dist/async.js');
var FB = require('fb');
var GoogleMapsAPI = require('googlemaps');

var wordbank = require("../modules/wordbank.js");
var rental_extractor = require("../modules/rental-extractor.js");
var Post = mongoose.model('Post');

// load the hint words 
var street_signs = wordbank.street_signs;

var exports = module.exports = {};

// output of the refinement process
// var refined_post;

// the refinement process
exports.parseAndSavePost = function(post) {
   	var self = this;
   	// syncronously execute in this order
	async.waterfall([
	  	async.apply(parseMessage, post),	// async.apply(fn, param) to implicitly pass params to first function
	  	extract_user,
	  	//check_post_exists,
	  	extract_profile_link,
	  	extract_profile_image,
	  	parseGPS_to,
	  	parseGPS_from
	], function(err, refined_post){
		if(err){console.log(err)};

		// reject any dud refined_post
		if(!refined_post || refined_post ==='undefined'){
			return false;
		}

		refined_post.active = true;
		//console.log(refined_post);
		// save to db only if we successfully extracted an address, coords, userurl and price 
		if(refined_post.to_address && refined_post.to_coords && refined_post.from_address && refined_post.from_coords && refined_post.userurl){
			var post = new Post(refined_post);
			post.save(function(err, post){
				if(err){console.log(err)}
				console.log("saving this new post:");
				console.log(post);
				return true;
			});
		}else{
			return false;
		}
	});
};

// parse message using REGEX
parseMessage = function(post, callback){	// implicit params async.apply(fn, param) --> function(param, callback){}

	// if the post has a message
	if(post.message){
		// set the postid and created_at time
		var postid = post.id;
		var updated_time = post.updated_time;
		var message = post.message;

		// create the post object that will be saved to db
		var data = {
			to_address: post.to_address,
			from_address: post.from_address,
			leave_time: post.leave_time,
			price: post.price,
			phone: post.phone,
			message: post.message,
			id: post.id,
			posturl: "http://facebook.com/" + post.id,
			updated_time: updated_time,
			groupid: post.groupid
		};
		callback(null, data);
	}else{
		// throw error if no message content
    	callback("No message content");					// implicit params callback(null, data) --> function(data, callback){}
	}
}

// extract the user id and name
extract_user = function(data, callback){	// implicit params callback(null, data) --> function(data, callback){}
	//console.log(data);

	// first get the userid of this post via postid
	var postid_edge = '/' + data.id + '?fields=from';
	FB.api(
	    postid_edge,
	    function (response) {
	      if (response && !response.error) {
    		data.userid = response.from.id;
    		data.username = response.from.name;

    		callback(null, data);
	      }
	    }
	);
}

// check if the post already exists (matching address and userid and within last month)
// do this before calling the expensive Google Geocoding API
check_post_exists = function(data, callback){
	// check if the post already exists
	Post.find({$and: [{userid: data.userid}]}, function(err, res){
		if(err){return next(err);}

		// if our response if empty, that means this post does not yet exist in db
		if(res.length == 0){
			// this part gets executed right away instead of property waiting for waterfall to finish
			// as a result, duplicates are let through
			console.log('new post');
			callback(null, data);
		}else{
			return callback("Post already exists");
		}
	});
}

// extract the user profile url
extract_profile_link = function(data, callback){
	// then get the profile link via the userid
	var userid_edge = '/' + data.userid + '/?fields=link';
	FB.api(
	    userid_edge,
	    function (response) {
	      if (response && !response.error) {
	        data.userurl = response.link;

    		callback(null, data);
	      }
	    }
	);
}

// extract the profile image url of user
extract_profile_image = function(data, callback){
	// then get the profile image url via the userid
	var userid_edge = '/' + data.userid + '?fields=picture&type=small';
	FB.api(
	    userid_edge,
	    function (response) {
	      if (response && !response.error) {
	      	//console.log(response);
	        data.userpic = response.picture.data.url;
    		callback(null, data);
	      }else{
    		callback(null, data);
	      }
	    }
	);
}

// extract the GPS coords of to_address using Google Maps GeoCoding API
parseGPS_to = function(data, callback){
	var publicConfig = {
	  key: 'AIzaSyAyS_IeE6P7sFMl8Ito_hL2wRjsiw9_lyc',
	  stagger_time:       1000, // for elevationPath
	  encode_polylines:   false,
	  secure:             true // use https
	  //proxy:              'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests
	};
	var gmAPI = new GoogleMapsAPI(publicConfig);

	// geocode API
	var geocodeParams = {
	  "address":    data.to_address,
	  "components": "components=country:CA"
	};
	gmAPI.geocode(geocodeParams, function(err, result){
	  if(err){console.log(err)};
	   //console.log(result);
	  if(result){
	  	if(result.results[0]){
		  	// take the coords of the first result
		  	data.to_coords = [result.results[0].geometry.location.lng, result.results[0].geometry.location.lat];
		  	callback(null, data);
		}else{
		  	return callback("No geocoding data!");
		}
	  }
	});
}

// extract the GPS coords of from_address using Google Maps GeoCoding API
parseGPS_from = function(data, callback){
	var publicConfig = {
	  key: 'AIzaSyAyS_IeE6P7sFMl8Ito_hL2wRjsiw9_lyc',
	  stagger_time:       1000, // for elevationPath
	  encode_polylines:   false,
	  secure:             true // use https
	  //proxy:              'http://127.0.0.1:9999' // optional, set a proxy for HTTP requests
	};
	var gmAPI = new GoogleMapsAPI(publicConfig);

	// geocode API
	var geocodeParams = {
	  "address":    data.from_address,
	  "components": "components=country:CA"
	};
	gmAPI.geocode(geocodeParams, function(err, result){
	  if(err){console.log(err)};
	   //console.log(result);
	  if(result){
	  	if(result.results[0]){
		  	// take the coords of the first result
		  	data.from_coords = [result.results[0].geometry.location.lng, result.results[0].geometry.location.lat];
		  	callback(null, data);
		}else{
		  	return callback("No geocoding data!");
		}
	  }
	});
}
