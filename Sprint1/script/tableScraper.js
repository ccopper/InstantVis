

function TableData() {
	this._rows = 0;
	this._cols = 0;
	this._data = [];

	this.addDataRow = function(dataRow) {
		this._data.push(dataRow);
	}

	this.getDataRow = function(rowNumber) {
		return this._data[rowNumber];
	}

	this.getData = function(row, col) {
		return this._data[row][col];
	}

	this.setRows = function(rows) {
		this._rows = rows;
	}

	this.setCols = function(cols) {
		this._cols = cols;
	}

	this.calcDimentions = function() {
		this._rows = this._data.length;
		var maxRowLengthFound = 0;
		for (row in this._data) {
			if (row.length > maxRowLengthFound) {
				maxRowLengthFound = row.length;
			}
		}
	}

}

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

function getTableData() {
	var allTableData = new AllTableData();


	$( 'table' ).each( function(currentTableIndex, currentTable) {
		var tableData = new TableData();

		$( $( currentTable ).find( 'tr' ) ).each( function(currentRowIndex, currentRow) {
			var currentRow = [];
			
			$( currentRow ).find( 'td' ).each( function(currentColumnIndex, currentData) {
				var tableDataElement = new TableDataElement();
				tableDataElement.setData( $( currentData ).text());
				currentRow.push(tableDataElement);
			});

			tableData.addDataRow(currentRow);

		});
		tableData.calcDimentions();
		allTableData.addTable(tableData);
	});

	return allTableData;
}


var allTableData = getTableData();

// console.log(allTableData.getTable(1).getDataRow(4));


