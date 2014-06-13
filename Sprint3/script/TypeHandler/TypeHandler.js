/**
 *	JS Type Handling and prediction	
 *	Predicts type and if necessary converts data.
 *
 *	@module TypeHandler
 */
 
/**
 * Create a new TypeHandler Class
 *
 * @constructor
 */
function TypeHandler() {}
 
/**
 *	Processs a table (converts columns, checks for headers and metadata)
 *	Processing is done in place.  The object reference passed in is modified.
 *	
 *	@param {ParserOutPut} table	A single table that was returned from the parser
 */
TypeHandler.prototype.processTable = function(table)
{

	//If there was no data present modify the table to be rejected
	if(typeof table.Data.Values == "undefined")
	{
		table.Data.Values = [[""]]
		table.Data.ColumnLabel = [""];
		table.Data.ColumnUnique = [1];
		table.Data.ColumnType = ["String"];
	}
	table.Data.ColumnUnique = []
	
		
	//Condense spaces
	for(var col in table.Data.Values[0])
	{
		for(var row in table.Data.Values)
		{
			table.Data.Values[row][col] = table.Data.Values[row][col].replace(/\s+/gm, " ").trim();;
		}
	}
	
	this.removeEmpty(table.Data.Values);
	
	//Check for labels
	var hasLabels = true;	
	var origHead = table.Data.Values[0].slice(0);	
	if(table.Data.ColumnLabel[0] == "")
	{
		hasLabels = false;

	} else
	{
		for(var i in table.Data.ColumnLabel)
		{
			table.Data.ColumnLabel[i] = table.Data.ColumnLabel[i].replace(/\s+/gm, " ");
		}	
	}
	
	//Loop through all items

	for(var col in table.Data.Values[0])
	{
		//Get all types
		var columnData = [];
		var setData = new SimpleSet();
		for(var row in table.Data.Values)
		{	
			//Retrive the raw data and get the valid types for this data
			var rawData = table.Data.Values[row][col];			
			columnData.push(this.acceptingTypes(rawData));
		}		

		//Check for labels
		if(!hasLabels)
		{
			var header = columnData.splice(0,1);
			var hType = this.validTypes(header);
			var cTypes = this.validTypes(columnData);
			
			if(hType[0] != cTypes[0] && hType[0] == "String")
			{

				table.Data.ColumnLabel = origHead;
				table.Data.Values.splice(0,1)[0]
				hasLabels = true				
			} else
			{
				columnData.splice(0,0, header[0])
			}
		}
			
		//Get the list of valid types
		var vTypes = this.validTypes(columnData);
		//convert all records
		for(var row in table.Data.Values)
		{	
			//Fetch the record with highest precedence
			var rec = columnData[row].filter(function(obj) 
			{
				return obj.Type == vTypes[0] && obj.isValid;
			});
			//Only update if there was an applicable record
			if(rec.length != 0)
			{
				table.Data.Values[row][col] = rec[0].Val;
				setData.add(rec[0].Val);
			} else
			{
				setData.add(table.Data.Values[row][col]);
			}
		}
		//Update the type metadata
		table.Data.ColumnType[col] = vTypes[0];
		table.Data.ColumnUnique[col] = setData.getUniqueCount() / table.Data.Values.length;
		
	}
	//If no columns were found provide defaults ex Col. 1
	if(!hasLabels)
	{
		table.Data.ColumnLabel = [];
		for(var col in table.Data.Values[0])
		{
			table.Data.ColumnLabel.push("Col. " + col);
		}
	}
}

/**
 *	Remove all rows that are only empty strings("")
 *	@param {Array[]} data	A reference to the Values section of the data object
 */
TypeHandler.prototype.removeEmpty = function(data)
{
	var i = 0;
	while(i != data.length)
	{
		if(this.isEmptyRow(data[i]))
		{
			data.splice(i,1);
		} else
		{
			i++;
		}
	}
}
/**
 *	Check if a row is completly empty.
 *	@param {Array[]} row A row of the table
 *	@returns {bool} true of false for emptyness
 */
TypeHandler.prototype.isEmptyRow = function(row)
{
	var res = true;
	for(var i in row)
	{
		res = res && (row[i].trim() == "");
	}
	return res;
};

/**
 *	After processing an entire column. This will return the list of valid types for the column
 *
 *	@param {Record[]} cData A listing of accepting records from a column
 *	@returns {String}	String list of valid types
 */
TypeHandler.prototype.validTypes = function(cData)
{
	//Create a copy of the typs avaible
	var vTypes = this.TypeLibrary.Precedence.slice(0);
	//Check all types and remove non applicable ones from the list availble
	for(var row in cData)
	{
		for(var rec in cData[row])
		{
			//Skip valid entrys in the data list
			if(cData[row][rec].isValid)
			{
				continue;
			}
			var idx = vTypes.indexOf(cData[row][rec].Type);
			if(idx == -1)
				continue;
			vTypes.splice(idx, 1);
		}		
	}
	
	return vTypes;
}

/**
 * 	Checks all types for provided data types
 *
 *	@param {String} rawVal	A raw value for a single entry
 *	@returns {Record[]}	An array of records for all types 
 */
