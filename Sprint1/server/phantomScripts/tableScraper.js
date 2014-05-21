
/*
 * Data contained within one table
 */

function TableData() {
	this._rows = 0;
	this._cols = 0;
	this._data = [];	// an array of array of TableDataElement
							// each row is made of an array of TableDataElement
							// this._data is an array of rows

	this._checkDimensions = function() {
		if (this._data.length > this._rows) {
			console.log("Table dimensions do not make sense, number of rows and columns might be wrong!");
		}
	}

	this.addDataRow = function(dataRow) {
		this._data.push(dataRow);
	}

	this.getDataRow = function(rowNumber) {
		return this._data[rowNumber];
	}

	this.getAllRows = function() {
		return this._data;
	}

	this.getDataAt = function(row, col) {
		return this._data[row][col];
	}

	this.setRows = function(rows) {
		this._rows = rows;
	}

	this.setCols = function(cols) {
		this._cols = cols;
	}
	
	this.getRows = function() {
		this._checkDimensions();
		return this._rows;
	}

	this.getCols = function() {
		this._checkDimensions();
		return this._cols;
	}

	this.calcDimensions = function() {
		this._rows = this._data.length;
		var maxRowLengthFound = 0;

		for (var row = 0; row < this._rows; row++) {
			if (this._data[row].length > maxRowLengthFound) {
				maxRowLengthFound = this._data[row].length;
			}
		}
		this._cols = maxRowLengthFound;
	}

}

/* 
 * Data contained in one table element (a single row/col location)
 */

function TableDataElement() {
	this._data = null;
	this._attributes = null;

	this.setData = function(data) {
		this._data = data;
	}

	this.getData = function() {
		return this._data;
	}

	this.getAttributes = function() {
		return this._attributes;
	}

	this.setAttributes = function(attributes) {
		this._attributes = attributes;
	}
}

/*
 * Holds date for all the tables
 */

function AllTableData() {
	this._tables = [];

	this.addTable = function(table) {
		this._tables.push(table);
	}

	this.getTableCount = function() {
		return this._tables.length;
	}

	this.getTable = function(index) {
		return this._tables[index];
	}

	this.getTables = function() {
		return this._tables;
	}
}

/*
 * Do the table scraping
 */

function getTableData() {
	var allTableData = new AllTableData();


	$( 'table' ).each( function(currentTableIndex, currentTable) {
		var tableData = new TableData();

		$( $( currentTable ).find( 'tr' ) ).each( function(currentRowIndex, currentRow) {
			var currentRowData = [];
			
			$( currentRow ).find( 'td' ).each( function(currentColumnIndex, currentData) {
				var tableDataElement = new TableDataElement();
				tableDataElement.setData( $( currentData ).text());
				currentRowData.push(tableDataElement);
			});

			tableData.addDataRow(currentRowData);

		});
		tableData.calcDimensions();
		allTableData.addTable(tableData);
	});

	return allTableData;
}


/**
 * Wrapper function to be called from the outside, all the other functions in this file are unused outside
 * this file.
 */

function tableScraper() {
	var allTables = getTableData();
	var exportableData = [];

	for (table in allTables.getTables()) {

		var rows = allTables.getTable(table).getRows();
		var cols = allTables.getTable(table).getCols();
		var exportableDataSingleSetValues = [];

		console.log('Table ' + table + ' (' + rows + ' rows by ' + 
					cols + ' cols) :');

		for (var row = 0; row < rows; row++) {
			var exportableDataSingleSetDataRow = [];
			for (var col = 0; col < cols; col++) {

				// put the data minus any attributes into the exportableData structure
				exportableDataSingleSetDataRow.push(
					allTables.getTable(table).getDataAt(row, col).getData());

				console.log('(' + row + ',' + col + ') = ' + 
					allTables.getTable(table).getDataAt(row, col).getData());
			}
			console.log('pushing row ' + row);
			exportableDataSingleSetValues.push(exportableDataSingleSetDataRow);

		}

		exportableData.push(
				{
					Rows : rows,
					Cols : cols,
					Values : exportableDataSingleSetValues
				}
		);
	}

	return (
		{
			Data : exportableData
		}
	);
}

//console.log(JSON.stringify(tableScraper()));
//console.log(tableScraper().Data[0].Values[2][1]);;


