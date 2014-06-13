//Global reference to table data
var tables = [];
var currentTable = 0;
//Global reference to current visualization type
var visType = NaN;
//Constraints for visualization
var visMinHeight = 100;
var visMinWidth = 100;
var visMaxHeight = 2000;
var visMaxWidth  = 2000;
var visMaxDataPoints = 1000;
var visMinDataPoints = 1;
var defaultVisWidth = 600;
var defaultVisHeight = 300;
var defaultNumPoints = 22;
//Global reference to table column sets. [[[1,2],[2,3]],[[4,5],[1,2]]]
var tableColumnSets = [];
//var for Draggable splitpane
var isDrag = false;
//Toggle color icon mode
var useColorIcons = false;
//Turn this on to test on local machine
var runLocal = false;
//Global reference to the current visualization type
var currentVis = NaN;
//Flag to indicate not to trigger resizing during saving process
var saving = false;
//Global reference to active colors
var x1ColorIndex = 0;
var x2ColorIndex = 0;
//Reference to number of columns in color table
var colorColumns = NaN;
//The current orientation of the visualization text
var textOrientation = "Horizontal";
//Color table
var colors =[	
				{hue:120,saturation:"41%",lightness:"64%"},	// Pale Green
				{hue:265,saturation:"31%",lightness:"76%"},	// Lavendar
				{hue:29,saturation:"97%",lightness:"76%"},	// Peach
				{hue:60,saturation:"100%",lightness:"80%"},	// Chalk Yellow
				{hue:214,saturation:"52%",lightness:"45%"},	// Light Denim Blue
				{hue:328,saturation:"98%",lightness:"47%"},	// Bold Pink
				{hue:162,saturation:"71%",lightness:"36%"},	// Pale Turquoise
				{hue:26,saturation:"98%",lightness:"43%"},	// Pumpkin Orange
				{hue:244,saturation:"31%",lightness:"57%"},	// Dark Lavendar
				{hue:329,saturation:"80%",lightness:"53%"},	// Mid-Dark Pink
				{hue:88,saturation:"69%",lightness:"38%"},	// Dark Green Apple Green
				{hue:44,saturation:"98%",lightness:"45%"},	// Golden Yellow
				{hue:201,saturation:"52%",lightness:"77%"},	// Pale Sky Blue
				{hue:204,saturation:"71%",lightness:"41%"},	// Lighter Denim Blue
				{hue:92,saturation:"57%",lightness:"71%"},	// Pastel Green
				{hue:116,saturation:"57%",lightness:"40%"},	// Christmas Green
				{hue:1,saturation:"92%",lightness:"79%"},	// Pink
				{hue:359,saturation:"79%",lightness:"50%"},	// Valentine Red
				{hue:5,saturation:"91%",lightness:"83%"},
				{hue:208,saturation:"46%",lightness:"80%"},
				{hue:109,saturation:"49%",lightness:"85%"},
				{hue:286,saturation:"32%",lightness:"85%"},
				{hue:35,saturation:"98%",lightness:"82%"},
				{hue:60,saturation:"100%",lightness:"90%"},
				{hue:153,saturation:"45%",lightness:"79%"},
				{hue:24,saturation:"95%",lightness:"83%"},
				{hue:219,saturation:"39%",lightness:"85%"},
				{hue:323,saturation:"66%",lightness:"87%"},
				{hue:80,saturation:"69%",lightness:"87%"},
				{hue:50,saturation:"100%",lightness:"84%"},
				{hue:359,saturation:"80%",lightness:"50%"},
				{hue:207,saturation:"54%",lightness:"47%"},
				{hue:118,saturation:"41%",lightness:"49%"},
				{hue:292,saturation:"35%",lightness:"47%"},
				{hue:30,saturation:"100%",lightness:"50%"},
				{hue:60,saturation:"100%",lightness:"60%"}
			];


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

	populateColorTable();

	$("#tableSelectionBox").change(tableSelectHandler);
	

	var urlParams = getURLParams()
 	
 	if(typeof urlParams["URL"] != "undefined")
 	{
 		 $("#urlTextbox").val(urlParams["URL"]);
 		 submitForm();
  	}

  	//Set radio button click events
  	$("#radio_Vertical").click(changeTextOrientation);
  	$("#radio_Horizontal").click(changeTextOrientation);
  	$("#radio_Angled").click(changeTextOrientation);

  	//Initialize inputs
  	$("#visHeight").attr({"max":visMaxHeight,"min":visMinHeight});
  	$("#visHeight").on('change',visSizeChangeHandler);
  	$("#visWidth").attr({"max":visMaxWidth,"min":visMinWidth});
  	$("#visWidth").on('change',visSizeChangeHandler);
  	$("#dataPoints").attr({"max":visMaxDataPoints,"min":visMinDataPoints});
  	$("#dataPoints").on('change',visDataOptionChange);

  	$("#visMargin_top").on('change',visSizeChangeHandler);
  	$("#visMargin_bottom").on('change',visSizeChangeHandler);
  	$("#visMargin_left").on('change',visSizeChangeHandler);
  	$("#visMargin_right").on('change',visSizeChangeHandler);
}