TypeHandler.prototype.acceptingTypes = function(rawVal)
{
	var vTypes = []

	if(rawVal == "")
	{
		
		return this.DefaultEntry();
	}
	
	for(var x in this.TypeLibrary.Types)
	{
		if(this.TypeLibrary.Types[x].Name == this.TypeLibrary.Default)
			continue;
		var obj = 
		{
			"RawVal": rawVal
		};
		this.testType(obj, this.TypeLibrary.Types[x].Name);

		vTypes.push(obj);		
	}
	
	return vTypes;
	
 };

 /**
 * 	Provides a default record
 *
 *	@returns {Record[]}	An array of records for all type's default value
 */
TypeHandler.prototype.DefaultEntry = function()
{
	var vTypes = []
	for(var x in this.TypeLibrary.Types)
	{
		if(this.TypeLibrary.Types[x].Name == this.TypeLibrary.Default)
			continue;
		var obj = 
		{
			"RawVal": "",
			"isValid": true,
			"MetaData": ""
		};
		obj["Type"] = this.TypeLibrary.Types[x].Name
		obj["Val"] = this.TypeLibrary.Types[x].DefaultVal();
		vTypes.push(obj);		
	}
	
	return vTypes;
}
 
 /**
 * 	Tests a single type
 *
 *	@param {Record} obj		A blank Record reference
 *	@param {Sring} typeName The name of the type to test 
 */
 TypeHandler.prototype.testType = function(obj,typeName)
 {
	
	var typeObj = this.TypeLibrary.Types.filter(function(typeIns) 
	{
		return typeIns.Name == typeName;
	});
	
	typeObj[0].accept(obj);
	
 };
/**
 *	Record
 *	@typedef {Object} Record
 *	@property {String} RawValue			Raw Value to pass
 *	@property {String} TypeName			TypeName Checked
 * 	@property {bool} isValid		 	True or false if it was valid
 * 	@property {Object} Val				Value of the raw value as (TypeName)
 */
 
/**
 * 	The Typelibrary
 *
 *	@typedef {Object} TypeLibrary
 *	@property {String} Default		The default type
 *	@property {String[]} Precedence	The precedence of the types (High to Low)
 * 	@property {Type[]} Types 	An array of all Types	
 */
 /**
 * 	Type
 *
 *	@typedef {Object} Type
 *	@property {String} Name	Type name
 *	@property {function} DefaultVal	 A no parameter function that returns the defaul value.
 * 	@property {function(Record)} accept A function that tests and modifies the passes in Record 
 */
 /**
  *	@property
  *	@type TypeLibrary
  *	
  */
TypeHandler.prototype.TypeLibrary =
 {
	"Default": "String",
	"Precedence": 
	[ 
		"Integer",
		"Float",
		"String"
	],
	"Types": 
	[
		{
			"Name": "Integer",
			"Parent": "Float",
			"DefaultVal": function() { return 0; },
			"accept": function (obj)
			{
				var raw = obj.RawVal.trim().replace(",", "");
				var regEx = /^([^\d\-\.]+)?(\-?\d*)([^\:\d\.]+.*)?$/;
				
				obj["Type"] = "Integer";
				if(!regEx.test(raw))
				{
					obj["isValid"] = false;
					obj["Val"] = 0;
					return
				}

				var res = regEx.exec(raw);

				if(typeof(res[2]) == "undefined" || res[2] == "")
				{
					obj["isValid"] = false;
					obj["Val"] = 0;
					return
				}
				
				obj["isValid"] = regEx.test(raw);

				var pVal = parseInt(res[2]);
				obj["Val"] = isNaN(pVal)? 0 : pVal;
				
			}
		},
		{
			"Name": "Float",
			"Parent": "String",
			"DefaultVal": function() { return 0.0; },
			"accept": function (obj)
			{	
				var raw = obj.RawVal.trim().replace(",", "");
				var regEx = /^([^\d\-\.]+)?(\-?\d*(\.?\d*)?)([^\:\d]+.*)?$/;
				
				obj["Type"] = "Float";
				if(!regEx.test(raw))
				{
					obj["isValid"] = false;
					obj["Val"] = 0.0;
					return
				}

				var res = regEx.exec(raw);

				if(typeof(res[2]) == "undefined" || res[2] == "")
				{
					obj["isValid"] = false;
					obj["Val"] = 0.0;
					return
				}
				
				obj["isValid"] = regEx.test(raw);

				var pVal = parseFloat(res[2]);
				obj["Val"] = isNaN(pVal)? 0 : pVal;
			}
		}]
 };
 
/**
 * SimpleSet
 * A base implementation of a Set
 *
 * @constructor
 */ 
function SimpleSet() 
{
	this.Store = {};
	this.UniqueCount = 0;
}

 /**
 * 	Adds a record to the set
 *
 *	@param {Object} entry	Item to add
 */
SimpleSet.prototype.add = function(entry)
{
	if(typeof this.Store[entry] == "undefined")
	{
		this.Store[entry] = 0;
		this.UniqueCount++
	} else
	{
		this.Store[entry]++;
	}
};
 /**
 * 	Gets the number of unique items in the set
 *
 *	@returns {Integer} The number of unique iutems
 */
SimpleSet.prototype.getUniqueCount = function()
{
	return this.UniqueCount;
};
 
 
 
 
 
 
 