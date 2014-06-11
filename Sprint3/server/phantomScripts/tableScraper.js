/**
 * @file Scrape HTML tabular data.
 * @example
 * Call tableScraper() from within the HTML document in question.
 * @module tableScraper
 */


/**
 * Data contained within one table
 *
 * @function
 */
function TableData() 
{
	this._rows = 0;
	this._cols = 0;
	this._data = [];	// an array of array of TableDataElement
							// each row is made of an array of TableDataElement
							// this._data is an array of rows
	this._caption = "";	// table caption, the AI expects an empty string if none found
	this._columnLabel = []; // labels for each column, default is an array of size 1 with the empty string
	this._columnLabel[0] = "";

	this._checkDimensions = function() 
	{
		if (this._data.length > this._rows) 
		{
			console.log("Table dimensions do not make sense, number of rows and columns might be wrong!");
		}
	}
	
	this.hasColumnLabel = function() 
	{
		return (! (this._columnLabel[0] == "" && this._columnLabel.length == 1) );
	}

	this.addDataRow = function(dataRow) 
	{
		this._data.push(dataRow);
	}

	this.getDataRow = function(rowNumber) 
	{
		return this._data[rowNumber];
	}

	this.getAllRows = function() 
	{
		return this._data;
	}

	this.getDataAt = function(row, col) 
	{
		return this._data[row][col];
	}

	this.setCaption = function(caption) 
	{
		this._caption = caption;
	}

	this.getCaption = function()
  	{
		return this._caption;
	}

	this.getColumnLabel = function() 
	{
		return this._columnLabel;
	}

	// pass in an array of strings that are the column labels
	this.setColumnLabel = function(columnLabel) 
	{
		this._columnLabel = columnLabel;
	}

	this.setRows = function(rows) 
	{
		this._rows = rows;
	}

	this.setCols = function(cols) 
	{
		this._cols = cols;
	}
	
	this.getRows = function() 
	{
		this._checkDimensions();
		return this._rows;
	}

	this.getCols = function() 
	{
		this._checkDimensions();
		return this._cols;
	}

	// determine the dimensions of a table based on this._data size
	this.calcDimensions = function() 
	{
		this._rows = this._data.length;
		var maxRowLengthFound = 0;

		for (var row = 0; row < this._rows; row++) 
		{
			if (this._data[row].length > maxRowLengthFound) 
			{
				maxRowLengthFound = this._data[row].length;
			}
		}
		this._cols = maxRowLengthFound;
	}

	// look for tables that have missing elements and report the number found
	this.numberOfMissingElements = function()
	{
		var holesFound = 0; // how many missing elements have been found

		for (var row = 0; row < this._rows; row++)
		{
			for (var col = 0; col < this._cols; col++)
			{
				if (this._data[row][col] == undefined)
				{
					holesFound++;
				}
			}
		}

		return holesFound;
	}

	// make sure each row and col match this._cols and this._rows
	this.tableIsRectangular = function()
	{
		var misMatches = 0;

		for (var row = 0; row < this._data.length; row++)
		{
			if (this._data[row].length != this._cols)
			{
				misMatches++;
			}
		}
		if (this._data.length != this._rows)
		{
			misMatches++;
		}

		return (misMatches == 0) ? true : false;
	}

}

/** 
 * Data contained in one table element (a single row/col location)
 *
 * @function
 */
function TableDataElement() 
{
	this._data = null;
	this._attributes = null;

	this.setData = function(data) 
	{
		this._data = data;
	}

	this.getData = function() 
	{
		return this._data;
	}

	this.getAttributes = function() 
	{
		return this._attributes;
	}

	this.setAttributes = function(attributes) 
	{
		this._attributes = attributes;
	}
}

/**
 * Holds data for all the tables
 *
 * @function
 */
function AllTableData() 
{
	this._tables = [];

	this.addTable = function(table) 
	{
		this._tables.push(table);
	}

	this.getTableCount = function() 
	{
		return this._tables.length;
	}

	this.getTable = function(index) 
	{
		return this._tables[index];
	}

	this.getTables = function() 
	{
		return this._tables;
	}
}

/**
 * Do the table scraping
 *
 * @function
 * @returns An AllTableData object
 */
