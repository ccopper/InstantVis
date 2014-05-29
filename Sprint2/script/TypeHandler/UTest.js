/**
 *	Instant Vis TypeHandler Tests
 *
 *	@module TypeHandlerTests
 */

/*
 *	Float Test
 */
test("2.45 is a valid Float", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "2.45"
	}	
	TH.testType(obj, "Float");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.Val, 2.45, "obj.Val == 2.45");
	equal(obj.Type, "Float", "obj.isValid == Float");
	equal(obj.isValid, true, "obj.isValid == true");
});

test("-42.45 is a valid Float", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "-42.45"
	}	
	TH.testType(obj, "Float");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.Val, -42.45, "obj.Val == -42.45");
	equal(obj.Type, "Float", "obj.isValid == Float");
	equal(obj.isValid, true, "obj.isValid == true");
});

test("2 is a valid Float", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "2"
	}	
	TH.testType(obj, "Float");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.Val, 2.0, "obj.Val == 2");
	equal(obj.Type, "Float", "obj.isValid == Float");
	equal(obj.isValid, true, "obj.isValid == true");
});

test("2. is a valid Float", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "2."
	}	
	TH.testType(obj, "Float");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.Val, 2.0, "obj.Val == 2.0");
	equal(obj.Type, "Float", "obj.isValid == Float");
	equal(obj.isValid, true, "obj.isValid == true");
});
/*
 *	Integer Test
 */
test("545 is a valid Integer", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "545"
	}	
	TH.testType(obj, "Integer");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.Val, 545, "obj.Val == 545");
	equal(obj.Type, "Integer", "obj.isValid == Integer");
	equal(obj.isValid, true, "obj.isValid == true");
});
test("-4545 is a valid Integer", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "-4545"
	}	
	TH.testType(obj, "Integer");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.Val, -4545, "obj.Val == -4545");
	equal(obj.Type, "Integer", "obj.isValid == Integer");
	equal(obj.isValid, true, "obj.isValid == true");
});
/*
 *	Date Test
 */
test("foo is an invalid date", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "foo"
	}	
	TH.testType(obj, "Date");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.Val, null, "obj.Val == null");
	equal(obj.Type, "Date", "obj.isValid == Date");
	equal(obj.isValid, false, "obj.isValid == false");
});

test("Aug 6, 1984 is a valid date", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "Aug 6, 1984"
	}	
	TH.testType(obj, "Date");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	notEqual(obj.Val, null, "obj.Val != null");
	equal(obj.Type, "Date", "obj.isValid == Date");
	equal(obj.isValid, true, "obj.isValid == true");
});

test("3:00 PM is a valid date", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "3:00 PM"
	}	
	TH.testType(obj, "Date");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	notEqual(obj.Val, null, "obj.Val != null");
	equal(obj.Type, "Date", "obj.isValid == Date");
	equal(obj.isValid, true, "obj.isValid == true");
});

test("15:00 is a valid date", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "15:00"
	}	
	TH.testType(obj, "Date");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	notEqual(obj.Val, null, "obj.Val != null");
	equal(obj.Type, "Date", "obj.isValid == Date");
	equal(obj.isValid, true, "obj.isValid == true");
});

test("06/24/1986 is a valid date", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "06/24/1986"
	}	
	TH.testType(obj, "Date");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	notEqual(obj.Val, null, "obj.Val != null");
	equal(obj.Type, "Date", "obj.isValid == Date");
	equal(obj.isValid, true, "obj.isValid == true");
});

test("06/24/1986 3:00PM is a valid date", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "06/24/1986"
	}	
	TH.testType(obj, "Date");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	notEqual(obj.Val, null, "obj.Val != null");
	equal(obj.Type, "Date", "obj.isValid == Date");
	equal(obj.isValid, true, "obj.isValid == true");
});

test("June 24, 1986 3:00PM is a valid date", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "06/24/1986"
	}	
	TH.testType(obj, "Date");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	notEqual(obj.Val, null, "obj.Val != null");
	equal(obj.Type, "Date", "obj.isValid == Date");
	equal(obj.isValid, true, "obj.isValid == true");
});

test("June 24, 1986 3:00PM is a valid date", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "06/24/1986"
	}	
	TH.testType(obj, "Date");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	notEqual(obj.Val, null, "obj.Val != null");
	equal(obj.Type, "Date", "obj.isValid == Date");
	equal(obj.isValid, true, "obj.isValid == true");
});

test("2001 is a valid date", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "2001"
	}	
	TH.testType(obj, "Date");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	notEqual(obj.Val, null, "obj.Val != null");
	equal(obj.Type, "Date", "obj.isValid == Date");
	equal(obj.isValid, true, "obj.isValid == true");
});


/*
 *
 */
test("2001 is a valid date, float and int", function()
{
	var TH = new TypeHandler();

	obj = TH.acceptingTypes("2001");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.length, 3, "Length 3");
	//equal(obj.Type, "Date", "obj.isValid == Date");
	//equal(obj.isValid, true, "obj.isValid == true");
});

test("4.999 is a valid date, float and int", function()
{
	var TH = new TypeHandler();

	obj = TH.acceptingTypes("4.999");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.length, 3, "Length 3");
	//equal(obj.Type, "Date", "obj.isValid == Date");
	//equal(obj.isValid, true, "obj.isValid == true");
});

test("SampleTablePArset", function()
{
	var TH = new TypeHandler();

	TH.processTable(sTbl);
	
	equal(true, true, "Raw Data:" + JSON.stringify(sTbl));

});






