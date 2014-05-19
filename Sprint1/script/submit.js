$(document).ready(function(){
	$("#submitButton").mousedown(function()
	{
		$(this).css("border-style", "ridge");
	});
	$("#submitButton").mouseup(function()
	{
		$(this).css("border-style", "groove");
		//document.getElementById('submitButton').style.border= "groove";
	});
	$("#submitButton").click(function()
	{
		//$(this).text("I was Clicked");
	});
});

