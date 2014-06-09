//Global reference to table data
var tables = [];
var currentTable = 0;
//Global reference to table column sets. [[[1,2],[2,3]],[[4,5],[1,2]]]
var tableColumnSets = [];
//var for Draggable splitpane
var isDrag = false;

$(document).ready(readyFunction);
	

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

//Called to fix table and graph size
function resizeVisWrapper()
{
	//Let the graph auto size
	$("#visualizationContainer").width($("#visSCG").outerWidth());
	//Fix table width
	$("#tableContainer").width($("#visWrapper").width() - $("#sPaneDiv").outerWidth() - $("#visualizationContainer").outerWidth() - 25);

}


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


function parseComplete(data)
{
	// Check if the request failed
	if(data.Status == 0)
	{
		nonRecoverableError("<h3>No tables found<br>Refresh and try again</h3>");
		return
	}
	
	//Remove Keypress handler
	$("#urlTextbox").unbind("keypress");
	
	tables = AI(data); // Call AI

	numDataSets = tables.length;

	if(numDataSets==0)
	{
		$("#submissionNotification").text("No meaningful data found. Please try again.");
		$("#urlTextbox").val("");
		$("#form").fadeIn(0);
		$("#loadingContent").hide();
		$("#examples").show();
		return;
	}

	$("#userInputArea").slideUp();
	$("#logo").hide();
	$("#testButton").hide();
	$("#visualizationToolbox").show();
	$("#visualizationToolbox").height($(window).height()-$('#toolBar').height()+40);
	$("#loadingContent").slideUp();


	populateTableSelect();

	//Load first visualization
	tableSelectHandler(0);
	//Select first table in selection box
	$('#tableSelectionBox').val("0");
}
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

function loadToolbox()
{
	$("#userInputArea").slideUp();
	$("#logo").hide();
	$("#testButton").hide();
	$("#visualizationToolbox").show();
	$("#visualizationToolbox").height($(window).height()-$('#toolBar').height()+40);

	var table1 = {		
 		"Visualizations":		
 			[{			
 				"Type": "Bar",			
 				"DataColumns": [0, 1]		
 			},{			
 				"Type": "Line",			
 				"DataColumns": [0, 1, 2, 3]		
 			},{			
 				"Type": "Scatter",			
 				"DataColumns": [0, 1]		
 			},{         
                 "Type": "Area",          
                 "DataColumns": [0, 1]       
             }],		
 		"Data":		
 			{			
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
 				"DataColumns": [0, 1]		
 			},{			
 				"Type": "Line",			
 				"DataColumns": [0, 1, 2, 3]		
 			},{			
 				"Type": "Scatter",			
 				"DataColumns": [0, 1]		
 			},{         
                 "Type": "Area",          
                 "DataColumns": [0, 1]       
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

 	for(var i=0; i<tables.length; i++)
	{
		addTable(tables[i],i);
	}

	//Load first visualization
	tableSelectHandler(0);
	//Select first table in selection box
	$('#tableSelectionBox').val("0");
}


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



function visTypeClickHandler(event)
{
	//Add a border to the icon clicked and remove any existing borders
	var iconId = NaN;
	if(typeof(event) == 'string')
	{
		iconId = event;
	}else{
		console.log('type:'+typeof(event)+'\n\t'+event);
		iconId = event.target.id;
	}
	console.log(iconId + 'Clicked');
	$('#iconContainer img').each(function()
	{
		$(this).removeClass('iconBorder');
	});
	$('#'+iconId).addClass('iconBorder');

	//Draw the visualization
	var visType = iconId.replace('_icon','');
/*	var visDivId = 'table_'+currentTable+'_visType_'+visType;

	//Check if visualization already exists, if not make it.
	if($('#'+visDivId).length)
	{
		console.log('Found existing div: '+visDivId);
		//If the requested graph is already shown, do nothing.
		if($('#'+visDivId).is(':visible'))
		{
			return;
		}else{
			//Hide all other visualizations and show the current visualization and tools
			$('#'+visDivId).siblings().hide();
			$('#'+visDivId).show();
			$('#options').show();
		}
	}else{
		console.log('Creating new visualization div for '+visDivId);
		createDiv('visualizationContainer',visDivId,"","",'visualization');
		var visualization = getVisualization(tables[currentTable],visType);
		if(!visualization)
		{
			console.log('Could not find visualization type ' + visType + ' for div: '+visDivId)
		}else{
			visualization.draw(visDivId);
			$('#'+visDivId).show();
			$('#'+visDivId).siblings().hide();
			$('#options').show();	
		}
		
	}
	*/
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

function loadVisTypeIcons(visTypes)
{
	$('#iconContainer').empty();
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
			$("#iconContainer").append("<img id='" + iconId + "'' src='"+imagePath+"' height='50',width='50'/>");
			$("#"+iconId).click(visTypeClickHandler);
		}
	}
}

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

function printArray(array)
{
	console.log("Printing array...")
	for(var i = 0; i < array.length; i++)
	{
		console.log('\t'+i+': '+array[i]);
	}
}

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

	// parseComplete("kldhdjkshg");

	console.log("url: " + url);
}