/**
 * This function will update the visualization size based on the size controls.
*/
function visSizeChangeHandler(event)
{
	var inputId = event.target.id;
	var numPattern = new RegExp("^\\d+$");
	if(numPattern.test($("#"+inputId).val()))
	{
		console.log("Detected number size.");
		refreshVisualization();
	}
	else
	{
		console.log("Detected Alpha character.");
		if(inputId == "visHeight")
		{
			$("#"+inputId).val($("#visSVG").height());
		}
		else
		{
			$("#"+inputId).val($("#visSVG").width());
		}
		
	}
}

/**
 * This function will detect any changes to the number of inputs and refresh the visualization
*/
function visDataOptionChange(event)
{
	console.log("Points change by: "+event.target.id);
}


/**
 * This function will read the margin values from the inputs and return a margin object.
 * @returns {Object} - An object containing the margins for each side of the visualization
*/
function getMargins()
{
	//{top: 50, right: 55, bottom: 55, left: 55};
	var mTop = parseInt($("#visMargin_top").val());
	var mBottom = parseInt($("#visMargin_bottom").val());
	var mLeft = parseInt($("#visMargin_left").val());
	var mRight = parseInt($("#visMargin_right").val());
	return {top: mTop, bottom: mBottom, left: mLeft, right: mRight}
}

/**
 * This function will take any updated visualization settings and draw a new visualization
*/
function refreshVisualization()
{
	$("#visSVG").empty();

	var visColors = [colors[x1ColorIndex],colors[x2ColorIndex]];
	var visWidth = parseInt($("#visWidth").val()) ? parseInt($("#visWidth").val()) : defaultVisWidth;
	var visHeight = parseInt($("#visHeight").val()) ? parseInt($("#visHeight").val()) : defaultVisHeight;
	var numDataPoints = parseInt($("#dataPoints").val()) ? parseInt($("#dataPoints").val()) : defaultNumPoints;
	var visMargins = getMargins();

	var visualization = getVisualization(tables[currentTable],visType,visColors,visWidth,visHeight,numDataPoints,visMargins,textOrientation);

	if(!visualization)
	{
		console.log('Could not find visualization type ' + visType + ' for div: '+visDivId)
	}else{
		visualization.draw("visSVG");
	}
}

