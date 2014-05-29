/* Take raw data from the parser and make sense of it, then pass the new massaged data
 * to the visualizer.
 */

// remove the 0th row from a table, shift all the others up by one
// helpful when the column labels have been extracted from the first 
// row of values  
var shiftAllTableRowsUpByOneDiscardRowZero = function(currentTable) {
	var totalOldRows = currentTable.Values.length;
	var colSize = currentTable.Cols;

	// do not try to adjust a table with only one or zero rows
	if (totalOldRows > 1) {
		for (var i = 0; i < totalOldRows - 2; i++) {
			for (var col = 0; col < colSize; col++) {
				currentTable[i][col] = currentTable[i+1][col];
			}
		}
		currentTable.Rows = currentTable.Rows - 1; // to account for the now removed 0th row
	}

}



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
		var currentTable = parserData.Data[tableNum];
		var cols = currentTable.Cols;
		var rows = currentTable.Rows;
		
		// for now the AI is semi pass through, assign each graph as a bar and a line
		for (var col = 0; col < cols; col++) {
			dataColumns.push(col); // set all columns to be graphed
		}
		
		// if the column labels appear to be unpopulated, take the data from the first
		// row and make column labels out of them
		if (currentTable.ColumnLabel[0] == "" && currentTable.ColumnLabel.length == 1) {
			var columnLabelsAreJustANumberSequence = false;

			// do not take column labels from the first row if there is no first row or the data
			// is a list (single row of data with no labels)
			if (currentTable.Values.length > 1) {
				columnLabelsAreJustANumberSequence = true;
			}

		
			var currentLabel;
			for (var colLabelIndex = 0; colLabelIndex < cols; colLabelIndex++) {
				if (columnLabelsAreJustANumberSequence) {
					currentLabel = "" + colLabelIndex; // force the labels to be strings
				} else {
					currentLabel =	"" + currentTable.Values[0][colLabelIndex];
				}
				columnLabels.push();
			}

			shiftAllTableRowsUpByOneDiscardRowZero(currentTable);
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

		// assemble the object for the type checker, it is an array of the following, one
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
				"Values" : dataRows
				// ColumnType will be set by the type checker later
			}
		} );

	}

	setTypes(AIoutput); // have the type checker assign column type to each column in each table
	return AIoutput;
}


var setTypes = function(datasets) {

	var TH = new TypeHandler();
	
	for (var i = 0; i < datasets.length; i++) {
		TH.processTable(datasets[i]);
	}

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





			
