

function tableType() {
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
			if (row.length > maxLengthRowFound) {
				maxLengthRowFound = row.length;
			}
		}
	}

}

function tableDataElementType() {
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

function allTableData() {
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
}

function getTableData() {
	var tableDataRowType = [];

	var tableDataElementType = {
		attributes : null,
		payload : null
	}

	var tableDataType = {
		rows : 0,
		cols : 0,
		data : []
	}

	var allTableDataType = {
		metaData : null,
		table : []
	}


	var allTableData = Object.create(allTableDataType);

	$( 'table' ).each( function(currentTableIndex, currentTable) {

		var currentTableData = Object.create(tableDataType);
		var maxLengthRowFound = 0;

		$( $( currentTable ).find( 'tr' ) ).each( function(currentRowIndex, currentRow) {

			var currentTableRowData = Object.create(tableDataRowType);

			$( currentRow ).find( 'td' ).each( function(currentColumnIndex, currentData) {
				var tableDataElement = Object.create(tableDataElementType);
				tableDataElement.payload = $( currentData ).text();
				currentTableRowData.push(tableDataElement);
			});

			if (maxLengthRowFound < currentTableRowData.length) {
				maxLengthRowFound = currentTableRowData.length;
			}

			currentTableData.data[currentRowIndex] = currentTableRowData;

		});
		allTableData.table[currentTableIndex] = currentTableData;
	});

	return allTableData;
}


var allTableData = getTableData();

//console.log(allTableData.table[1].data[2][1]);


