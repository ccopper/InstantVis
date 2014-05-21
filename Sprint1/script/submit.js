$(document).ready(function(){
	$("#submitButton").mousedown(function()
	{
		$(this).css("border-style", "ridge");
	});
	$("#submitButton").mouseup(function()
	{
		$(this).css("border-style", "groove");
	});
	$("#submitButton").click(function(d)
	{
		var url = document.getElementById("urlTextbox").value;

		$("#form").fadeOut(0);
		$("#loadingContent").show();//style.display = "inline";

		//parseHTML(url, parseComplete);

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
	//var cleanData = doWork(data); // Call AI

	//visualize(cleanData, "visArea"); // Send to Visualizer

	visualize(0,"visArea");

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
