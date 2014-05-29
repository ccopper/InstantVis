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
TypeHandler.prototype.startBatch = function()
{

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
		"Date",
		"Integer",
		"Float",
		"String"
	],
	"Types": 
	[
		{
			"Name": "Integer",
			"Parent": "Float",
			"accept": function (obj)
			{
				regEx = /^[\d]+$/;
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
				regEx = /^[\d]+(\.[\d]*)?$/;
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
 
 