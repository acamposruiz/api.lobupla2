'use strict';

angular.module('lobuplaApp')
	.directive('ngEnter', function () {
	    return function (scope, element, attrs) {
	        element.bind("keydown keypress", function (event) {
	            if(event.which === 13) {
	                scope.$apply(function (){
	                    scope.$eval(attrs.ngEnter);
	                });

	                event.preventDefault();
	            }
	        });
	    };
	})
	// .factory('venuesFactory', function($http) {
	//  return{
	//     getVenues : function(address) {
	//         return $http({
	//             url: 'content/test_data.json',
	//             method: 'GET'
	//         })
	//     }
	//  }
	// })
  .controller('HomeCtrl', function ($scope, $http, $cookies, $q) {
  	var setVenues = function(venues) {  
  	    $scope.venues = venues;
  	}

  	var updateLastestSearchs = function(address) {
  		if ($cookies.lastestSearchs) {
  			$scope.lastestSearchs = JSON.parse($cookies.lastestSearchs);
  			if ($scope.lastestSearchs.indexOf(address) != -1) {
  				$scope.lastestSearchs.splice($scope.lastestSearchs.indexOf(address),1);
  			};
  			$scope.lastestSearchs.unshift(address);
  			$cookies.lastestSearchs = JSON.stringify($scope.lastestSearchs);
  		} 
  		else{
  			$cookies.lastestSearchs = JSON.stringify([address]);
  		};
  	};

  	$scope.venues = [];
  	$scope.showLatest = ($cookies.showLatest == "true")? true: false;
  	$scope.lastestSearchs = ($cookies.lastestSearchs)? JSON.parse($cookies.lastestSearchs): null;

  	$scope.toggleLatest = function(){
  		$scope.showLatest = !$scope.showLatest; 
  		$cookies.showLatest = $scope.showLatest.toString(); 
  	};

  	$scope.removeAddress = function(index) {
  		$scope.lastestSearchs.splice(index,1);
  		$cookies.lastestSearchs = JSON.stringify($scope.lastestSearchs);
  	};

  	$scope.research = function(index) {
  		$scope.address = $scope.lastestSearchs[index];
  		$scope.updateVenues($scope.address);
  	};

  	$scope.updateVenues = function(address) {
  		updateLastestSearchs(address);

		  getCoordinates(address)  
  	    .then(getVenuesFromCoordinates)
  	    .then(setVenues);
  	};

  	function getCoordinates(address) {  
  	    var deferred = $q.defer();

  	    $http({
					url: 'http://maps.googleapis.com/maps/api/geocode/json', 
					params: {
						address: address,
						components:'country:ES'
					}, 
					method: 'GET', 
					//data: data, 
					headers: angular.extend({
						'X-Requested-With': undefined
					})
				}).
				success(function(data){
  	    	deferred.resolve(data);
				});

  	    return deferred.promise;
  	}

  	function getVenuesFromCoordinates(data) {  
  	    var deferred = $q.defer();

      	$http({
					url: 'https://api.foursquare.com/v2/venues/search', 
					params: {
						client_id:'WU3OIROB5N3J1U3JPWWP0EUVICAZTMDCL2MUFLM2RKZ4HZFO',
						client_secret:'YF3BCWYDRXLSRUOSJ24WDBKWFZMYDGS1EYF5TSHM2O35VACU',
						ll: data.results[0].geometry.location.lat + ',' + data.results[0].geometry.location.lng,
						v: '20150217'
					}, 
					method: 'GET', 
					//data: data, 
					headers: angular.extend({
						'X-Requested-With': undefined
					})
				}).
				success(function(data){
  	    	deferred.resolve(data.response.venues);
				});

  	    return deferred.promise;
  	}

  });
