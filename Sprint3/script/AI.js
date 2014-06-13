/** 
 * @file Take raw data from the parser and analyze it, then pass the new data to the visualizer.
 * @module AI
 */


// Data structure documention:

/**
 * The master data stucture used by the AI.
 *
 * @typedef {Object[]} AIdataStructure
 * @property {Visualizations[]} Visualizations
 * @property {Data} Data
 * @property DataSetScore Calculated in {@link rankDatasets}
 */

/**
 * An array of visualization requests of different {@link Visualizations.Type}.
 *
 * @typedef {Object[]} Visualizations
 * @property {String} Type Visualization type ("Bar", "Line", etc)
 * @property {Integer[]} DataColumns Which columns in the dataset should be used for the visualization
 * @property {Float} Score Visualization score, used for ranking visualizations of the same datase against each other. A higher score means a more unique visualization.
 */

/**
 * The data structure that holds all the data for one dataset. The data is organized by rows and columns.
 *
 * @typedef {Object} Data
 * @property {Integer} Rows Number of rows in the data
 * @property {Integer} Cols Number of columns in the data
 * @property {String} Caption Caption (title) taken from the source data
 * @property {String[]} ColumnLabel heading for each column
 * @property Values A two dimensional array of the values that make up the dataset
 * @property {String[]} ColumnType Type of column as determined by the type handler
 * @property {Float[]} ColumnUnique The uniqueness of each column as calculated by the type handler
 */


/**
 * Have the type checker assign column type to each column in each table. 
 *
 * @function 
 * @param datasets Data objects as generated by the parser.
 */
var setTypes = function(datasets) 
{
	var TH = new TypeHandler();
	
	for (var i = 0; i < datasets.length; i++) 
	{
		TH.processTable(datasets[i]);
	}
}

/**
 * Calculate the average uniqueness of selected columns of a dataset.
 * @function
 * @param 	dataset A Data object as generateted by the parser.
 * @param	{array} columnsToUse The column indices to use for calculating the visulization score.
 * @returns	Visualization score for the given dataset and columns.
 */
var determineVisualizationScore = function(dataset, columnsToUse) 
{
	var scoreNumerator= 0;

	for (var i = 0; i < columnsToUse.length; i++) 
	{
		scoreNumerator = scoreNumerator + dataset.Data.ColumnUnique[columnsToUse[i]];
	}

	return scoreNumerator / columnsToUse.length;
}

/**
 * Find the leftmost most unique column that excludes any column numbers in the exclude array.
 * If excludeStrings == true, do not select a string column.
 *
 * @function
 * @param currentDataset An element from {@link AIdataStructure}
 * @param {Integer[]} excludeColumns Do not consider these columns when selecting the next 
 * @param {Boolean} excludeStrings if true, do not consider string columns
 *
 * @returns {Integer} The column index of the next best column
 * @returns -1 if no columns were found
 */
var findNextBestAvailableColumn = function(currentDataset, excludeColumns, excludeStrings) 
{
	var usableColumns = []; // columns that are not on the exclude list

	var anExcludeColumnWasFound;
	
	for (var i = 0; i < currentDataset.Data.Cols; i++) 
	{
		anExcludeColumnWasFound = false;
		if (excludeStrings == true) 
		{
			if (currentDataset.Data.ColumnType[i] == "String") 
			{
				anExcludeColumnWasFound = true;
			}
		} 
		for (var j = 0; j < excludeColumns.length; j++) 
		{
			if (i == excludeColumns[j]) 
			{ // i is an exclude column
				anExcludeColumnWasFound = true;
			} 
		}
		if (anExcludeColumnWasFound == false) 
		{ 
			usableColumns.push(i);
		}
	} 

	// sort the usableColumns with the highest uniqueness score at the index 0 of the array, 
	// for ties in uniqueness, the lefter column moves more toward the 0 index of the array.
	usableColumns.sort( function(a, b) 
			{
			if ((currentDataset.Data.ColumnUnique[a] > currentDataset.Data.ColumnUnique[b]) ||
				((currentDataset.Data.ColumnUnique[a] == currentDataset.Data.ColumnUnique[b]) && (a < b)))  
			{
				return -1;
			} 
			else if (currentDataset.Data.ColumnUnique[a] < currentDataset.Data.ColumnUnique[b]) 
			{
				return 1;
			} 
			else 
			{
				return 0;
			}
	});

	if (usableColumns.length == 0) 
	{ // nothing was found
		return -1;
	} 
	else 
	{
		return usableColumns[0];
	}
}

