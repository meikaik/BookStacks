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
        }
      }, function(err){
        console.log(err);
      });
  };      

  // Initiate Map
  // initiate the map and focus on current geolocation
  function initMap() {
    $scope.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 43.660045, lng: -79.385094},
      zoom: 14
    });
  }
  google.maps.event.addDomListener(window, 'load', initMap);
  // to handle location error
  function handleLocationError(browserHasGeolocation, infoWindow, pos) {
      infoWindow.setPosition(pos);
      infoWindow.setContent(browserHasGeolocation ?
                          'Error: The Geolocation service failed.' :
                          'Error: Your browser doesn\'t support geolocation.');
  };

  // Get posts from Facebook
  $scope.get_recent_posts = function(){
    var groupid = 225049564330328;
    FB.api(
        "/"+groupid+"/feed?limit=20",
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
        $scope.dropPins(data.data);   // drop the pins on the map
      }, function(err){
        console.log(err);
      });
  };

  // array of map markers
  $scope.map_marker_objects = [];

  // drop the pins for each post 
  $scope.dropPins = function(posts){
      // create a marker for each pin
      posts.forEach(function(n, i){

          // create the marker for each pin
          var marker = new google.maps.Marker({
              position: new google.maps.LatLng(n.to_coords[1], n.to_coords[0]),
              map: $scope.map,
              icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
          });
          // place it on the map
          marker.setMap($scope.map);
          $scope.map_marker_objects.push(marker);

          // action on click of pin
          google.maps.event.addListener(marker, 'click', function(e){
              console.log(marker.position);
          });
      });
  };

  // see original fb post in a new tab 
  $scope.open_in_new_tab = function(url){
    if(url){
      $window.open(url, '_blank');
    }
  }


}]);