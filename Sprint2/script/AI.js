/* Take raw data from the parser and make sense of it, then pass the new massaged data
 * to the visualizer.
 */


/**
 * Take raw parser data and return a data object to be used by the visualizer.
 *
 * @param 	parserData	A js object from the parser as defined in the wiki 
 * @returns A js object for delivery to the visualizer in the format as defined by the wiki
 */
function AI(parserData) {
	var AIoutput = [];

	for (var tableNum = 0; tableNum < parserData.Data.length; tableNum++) {
		var columnLabels = [];
		var dataColumns = [];
		var cols = parserData.Data[tableNum].Cols;
		var rows = parserData.Data[tableNum].Rows;
		
		// for now the AI is pass through, assign each graph as a bar and a line
		for (var col = 0; col < cols; col++) {
			dataColumns.push(col); // set all columns to be graphed
		}
		
		// TODO: this is just a placeholder column namer with no smarts to it, fix that
		// make column labels like 'col2', 'col3', etc for each column	
		for (var colLabel = 0; colLabel < cols; colLabel++) {
			columnLabels.push("col" + colLabel);
		}

		// iterate over every data element from the parser data,
		// convert the string element data to integer and store that
		// in dataRows[]
		var dataRows = [];
		for (var row = 0; row < rows; row++) {
			var dataCols = [];
			for (var col = 0; col < cols; col++) {
				dataCols.push(parseInt(parserData.Data[tableNum].Values[row][col]));
			}
			dataRows.push(dataCols);
		}

		// assemble the object for the visualizer, it is an array of the following, one
		// for each data table
		AIoutput.push( {
			"Visualizations" : [
				{
					"Type" : "Line",
					"DataColumns" : dataColumns
				},
				{
					"Type" : "Bar",
					"DataColumns" : dataColumns
				},
				{
					"Type" : "Scatter",
					"DataColumns" : dataColumns
				},
				{
					"Type" : "Area",
					"DataColumns" : dataColumns
				}
			],
			"Data" : {
				"ColumnLabel" : columnLabels,
				"ColumnType" : "Integer", 	// TODO: remove hard coded type integer assumption
				"Values" : dataRows
			}
		} );

	}

	return AIoutput;
}



function AIdemo() {
	var parserData = {
			"Status": 0,      
			"Data": [ 
				{
					"Rows": 3,
					"Cols": 2,
					"Values": [["1", "2"],["3", "4"],["5", "6"]]
				},
				{
					"Rows": 4,
					"Cols": 3,
					"Values": [["1", "2", "4"],["3", "4", "5"],["5", "6", "5"], ["7", "8", "40"]]
				}
			]
	};

	console.log(JSON.stringify(AI(parserData)));

}

// Uncomment the below to run a demo function that will output some data to the console
// AItest();





			