/**
 * Pick variable(s) for the treemap. The selection is: the independent var is a string col and the
 * dependent var is numeric. If this cannot be satisfied, then select only one numeric column. In cases
 * where there are more than one column with the same best unique score, select the leftmost one.
 *
 * @function
 * @param currentDataset An element from {@link AIdataStructure}
 * @returns {Integer[]} The columns to use for the tree map
 */
var selectTreemapVars = function(currentDataset)
{
	var cols = currentDataset.Data.Cols;
	var treemapVars = [];
	var bestString;
	var bestNumeric;
	var stringFound = false;
	var numericFound = false;

	
	// find the best numeric column
	for (var i = 0; i < cols; i++)
	{
		if (currentDataset.Data.ColumnType[i] != "String")
		{
			if (numericFound == true)
			{
				if (currentDataset.Data.ColumnUnique[i] > currentDataset.Data.ColumnUnique[bestNumeric])
				{
					bestNumeric = i;
				}
			}
			else
			{
				numericFound = true;
				bestNumeric = i;
			}
		}
	}

	// see if there is a string column, select the best one
	for (var i = 0; i < cols; i++)
	{
		if (i != bestNumeric)
		{
			if (currentDataset.Data.ColumnType[i] == "String")
			{
				if (stringFound == true)
				{
					if (currentDataset.Data.ColumnUnique[i] > currentDataset.Data.ColumnUnique[bestString])
					{
						bestString = i;
					}
				}
				else
				{
					stringFound = true;
					bestString = i;
				}
			}
		}
	}

	if (stringFound == true && numericFound == true)
	{
		if (bestString >= 0)
		{
			treemapVars[0] = bestString;
		}

		if (bestNumeric >= 0 && bestString >= 0)
		{
			treemapVars[1] = bestNumeric;
		}
		else
		{
			treemapVars[0] = bestNumeric;
		}
	}
	else if (numericFound == true)
	{
		if (bestNumeric >= 0)
		{
			treemapVars[0] = bestNumeric;
		}
	}
	else if (bestString < 0 && bestNumeric < 0)
	{
		console.log("AI: unable to find good variables for treemap.");
	}

	console.log("AI: treemap var selector: string col " + (stringFound == true ? bestString : "(no string selected) ") +
			", numeric col " + bestNumeric);

	return treemapVars;
}
		
/**
 * Find the best independent variable for a given dataset, this is the least unique column.
 *
 * @function
 * @param currentDataset An element from {@link AIdataStructure}
 * @returns {Integer} -1 if none was found
 * @returns {Integer} The index of the best choice for an independent variable
 */
var findIndependentVariable = function(currentDataset) 
{
	var leastUniqueColumnFound = 0;

	for (var col = 1; col < currentDataset.Data.Cols; col++)
	{
		if (currentDataset.Data.ColumnUnique[col] < currentDataset.Data.ColumnUnique[leastUniqueColumnFound])
		{
			leastUniqueColumnFound = col;
		}
	}

	return leastUniqueColumnFound;
}

/**
 * Look at each dataset, see what column types it has and determine what groups of columns can be visualized. Remove 
 * some datasets if they contain all string data. Add a {@link Visualizations} array to each dataset.
 *
 * @function
 * @param {AIdataStructure} AIdataStructure
 */
