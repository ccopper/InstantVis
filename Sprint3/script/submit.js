/** 
 * Web page event and controller logic
 *	@module Submit
 */

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
var visMaxMargin = 2000;
var defaultVisWidth = 600;
var defaultVisHeight = 300;
var defaultNumPoints = -1;
//Margin object to hold default values
var defaultMargins = {top: 50, right: 55, bottom: 55, left: 55};
//Margin object to save previous values
var oldMargins = defaultMargins;
//Store the maximum number of data points for the current visualization
var maxPoints = NaN;
//Global reference to table column sets. [[[1,2],[2,3]],[[4,5],[1,2]]]
var tableColumnSets = [];
//var for Draggable splitpane
var isDrag = false;
//Toggle color icon mode
var useColorIcons = false;
//Turn this on to test on local machine
var runLocal = true;
//Global reference to the current visualization type
var currentVis = NaN;
//Array of visualizations which do not require two color tables 
var oneColorVisualizations = ["Bar","Scatter","Bubble"];

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
				{hue:60,saturation:"100%",lightness:"60%"},
				{hue:152,saturation:"199%",lightness:"44%"},
				{hue:229,saturation:"82%",lightness:"19%"}
			];
//Global reference to active colors
var visColorId = [5,10];
var visColors = [colors[visColorId[0]], colors[visColorId[1]]];

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
	
	//set the default color borders
	$("#colorTableX1 td:eq(" + (visColorId[0]) +")").addClass("colorSquareHighLightOn");
	$("#colorTableX2 td:eq(" + (visColorId[1]) +")").addClass("colorSquareHighLightOn");
	
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

  	$("#visMargin_top").on('change',marginChangeHandler);
  	$("#visMargin_bottom").on('change',marginChangeHandler);
  	$("#visMargin_left").on('change',marginChangeHandler);
  	$("#visMargin_right").on('change',marginChangeHandler);
}

/**
 * This function handles changes to the visualization margin values. 
 * It will make sure only positive numeric values within specified
 * range will be accepted.
*/
function marginChangeHandler(event)
{
	var inputId = event.target.id;
	var numPattern = new RegExp("^-?\\d+$");
	var margin = $("#"+inputId).val();
	var margin_int = parseInt(margin);
	if(numPattern.test(margin))
	{
		if(margin_int < 0)
		{
			$("#"+inputId).val(0);
			refreshVisualization();
			oldMargins = getMargins();
		}
		else if (margin_int > visMaxMargin)
		{
			$("#"+inputId).val(visMaxMargin);
			refreshVisualization();
			oldMargins = getMargins();
		}
		else
		{
			refreshVisualization();
			oldMargins = getMargins();
		}
	}
	else
	{
		if(oldMargins)
		{
			if(inputId == 'visMargin_top')
			{
				$("#"+inputId).val(oldMargins.top);		
			}
			if(inputId == 'visMargin_bottom')
			{
				$("#"+inputId).val(oldMargins.bottom);		
			}
			if(inputId == 'visMargin_left')
			{
				$("#"+inputId).val(oldMargins.left);		
			}
			if(inputId == 'visMargin_right')
			{
				$("#"+inputId).val(oldMargins.right);		
			}
		}
	}
}


