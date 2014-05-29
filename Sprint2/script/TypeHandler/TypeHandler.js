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
 *
 */
TypeHandler.prototype.processTable = function(table)
{
	//Check for labels
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
			var rawData = table.Data.Values[row][col];
			columnData.push(this.acceptingTypes(rawData));
		}
		//Check for labels
		if(!hasLabels)
		{
			
			
		} else
		{
			//Get the list of valid types
			var vTypes = this.validTypes(columnData);
			//convert all records

			for(var row in table.Values)
			{		
				var rec = columnData[row].filter(function(obj) 
				{
					return obj.Type == vTypes[0] && isValid;
				});
				
				table.Data.Values[col][row] = rec.Val;
			}
			table.Data.ColumnType[col] = vTypes[0];
		}
		
	}	
}

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
 *
 */
 TypeHandler.prototype.testType = function(obj,typeName)
 {
	//
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
			"accept": function (obj)
			{
				regEx = /^\-?[\d]+$/;
				obj["Type"] = "Integer";
				obj["isValid"] = regEx.test(obj.RawVal.trim());
				obj["Val"] = parseInt(obj.RawVal.trim());
			}
		},
		{
			"Name": "Float",
			"Parent": "String",
			"accept": function (obj)
			{
				regEx = /^\-?[\d]+(\.[\d]*)?$/;
				obj["Type"] = "Float";
				obj["isValid"] = regEx.test(obj.RawVal.trim());
				obj["Val"] = parseFloat(obj.RawVal.trim());
			}
		},{
			"Name": "Date",
			"Parent": "String",
			"accept": function (obj)
			{
				var d = Date.parse(obj.RawVal.trim());
				
				obj["Type"] = "Date";
				
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
 
 