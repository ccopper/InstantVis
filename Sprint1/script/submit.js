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
		$("#form").hide(1000);
		visualize(0,parentId);
	});
});

