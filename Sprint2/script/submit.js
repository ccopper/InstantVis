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

		submitForm();
	});
	$(document).keypress(function(e) {
		if(e.which == 13) {
			submitForm();
		}
	});
});

function submitForm()
{

	var url = $("#urlTextbox").val();

	url = url.trim();

	if (url == "")
	{
		$("#submissionNotification").text("Please enter a valid URL.");
		return;
	}

	$("#reprintUrl").text(url);

	$("#form").fadeOut(0);
	$("#loadingContent").show();//style.display = "inline";


	parseHTML(url, parseComplete);


	// parseComplete("kldhdjkshg");

	console.log("url: " + url);
}

function parseComplete(data)
{
	//Check if the request failed
	if(data.Status == 0)
	{
		$("#resultsMessage").html("<h3>No Usable Tables Found</h3>");
		$("#loadingContent").hide();
		$("#resultsMessage").fadeIn(500);

		return
	}
	
	var cleanData = AI(data); // Call AI


	numDataSets = cleanData.length;

	for (var i = 0; i < numDataSets; i++) {
	visualize(cleanData[i],"visArea");
	}

	// visualize(0, "visArea");

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