function getTableData() 
{
	var allTableData = new AllTableData();

	// iterate over each <table> in the document
	$( 'table' ).each( function(currentTableIndex, currentTable) 
	{
		var tableData = new TableData();

		// find the table caption if it exists
		var caption = $( $( currentTable ).find( 'caption' ) ).text();
		if (caption != undefined) 
		{
			tableData.setCaption(caption);
		}

		// look for table heading data, collect it if it exists
		// this will look for all theads in the table, so if the table is malformed and
		// there are numerous theads, the last one encountered will be the column headings

		var tableHeadOuter = ['thead', 'tr'];
		var tableHeadInner = ['th', 'th'];
		
		for (var i = 0; i < tableHeadOuter.length; i++) 
		{
			$( $( currentTable ).find( tableHeadOuter[i]) ).each( function(currentTableHeadIndex,
				currentTableHead) 
			{

				var currentTableHeadData = [];

				$( currentTableHead ).find( tableHeadInner[i] ).each( function(currentTableHeadColumnIndex,
					currentTableHeadColumn) 
				{
					currentTableHeadData.push( $( currentTableHeadColumn ).text() );
				});

				if (currentTableHeadData.length > 0) 
				{
					tableData.setColumnLabel(currentTableHeadData);
				}

			});
			if (tableData.hasColumnLabel()) 
			{
				break;
			}
		}


		var trSelector = ['tbody tr', 'tr'];

		for (var i = 0; i < trSelector.length; i++) 
		{
			var dataAdded = false;
			// iterate over each <tr> table row
			$( $( currentTable ).find( trSelector[i] ) ).each( function(currentRowIndex, currentRow) 
			{
				var currentRowData = [];

				// pick out each <td> table data element and make a new TableDataElement for that data	
				$( currentRow ).find( 'td' ).each( function(currentColumnIndex, currentData) 
				{
					var tableDataElement = new TableDataElement();
					tableDataElement.setData( $( currentData ).text());
					currentRowData.push(tableDataElement);
				});
				
				if (currentRowData.length > 0) 
				{
					dataAdded = true;
					tableData.addDataRow(currentRowData);
				}

			});
			if (dataAdded) 
			{
				break;
			}
		}
		tableData.calcDimensions();
		if (tableData.numberOfMissingElements() == 0 &&
			 tableData.tableIsRectangular() == true)
		{
			allTableData.addTable(tableData);
		}
		else
		{
			console.log("Parser: table with missing elements found, cannot parse.");
		}
	});

	return allTableData;
}

/**
 * @typedef Data
 * @property {String[]} ColumnLabel Column headers picked up in the HTML table
 * @property {String} Caption HTML table caption (title) if it exists
 * @property {Integer} Rows Table rows
 * @property {Integer} Cols Table columns
 * @property Values A two dimensional array of table values, ordered as [row][col]
 */

/**
 * Wrapper function to be called from the outside, all the other functions in this file are unused outside
 * this file.
 *
 * @public
 * @returns	{Data[]} An array of {@link Data} objects, one for each table parsed
 */
function tableScraper() 
{
	var allTables = getTableData(); 	// do the actual table scraping, the allTables var will contain all 
												// tables and associated data
	var exportableData = [];

	/* for each table, get all associated data from all rows and cols */
	for (table in allTables.getTables()) 
	{

		var rows = allTables.getTable(table).getRows();
		var cols = allTables.getTable(table).getCols();
		var exportableDataSingleSetValues = [];

		console.log('Table ' + table + ' (' + rows + ' rows by ' + 
					cols + ' cols) :');

		for (var row = 0; row < rows; row++) 
		{
			var exportableDataSingleSetDataRow = [];
			for (var col = 0; col < cols; col++) 
			{

				// put the data minus any attributes into the exportableData structure
				// if the data is undefined, insert 'Number.NaN' into that element
				var element = allTables.getTable(table);
				element = element.getDataAt(row, col);
				if(element == undefined)
				{
					element = Number.NaN;
				} 
				else 
				{
					element = element.getData();
				
					if (element == undefined) 
					{
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
	
	return (
		{
			Data : exportableData
		}
	);
}


