'use strict';

/* Directives */
mapApp.directive('map', ['$window', '$filter', function($window, $filter) {

  return {
    restrict: 'A',
    template: '<div id="map"></div>',
    link: function(scope, elm, attrs) {       
      L.mapbox.accessToken = 'pk.eyJ1IjoiYWxiYXRyb3NzZGlnaXRhbCIsImEiOiI1cVUxbUxVIn0.SqKOVeohLfY0vfShalVDUw';
      scope.map = L.mapbox.map('map', 'examples.map-i86nkdio', {
        scrollWheelZoom: false,
         zoomControl: false
      }).setView([0, 0], 0);
      //L.geoJson(scope.data.markers);
      new L.Control.Zoom({ position: 'topright' }).addTo(scope.map);


      scope.markerLayer = L.mapbox.featureLayer().addTo(scope.map);
      
      scope.animationLayer = L.polyline([], {}).addTo(scope.map);

      scope.$watch('data', function() {
        if (scope.data != undefined) {

          // Add route layer
          scope.routeLayer = L.mapbox.featureLayer([scope.data.route]).addTo(scope.map);

          
          // Add makers
          scope.markers = [];
          for (var i=0; i<scope.data.markers.length; i++) {
            var data = scope.data.markers[i];
            var coords = getLatLng(data);
            var marker = L.marker(coords);
            marker.setIcon(L.mapbox.marker.icon(data.properties));
            marker.setOpacity(5);
            marker.addTo(scope.markerLayer);
            scope.markers.push(marker);
           
          }




          // Set the padding right variable
          scope.map.on('resize', function() {
            setPaddingRight();
          });
          scope.paddingRight = setPaddingRight();
          

          scope.map.fitBounds(scope.markerLayer.getBounds(), {
            animate: false,
            paddingTopLeft: [scope.paddingRight, 0]
          });

          setTimeout(function(){
            scope.map.zoomIn(1);

            setTimeout(function(){
              
            }, 2000);

            scope.map.on('zoomend', function() {
              var c = scope.data.markers[0].geometry.coordinates;
              var offset = scope.map._getNewTopLeftPoint([c[1], c[0]]).subtract(scope.map._getTopLeftPoint());
              offset.x -= scope.paddingRight;
              console.log(offset);
              scope.map.panBy(offset, {
                animate: true,
                duration: 2,
              });
            })
            


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

      // IE 8
      if (window.pageYOffset === undefined) {
        var y = document.documentElement.scrollTop;
        var h = document.documentElement.clientHeight;
      } else {
        var y = window.pageYOffset;
        var h = window.innerHeight;
      }

      //console.log(y);

      // If scrolled to the very top of the page set the first section active.
      if (y === 0) return scope.active = 0;

      // Otherwise, conditionally determine the extent to which page must be
      // scrolled for each section. The first section that matches the current
      // scroll position wins and exits the loop early.
      var memo = 0;
      var buffer = sections[0].offsetHeight*1.5;//h * 0.33;
      var active = 0;
      for (var i=0; i < sections.length; i++) {
        if (scope.data != undefined && scope.data.markers != undefined) {
          memo += sections[i].offsetHeight;
          if (y > (memo-buffer)) {
            active = i;
          }
        }
      }
     
      // Active media change
      if (active != scope.active && scope.data != undefined && window.map != undefined) {
        scope.markers[scope.active].setOpacity(.5);
        scope.active = active;
        scope.markers[scope.active].setOpacity(1);
        scope.sectionStart = y;
        scope.sectionEnd = y + sections[active].offsetHeight;



        //console.log(scope.data.markers[active].geometry.coordinates[0]);
        var c = scope.data.markers[active].geometry.coordinates;
        //scope.map.setZoom(1).panTo([c[1], c[0]]).setZoom(10);
        /*scope.map.fitBounds(scope.featureLayer.getBounds(), {
          animate: true,
          paddingTopLeft: [500,0]
        });*/
        
        if (1==2) { // Todo: make autopan an option
          var offset = scope.map._getNewTopLeftPoint([c[1], c[0]]).subtract(scope.map._getTopLeftPoint());
          offset.x -= scope.paddingRight;
          //console.log(offset);
          scope.map.panBy(offset, {
            animate: true,
            duration: 1,
          });
        }


        //console.log(scope.map.getCenter);
        scope.$apply();
      }

      // Draw the map animation
      if (scope.data != undefined && window.map != undefined) {
  	    scope.sectionStart = scope.sectionStart == undefined ? 0 : scope.sectionStart;
        scope.active = scope.active == undefined ? 0 : scope.active;
        var markerRoute = scope.data.markers[scope.active].properties.route;
  	    var completed = getCompleted(y, scope.sectionStart, scope.sectionEnd);
        var center = drawLine(scope.animationLayer, scope.data.route.geometry.coordinates, scope.sectionCompleted, completed, markerRoute.start, markerRoute.end);
        scope.sectionCompleted = completed;
        //scope.map.panTo(center);

        var offset = scope.map._getNewTopLeftPoint([center.lat, center.lng]).subtract(scope.map._getTopLeftPoint());
        console.log(parseInt(offset.x) + parseInt(offset.y));
        //if (offset.x + offset.y > 200) {
          offset.x -= scope.paddingRight;
          console.log(offset);
          scope.map.panBy(offset, {
            animate: false
          });
        //}
        
      }


    });
  }
});


function drawLine(line, coords, start, end, sectionStart, sectionEnd) {
  var n = sectionEnd - sectionStart, latlng;
  start = sectionStart + parseInt(n*start);
  end = sectionStart + parseInt(n*end);

  for (var i=start; i<end; i++) {
    if (coords[i] != undefined) {
      latlng = L.latLng(coords[i][1], coords[i][0]);
      line.addLatLng(latlng);
    }
  }
  return latlng;
}
