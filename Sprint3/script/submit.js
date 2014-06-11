//Global reference to table data
var tables = [];
var currentTable = 0;
//Global reference to table column sets. [[[1,2],[2,3]],[[4,5],[1,2]]]
var tableColumnSets = [];
//var for Draggable splitpane
var isDrag = false;

$(document).ready(readyFunction);
	
/**
 * this function adds various event handlers to the interface components.
*/
function readyFunction()
{

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
	
	$("#urlTextbox").bind("keypress", function(event)
	{
		var code = event.keyCode || event.which;
		if(code == 13) 
		{ 
			submitForm();
		}
	});

	//Handle Split Pane
	$("#sPaneDiv").mousedown(function()
	{
		isDrag = true;

		$("#visWrapper").addClass("unselectable");

		$("#visWrapper").css("cursor", "ew-resize");
		$("#visWrapper").mousemove(function ()
		{
			var gWidth = $("#visualizationContainer").width();
			var margin = event.pageX - gWidth - 10;

			if(margin < 0)
			{
				$("#visualizationContainer").width(gWidth + margin)
			} else
			{
				$("#visualizationContainer").width(event.pageX - 10)
			}
			$("#tableContainer").width($("#visWrapper").width() - event.pageX - 20);

		});

	});
	$("#visWrapper").mouseup(function (event)
	{
		if(!isDrag)
		{ return;}
		$("#visWrapper").removeClass("unslectable");
		$("#visWrapper").css("cursor", "auto");
		isDrag = false;
		$("#visWrapper").unbind("mousemove");

	});
	
	$( window ).resize(resizeVisWrapper);

	$("#tableSelectionBox").change(tableSelectHandler);
	
	var urlParams = getURLParams()
 	
 	if(typeof urlParams["URL"] != "undefined")
 	{
 		 $("#urlTextbox").val(urlParams["URL"]);
 		 submitForm();
  	}
	
}

/**
 * This function will reload the page. Effectively 
 * taking the user back to the main input screen.
*/
function refreshPage()
{
	location.reload()
}

/**
 * Called to fix table and graph size
*/
function resizeVisWrapper()
{
	//Let the graph auto size
	$("#visualizationContainer").width($("#visSCG").outerWidth());
	//Fix table width
	$("#tableContainer").width($("#visWrapper").width() - $("#sPaneDiv").outerWidth() - $("#visualizationContainer").outerWidth() - 25);
}

/**
 * This function is called when the user selects a table from the drop down list.
 * It is also called manually to automatically select the first table and display its visualizations.
 * @param {Object} event - The listbox change event that triggers this function. Or a number representing a table to select.
*/
function tableSelectHandler(event)
{
	var tableNumber = NaN;
	if(typeof(event)=='number')
	{
		tableNumber = event;
	}else{
		tableNumber = $(this).val();
	}
	currentTable = tableNumber;
	console.log('Table Selected: '+ tableNumber);
	//Load icons for table
	var graphTypes = getGraphTypes(tableNumber);
	loadVisTypeIcons(graphTypes);
	
	populateTable(tables[tableNumber]);
	
	//Load first visualization
	visTypeClickHandler(tables[0].Visualizations[0].Type+'_icon');

}


/**
 * This function is called once the parser has completed parsing. The data is analyzed and then loaded into the interface.
 * @param {Object} data - The table data that the parser found.
*/
function parseComplete(data)
{
	// Check if the request failed
	if(data.Status == 0)
	{
		nonRecoverableError("No tables found. Please try again.");
		return
	}
	
	//Remove Keypress handler
	$("#urlTextbox").unbind("keypress");
	
	tables = AI(data); // Call AI

	numDataSets = tables.length;

	if(numDataSets==0)
	{
		nonRecoverableError("No meaningful data found. Please try again.");
		return;
	}

	$("#userInputArea").slideUp();
	$("#logo").hide();
	$("#testButton").hide();
	$("#visualizationToolbox").show();
	$("#visualizationToolbox").height($(window).height());
	$("#loadingContent").slideUp();


	populateTableSelect();

	//Load first visualization
	tableSelectHandler(0);
	//Select first table in selection box
	$('#tableSelectionBox').val("0");
}

