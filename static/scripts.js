var map;

var myPosition = new google.maps.LatLng(37.788946,-122.411527);
var NYC = new google.maps.LatLng(40.7141667,-74.0063889);

var roadTripStops = [];
var directionsService;
var directionsDisplay;



function initializeMap() {

  var mapOptions = {
    zoom: 14,
    center: {
      lat: 37.788946,
      lng: -122.411527
    }
  };

  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // add marker for Hackbright
      var image = {
        url: 'https://hackbrightacademy.com/content/themes/hackbright/img/logo.png',
        // The origin for this image is (0, 0).
        origin: new google.maps.Point(0, 0),
        // The anchor for this image is the base of the flagpole at (0, 32).
        anchor: new google.maps.Point(0, 32)
      };

      var markerHB = new google.maps.Marker({
        position: myPosition,
        map: map,
        title: 'HB mothership',
        animation: google.maps.Animation.DROP,
        icon: image
      });


  // add listener to HB marker
      function toggleBounce() {
        if (markerHB.getAnimation() !== null) {
          markerHB.setAnimation(null);
        } else {
          markerHB.setAnimation(google.maps.Animation.BOUNCE);
        }
      }

      markerHB.addListener('click', toggleBounce);


  // add info window for HB marker
      var contentString = '<div id="content">' +
      '<p>Le brainsource de Hackbrighte.</p>' +
      '</div>';

      var infoWindow = new google.maps.InfoWindow({
      content: contentString,
      maxWidth: 200
      });

      markerHB.addListener('click', function() {
        infoWindow.open(map, marker);
      });


  // add your own styling

      var styleArray = [
        {
          featureType: "all",
          stylers: [
            { saturation: -80 }
          ]
        },{
          featureType: "road.arterial",
          elementType: "geometry",
          stylers: [
            { hue: "#00ffee" },
            { saturation: 50 }
          ]
        },{
          featureType: "poi.business",
          elementType: "labels",
          stylers: [
            { visibility: "off" }
          ]
        }
      ];

      map.setOptions({styles: styleArray});

}

google.maps.event.addDomListener(window, 'load', initializeMap);

////////////////////////////////////////////////////////
// SEARCHBOX PLACES - places search, with autocomplete

var createInputPlaces = function(DOMid){

      var inputLocation = document.getElementById(DOMid);

      var locationAutoC = new google.maps.places.Autocomplete(inputLocation);

    // Get the full place details when the user selects a place from the
    // list of suggestions.
      google.maps.event.addListener(locationAutoC, 'place_changed', function() {
        infowindow.close();
        var place = locationAutoC.getPlace();
        if (!place.geometry) {
          return;
        }
      });

};

google.maps.event.addDomListener(window, 'load', function(){
    createInputPlaces("destination");
    createInputPlaces("newStopInput");
});


////////////////////////////////////////////////////////
// SET DESTINATION

$("#createRoadTrip").on("click", function(){
    // create directions object
      directionsService = new google.maps.DirectionsService;
      directionsDisplay = new google.maps.DirectionsRenderer({
        draggable: true,
        map: map,
        panel: document.getElementById('directions')
      });

      directionsDisplay.setMap(map);

      directionsDisplay.addListener('directions_changed', function(){
        computeTotalDistance(directionsDisplay.getDirections());
      });

    // trigger google dev code
      displayRoute(myPosition, $("#destination").val(), directionsService,directionsDisplay);
});


////////////////////////////////////////////////////////
// MARK OWN POI -- without adding to route

$("#updateRoadTrip").on("click", function(){

    roadTripStops.push({
        location: $("#newStopInput").val(),
        stopover: true
      });

    displayRoute(myPosition, $("#destination").val(), directionsService,directionsDisplay);
});

////////////////////////////////////////////////////////
// Change the preferred mode of transport

document.getElementById('mode').addEventListener('change', function() {
    // update global var

    //trigger route update
    displayRoute(myPosition, $("#destination").val(), directionsService,directionsDisplay);
  });


////////////////////////////////////////////////////////
// GOOGLE DEV CODE -- display route with waypoints.

function displayRoute(origin, destination, service, display) {
  var selectedMode = document.getElementById('mode').value;
  service.route({
    origin: origin,
    destination: destination,
    waypoints: roadTripStops,
    travelMode: google.maps.TravelMode[selectedMode],
    avoidTolls: true
  }, function(response, status) {
    if (status === google.maps.DirectionsStatus.OK) {
      display.setDirections(response);
    } else {
      alert('Could not display directions due to: ' + status);
    }
  });
}

function computeTotalDistance(result) {
  var total = 0;
  var myroute = result.routes[0];
  for (var i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i].distance.value;
  }
  total = total / 1000;
  document.getElementById('total').innerHTML = total + ' km';
}
