Parse.initialize("oe3dboiG0RzJNULxKvdHYGWEb3Cq7mzHRC3Dwh6E", "cR8whmMjybMoXUqfAzhxUJSiBXw3QPt7ZB4bRGw8");
TipObject = Parse.Object.extend("TipObject");

$(document).ready(function() {

    $("#addtipForm").on("submit", function(e) {
		e.preventDefault();

		//get values
		var numcows = $("#numcows").val();
		var howdangerous = $("#howdangerous option:selected").val();
		var comments = $("#comments").val();

		//TBD: Validation
		var tip = new TipObject();
		tip.save(
				{
					numcows:numcows,
					howdangerous:howdangerous,
					comments:comments
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

		var query = new Parse.Query(TipObject);
		query.find({
			success: function(results) {
				var s = '';
				for(var i=0, len=results.length; i<len; i++) {
					var result = results[i];
					console.dir(result);
					s+= '<p>';
					s+= '<b>ID:</b> '+ result.id + '<br/>';
					s+= 'Created: ' + result.createdAt + '<br/>';
					s+= 'Number of Cows: ' + result.attributes.numcows + '<br/>';
					s+= 'How Dangerous?: ' + result.attributes.howdangerous + '<br/>';
					s+= 'Comments: ' + result.attributes.comments;
					s+= '</p>';
				}
				$("#tipdisplay").html(s);
			},
			error: function(error) {
				alert("Error: " + error.code + " " + error.message);
			}
		}); 
    }
});

//Wrapper for alert so I can dynamically use PhoneGap alert's on device
function doAlert(str,cb) {
	alert(str);
	cb();
}