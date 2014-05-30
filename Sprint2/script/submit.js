
//Global reference to table data
var tables = [];
//Global reference to table column sets. [[[1,2],[2,3]],[[4,5],[1,2]]]
var tableColumnSets = [];

$(document).ready(readyFunction);
	

function readyFunction()
{
	if(typeof d3 == "undefined")
	{	
		nonRecoverableError("<h3>Failed to load d3!<br>Try again later.</h3>"); 
		return;
	}
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
}

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
	// Check if the request failed
	if(data.Status == 0)
	{
		nonRecoverableError("<h3>No tables found<br>Refresh and try again</h3>");
		return
	}
	
	var cleanData = AI(data); // Call AI


	numDataSets = cleanData.length;

	$("#visualizationToolbox").show();
	$("#userInputArea").slideUp();
	$("#testButton").hide();

	for(var i=0; i<numDataSets; i++)
	{
		addTable(cleanData[i],i);
	}

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


function loadToolbox()
{
	$("#visualizationToolbox").show();
	$("#userInputArea").slideUp();
	$("#testButton").hide();

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

	tables = [table1, table2];

	var numTables = tables.length;
	for(i=0; i<numTables; i++)
	{
		addTable(tables[i],i);
	}
}

function addTable(table,id)
{
	createDiv('tableSelectionSideBar','table'+id,"90%","",'tableEntry')
	$("#table"+id).text("Table: "+id);
	$("#table"+id).click(tableClickHandler);
	var columnSets = []
	var numVisualizations = table.Visualizations.length;
	for(j=0; j<numVisualizations; j++)
	{
		if(!arrayContainsSubArray(columnSets,table.Visualizations[j].DataColumns))
		{
			columnSets.push(table.Visualizations[j].DataColumns);
		}
	}
	tableColumnSets.push([columnSets]);
	for(j=0; j<columnSets.length; j++)
	{
		createDiv('table'+id,'table_'+id+'_columnSet'+j,"20%","",'columnSetEntry');
		$('#table_'+id+'_columnSet'+j).text(j);
		$('#table_'+id+'_columnSet'+j).click(columnSetClickHandler);
	}

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

function visTypeClickHandler(event)
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
	var tableNumber = parseInt(iconId.charAt(6));
	var columnSetNumber = parseInt(iconId.charAt(17));
	var columnSet = tableColumnSets[tableNumber][0][columnSetNumber];
	var visType = iconId.substring(19);
	var visDivId = 'table_'+tableNumber+'_columnSet_'+columnSetNumber+'_visType_'+visType;

	console.log('Icon Click. visType:' + visType);

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
		var visualization = getVisualization(tables[tableNumber],columnSet,visType);
		visualization.draw(visDivId);
		$('#'+visDivId).show();
		$('#'+visDivId).siblings().hide();
		$('#options').show();
	}	
}

function loadVisTypeIcons(visTypes,source)
{
	$('#visTypeSelection').empty();
	for(var i = 0; i<visTypes.length; i++)
	{
		var imagePath = NaN;
		var iconId = NaN;
		switch(visTypes[i])
		{
			case 'Bar':
				iconId = source + '_Bar';
				imagePath = 'images/bar.png';
				break;
			case 'Line':
				iconId = source + '_Line';
				imagePath = 'images/line.png';
				break;
			case 'Scatter':
				iconId = source + '_Scatter';
				imagePath = 'images/scatter.png';
				break;
			case 'Area':
				iconId = source + '_Area';
				imagePath = 'images/area.png';
				break;
			default:
				console.log('Encountered unexpected visualization type: '+visTypes[i]);
		}
		if(imagePath != NaN && iconId != NaN){
			createDiv('visTypeSelection',iconId,'50px','50px','visIcon');
			$("#"+iconId).append("<img id='" + iconId + "'' src='"+imagePath+"' height='50',width='50'/>");
			$("#"+iconId).click(visTypeClickHandler);
		}
	}
}

function expandTable(tableId)
{
	var children = $('#'+tableId).children();
	for(i = 0; i< children.length; i++)
	{
		$('#'+children[i].id).slideDown();
	}
}

function collapseTable(tableId)
{
	var children = $('#'+tableId).children();
	for(i = 0; i< children.length; i++)
	{
		$('#'+children[i].id).slideUp();
	}
}

function getGraphTypes(columnSetId)
{
	var tableNumber = parseInt(columnSetId.charAt(6));
	var columnSetNumber = parseInt(columnSetId.charAt(17));
	var currentTable = tables[tableNumber];
	var columnSet = tableColumnSets[tableNumber][0][columnSetNumber];
	var columnNumString = "";

	console.log('Getting graph types for table:'+tableNumber+' column set:'+columnSetNumber);
	//console.log('Column sets found: '+columnSet.length)
	//printArray(columnSet);

	var graphTypes = [];

	for(var i = 0; i < currentTable.Visualizations.length; i++)
	{
		if(arraysAreEqual(currentTable.Visualizations[i].DataColumns,columnSet)){
			graphTypes.push(currentTable.Visualizations[i].Type);
		}
	}

	//printArray(graphTypes);

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
