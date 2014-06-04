/* Take raw data from the parser and analyze it, then pass the new data
 * to the visualizer.
 */


// have the type checker assign column type to each column in each table/ 
var setTypes = function(datasets) {
	var TH = new TypeHandler();
	
	for (var i = 0; i < datasets.length; i++) {
		TH.processTable(datasets[i]);
	}

}

// calculate the average uniqueness of selected columns of a dataset
var determineVisualizationScore = function(dataset, columnsToUse) {
	var scoreNumerator= 0;

	for (var i = 0; i < columnsToUse.length; i++) {
		scoreNumerator = scoreNumerator + dataset.Data.ColumnUnique[columnsToUse[i]];
	}

	return scoreNumerator / columnsToUse.length;
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
			
			//
			// bubble chart
			//
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
						if (currentDataset.Data.ColumnUnique[a] > currentDataset.Data.ColumnUnique[b]) {
							return 1; // put a after b because a has a higher score
						} else if (currentDataset.Data.ColumnUnique[a] < currentDataset.Data.ColumnUnique[b]) {
							return -1;
						} else {
							return 0; // they are equal
						}
					}
				);

				var columnsToUse = [
						numberColumns[0],
						numericColumnsSorted.pop(),
						numericColumnsSorted.pop()
					];

				visualizations.push(
					{
						"Type" : "Bubble",
						"DataColumns" : columnsToUse,
						"Score" : determineVisualizationScore(currentDataset, columnsToUse)
					}
				);
			}
								

			//
			// pie, tree, and bar chart default
			//
			

			// look for string and numeric sets
			if (stringColumns.length > 0 && numberColumns.length > 0) {
				// find most unique string column
				var mostUniqueStringColumn = stringColumns[0];
				for (var stringDataCurrentCol = 1; stringDataCurrentCol < stringColumns.length; 
						stringDataCurrentCol++) {

					if (currentDataset.Data.ColumnUnique[stringColumns[stringDataCurrentCol]] > 
							currentDataset.Data.ColumnUnique[mostUniqueStringColumn]) {
						mostUniqueStringColumn = stringColumns[stringDataCurrentCol];
					}
				}
				
				// find most unique numeric column
				var mostUniqueNumericColumn = numberColumns[0];
				for (var numericCurrentCol = 1; numericCurrentCol < numberColumns.length; numericCurrentCol++) {
					if (currentDataset.Data.ColumnUnique[numberColumns[numericCurrentCol]] > 
							currentDataset.Data.ColumnUnique[mostUniqueNumericColumn]) {

							mostUniqueNumericColumn = numberColumns[numericCurrentCol];
					}
				}
				
				var chartsToRequest = ["Pie", "Bar", "Tree", "BarHorizontal"];
				for (var c = 0; c < chartsToRequest.length; c++) {
					visualizations.push(
						{
							"Type" : chartsToRequest[c],
							"DataColumns" : [mostUniqueStringColumn, mostUniqueNumericColumn],
							"Score" : determineVisualizationScore(currentDataset, [mostUniqueStringColumn,
								mostUniqueNumericColumn])
						}
					);
				}
			}

			//
			// look for numeric vs numeric data
			// make one of each of these graphs for each combo: Line, Bar, Scatter
			if (numberColumns.length >= 2) {
				var graphTypes = ["Line", "Scatter"];
				var indepententVariableColumn;
				var dependentVariableColumn;
				var hasTwoDependentVariables = false;

				if (numberColumns.length > 2) {
					hasTwoDependentVariables = true;
				}

				// find independent variable
				// select the leftmost numeric column to be the independent variable
				indepententVariableColumn = numberColumns[0];

				// find dependent variable
				// select the most unique numeric column that is not the independent variable
				var mostUniqueDependentColumn = numberColumns[1];
				if (hasTwoDependentVariables) { // select a second dependent variable
					var secondMostUniqueDependentColumn = numberColumns[2];
				}
				for (var i = 1; i < numberColumns.length; i++) {
					if (currentDataset.Data.ColumnUnique[numberColumns[i]] > 
							currentDataset.Data.ColumnUnique[mostUniqueDependentColumn]) {

						if (hasTwoDependentVariables) {
							secondMostUniqueDependentColumn = mostUniqueDependentColumn;
						}
						mostUniqueDependentColumn = numberColumns[i];
					}
				}

				var dataColumnsToGraph = [];
				dataColumnsToGraph.push(indepententVariableColumn);
				dataColumnsToGraph.push(mostUniqueDependentColumn);
				if (hasTwoDependentVariables) {
					dataColumnsToGraph.push(secondMostUniqueDependentColumn);
				}
				for (var graphType = 0; graphType < graphTypes.length; graphType++) {
					visualizations.push(
						{
							"Type" : graphTypes[graphType],
							"DataColumns" : dataColumnsToGraph,
							"Score" : determineVisualizationScore(currentDataset, dataColumnsToGraph)
						}
					);
				}

			}

			currentDataset.Visualizations = visualizations;

		}
	}	

}
 

var rankDatasets = function(AIdataStructure) {
	
	for (var datasetIndex = 0; datasetIndex < AIdataStructure.length; datasetIndex++) {
		var currentDataset = AIdataStructure[datasetIndex];
		var bestVisScoreFound = 0;
		for (var visIndex = 0; visIndex < currentDataset.Visualizations.length; visIndex++) {
			var currentVis = currentDataset.Visualizations[visIndex];
			if (currentVis.Score > bestVisScoreFound) {
				bestVisScoreFound = currentVis.Score;
			}
		}
		currentDataset.Data.DataSetScore = bestVisScoreFound;
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

	setTypes(AIdataStructure); 

	determineVisualizationsToRequest(AIdataStructure);

	rankDatasets(AIdataStructure);
	
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




			