/**
 * This function takes the list of tables received from the
 * Analyzer and adds entries in the table selection list box for each.
*/
function populateTableSelect()
{
	var sel = $('#tableSelectionBox').val();
	$('#tableSelectionBox').empty();
	for(var i in tables)
	{
		addTable(tables[i],i);
	}
	$('#tableSelectionBox').val(sel);
}

/**
 * This function takes a table and its corresponding number 
 * and adds an entry in the table selection list box for it.
 * @param {Object} table - The table object to get a caption from if possible.
 * @param {number} tableNumber - The order of the table in the Analyzer data
*/
function addTable(table,tableNumber)
{
	//If the table has a name, insert it instead of 'table: #'
	var tableName = 'Table ' + tableNumber;
	if(tables[tableNumber].Data.Caption)
	{
		tableName = tables[tableNumber].Data.Caption;
	}else
	{
		tables[tableNumber].Data.Caption = tableName;
	}
	$('#tableSelectionBox').append('<option value="'+tableNumber+'">'+tableName+'</option>');
}


/**
 * This function is called whenever a visualization type icon is clicked. It finds and loads the appropriate visualization.
 * @param {Object} event - The event that triggers this function or a string representing the icon id being clicked.
*/
function visTypeClickHandler(event)
{
	//First check to see if the function was called via an event or manually with a string
	var iconId = NaN;
	if(typeof(event) == 'string')
	{
		iconId = event;
	}else{
		console.log('type:'+typeof(event)+'\n\t'+event);
		iconId = event.target.id;
	}
	console.log(iconId + 'Clicked');

	//Set all icon borders to white so they can't be seen.
	$('#iconContainer img').each(function()
	{
		$(this).removeClass('iconBorderHighlight');
		$(this).addClass('iconBorderDefault')
	});
	//Highlight the border of the clicked icon to show it has been clicked
	$('#'+iconId).addClass('iconBorderHighlight');

	//Draw the visualization
	var visType = iconId.replace('_icon','');

	$("#visSVG").empty();
	var visualization = getVisualization(tables[currentTable],visType);
	if(!visualization)
	{
		console.log('Could not find visualization type ' + visType + ' for div: '+visDivId)
	}else{
		visualization.draw("visSVG");

		$('#options').show();	
	}
	
	updateTableVis(visType);
	//Since we have initilized a new graph resize the vis/table
	resizeVisWrapper();
}

/**
 * This function loads the appropriate visualization type icons for the current selected table.
 * @param {Array} visTypes - An array of strings representing the visualization types to be shown.
*/
function loadVisTypeIcons(visTypes)
{
	//Remove all existing icons
	$('#iconContainer').empty();
	//For every visualization type load the appropriate icon
	for(var i = 0; i<visTypes.length; i++)
	{
		var imagePath = NaN;
		var iconId = visTypes[i]+"_icon";
		switch(visTypes[i])
		{
			case 'Table':
				imagePath = 'images/table.png';
				break;
			case 'Bar':
				imagePath = 'images/bar.png';
				break;
			case 'Line':
				imagePath = 'images/line.png';
				break;
			case 'Scatter':
				imagePath = 'images/scatter.png';
				break;
			case 'Area':
				imagePath = 'images/area.png';
				break;
			case 'Pie':
				imagePath = 'images/pie.png';
				break;
			case 'Tree':
				imagePath = 'images/tree.png';
				break;
			case 'Bubble':
				imagePath = 'images/bubble.png'
				break;
			default:
				console.log('Encountered unexpected visualization type: '+visTypes[i]);
		}
		if(imagePath != NaN && iconId != NaN){
			$("#iconContainer").append("<img id='" + iconId + "'' src='"+imagePath+"' class='iconBorderDefault' height='50',width='50'/>");
			$("#"+iconId).click(visTypeClickHandler);
		}
	}
}

