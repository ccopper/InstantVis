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

		shiftAllTableRowsUpByOneDiscardRowZero(currentTable);
	} 

}

var setTypes = function(datasets) {

	var TH = new TypeHandler();
	
	for (var i = 0; i < datasets.length; i++) {
		TH.processTable(datasets[i]);
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
		var columnLabels = [];
		var dataColumns = [];
		var currentTable = parserData.Data[tableNum];
		var cols = currentTable.Cols;
		var rows = currentTable.Rows;
		
		for (var col = 0; col < cols; col++) {
			dataColumns.push(col); // set all columns to be graphed
		}
		
		makeColumnLabelsIfNeedBe(currentTable);

		
		// assemble the object for the type checker, it is an array of the following, one
		// for each data table
		AIdataStructure.push( {
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
				"Values" : currentTable.Values
				// ColumnType will be set by the type checker later
			}
		} );

	}

	// setTypes(AIdataStructure); // have the type checker assign column type to each column in each table

	return AIdataStructure;
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





			