/**
 * This function will look at the id of the table cell clicked and update the visualization color accordingly
*/
function colorClickHandler(event,refresh)
{
	var colorId = event.target.id;
	var colorTableId = colorId.substr(colorId.length - 1);
	var colorIndex = colorId.replace("color_","").replace("_x"+colorTableId,"");
	console.log("Color Clicked. Index:" + colorIndex + " " + ((colorTableId == "1") ? "x1" : "x2"));
	if(!refresh)
	{
		refresh = true;
	}
	if(colorTableId==1)
	{
		x1ColorIndex = colorIndex;
	}
	else if(colorTableId == 2)
	{
		x2ColorIndex = colorIndex;
	}
	else
	{
		console.error("Color table identifier out of bounds. table: " + colorTableId);
		`;
	}
	if(colorIndex > (colors.length - 1) || colorIndex < 0)
	{
		console.error("Color row out of bounds. Row:" + row);
	}

	if(refresh){
		refreshVisualization();
	}

	setColorBorders();
}

/**
 * This function will remove borders from inactive color
 * squares and set the border of the active color squares.
*/
function setColorBorders()
{

	for(var j = 1; j < 3; j++)
	{
		for(var i in colors)
		{
			$("#color_"+i+"_x"+j).removeClass("colorSquareHighLightOn");
			$("#color_"+i+"_x"+j).addClass("colorSquareHighLightOff");
			if(i == x1ColorIndex && j == 1)
			{
				$("#color_"+i+"_x"+j).removeClass("colorSquareHighLightOff");
				$("#color_"+i+"_x1").addClass("colorSquareHighLightOn");
			}
			if(i == x2ColorIndex && j == 2)
			{
				$("#color_"+i+"_x"+j).removeClass("colorSquareHighLightOff");
				$("#color_"+i+"_x2").addClass("colorSquareHighLightOn");
			}
		}
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
 * This function is for testing purposes only. It will simulate the server sending data back and load that data.
*/
function testLocally()
{
	var table1 = {		
 		"Visualizations":		
 			[{			
 				"Type": "Bar",			
 				"DataColumns": [0, 1],
 				"Score": 1	
 			},{			
 				"Type": "Line",			
 				"DataColumns": [0, 1, 2],
 				"Score": 2		
 			},{			
 				"Type": "Scatter",			
 				"DataColumns": [0, 1, 2],	
 				"Score": 10		
 			},{         
                 "Type": "Pie",          
                 "DataColumns": [0, 1],
                 "Score": 3       
             },{         
                 "Type": "Tree",          
                 "DataColumns": [0],
                 "Score": 4           
             },{         
                 "Type": "Bubble",          
                 "DataColumns": [0, 1, 2],
                 "Score": 5     
             }],		
 		"Data":		
 			{			
 				"ColumnLabel": ["X", "Y", "Z"],			
 				"ColumnType": ["Integer", "Integer", "Integer"],
 				"Caption": "This is a title",			
 				"Values":				
 					[[0, 0, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],					
 					[1,	1, 1, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[2,	4, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[3,	9, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[4,	16, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[5,	25, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[6,	15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[7,	21, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[8,	23, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[9,	15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],             
                     [10, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [11, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [12, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [13, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [14, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [15, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [16, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [17, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [18, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [19, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [20, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [21, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)]]		
 			}		
 		};
 	var table2 = {		
 		"Visualizations":		
 			[{			
 				"Type": "Bar",			
 				"DataColumns": [0, 1],
 				"Score": 3	
 			},{			
 				"Type": "Line",			
 				"DataColumns": [0, 1, 2, 3],
 				"Score": 4
 			},{			
 				"Type": "Scatter",			
 				"DataColumns": [0, 1],
 				"Score": 5	
 			},{         
                 "Type": "Pie",          
                 "DataColumns": [0, 1],
                 "Score": 9
             },{         
                 "Type": "Tree",          
                 "DataColumns": [0, 1],
                 "Score": 2
             }],		
 		"Data":		
 			{		
 				"Caption": "2014 Rain Fall",	
 				"ColumnLabel": ["X", "Y"],			
 				"ColumnType": ["Integer", "Integer"],			
 				"Values":				
 					[[0, 0, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],					
 					[1,	1, 1, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[2,	4, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[3,	9, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[4,	16, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[5,	25, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[6,	15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[7,	21, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[8,	23, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],				
 					[9,	19, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],             
                     [10, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [11, 10, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [12, 8, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [13, 7, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [14, 9, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [15, 12, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [16, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [17, 8, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [18, 3, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [19, 4, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [20, 5, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],              
                     [21, 8, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)]]		
 			}		
 		};
 	tables = [table1,table2];

 	$("#userInputArea").slideUp();
	$("#logo").hide();
	$("#testButton").hide();
	$("#visualizationToolbox").show();
	$("#visualizationToolbox").height($(window).height());
	$("#loadingContent").slideUp();

	populateTableSelect();
	
	//Select first table in selection box
	$('#tableSelectionBox').val("0");

	//Load first visualization
	tableSelectHandler(0);
	//Set Border Styling
	colorClickHandler({target:{id:"color_0_x1"}},false);
}

/**
 * This function will detect radio button clicks and update the visualization accordingly
*/
function changeTextOrientation(event)
{
	console.log("Radio button click: "+event.target.id);
	newOrientation = event.target.id.replace("radio_","");
	if(textOrientation == newOrientation)
	{
		return;
	}
	textOrientation = newOrientation;
	refreshVisualization();
}

/**
 * Called to fix table and graph size
*/
function resizeVisWrapper()
{
	if(saving)
	{
		return;
	}
	//Let the graph auto size
	var actWidth = $("#visSVG").outerWidth();
	if(actWidth > (document.body.clientWidth * 0.6))
	{
		actWidth = document.body.clientWidth * 0.6;
	}
	$("#visualizationContainer").width(actWidth + 15);
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
	
	//Load visualization with highest confidence score

	currentVis = "initial"
	var bestVisIndex = getBestVisualization(0);
	visTypeClickHandler(tables[0].Visualizations[bestVisIndex].Type+'_icon');

}

/**
 * Iterate over all visualizations in a table and return the
 * index of the visualization with the highest confidence score
 * @param {number} tableIndex - The index of the table in the tables array
 * @returns {number} visIndex - The index of the visualization in the table
*/
function getBestVisualization(tableIndex)
{
	if(tableIndex > (tables.length - 1) || tableIndex < 0)
	{
		console.error("Unexpected table index: " + tableIndex);
	}
	var visIndex = NaN;
	var bestScore = -1;
	for(var i in tables[tableIndex].Visualizations)
	{
		if(!visIndex)
		{
			visIndex = i;
		}
		else
		{
			if(tables[tableIndex].Visualizations[i].Score > bestScore)
			{
				bestScore = tables[tableIndex].Visualizations[i].Score;
				visIndex = i;
			}
		}
	}
	return visIndex;
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
		return;
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

	//Select first table in selection box
	$('#tableSelectionBox').val("0");

	//Load first visualization
	tableSelectHandler(0);
	
	//Set Border Styling
	colorClickHandler({target:{id:"color_0_x1"}},false);


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
		currentVis = NaN;
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
	visType = iconId.replace('_icon','');
	if(currentVis == visType)
	{
		return;
	}else{
		currentVis = visType	
	}
	
	refreshVisualization();

	if(hideSecondColorPalette())
	{
		console.log("Hiding color table for vis:"+visType);
		$("#colorTableX2").hide();
		$("#colorPalette").width(colorColumns * 20 + 20);

	}
	else
	{
		$("#colorTableX2").show();	
		$("#colorPalette").width(2 * (colorColumns * 20) + 20);
	}

	updateVisSizeControls();
	
	updateTableVis(visType);
	//Since we have initilized a new graph resize the vis/table
	if($("#tableContainer").is(':visible'))
	{
		resizeVisWrapper();
	}
}

/**
 * This function will update the values of the size controls to reflect
 * the height and width of the current visualization.
*/
function updateVisSizeControls()
{
	var svgWidth = $("#visSVG").width();
	var svgHeight = $("#visSVG").height();
	var numVisDataPoints = currentVisualization.dataSet.length;
	$("#visWidth").val(svgWidth);
	$("#visHeight").val(svgHeight);
	$("#dataPoints").val(numVisDataPoints);

}

/**
 * This function will determine if the current visualization
 * should show one or two color palettes
 * @returns {Boolean} - True to hide color palette, false to keep it showing
*/
function hideSecondColorPalette()
{
	if(currentVisualization instanceof Treemap)
	{
		return false;
	}
	if(currentVisualization instanceof Bubble)
	{
		return true;
	}
	if(currentVisualization instanceof Pie)
	{
		return false;
	}
	if(currentVisualization instanceof Scatter)
	{
		if(currentVisualization.dataSet[0].length == 2)
		{
			return true;
		}
		return false;
	}
	if(currentVisualization instanceof Line)
	{
		if(currentVisualization.dataSet[0].length == 2)
		{
			return true;
		}
		return false;
	}
	if(currentVisualization instanceof Bar)
	{
		if(currentVisualization.dataSet[0].length <= 2)
		{
			return true;
		}
		return false;
	}
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
				imagePath = 'images/table_grey.png';
				break;
			case 'Bar':
				imagePath = 'images/bar_grey.png';
				break;
			case 'Line':
				imagePath = 'images/line.png';
				break;
			case 'Scatter':
				imagePath = 'images/scatter.png';
				break;
			case 'Area':
				imagePath = 'images/area_grey.png';
				break;
			case 'Pie':
				imagePath = 'images/pie_grey.png';
				break;
			case 'Tree':
				imagePath = 'images/tree_grey.png';
				break;
			case 'Bubble':
				imagePath = 'images/bubble_grey.png'
				break;
			default:
				console.log('Encountered unexpected visualization type: '+visTypes[i]);
		}
		if(useColorIcons)
		{
			imagePath = imagePath.replace("_grey","");
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
	}
	else
	{
		$("#tableContainer").show();
		$("#sPaneDiv").show()	
		$("#visualizationContainer").width(document.body.clientWidth/2);
		resizeVisWrapper();
	}
}

/**
 * This function will hide or show the controls to edit the visualization
*/
function toggleEditControls()
{
	$("#editVisualization").toggle();
	var widthBefore = $("#visualizationContainer").width();
	$("#editVisualization").resize();
	$("#visualizationContainer").width(widthBefore);

}

/**
 * This function will return the appropriate visualization types for a specified table.
 * @param {number} tableNumber - A number representing a table to be pulled from the analyzer data.
 * @returns {Array} - An array of strings representing graph types for a particular table
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
 * @returns {Boolean} - True if the array contains the element, false otherwise.
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
 * @returns {Object} - An object that represents the url parameters.
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
	saving = true;
	var html = d3.select("svg")
		.attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

    var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
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
	 saving = false;
}

/**
 * This function will take the global color list and 
 * create a table with cells with corresponding background colors.
*/
function populateColorTable()
{
	tableX1 = document.getElementById("colorTableX1");
	tableX2 = document.getElementById("colorTableX2");
	
	if(!tableX1 || !tableX2)
	{
		console.error("Could not find color table in html.");
		return;
	}

	//For both color tables, create a grid of colors with unique id's
	colorColumns = Math.ceil(Math.sqrt(colors.length));
	var colorCounter = 0;
	var colorRowCounter = 0;
	while(colorCounter < colors.length)
	{
		rowX1 = tableX1.insertRow(colorRowCounter);
		rowX2 = tableX2.insertRow(colorRowCounter);
		var columnCounter = ((colors.length - colorCounter) >= colorColumns) ? colorColumns : colors.length - colorCounter;
		for(var i = 0; i < columnCounter; i++)
		{
			cellX1 = rowX1.insertCell(i);
			hslColor = "hsl("+colors[colorCounter].hue+","+colors[colorCounter].saturation+","+colors[colorCounter].lightness+")";
			cellX1.id = "color_"+colorCounter+"_x1";
			$('#'+cellX1.id).click(colorClickHandler);
			cellX1.style.backgroundColor = hslColor;
			cellX1.style.width = "10px";
			cellX1.style.height = "10px";

			cellX2 = rowX2.insertCell(i);
			hslColor = "hsl("+colors[colorCounter].hue+","+colors[colorCounter].saturation+","+colors[colorCounter].lightness+")";
			cellX2.id = "color_"+colorCounter+"_x2";
			$('#'+cellX2.id).click(colorClickHandler);
			cellX2.style.backgroundColor = hslColor;
			cellX2.style.width = "10px";
			cellX2.style.height = "10px";
			colorCounter++;
		}
		colorRowCounter++;
	}

}

/**
 * This function sends a url to the server to parse.
 * @param {string} urlToParse - The url to send to the server to pares for table data.
*/
function submitForm(urlToParse)
{
	if(runLocal)
	{
		testLocally();
		return;
	}
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

	// parseComplete("kldhdjkshg");

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