/**
 * This function will update the visualization size based on the size controls.
*/
function visSizeChangeHandler(event)
{
	var inputId = event.target.id;
	var numPattern = new RegExp("^\\d+$");
	var dimension = $("#"+inputId).val();
	if(numPattern.test(dimension))
	{
		if(parseInt(dimension) > visMaxWidth || parseInt(dimension) < visMinWidth)
		{
			if(inputId == "visHeight")
			{
				$("#"+inputId).val($("#visSVG").height());
			}
			else
			{
				$("#"+inputId).val($("#visSVG").width());
			}
		}
		else
		{
			refreshVisualization();
		}
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
	var inputId = event.target.id;
	var fieldValue = $("#"+inputId).val();
	var fieldValue_int = parseInt(fieldValue);
	var numPattern = new RegExp("^\\d+$");
	if(numPattern.test(fieldValue))
	{
		if(fieldValue_int > maxPoints)
		{
			 $("#"+inputId).val(maxPoints);
		}
		else if(fieldValue_int < 1)
		{
			$("#"+inputId).val(1);
		}
		else
		{
			refreshVisualization();
		}
	}
	else
	{
		 $("#"+inputId).val(currentVisualization.dataSet.length);
	}
}


/**
 * This function will read the margin values from the inputs and return a margin object.
 * @returns {Object} - An object containing the margins for each side of the visualization
*/
function getMargins()
{
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

	//var visColors = [colors[x1ColorIndex],colors[x2ColorIndex]];
	var visWidth = parseInt($("#visWidth").val()) ? parseInt($("#visWidth").val()) : defaultVisWidth;
	var visHeight = parseInt($("#visHeight").val()) ? parseInt($("#visHeight").val()) : defaultVisHeight;
	console.log("Refresh: Height: " + visHeight);
	var numDataPoints = parseInt($("#dataPoints").val()) ? parseInt($("#dataPoints").val()) : defaultNumPoints;
	var visMargins = getMargins();

	var visualization = getVisualization(tables[currentTable],visType,visColors,visWidth,visHeight,numDataPoints,visMargins,textOrientation);

	if(!visualization)
	{
		console.log('Could not find visualization type ' + visType + ' for div: '+visDivId)
	}else{
		visualization.draw("visSVG");
	}

	resizeVisWrapper();
}

/**
 * This function will look at the id of the table cell clicked and update the visualization color accordingly
*/
function colorClickHandler(event,refresh)
{
	//If the square clicked already is selected, don't do anything
	if($(this).hasClass("colorSquareHighLightOn"))
	{
		console.log("No color change.");
		return;
	}

	//Get the color and table
	var colorIndex = $(this).data("cId");
	var colorTableId = $(this).data("tId");
	
	console.log("Color Clicked. Index:" + colorIndex + " " + ((colorTableId == "1") ? "x1" : "x2"));

	visColorId[colorTableId-1] = colorIndex;
	
	$("#colorTableX"+ colorTableId + " td").removeClass("colorSquareHighLightOn")
	$("#colorTableX"+ colorTableId + " td").addClass("colorSquareHighLightOff")

	$(this).removeClass("colorSquareHighLightOff");
	$(this).addClass("colorSquareHighLightOn");
	
	visColors = [colors[visColorId[0]], colors[visColorId[1]]];


	refreshVisualization();
	
	
	tableColorUpdate();
	// $(this).css("border","solid 2px");
	// var column_num = parseInt($(this).index()) + 1;
	// var row_num = parseInt($(this).parent().index()) + 1;
	// console.log("Cell Clicked: ("+column_num+","+row_num+")");
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
 					[[0, 0, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],					
 					[1,	1, 1, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					[2,	4, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					[3,	9, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					[4,	16, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					[5,	25, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					[6,	15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					[7,	21, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					[8,	23, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					[9,	15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],             
                     [10, 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     [11, 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     [12, 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     [13, 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     [14, 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     [15, 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     [16, 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     [17, 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     [18, 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     [19, 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     [20, 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     [21, 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)]]		
 			}		
 		};
 	var table2 = {		
 		"Visualizations":		
 			[{			
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
 				"ColumnType": ["String", "Integer"],			
 				"Values":				
 					[["Hello", 0, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],					
 					["Hello",	1, 1, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					["Hello1",	4, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					["Hello2",	9, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					["Hello3",	16, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					["Hello4",	25, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					["Hello5",	15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					["Hello6",	21, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					["Hello7",	23, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],				
 					["Hello8",	19, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],             
                     ["Hello9", 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     ["Hello10", 10, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     ["Hello11", 8, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     ["Hello12", 7, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     ["Hello13", 9, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     ["Hello14", 12, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     ["Hello15", 15, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     ["Hello16", 8, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     ["Hello17", 3, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     ["Hello18", 4, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     ["Hello19", 5, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)],              
                     ["Hello20", 8, (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50), (Math.random()*50)]]		
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

	//colorClickHandler({target:{id:"color_0_x1"}});

}

/**
 * Called to fix table and graph size
*/
function resizeVisWrapper()
{
	if(!$("#tableContainer").is(':visible'))
	{
		return;
	}
	//Let the graph auto size
	var actWidth = $("#visSVG").outerWidth();
	if(actWidth > (document.body.clientWidth * 0.6))
	{
		actWidth = document.body.clientWidth * 0.6;
	}
	$("#visualizationContainer").width(actWidth + 35);
	//Fix table width
	$("#tableContainer").width($("#visWrapper").width() - $("#sPaneDiv").outerWidth() - $("#visualizationContainer").outerWidth() - 30);
	
	$("#visualizationToolbox").height($(window).height() - 40);
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


	if(tableHasVisType(tableNumber,"Bar"))
	{
		visTypeClickHandler('Bar_icon');
	}
	else
	{
		var bestVisIndex = getBestVisualization(tableNumber);
		visTypeClickHandler(tables[tableNumber].Visualizations[bestVisIndex].Type+'_icon');
	}
	

}

/**
 * This function will determine if a given visualization type exists in a table.
 * @param {number} tableIndex - The index of the table to search through
 * @param {string} type - The visualization type to search for
 * @returns {Boolean} - True if table has vis type, otherwise false.
*/
function tableHasVisType(tableIndex, type)
{
	for(var i in tables[tableIndex].Visualizations)
	{
		if(tables[tableIndex].Visualizations[i].Type == type)
		{
			return true;
		}
	}
	return false;
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
 * This function will reset the values of the margin controls to the default
*/
function resetMargins()
{
	$("#visMargin_top").val(defaultMargins.top);
	$("#visMargin_bottom").val(defaultMargins.bottom);
	$("#visMargin_left").val(defaultMargins.left);
	$("#visMargin_right").val(defaultMargins.right);
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
		if($("#"+event.target.id).hasClass('iconBorderHighlight'))
		{
			return;
		}
		console.log('type:'+typeof(event)+'\n\t'+event);
		iconId = event.target.id;
		$("#visWidth").val(defaultVisWidth);
		$("#visHeight").val(defaultVisHeight);
		$("#dataPoints").val(-1);
		resetMargins();
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
	//Disable width option for pie charts
	$("#visWidth").prop('disabled', (visType == "Pie"));

	if(visType == "Tree" || visType == "Pie")
	{
		$("#visTextOptions").hide();
	}
	else
	{
		$("#visTextOptions").show();	
	}

	refreshVisualization();

	maxPoints = currentVisualization.dataSet.length;

	if(hideSecondColorPalette())
	{
		console.log("Hiding color table for vis:"+visType);
		$("#colorTableX2").hide();
		$("#colorPalette").width(colorColumns * 20 + 5);

	}
	else
	{
		$("#colorTableX2").show();	
		$("#colorPalette").width(2 * (colorColumns * 20));
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
	$("#visWidth").val(defaultVisWidth);
	$("#visHeight").val(defaultVisHeight);
	$("#dataPoints").val(maxPoints);

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
	//var widthBefore = $("#visualizationContainer").innerWidth();
	//$("#editVisualization").resize();
	//$("#visualizationContainer").width(widthBefore);

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
}

/**
 * This function will take the global color list and 
 * create a table with cells with corresponding background colors.
*/
function populateColorTable()
{
	var tableX1 = $("#colorTableX1");
	var tableX2 = $("#colorTableX2");
	
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
		tableX1.append("<tr />");
		tableX2.append("<tr />");
		var columnCounter = ((colors.length - colorCounter) >= colorColumns) ? colorColumns : colors.length - colorCounter;
		for(var i = 0; i < columnCounter; i++)
		{
			var cell = $("<td>",
			{
				"class": "colorCell",
				"style": "background-color: hsl("+colors[colorCounter].hue+","+colors[colorCounter].saturation+","+colors[colorCounter].lightness+")",
				"click": colorClickHandler,
				"data": 
				{ 
					"cId": colorCounter,
					"tId": 1
				}
			});
			cell.addClass("colorSquareHighLightOff");
			
			tableX1.find("tr:last").append(cell);
			//Clone the cell(true preserves data and events)
			tableX2.find("tr:last").append(cell.clone(true).data("tId", 2));

			
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
