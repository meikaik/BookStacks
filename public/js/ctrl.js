// controller
Comuet.controller('mainCtrl', 
  ['$scope', 'LoginFactory', 'PostStorage', 'ServerPostsFactory', '$window', 
  function($scope, LoginFactory, PostStorage, ServerPostsFactory, $window){

  // Initial variables
  $scope.signedIn = false;

  // Facebook Login
  $scope.login = function(){ 
    LoginFactory.login()
      .then(function(data){
        if(data){
          //console.log(data);
          $scope.signedIn = true;
          $scope.accessToken = data.accessToken;
          $scope.profile = data.profile;

          // Get posts from facebook
          $scope.get_recent_posts();

            $(document).ready(function() {  
                $("#list").niceScroll({
                      cursorwidth:"20px",
                      zindex: 99
                    });
            });
        }
      }, function(err){
        console.log(err);
      });
  };      

  // Get posts from Facebook
  $scope.get_recent_posts = function(){
    var groupid = 2265647819;
    FB.api(
        "/"+groupid+"/feed?limit=100",
        function (response) {
          if (response.data && !response.error) {
            //$scope.posts = response.data; 
            //$scope.$apply(function () {});

            $scope.flush_olds_and_send_news(response.data, groupid);
            $scope.get_db_posts(groupid);
          }else{
            console.log(response.error);
          }
        }
      );
  }

  // Get rid of old posts and submit new ones to server
  $scope.flush_olds_and_send_news = function(feed, groupid){
    ServerPostsFactory.processPosts(feed, groupid, $scope.profile, $scope.accessToken);
  };

  // get posts from database
  $scope.get_db_posts = function(groupid){
    // build the object to store user info
    var user_profile = {        
      profile: $scope.profile,
      accessToken: $scope.accessToken,
      groupid: groupid
    };

    // get the posts from server via a service
    ServerPostsFactory.get_server_posts(user_profile)
      .then(function(data){
        //console.log(data.data);
        $scope.posts = data.data;       // show those posts retrieved from server
      }, function(err){
        console.log(err);
      });
  };

  $scope.openUrl = function(post){
    var win = window.open(post.posturl, '_blank');
    win.focus();
  }

}])