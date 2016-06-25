// for communication with server backend
// and clientside pre-processing before interacting with server backend

Comuet.factory('ParserFactory', ['$http', '$q', '$timeout', 
	function($http, $q, $timeout){

	var user_profile;
	var newPosts;
	var processed_posts = [];

	var refined_post;

	var key_locations = [
		"Ottawa",
		"Toronto",
		"Scarborough",
		"Markham",
		"Waterloo"
	];


	return {
		parsePosts: function(newPosts, user_profile){
			var self = this; 

			user_profile = user_profile;
			newPosts = newPosts;

			// process each post
			for(var p = 0; p<newPosts.length; p++){
				refined_post = newPosts[p];
				if(refined_post.message){
					self.beginChain(refined_post);
				}
			}

			// then submit the processed posts to the server
			self.submit_new_posts(processed_posts, user_profile)
		},

		beginChain: function(post){
			var self = this;
			self.extract_to_address(post);
		},

		extract_to_address: function(post){
			var self = this;
			var start_search = post.message.indexOf('Driving');

			// if 'from' never occurs, indexOf() will return -1
			if(start_search != -1){
				for(var f=0; f<key_locations.length; f++){
					var loc = post.message.indexOf(key_locations[f], start_search)
					if(loc != -1){
						refined_post.to_address = key_locations[f];
						break;
					}
				}
			}

			// then next function
			self.extract_from_address(refined_post);
		},

		extract_from_address: function(post){
			var self = this;
			var start_search = post.message.indexOf('from');

			// if 'from' never occurs, indexOf() will return -1
			if(start_search != -1){
				for(var f=0; f<key_locations.length; f++){
					var loc = post.message.indexOf(key_locations[f], start_search)
					if(loc != -1){
						refined_post.from_address = key_locations[f];
						break;
					}
				}
			}

			// then next function
			self.extract_time(refined_post);
		},

		extract_time: function(post){
			var self = this;
			// parse the time
			refined_post.leave_time = new Date();

			// then the next function
			self.extract_price(refined_post);
		},

		extract_price: function(post){
			var self = this;
			// parse each post for $ as hint
			var parsed_price = post.message.match(/[$][ ]?[\d]*\b/g);
			if(parsed_price){
				// get the first extracted price
				var price = parsed_price[0].slice(1);
				refined_post.price = price;
			}else{
				refined_post.price = 10;
			}

			// then the next function
			self.extract_phone(refined_post);
		},

		extract_phone: function(post){
			var self = this;
			// parse each post to find strings that indicate a phone number
			var parsed_phone = post.message.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g);
			if(parsed_phone){
				refined_post.phone = parsed_phone[0];
			}else{
				refined_post.phone = null;
			}

			// then the next function
			self.add_to_processed_posts(refined_post);
		},

		add_to_processed_posts: function(post){
			processed_posts.push(post);
		},

		// submit the new posts to the server to be parsed & saved to db
		submit_new_posts: function(processed_posts, user_profile){
			var self = this;
			//console.log(newPosts);

			if(processed_posts.length == 0){
				//console.log("No new posts for this group");
			}else{
				$http.post('/new_posts', {processed_posts: processed_posts, user_profile: user_profile})
					.then(function(data){
						//console.log(data);
						//console.log("Submitted new posts!");
					}, function(err){
						console.log(err);
					});
			}
		},

	}

}]);