$(document).ready(function(){
	$("#submitButton").mousedown(function()
	{
		$(this).css("border-style", "ridge");
	});
	$("#submitButton").mouseup(function()
	{
		$(this).css("border-style", "groove");
	});
	$("#submitButton").click(function()
	{
		var url = document.getElementById("urlTextbox").value;

		if (url == "") {
			$("#submissionNotification").text("Please enter a valid URL.");
			return;
		}

		$("#reprintUrl").text(url);

		$("#form").fadeOut(0);
		$("#loadingContent").show();//style.display = "inline";

		// parseHTML(url, parseComplete);

		parseComplete("kldhdjkshg");

		console.log("url: " + url);

		// var parentId = $(this).parent().parent().parent().attr('id');
		// console.log('Parent Id is: ' + parentId);
		//$("#form").hide(1000);
		
		
		// $("#visArea").fadeIn(500);
	});

	

});


function parseComplete(data) 
{
	// var cleanData = AI(data); // Call AI

	// numDataSets = cleanData.length;

	// for (var i = 0; i < numDataSets; i++) {
	// 	visualize(cleanData[i],"visArea");
	// }

	visualize(0, "visArea");

	showResults();

}

function showResults()
{
	
	// Display results message.
	$("#resultsMessage").fadeIn(500);
		
	// Display all of the visualizations.
	var visDivs = $("#visArea").children();
	var numVis = visDivs.length;
	for (var i = 0; i < numVis; i++) {
		$("#vis" + i).fadeIn(500);
	}
	
	$("#loadingContent").hide();//style.display = "none";
}
