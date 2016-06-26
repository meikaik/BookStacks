// for communication with server backend
// and clientside pre-processing before interacting with server backend

Bookstacks.factory('ServerPostsFactory', ['$http', '$q', '$timeout', 'ParserFactory', function($http, $q, $timeout, ParserFactory){

	// to hold all new posts
	var newPosts = [];

	return {

		// grab the last post in db in order to check its date
		processPosts: function(feed, groupid, profile, accessToken){
			var self = this;
			var group = {
				groupid: groupid
			}
			// create the user var (eventually will be sent to backend)
			var user_profile = {
				profile: profile,
				accessToken: accessToken
			};

			$http.post('/check_latest_post', group)
				.then(function(data){
					// console.log(data.data);
					if(data){
						var lastPostTime = data.data;
					}else{
						// if there is nothing in the database, assume the latest date to be March 1, 2016
						var lastPostTime = new Date("03-01-2016");
					}
					// console.log(lastPostTime);

					// filter out the old posts
					self.filterOlds(feed, lastPostTime, user_profile, groupid);
				}, function(err){
					console.log(err);
				});
		},

		// check if post date is older than the latest post in database
		filterOlds: function(feed, lastPostTime, user_profile, groupid){
			var self = this;
			for(var p = 0; p<feed.length; p++){
				if(feed[p].updated_time > lastPostTime){
					var onePost = feed[p];
					onePost.groupid = groupid;
					newPosts.push(onePost);
				}
			}
			// console.log(newPosts);
			ParserFactory.parsePosts(newPosts, user_profile);
		},

		// get the latest posts from server
		// this function is called independent of the method chain above
		get_server_posts: function(user_profile){
			//console.log(user_profile);
			return $http.post('/get_posts', user_profile)
						/*.then(function(data){
							console.log(data.data);
						}, function(err){
							console.log(err);
						})*/
		}

		
	}

}]);