var determineVisualizationsToRequest = function(AIdataStructure) 
{

	for (var currentDatasetIndex = 0; currentDatasetIndex < AIdataStructure.length; currentDatasetIndex++) 
	{
		var numberColumns = [];			// indexes of columns that contain numeric data
		var stringColumns = [];			// contains indexes of columns that contain string data
		var currentDataset = AIdataStructure[currentDatasetIndex];
		var visualizations = [];		// this is the "Visualizations" part of the AI data structure as defined in the wiki

		var stringColumnsFound = 0;	// how many columns are only strings, if this number matches the number of columns, 
		// remove the dataset as it is undesirable to have only string datasets
		var nonStringFound = false;

		for (var currentColumn = 0; currentColumn < currentDataset.Data.Cols; currentColumn++) 
		{
			var colType = currentDataset.Data.ColumnType[currentColumn];

			if (colType == "Integer" || colType == "Float") 
			{
				numberColumns.push(currentColumn);
				nonStringFound = true;
			} 
			else if (colType == "String") 
			{
				stringColumns.push(currentColumn);	
			} 
			else 
			{
				console.log("AI found column with no type!");
				// the column has no type, this is no good, so no additional visualizations will be generated
			}
		}

		if (nonStringFound && currentDataset.Data.Cols >= 2 ) 
		{ // not only string data was found and there are at least 2 columns

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

			if (secondDependentVariable == -1) 
			{
				haveOnlyTwoColumns = true;
			} 
			else 
			{
				haveOnlyTwoColumns = false;
			}


			var treemapStyleVarsTypes = ["Tree", "Pie"];
			var twoColumnOnlyVisTypes = ["Bar", "Scatter"];
			var threeColumnOnlyVisTypes = ["Bubble"];
			var twoOrThreeColumnVisTypes = ["Line"]; 
			var twoColumnVisTypes = twoOrThreeColumnVisTypes.concat(twoColumnOnlyVisTypes);
			var threeColumnVisTypes = twoOrThreeColumnVisTypes.concat(threeColumnOnlyVisTypes);

			var columnsToVisualize = [];
			var visTypes = [];

			if (firstDependentVariable >= 0)
			{
				if (haveOnlyTwoColumns) 
				{ // request visualizations that only require two variables
					columnsToVisualize.push(selectedColumns[0]);
					columnsToVisualize.push(selectedColumns[1]);
					for (var i = 0; i < twoColumnVisTypes.length; i++) 
					{
						visTypes.push(twoColumnVisTypes[i]);
					}
				} 
				else 
				{
					for (var i = 0; i < selectedColumns.length; i++) 
					{
						columnsToVisualize.push(selectedColumns[i]);
					}
					for (var i = 0; i < threeColumnVisTypes.length; i++) 
					{
						visTypes.push(threeColumnVisTypes[i]);
					}
				}

				for (var i = 0; i < visTypes.length; i++) 
				{

					visualizations.push(
							{
								"Type" : visTypes[i],
								"DataColumns" : columnsToVisualize,
								"Score" : determineVisualizationScore(currentDataset, columnsToVisualize)
							}
							);
				}

				if (currentDataset.Data.Cols > 2) 
				{ // add the twoColumnOnly vis types

					for (var i = 0; i < twoColumnOnlyVisTypes.length; i++) 
					{
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

			if (treemapStyleVarsTypes.length > 0)
			{
				for (var i = 0; i < treemapStyleVarsTypes.length; i++)
				{
					var treemapVars = selectTreemapVars(currentDataset);
					if (treemapVars.length > 0)
					{
						visualizations.push(
								{
									"Type" : treemapStyleVarsTypes[i],
									"DataColumns" : treemapVars,
									"Score" : determineVisualizationScore(currentDataset, treemapVars)
								}
								);
					}
				}
			}
		}

		// add the selected visualizations array to the dataset, note that this could be an empty array
		// in the case that no suitable visualizations were found
		currentDataset.Visualizations = visualizations;

	}	

}
 
/**
 * Give each dataset a score using this algorithm:
 * DataSetScore = (the sum of all column unique scores for the dataset) * (data set rows) * (data set cols)
 *
 * @function
 * @param {AIdataStructure} AIdataStructure
 */
var rankDatasets = function(AIdataStructure) 
{
	
	for (var datasetIndex = 0; datasetIndex < AIdataStructure.length; datasetIndex++) 
	{
		
		var currentDataset = AIdataStructure[datasetIndex];
		var colUniqueSum = 0;

		for (var col = 0; col < currentDataset.Data.Cols; col++) 
		{
			colUniqueSum = colUniqueSum + currentDataset.Data.ColumnUnique[col];
		}

		currentDataset.Data.DataSetScore = colUniqueSum * currentDataset.Data.Cols * 
			currentDataset.Data.Rows;
	}
}


/**
 * Generate a visualization title based on the selected colums for each visualization. Adds the
 * VisTitle field to the Visualization object for each visualization.
 *
 * @function
 * @param {AIdataStructure}
 */
var generateVisTitle = function(AIdataStructure)
{
	for (var elementIndex = 0; elementIndex < AIdataStructure.length; elementIndex++)
	{
		var element = AIdataStructure[elementIndex];
		for (var visIndex = 0; visIndex < element.Visualizations.length; visIndex++)
		{
			var visTitle;
			var visualization = element.Visualizations[visIndex];

			if (visualization.Type == "Tree" || visualization.Type == "Pie")
			{
				if (visualization.DataColumns.length == 2) // string and numeric
				{
					visTitle = "" + element.Data.ColumnLabel[visualization.DataColumns[1]] + " by " +
						element.Data.ColumnLabel[visualization.DataColumns[0]];
				}
				else
				{
					visTitle = "" + element.Data.ColumnLabel[visualization.DataColumns[0]];
				}
			}
			else if (visualization.DataColumns.length == 2) // one independent and one dependent 
			{
				visTitle = "" + element.Data.ColumnLabel[visualization.DataColumns[1]] + " vs " + 
					element.Data.ColumnLabel[visualization.DataColumns[0]];
			}
			else if (visualization.DataColumns.length == 3) // one independent and two dependents
			{
				visTitle = "" +  element.Data.ColumnLabel[visualization.DataColumns[1]] + " and " + 
				  	element.Data.ColumnLabel[visualization.DataColumns[2]] + " vs " + 
					element.Data.ColumnLabel[visualization.DataColumns[0]];
			}
			else // some other combo of vars, just use the independent var name as the title
			{
				visTitle = "" + element.Data.ColumnLabel[visualization.DataColumns[1]];
			}
			
			visualization.VisTitle = visTitle;
		}
	}
}

/**
 * Remove datasets from the {@link AIdataStructure} if they have no associated visualization
 * or values.
 *
 * @function
 * @parame {AIdataStructure} 
 */
var removeDatasetsWithNoAssociatedVisualizationsOrValues = function(AIdataStructure)
{
	var visualizationsRemoved = 0;
	// remove empty visualizations

	var AIdataStructureClean = [];

	for (var i = 0; i < AIdataStructure.length; i++) 
	{
		if (AIdataStructure[i].Visualizations.length == 0 ||
		    AIdataStructure[i].Data.Values.length == 0)
		{
			visualizationsRemoved = visualizationsRemoved + 1;
		}
		else
		{
			AIdataStructureClean.push(AIdataStructure[i]);
			console.log("AI: adding in: " + JSON.stringify(AIdataStructure[i]));
		}
	}
	
	for (var i = 0; i < AIdataStructure.length; i++)
	{
		AIdataStructure.pop();
	}

	for (var i = 0; i < AIdataStructureClean.length; i++)
	{
		AIdataStructure.push(AIdataStructureClean[i]);
	}

	console.log("AI: removed " + visualizationsRemoved + " visualization" + 
			(visualizationsRemoved > 1 ? "s" : ""));
}

/**
 * Take raw parser data and return an {@link AIdataStructure} object to be used by the visualizer.
 *
 * @global
 * @function
 * @param 	{Data} parserData	Dataset data from the parser
 * @returns {AIdataStructure} Data and requested visualizations for different columns in each dataset
 */
function AI(parserData) 
{
	var AIdataStructure = [];

	for (var tableNum = 0; tableNum < parserData.Data.length; tableNum++) 
	{
		var dataColumns = [];
		var currentTable = parserData.Data[tableNum];
		var columnType = [""];
		var emptyVis = [];
		
		// assemble the AI data object for the type checker, it is an array of the following, one
		// for each data table

		if (currentTable.Rows > 1 && currentTable.Cols > 1) // ignore single dimension tables
		{
			var visDataElement = 
				{
					"Visualizations" : emptyVis,
					"Data" : {
						"Rows" : currentTable.Rows,
						"Caption" : currentTable.Caption,
						"Cols" : currentTable.Cols,
						"ColumnLabel" : currentTable.ColumnLabel,
						"Values" : currentTable.Values,
						"ColumnType" : columnType
					}
				};

			AIdataStructure.push(visDataElement);
		}
		else
		{
			console.log("AI: ignoring a single dimension table.");
		}

	}

	setTypes(AIdataStructure); 

	determineVisualizationsToRequest(AIdataStructure);

	rankDatasets(AIdataStructure);

	generateVisTitle(AIdataStructure);

	removeDatasetsWithNoAssociatedVisualizationsOrValues(AIdataStructure);
	
	console.log("AI produced this data: " 
			+ JSON.stringify(AIdataStructure));

	return AIdataStructure;
}


			
