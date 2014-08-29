'use strict';

/* Controllers */

mapApp.controller('data', ['$scope', '$http', '$window', '$document', '$rootScope', function($scope, $http, $window, $document, $rootScope) {
  $scope.active = 0;

  $http.get('json/example.json').success(function(data) {
    data.markers = [];
    data.route = [];
    var i = 0;
    // Separate the markers from the route
    for (var j= 0; j < data.features.length; ++j) {
      var item = data.features[j];
      if (item.geometry.type == 'Point') {
        data.markers.push(item);
      }
      else {
        item.geometry.coordinates = item.geometry.coordinates.reverse();
        data.route = item;
      }
    }

    // Figure out the key in the route for each marker
    for (var i=0, n=data.markers.length; i<n; i++) {
      var route = {
        start: closestKey(getLatLng(data.markers[i]), data.route.geometry.coordinates)
      }
      if ((i+1 < n) && data.markers[i+1] != undefined) {
        route.end = closestKey(getLatLng(data.markers[i+1]), data.route.geometry.coordinates);
      }
      data.markers[i].properties.route = route;
    }

    $scope.data = data;

  });

  //$scope.orderProp = 'age';


    $scope.toTheTop = function() {
      $document.scrollTop(0, 5000);
    }
    var section2 = angular.element(document.getElementById('section-2'));
    $scope.toSection2 = function() {
      $document.scrollTo(section2, 30, 1000);
    }

    
 
  }])


