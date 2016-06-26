// for communication with server backend
// and clientside pre-processing before interacting with server backend

Bookstacks.factory('ParserFactory', ['$http', '$q', '$timeout', 
	function($http, $q, $timeout){

	var user_profile;
	var newPosts;
	var processed_posts = [];

	var refined_post;

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
			post.posturl = "http://facebook.com/" + post.id;
			self.extract_content(post);
		},

		extract_content: function(post){
			var self = this;
			refined_post.content = post.message;

			// then next function
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