function tableClickHandler(event)
{
	var callerId = event.target.id;
	//Do not handle column set clicks
	if(!/table\d+/.test(callerId))
	{
		return;
	}
	var tableNumber = parseInt(callerId.substring(5));
	var columnSet = tableColumnSets[tableNumber][0][0];
	var visType = tables[tableNumber].Visualizations[0].Type;

	console.log(callerId+' clicked.')
	//If opening a different table, clear all visualizations
	if(!$('#'+$('#'+callerId).children()[0].id).is(':visible'))
	{
		$('#visualizationContainer').children().hide();
	}
	//Collapse other open tables
	var children = $('#'+callerId).parent().children();
	for(childIndex = 0; childIndex < children.length; childIndex++)
	{
		if(children[childIndex].id != callerId)
		{
			collapseTable(children[childIndex].id);
		}else{
			expandTable(children[childIndex].id);
		}
	}
	var columnSetId = $('#'+callerId).children()[0].id;
	loadVisTypeIcons(getGraphTypes(columnSetId),columnSetId);
	//Automatically draw first table and load vis options
	visTypeClickHandler('table_'+tableNumber+'_columnSet0'+'_'+visType);
	//getVisualization(tables[tableNumber],columnSet,visType).draw('visualization');
}

function columnSetClickHandler(event)
{
	var iconId = NaN;
	//This function can be called by an event or by another function
	//The parameter may be either a string or an event
	if(typeof(event)=='string')
	{
		iconId = event;
	} else{
		iconId = event.target.id;
	}
	console.log('Column set click: '+iconId);
	$('#visualization').empty();
	//Draw first graph type automatically
	var tableNumber = parseInt(iconId.charAt(6));
	var columnSetNumber = parseInt(iconId.charAt(17));
	var columnSet = tableColumnSets[tableNumber][0][columnSetNumber];
	var graphs = getGraphTypes(iconId);
	loadVisTypeIcons(graphs,iconId);
	visTypeClickHandler('table_'+tableNumber+'_columnSet'+columnSetNumber+'_'+graphs[0]);
}


function arrayContainsSubArray(array,element)
{
	if(array.length == 0)
	{
		return false;
	}
	for(k=0; k < array.length; k++)
	{
		if(arraysAreEqual(array[k],element))
		{
			return true;
		}
	}
	return false;
}

function arraysAreEqual(arrayA,arrayB)
{
	if(arrayA.length != arrayB.length)
	{
		return false;
	}
	for(index = 0; index < arrayA.length; index++)
	{
		if(arrayA[index] != arrayB[index]){
			return false;
		}
	}
	return true;
}

function nonRecoverableError(errMessage)
{
	$("#resultsMessage").html(errMessage);
	$("#graphArea").children().hide();
	$("#resultsMessage").fadeIn(500);
	
}
