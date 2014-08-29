'use strict';

/* App Module */
var mapApp = angular.module('mapApp', []);



function getLatLng(data) {
  if (data != undefined) {
    return new L.LatLng(data.geometry.coordinates[1], data.geometry.coordinates[0]);
  }
  return null;
}

function setPaddingRight() {
  if (window.innerWidth <= 640) {
    return 0;
  }
  else {
    return parseInt(window.innerHeight*.5);
  }
}


// copeied from leaflet.geometryutil.js closest fxn
function closestKey(latlng, latlngs) {
  var mindist = 10000000;
  var result = null;
  for(var i = 0, n = latlngs.length; i < n; i++) {
    var ll = new L.LatLng(latlngs[i][1], latlngs[i][0]);
    //console.log(ll);
    var distance = latlng.distanceTo(ll);
    if (distance < mindist) {
        mindist = distance;
        //result = ll;
        result = i;
    }
  }
  return result;
}

function getCompleted(current, start, end) {
  return (current-start)/(end-start);
}