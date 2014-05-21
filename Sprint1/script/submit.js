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
		var parentId = $(this).parent().parent().parent().attr('id');
		console.log('Parent Id is: ' + parentId);
		//$("#form").hide(1000);
		$("#form").fadeOut(0);
		$("#resultsMessage").fadeIn(500);
		// style.display = "inline";
		visualize(0,parentId);
		var visDivs = $("#visArea").children();
		var numVis = visDivs.length;
		for (var i = 0; i < numVis; i++) {
			$("#vis" + i).fadeIn(500);
		}
		// $("#visArea").fadeIn(500);
	});
});

