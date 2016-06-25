// declare dependencies
var express=  require('express');
var mongoose = require('mongoose');
var async = require('../node_modules/async/dist/async.js');

var wordbank = require("../modules/wordbank.js");
var exports = module.exports = {};

exports.extract_price = function(parsed_price){
	// currently takes the first price in array as the posting price
	// refactor to get min price listed out of array
	if(parsed_price){
		// get the first extracted price
		var price = parsed_price[0].slice(1);
		for(var pr = 0; pr<parsed_price.length; pr++){
			// check if each identified price is lower than the first
			if(parsed_price[pr].slice(1)<price && parsed_price[pr].slice(1)>price-150){
				// and if it is, we assume the lower price is the listing price
				price = parsed_price[pr].slice(1);
			}
		}
		return price;
	}
}

exports.extract_phone = function(parsed_phone){
	// if any results in parsed_phone, we assume that is the poster's phone #
	if(parsed_phone){
		return parsed_phone[0];
	}
}