/**
 * This function will hide the table from the interface and center the visualization in the middle.
*/
function toggleDataTable()
{
	if($("#tableContainer").is(":visible"))
	{
		$("#tableContainer").hide()
		$("#sPaneDiv").hide()
		$("#visualizationContainer").width("100%");
	}else{
		$("#tableContainer").show();
		$("#sPaneDiv").show()	
		$("#visualizationContainer").width(document.body.clientWidth/2);
		
	}
	resizeVisWrapper();
}

/**
 * This function will return the appropriate visualization types for a specified table.
 * @param {number} tableNumber - A number representing a table to be pulled from the analyzer data.
*/
function getGraphTypes(tableNumber)
{
	var currentTable = tables[tableNumber];

	console.log('Getting graph types for table:'+tableNumber);

	var graphTypes = [];

	for(var i = 0; i < currentTable.Visualizations.length; i++)
	{
		if(!arrayContains(graphTypes,currentTable.Visualizations[i].Type))
		{
			graphTypes.push(currentTable.Visualizations[i].Type);
		}
	}

	return graphTypes;
}

/**
 * This function will return if a given element exists in a given array.
 * @param {Array} array - The array to check for the given element
 * @param {Object} element - The element to check for in the array
*/
function arrayContains(array,element)
{
	if(array.length == 0)
	{
		return false;
	}
	for(var i = 0; i < array.length; i++)
	{
		if(array[i]==element)
		{
			return true;
		}
	}
	return false;
}


/**
 * This function checks the url for a supplied ?URL= parameter
 * and tries to parse the url automatically.
*/
function getURLParams()
{
	var match,
		pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);

    urlParams = {};
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
	   
	return urlParams
}

/**
 * This function translates the svg information into an image and opens that image in a new page.
*/
function exportVisualization()
{
	var html = d3.select("svg")
		.attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

    var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
  	//var img = '<img src="'+imgsrc+'">'; 
  	//d3.select("#visExport").html(img);
  	// var w = window.open()
  	// w.document.write($("#visExport").html());
  	// w.document.close()

 
	var image = new Image;
	image.src = imgsrc;
	image.onload = function() {
		var canvas = document.querySelector("canvas");
	 	canvas.width = image.width;
	 	canvas.height = image.height;
	 	context = canvas.getContext("2d");

	 	context.drawImage(image, 0, 0);
	 	var canvasdata = canvas.toDataURL("image/png");

		var pngimg = '<img src="'+canvasdata+'">'; 	 
		var a = document.createElement("a");
		a.download = "visualization.png";
		a.href = canvasdata;
		a.click();
	  };
}

/**
 * This function sends a url to the server to parse.
 * @param {string} urlToParse - The url to send to the server to pares for table data.
*/
function submitForm(urlToParse)
{
	var url = NaN;
	if(urlToParse)
	{
		url = urlToParse;
	}else{
		url = $("#urlTextbox").val();	
	}
	
	url = url.trim();

	if (url == "")
	{
		$("#submissionNotification").text("Please enter a valid URL.");
		return;
	}

	$("#reprintUrl").text(url);

	$("#form").fadeOut(0);
	$("#loadingContent").show();//style.display = "inline";
	$("#examples").hide();

	parseHTML(url, parseComplete);

	// SWAP THESE V ^

	//parseComplete("kldhdjkshg");

	console.log("url: " + url);
}

/**
 * This function displays an error message if a non-recoverable error is reached.
 * @param {string} errMessage - The message to be displayed
*/
function nonRecoverableError(errMessage)
{
	$("#submissionNotification").text(errMessage);
	$("#urlTextbox").val("");
	$("#form").fadeIn(0);
	$("#loadingContent").hide();
	$("#examples").show();
}
