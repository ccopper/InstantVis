/**
 *	JS Type Handling and prediction	
 *
 *
 */
 
/**
	Example Object for type checker acceptFunction
	
	{
		"RawVal": (String Value),	INPUT		Raw Value
		"Type": (TypeName),			OUTPUT		Type checked
		"isValid": (0 | 1),			OUTPUT		Is a valid instance of Type?
		"Val": (TypeName)			OUTPUT		Converted Value
		"MetaData": ()				OUTPUT		Associated metadata
	}
 
 */
/**
 *	 Constructor
 */
function TypeHandler() {}
 
/**
 *		Processs a table (converts columns, checks for headers and metadata)
 *
 */
TypeHandler.prototype.processTable = function(table)
{
	//Check for labels
	table.Data["MetaData"] = []
	var hasLabels = true;
	if(table.Data.ColumnLabel[0] == "")
	{
		hasLabels = false;
	}
	//Loop through all items
	for(var col in table.Data.Values[0])
	{
		//Get all types
		var columnData = [];
		for(var row in table.Data.Values)
		{	
			//Populate an empty metadata array
			if(typeof table.Data.MetaData[row] == "undefined")
			{
				table.Data.MetaData[row] = [];
			}
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
			
			if(hType[0] == "String" && hType[0] != cTypes[0])
			{
				table.Data.ColumnLabel = table.Data.Values.splice(0,1)[0]
				hasLabels = true				
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
			table.Data.MetaData[row][col] = "";
			if(rec.length != 0)
			{
				table.Data.Values[row][col] = rec[0].Val;
				table.Data.MetaData[row][col] = rec[0].MetaData;
			}
		}
		//Update the type metadata
		table.Data.ColumnType[col] = vTypes[0];
		
		
	}	

}
/**
 *
 *
 */
TypeHandler.prototype.validTypes = function(cData)
{
	var vTypes = this.TypeLibrary.Precedence.slice(0);
	
	for(var row in cData)
	{
		for(var rec in cData[row])
		{
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
 *
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
	Example Object for type checker acceptFunction
	
	{
		"RawVal": (String Value),	INPUT		Raw Value
		"Type": (TypeName),			OUTPUT		Type checked
		"isValid": (True | False),	OUTPUT		Is a valid instance of Type?
		"Val": (TypeName)			OUTPUT		Converted Value
		"MetaData": ()				OUTPUT		Associated metadata
	}
 */
TypeHandler.prototype.TypeLibrary =
 {
	"Default": "String",
	"Precedence": 
	[ 
		"Integer",
		"Float",
		"Date",
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
				regEx = /^([^\d\-]*)(\-?[\d]+)(\D*)$/;
				obj["Type"] = "Integer";
				if(!regEx.test(obj.RawVal.trim()))
				{
					obj["isValid"] = false;
					obj["Val"] = 0;
					return
				}
				var rexec = regEx.exec(obj.RawVal.trim());
				//console.log(rexec)
				obj["isValid"] = regEx.test(obj.RawVal.trim());
				obj["Val"] = parseInt(rexec[2].trim());
				obj["MetaData"] = rexec[1].trim() + rexec[rexec.length-1].trim()
			}
		},
		{
			"Name": "Float",
			"Parent": "String",
			"DefaultVal": function() { return 0.0; },
			"accept": function (obj)
			{
				
				var regEx = /^([^\d\-]*)(\-?(([\d]+(\.[\d]*)?)|(\.[\d]+)))(\D*)$/;
				obj["Type"] = "Float";
				if(!regEx.test(obj.RawVal.trim()))
				{
					obj["isValid"] = false;
					obj["Val"] = 0.0;
					return
				}
				var rexec = regEx.exec(obj.RawVal.trim());
				//console.log(rexec)
				obj["isValid"] = regEx.test(obj.RawVal.trim());
				obj["Val"] = parseFloat(rexec[2].trim());
				obj["MetaData"] = rexec[1].trim() + rexec[rexec.length-1].trim()
			}
		},{
			"Name": "Date",
			"Parent": "String",
			"DefaultVal": function() { return new Date(); },
			"accept": function (obj)
			{
				var d = Date.parse(obj.RawVal.trim());
				
				obj["Type"] = "Date";
				obj["MetaData"] = "";
				//Verify that the date is valid
				if (d == null)
				{
					obj["isValid"] = false;
					obj["Val"] = null;
				} else
				{
					obj["isValid"] = true;
					obj["Val"] = d;
				}
			}
		}]
 };
 
 