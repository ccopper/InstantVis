/* Take raw data from the parser and make sense of it, then pass the new massaged data
 * to the visualizer.
 */

// remove the 0th row from a table, shift all the others up by one
// helpful when the column labels have been extracted from the first 
// row of values  
var shiftAllTableRowsUpByOneDiscardRowZero = function(currentTable) {
	var totalOldRows = currentTable.Rows;
	var colSize = currentTable.Cols;

	// do not try to adjust a table with only one or zero rows
	if (totalOldRows > 1) {
		for (var i = 0; i < totalOldRows - 1; i++) {
			for (var col = 0; col < colSize; col++) {
				currentTable.Values[i][col] = currentTable.Values[i+1][col];
			}
		}
		currentTable.Rows = currentTable.Rows - 1; // to account for the now removed 0th row
	}

}

var makeColumnLabelsIfNeedBe = function(currentTable) {
	

	// if the column labels appear to be unpopulated, take the data from the first
	// row and make column labels out of them
	if (currentTable.ColumnLabel[0] == "" && currentTable.ColumnLabel.length == 1) {
		var columnLabelsAreJustANumberSequence = false;
		var columnLabels = [];

		// do not take column labels from the first row if there is no first row or the data
		// is a list (single row of data with no labels)
		if (currentTable.Values.length > 1) {
			columnLabelsAreJustANumberSequence = true;
		}


		var currentLabel;
		for (var colLabelIndex = 0; colLabelIndex < currentTable.Cols; colLabelIndex++) {
			if (columnLabelsAreJustANumberSequence) {
				currentLabel = "" + colLabelIndex; // force the labels to be strings
			} else {
				currentLabel =	"" + currentTable.Values[0][colLabelIndex];
			}
			columnLabels.push();
		}
		
		currentTable.ColumnLabel = columnLabels;

		shiftAllTableRowsUpByOneDiscardRowZero(currentTable);
	} 

}

var setTypes = function(datasets) {

	var TH = new TypeHandler();
	
	for (var i = 0; i < datasets.length; i++) {
		TH.processTable(datasets[i]);
	}

}


