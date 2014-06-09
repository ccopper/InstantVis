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

// find the leftmost most unique column that excludes any column numbers in the exclude array
// if excludeStrings == true, do not select a string column
// return -1 if no columns were found
var findNextBestAvailableColumn = function(currentDataset, excludeColumns, excludeStrings) {
	var usableColumns = []; // columns that are not on the exclude list

	var anExcludeColumnWasFound;
	
	for (var i = 0; i < currentDataset.Data.Cols; i++) {
		anExcludeColumnWasFound = false;
		if (excludeStrings == true) {
			if (currentDataset.Data.ColumnType[i] == "String") {
				anExcludeColumnWasFound = true;
			}
		} 
		for (var j = 0; j < excludeColumns.length; j++) {
			if (i == excludeColumns[j]) { // i is an exclude column
				anExcludeColumnWasFound = true;
			} 
		}
		if (anExcludeColumnWasFound == false) { 
			usableColumns.push(i);
		}
	} 

	// sort the usableColumns with the highest uniqueness score at the index 0 of the array, 
	// for ties in uniqueness, the lefter column moves more toward the 0 index of the array.
	usableColumns.sort( function(a, b) {
		if ((currentDataset.Data.ColumnUnique[a] > currentDataset.Data.ColumnUnique[b]) ||
			((currentDataset.Data.ColumnUnique[a] == currentDataset.Data.ColumnUnique[b]) && (a < b)))  {
			return -1;
		} else if (currentDataset.Data.ColumnUnique[a] < currentDataset.Data.ColumnUnique[b]) {
			return 1;
		} else {
			return 0;
		}
	});

	if (usableColumns.length == 0) { // nothing was found
		return -1;
	} else {
		return usableColumns[0];
	}
}

// find the best independent variable
// return -1 if none was found
var findIndependentVariable = function(currentDataset) {
	var excludeList = [];
	var excludeStrings = false;
	return findNextBestAvailableColumn(currentDataset, excludeList, excludeStrings);
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

		if (nonStringFound && currentDataset.Data.Cols >= 2 ) { // not only string data was found and there are at least 2 columns

			var selectedColumns = []; 	// columns in this array from being selected as variables to visualize
			var haveOnlyTwoColumns; 	// is true if only two columns of data can be visualized for this dataset
			// find default columns to be used with each applicable visualization type
			
			// select independent variable
			var independentVariableColumn = findIndependentVariable(currentDataset);
			selectedColumns.push(independentVariableColumn);
		
			// select first dependent variable, exclude strings
			var firstDependentVariable = findNextBestAvailableColumn(currentDataset, selectedColumns, true); 
			selectedColumns.push(firstDependentVariable);

			// look for a second dependent variable
			var secondDependentVariable ;
			secondDependentVariable = findNextBestAvailableColumn(currentDataset, selectedColumns, true); 
			selectedColumns.push(secondDependentVariable);

			if (secondDependentVariable == -1) {
				haveOnlyTwoColumns = true;
			} else {
				haveOnlyTwoColumns = false;
			}

			var twoColumnOnlyVisTypes = ["Pie", "Tree", "Scatter"];
			var threeColumnOnlyVisTypes = ["Bubble"];
			var twoOrThreeColumnVisTypes = ["Bar", "Line"]; // , "BarHorizontal"];
			var twoColumnVisTypes = twoOrThreeColumnVisTypes.concat(twoColumnOnlyVisTypes);
			var threeColumnVisTypes = twoOrThreeColumnVisTypes.concat(threeColumnOnlyVisTypes);

			var columnsToVisualize = [];
			var visTypes = [];

			if (haveOnlyTwoColumns) { // request visualizations that only require two variables
				columnsToVisualize.push(selectedColumns[0]);
				columnsToVisualize.push(selectedColumns[1]);
				for (var i = 0; i < twoColumnVisTypes.length; i++) {
					visTypes.push(twoColumnVisTypes[i]);
				}
			} else {
				for (var i = 0; i < selectedColumns.length; i++) {
					columnsToVisualize.push(selectedColumns[i]);
				}
				for (var i = 0; i < threeColumnVisTypes.length; i++) {
					visTypes.push(threeColumnVisTypes[i]);
				}
			}

			for (var i = 0; i < visTypes.length; i++) {

				visualizations.push(
						{
							"Type" : visTypes[i],
							"DataColumns" : columnsToVisualize,
							"Score" : determineVisualizationScore(currentDataset, columnsToVisualize)
						}
					);
			}

			if (currentDataset.Data.Cols > 2) { // add the twoColumnOnly vis types
				
				for (var i = 0; i < twoColumnOnlyVisTypes.length; i++) {
					visualizations.push(
							{
								"Type" : twoColumnOnlyVisTypes[i],
								"DataColumns" : [selectedColumns[0], selectedColumns[1]],
								"Score" : determineVisualizationScore(currentDataset, columnsToVisualize)
							}
						);
				}
			}

		}

		// add the selected visualizations array to the dataset, note that this could be an empty array
		// in the case that no suitable visualizations were found
		currentDataset.Visualizations = visualizations;

	}	

}
 
// give each dataset a score using this algorithm:
// DataSetScore = (the sum of all column unique scores for the dataset) * (data set rows) * (data set cols)
var rankDatasets = function(AIdataStructure) {
	
	for (var datasetIndex = 0; datasetIndex < AIdataStructure.length; datasetIndex++) {
		
		var currentDataset = AIdataStructure[datasetIndex];
		var colUniqueSum = 0;

		for (var col = 0; col < currentDataset.Data.Cols; col++) {
			colUniqueSum = colUniqueSum + currentDataset.Data.ColumnUnique[col];
		}

		currentDataset.Data.DataSetScore = colUniqueSum * currentDataset.Data.Cols * 
			currentDataset.Data.Rows;
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
				"Caption" : currentTable.Caption,
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

	var visualizationsRemoved = 0;
	// remove empty visualizations
	for (var i = 0; i < AIdataStructure.length; i++) {
		if (AIdataStructure[i].Visualizations.length == 0) {
			AIdataStructure.splice(i, 1);
			visualizationsRemoved = visualizationsRemoved + 1;
		}
	}
	
	var consoleRemovedMessage = "";

	if (visualizationsRemoved > 0) { 
		consoleRemovedMessage = " removed " + visualizationsRemoved + 
			" visualizations (perhaps all string data was encountered in a table) and ";
	}
	
	console.log("AI " + consoleRemovedMessage + " produced this data " 
			+ JSON.stringify(AIdataStructure));

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




			
