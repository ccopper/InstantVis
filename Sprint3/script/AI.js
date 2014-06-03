/* Take raw data from the parser and make sense of it, then pass the new massaged data
 * to the visualizer.
 */


var setTypes = function(datasets) {

	var TH = new TypeHandler();
	
	for (var i = 0; i < datasets.length; i++) {
		TH.processTable(datasets[i]);
	}

}


// look at each dataset, see what column types it has and determine what groups of columns can be visualized
// remove some datasets if they contain all string data
var determineVisualizationsToRequest = function(AIdataStructure) {

	for (var currentDatasetIndex = 0; currentDatasetIndex < AIdataStructure.length; currentDatasetIndex++) {
		var numberColumns = [];			// indexes of columns that contain numeric data
		var stringColumns = [];			// contains indexes of columns that contain string data
		var currentDataset = AIdataStructure[currentDatasetIndex];
		var visualizations = [];		// this is the "Visualizations" part of the AI data structure as defined in the wiki

		var stringColumnsFound = 0;	// how many columns are only strings, if this number matches the number of columns, 
												// remove the dataset as it is undesirable to have only string datasets
		var nonStringFound = false;

		for (var currentColumn = 0; currentColumn < currentDataset.Data.Cols; currentColumn++) {
			var colType = currentDataset.Data.ColumnType[currentColumn];

			if (colType == "Integer" || colType == "Float") {
				numberColumns.push(currentColumn);
				nonStringFound = true;
			} else if (colType == "String") {
				stringColumns.push(currentColumn);	
			} else {
				console.log("AI found column with no type!");
				// the column has no type, this is no good, so no additional visualizations will be generated
			}
		}

		if (nonStringFound) { // not only string data was found

			// find default columns to be used with each applicable visualization type

			// bubble chart
			if (numberColumns.length >= 3) { // need at least 3 numeric columns for bubble chart
				var numericColumnsSorted = [];
				// gather the numeric columns found, but exclude the first one found
				// as that will be the independent variable (the first data col in the
				// visualization request).
				for (var i = 1; i < numberColumns.length; i++) {
					numericColumnsSorted.push(numberColumns[i]);
				}
				// sort the columns based on their ColumnUnique score, the highest score goes at the end
				// of the array
				numericColumnsSorted.sort(function(a, b) {
						if (currentDataset.Data.ColumnUnique[a] > currentDataSet.Data.ColumnUnique[b]) {
							return 1; // put a after b because a has a higher score
						} else if (currentDataset.Data.ColumnUnique[a] < currentDataset.Data.ColumnUnique[b]) {
							return -1;
						} else {
							return 0; // they are equal
						}
					}
				);

				visualizations.push(
					{
						"Type" : "Bubble",
						"DataColumns" : [
							numberColumns[0],
							numericColumnsSorted.pop(),
							numericColumnsSorted.pop()
						]
					}
				);
			}
								

			// look for string and numeric sets, request a pie chart for them
			for (var stringDataCurrentCol = 0; stringDataCurrentCol < stringColumns.length; stringDataCurrentCol++) {
				for (var numericCurrentCol = 0; numericCurrentCol < numberColumns.length; numericCurrentCol++) {

					var colsInvolved = [];
					colsInvolved.push(stringColumns[stringDataCurrentCol]);
					colsInvolved.push(numberColumns[numericCurrentCol]);

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

}
 
// rank visualizations for each dataset, the higher the rank, the better the AI thinks 
// the visualized data will look.
// TODO: make this have smarts to it, right now it just ranks by liking the first one most
var rankVisualizations = function(AIdataStructure) {
	for (var datasetIndex = 0; datasetIndex < AIdataStructure.length; datasetIndex++) {
		for (var v = 0; v < AIdataStructure[datasetIndex].Visualizations.length; v++) {
			AIdataStructure[datasetIndex].Visualizations[v].Score = 
				AIdataStructure[datasetIndex].Visualizations.length - v;
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

	determineVisualizationsToRequest(AIdataStructure);
	
	rankVisualizations(AIdataStructure);

	// remove empty visualizations
	for (var i = 0; i < AIdataStructure.length; i++) {
		if (AIdataStructure[i].Visualizations.length == 0) {
			AIdataStructure.splice(i, 1);
		}
	}
	
	
	
	
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




			
