/*
 * tableScraper() and associated functions that tableScraper() uses to scrape html tabular data.
 * Call tableScraper() from within the html document in question.
 *
 */


/*
 * Data contained within one table
 */

function TableData() {
	this._rows = 0;
	this._cols = 0;
	this._data = [];	// an array of array of TableDataElement
							// each row is made of an array of TableDataElement
							// this._data is an array of rows
	this._caption = "";	// table caption, the AI expects an empty string if none found
	this._columnLabel = []; // labels for each column, default is an array of size 1 with the empty string
	this._columnLabel[0] = "";

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

	this.setCaption = function(caption) {
		this._caption = caption;
	}

	this.getCaption = function() {
		return this._caption;
	}

	this.getColumnLabel = function() {
		return this._columnLabel;
	}

	// pass in an array of strings that are the column labels
	this.setColumnLabel = function(columnLabel) {
		this._columnLabel = columnLabel;
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

	// iterate over each <table> in the document
	$( 'table' ).each( function(currentTableIndex, currentTable) {
		var tableData = new TableData();

		// find the table caption if it exists
		var caption = $( $( currentTable ).find( 'caption' ) ).text();
		if (caption != undefined) {
			tableData.setCaption(caption);
		}

		// look for table heading data, collect it if it exists
		// this will look for all theads in the table, so if the table is malformed and
		// there are numerous theads, the last one encountered will be the column headings
		$( $( currentTable ).find( 'thead' ) ).each( function(currentTableHeadIndex,
					currentTableHead) {
			
			var currentTableHeadData = [];

			$( currentTableHead ).find( 'th' ).each( function(currentTableHeadColumnIndex,
						currentTableHeadColumn) {

				currentTableHeadData.push( $( currentTableHeadColumn ).text() );
			});


			var dataFound = false;	// set true if any of the table headings contain data
			for (var i = 0; i < currentTableHeadData.length; i++) {
				if (currentTableHeadData[i] != undefined &&
					 currentTableHeadData[i] != "") {
					dataFound = true;
					break;
				}
			}
			
			if (dataFound) {
				tableData.setColumnLabel(currentTableHeadData);
			}

		});


		var trSelector = 'tbody tr';

		// iterate over each <tr> table row
		$( $( currentTable ).find( trSelector ) ).each( function(currentRowIndex, currentRow) {
			var currentRowData = [];
		
			// pick out each <td> table data element and make a new TableDataElement for that data	
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
 *
 * @returns	Data : [] portion of parser to AI js object as documented in the wiki and in the function
 */

function tableScraper() {
	var allTables = getTableData(); 	// do the actual table scraping, the allTables var will contain all 
												// tables and associated data
	var exportableData = [];

	/* for each table, get all associated data from all rows and cols */
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
				// if the data is undefined, insert 'Number.NaN' into that element
				var element = allTables.getTable(table);
				element = element.getDataAt(row, col);
				if(element == undefined)
				{
					element = Number.NaN;
				} else {
					element = element.getData();
				
					if (element == undefined) {
						element = Number.NaN;
					}
				}
				exportableDataSingleSetDataRow.push(element);

				console.log('(' + row + ',' + col + ') = ' + element);
			}

			exportableDataSingleSetValues.push(exportableDataSingleSetDataRow);

		}

		exportableData.push(
				{
					ColumnLabel : allTables.getTable(table).getColumnLabel(),
					Caption : allTables.getTable(table).getCaption(),
					Rows : rows,
					Cols : cols,
					Values : exportableDataSingleSetValues
				}
		);
	}
	
	/*
	 * returns this object:
	 *
	 * {
	 * 	Data : [
	 * 		ColumnLabel : [(string)],
	 * 		Caption : [(string)],
	 * 		Rows : (integer),
	 * 		Cols : (integer),
	 * 		Values : [Rows][Cols]
	 * 	]
	 * }
	 */

	return (
		{
			Data : exportableData
		}
	);
}


