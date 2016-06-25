Comuet.factory('LoginFactory', ['$q', function($q){

  return {

  	// login with facebook
  	login: function(){
  		var self = this;
  		var deferred = $q.defer();

  		FB.login(function(response){
		  if (response.status === 'connected') {
		    // console.log('connected to facebook!');

		    // get access token
		    var accessToken = response.authResponse.accessToken;

		    // get profile info
		    FB.api('/me', function(response) {
			    profile = JSON.stringify(response);
				//console.log(profile);
				// create a user var to store profile and access token
				var data = {
			    	profile: profile,
			    	accessToken: accessToken
			    };
			    // resolve promise with the user var
		    	deferred.resolve(data);
			});
		  } else if (response.status === 'not_authorized') {
		    // The person is logged into Facebook, but not your app.
		    console.log('already logged in');
		  } else {
		    // The person is not logged into Facebook, so we're not sure if
		    // they are logged into this app or not.
		    console.log('not logged in');
		  }
		});
		return deferred.promise;
  	},

  	// Utility function. May not be currently in use.
  	// view profile of current logged in user
  	view_profile: function(){
  		var profile;
  		FB.api('/me', function(response) {
		    profile = JSON.stringify(response);
			console.log(profile);
		});
  	}

  }

}]);