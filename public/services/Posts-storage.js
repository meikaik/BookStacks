Bookstacks.factory('PostStorage', ['$q', function($q){

	var posts;
	var tempPosts;

  return {

  	save_posts: function(feed){
      if(posts == Array){
        posts.length = 0;
      }
  		posts = feed;
  	},

  	recall_posts: function(){
  		return posts;
  	},

  	save_tempPosts: function(posts){
      if(tempPosts == Array){
        tempPosts.length = 0;
      }
  		tempPosts = posts;
  	},	

  	recall_tempPosts: function(){
  		return tempPosts;
  	}

  }

}]);