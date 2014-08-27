'use strict';

/* Controllers */

var mapApp = angular.module('mapApp', []);

mapApp.controller('data', function($scope, $http, $window, $document, $rootScope) {
  $scope.active = 0;

  $http.get('json/example.json').success(function(data) {
    var items = [];
    var i = 0;
    for (var j= 0; j < data.features.length; ++j) {
      var item = data.features[j];
      if (item.geometry.type == 'Point') {
        items.push(item);
        i++;
      }
      else {
        if(items[i-1].properties.transition === undefined) {
          items[i-1].properties.transition = [];
        }
        items[i-1].properties.transition.push(item);
      }
    }
    data.features = items;

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

    
 
  })
.directive('map', [function($window) {

  return {
    restrict: 'A',
    template: '<div id="map"></div>',
    link: function(scope, elm, attrs) {       
      L.mapbox.accessToken = 'pk.eyJ1IjoiYWxiYXRyb3NzZGlnaXRhbCIsImEiOiI1cVUxbUxVIn0.SqKOVeohLfY0vfShalVDUw';
      scope.map = L.mapbox.map('map', 'examples.map-i86nkdio', {
        scrollWheelZoom: false,
         zoomControl: false
      }).setView([0, 0], 0);
      //L.geoJson(scope.data.features);
      new L.Control.Zoom({ position: 'topright' }).addTo(scope.map);


      scope.featureLayer = L.mapbox.featureLayer()
        .addTo(scope.map);

      scope.$watch('data', function() {
        if (scope.data != undefined) {
          scope.markers = [];
          // a simple GeoJSON featureset with a single point
          // with no properties
          console.log(scope.data);
          scope.featureLayer.setGeoJSON(scope.data);
          console.log(scope.featureLayer);

          scope.map.on('resize', function() {
            scope.paddingRight = parseInt(window.innerHeight*.5);
          });
          scope.paddingRight = parseInt(window.innerHeight*.5);

          scope.map.fitBounds(scope.featureLayer.getBounds(), {
            animate: false,
            paddingTopLeft: [scope.paddingRight, 0]
          });

          setTimeout(function(){
            scope.map.zoomIn(3);
            scope.map.panTo([scope.data.features[0].geometry.coordinates[1], scope.data.features[0].geometry.coordinates[0]])
          }, 2000);

          

          
          /*scope.map.panTo(scope.data.features[0].geometry.coordinates, scope.map.getZoom() + 3, {
            animate: true,
            duration: 2
          });*/


        }
        
      });

      
    }
  };
}])
.directive("scroll", function ($window) {
  return function(scope, element, attrs) {
    angular.element($window).bind("scroll", function() {
      var sections = document.getElementsByTagName('section');
      console.log(scroll);

      // IE 8
      if (window.pageYOffset === undefined) {
        var y = document.documentElement.scrollTop;
        var h = document.documentElement.clientHeight;
      } else {
        var y = window.pageYOffset;
        var h = window.innerHeight;
      }

      // If scrolled to the very top of the page set the first section active.
      if (y === 0) return scope.active = 0;

      // Otherwise, conditionally determine the extent to which page must be
      // scrolled for each section. The first section that matches the current
      // scroll position wins and exits the loop early.
      var memo = 0;
      var buffer = sections[0].offsetHeight*1.5;//h * 0.33;
      var active = 0;
      for (var i=0; i < sections.length; i++) {
        if (scope.data != undefined && scope.data.features != undefined) {
          memo += sections[i].offsetHeight;
          if (y > (memo-buffer)) {
            active = i;
          }
        }
      }

      // If no section was set active the user has scrolled past the last section.
      // Set the last section active.
      //if (!scope.active) scope.active = sections.length - 1;

      

      if (active != scope.active && scope.data != undefined && window.map != undefined) {
        scope.active = active;
        //console.log(scope.data.features[active].geometry.coordinates[0]);
        var c = scope.data.features[active].geometry.coordinates;
        //scope.map.setZoom(1).panTo([c[1], c[0]]).setZoom(10);
        /*scope.map.fitBounds(scope.featureLayer.getBounds(), {
          animate: true,
          paddingTopLeft: [500,0]
        });*/
        
        var offset = scope.map._getNewTopLeftPoint([c[1], c[0]]).subtract(scope.map._getTopLeftPoint());
        offset.x -= scope.paddingRight;
        console.log(offset);
        scope.map.panBy(offset, {
          animate: true,
          duration: 1,
        });


        console.log(scope.map.getCenter);
        scope.$apply();
      }
    });
  }
});

