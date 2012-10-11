Parse.initialize("oe3dboiG0RzJNULxKvdHYGWEb3Cq7mzHRC3Dwh6E", "cR8whmMjybMoXUqfAzhxUJSiBXw3QPt7ZB4bRGw8");
TipObject = Parse.Object.extend("TipObject");

var currentLocation;

$(document).ready(function() {

	//I handle doing GPS on addForm display
    if($("#addTipBtn").length === 1) {
		currentLocation=null;
		navigator.geolocation.getCurrentPosition(function(pos) {
			//store the long/lat
			currentLocation = {longitude:pos.coords.longitude, latitude:pos.coords.latitude};
			$("#addTipBtn").removeAttr("disabled");
		}, function(err) {
			//Since geolocation failed, we can't allow the user to submit
			doAlert("Sorry, but we couldn't find your location.\nYou may not post a cow tip.");
		});

    }

    $("#addtipForm").on("submit", function(e) {
		e.preventDefault();

		//get values
		var numcows = $("#numcows").val();
		var howdangerous = $("#howdangerous option:selected").val();
		var comments = $("#comments").val();

		//TBD: Validation
		var tip = new TipObject();
		var point = new Parse.GeoPoint({latitude: currentLocation.latitude, longitude: currentLocation.longitude});
		tip.save(
				{
					numcows:numcows,
					howdangerous:howdangerous,
					comments:comments,
					location:point
				},{
					success:function(object) {
						console.log("Saved object");
						doAlert("Tip Saved!", function() { document.location.href='index.html'; });
					},
					error:function(model, error) {
						console.log("Error saving");
					}
				});

    });

    if($("#tipdisplay").length === 1) {

		//Update status to let the user know we are doing important things. Really important.
		$("#tipdisplay").html("Please stand by. Checking your location for nearby cow tips!");

		navigator.geolocation.getCurrentPosition(function(pos) {
			var myLocation = new Parse.GeoPoint({latitude: pos.coords.latitude, longitude: pos.coords.longitude});

			//Begin our query
			var query = new Parse.Query(TipObject);
			//query.near("location", myLocation);
			//Only within 30 miles
			query.withinMiles("location", myLocation, 30);
			//only within last week
			var lastWeek = new Date();
			lastWeek.setDate(lastWeek.getDate()-7);
			query.greaterThan("createdAt", lastWeek);
			query.find({
				success:function(results) { renderResults(results,myLocation); },
				error: function(error) { alert("Error: " + error.code + " " + error.message); }
			});

		}, function(err) {
			//Since geolocation failed, we can't allow the user to submit
			doAlert("Sorry, but we couldn't find your location.");
		},{timeout:20000,enableHighAccuracy:false});
    }
});

function renderResults(results,myLoc) {
	console.log("renderResults: "+results.length);

	if(results.length) {
		$("#tipdisplay").html("Displaying tips within 30 miles and from the last 7 days.");

		var map = L.map('map').setView([myLoc.latitude, myLoc.longitude], 8);
		var layerOpenStreet = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {maxZoom:18, minZoom:1, attribution:'Map data &copy; 2012 OpenStreetMap'}).addTo(map);
		var dangerLevels = ["Totally Safe","Some Risk","Farmer with Shotgun!"];

		for(var i=0, len=results.length; i<len; i++) {
			var result = results[i];
			var marker = L.marker([result.attributes.location.latitude, result.attributes.location.longitude]).addTo(map);
			var markerLabel = "Cows: "+result.attributes.numcows+"<br/>Danger: "+dangerLevels[result.attributes.howdangerous-1];
			if(result.attributes.comments && result.attributes.comments.length) markerLabel += "<br>"+result.attributes.comments;
			marker.bindPopup(markerLabel);
		}
	} else {
		$("#tipdisplay").html("I'm sorry, but I couldn't find any tips within 30 miles and from the past 7 days.");
	}
}

//Wrapper for alert so I can dynamically use PhoneGap alert's on device
function doAlert(str,cb) {
	if(cb) cb();
}