// look at each dataset, see what column types it has and determine what groups of columns can be visualized
var determineVisualizationsToRequest = function(AIdataStructure) {
	var removeTheseDatasets = []; 	// AIdataStructure indexes of datasets to remove (so they will not be visualized 

	for (var currentDatasetIndex = 0; currentDatasetIndex < AIdataStructure.length; currentDatasetIndex++) {
		var stringDateColumns = [];	// contains indexes of columns that contain string or date data
		var numberColumns = [];			// indexes of columns that contain numeric data
		var currentDataset = AIdataStructure[currentDatasetIndex];
		var visualizations = [];		// this is the "Visualizations" part of the AI data structure as defined in the wiki

		var stringColumnsFound = 0;	// how many columns are only strings, if this number matches the number of columns, 
												// remove the dataset as it is undesirable to have only string datasets
		for (var currentColumn = 0; currentColumn < currentDataset.Data.Cols; currentColumn++) {
			var colType = currentDataset.Data.ColumnType[currentColumn];

			if (colType == "Integer" || colType == "Float") {
				numberColumns.push(currentColumn);
			} else if (colType == "String") {
				stringColumnsFound = stringColumnsFound + 1;
				stringDateColumns.push(currentColumn);	
			} else if (colType == "Date") {
				stringDateColumns.push(currentColumn);
			} else {
				// the column has no type, this is no good, so no additional visualizations will be generated
			}
		}

		console.log("AI found " + numberColumns.length + " numeric columns and " + stringDateColumns.length + " string/date columns");

		if (stringColumnsFound == currentDataset.Data.Cols) { // only string data was found
			removeTheseDatasets.push(currentDatasetIndex);
		} else {

			// look for (string|date) and numeric sets, request a pie chart for them
			for (var stringDataCurrentCol = 0; stringDataCurrentCol < stringDateColumns.length; stringDataCurrentCol++) {
				for (var numericCurrentCol = 0; numericCurrentCol < numberColumns.length; numericCurrentCol++) {

					var colsInvolved = [];
					colsInvolved.push(numberColumns[numericCurrentCol]);
					colsInvolved.push(stringDateColumns[stringDataCurrentCol]);

					visualizations.push(
							{
								"Type" : "Pie",
								"DataColumns" : colsInvolved
							}
							);
				}
			}

			// look for numeric vs numeric data
			// make one of each of these graphs for each combo: Line, Bar, Scatter
			var graphTypes = ["Line", "Bar", "Scatter"];
			for (var independentVariableIndex = 0; independentVariableIndex < numberColumns.length; independentVariableIndex++) {
				for (var dependentVariableIndex = 0; dependentVariableIndex < numberColumns.length; dependentVariableIndex++) {
					if (independentVariableIndex != dependentVariableIndex) {
						var dataColumnsToGraph = [numberColumns[dependentVariableIndex], numberColumns[independentVariableIndex]];
						for (var graphType = 0; graphType < graphTypes.length; graphType++) {
							visualizations.push(
									{
										"Type" : graphTypes[graphType],
										"DataColumns" : dataColumnsToGraph
									}
									);
						}
					}
				}
			}

			currentDataset.Visualizations = visualizations;

		}
	}

	if (removeTheseDatasets.length > 0) {
		var newAIdataStructure = [];

		for (var i = 0; i < removeTheseDatasets.length; i++) {
			AIdataStructure[removeTheseDatasets[i]].removeThisDataset = true;
		}

		for (var i = 0; i < AIdataStructure.length; i++) {
			if (AIdataStructure[i].removeThisDataset != true) {
				newAIdataStructure.push(AIdataStructure[i]);
			} else {
				// this is a dataset to remove, so do not put it in the newAIdataStructure
			}
		}

		// replace the AIdataStructure with one that has undesirable datasets removed
		for (var i = 0; i < AIdataStructure.length; i++) {
			AIdataStructure.pop();
		}
		for (var i = newAIdataStructure.length - 1; i >= 0; i--) {
			AIdataStructure.push(newAIdataStructure[i]);
		}
	}

}


/**
 * Take raw parser data and return a data object to be used by the visualizer.
 *
 * @param 	parserData	A js object from the parser as defined in the wiki 
 * @returns A js object for delivery to the visualizer in the format as defined by the wiki
 */
function AI(parserData) {
	var AIdataStructure = [];

	for (var tableNum = 0; tableNum < parserData.Data.length; tableNum++) {
		var dataColumns = [];
		var currentTable = parserData.Data[tableNum];
		var columnType = [""];
		
		makeColumnLabelsIfNeedBe(currentTable);
		
		// assemble the AI data object for the type checker, it is an array of the following, one
		// for each data table

		AIdataStructure.push( {
			"Visualizations" : [],
			"Data" : {
				"Rows" : currentTable.Rows,
				"Cols" : currentTable.Cols,
				"ColumnLabel" : currentTable.ColumnLabel,
				"Values" : currentTable.Values,
				"ColumnType" : columnType
			}
		} );

	}

	setTypes(AIdataStructure); // have the type checker assign column type to each column in each table

	console.log("TypeHandler produced this data: " + JSON.stringify(AIdataStructure));

	determineVisualizationsToRequest(AIdataStructure);
	
	console.log("AI produced this data: " + JSON.stringify(AIdataStructure));

	return AIdataStructure;
}



function AIdemo() {
	var parserData = {
			"Status": 0,      
			"Data": [ 
				{
					"Rows": 3,
					"Cols": 2,
					"Values": [["1", "2"],["3", "4"],["5", "6"]],
					"ColumnLabel" : []
				},
				{
					"Rows": 4,
					"Cols": 3,
					"Values": [["1", "2", "4"],["3", "4", "5"],["5", "6", "5"], ["7", "8", "40"]],
					"ColumnLabel" : []
				}
			]
	};

	console.log(JSON.stringify(AI(parserData)));

}

// Uncomment the below to run a demo function that will output some data to the console
//AIdemo();




			
