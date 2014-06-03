/**
 *	Instant Vis TypeHandler Tests
 *
 *	@module TypeHandlerTests
 */
	//Sample data tale 1 (float, integer)
	var sTbl =
	{	
		"Data":
		{
			"ColumnLabel": ["X", "Y"],
			"ColumnType": [],
			"Values":
				[["0","0"],	
				["1","1"],
				["2","4"],
				["3","9"],
				["4","16"],
				["5.999","25"],
				["6","36"],
				["7","49"],
				["8","64"],
				["9","81"]]
		}	
	};
	//Sample table data 2 (float, string)
 	var sTbl2 =
	{	
		"Data":
		{
			"ColumnLabel": ["X", "Y"],
			"ColumnType": [],
			"Values":
				[["0","One"],	
				["1","Two"],
				["2","Three"],
				["3","Four"],
				["4","Five"],
				["5.999","Six"],
				["6","Seven"],
				["7","Eight"],
				["8","Nine"],
				["9","Ten"]]
		}	
	};

 	var sTbl4 =
	{	
		"Data":
		{
			"ColumnLabel": ["X", "Y"],
			"ColumnType": [],
			"Values":
				[["0",		"1"],	
				["1",		"1"],
				["2",		""],
				["3",		"55"],
				["4",		"14"],
				["5",		""],
				["6",		"3"],
				["7",		"7"],
				["8",		""],
				["9",		"4"]]
		}	
	};
	 var sTbl5 =
	{	
		"Data":
		{
			"ColumnLabel": [""],
			"ColumnType": [],
			"Values":
				[["Index",	"Data"],	
				["1",		"1"],
				["2",		"5"],
				["3",		"55"],
				["4",		"14"],
				["5",		"6"],
				["6",		"3"],
				["7",		"7"],
				["8",		"4"],
				["9",		"4"]]
		}	
	};
	var sTbl6 =
	{

		"Data":
		{
			"ColumnLabel": [""],
			"ColumnType": [],
			"Values": 
			[["*Hour(MST)",
			"O3 \nPPB ",
			"PM2.5 \n µg/m3 ",
			"RD \ndeg  ",
			"RS  \nmph    ",
			"TEMP  \ndegF   ",
			"WD  \ndeg    ",
			"WS  \nmph    "],
			["1:00 AM",		"26",	"1",	"180.0",	"4.1",	"54",	"179",	"4"],
			["2:00 AM",		"29",	"2",	"177.8",	"4.0",	"55",	"175",	"5"],
			["3:00 AM",		"33",	"3",	"250.4",	"2.8",	"57",	"251",	"4"],
			["4:00 AM",		"30",	"3",	"316.9",	"0.0",	"55",	"347",	"2"],
			["5:00 AM",		"27",	"2",	"214.3",	"1.0",	"53",	"214",	"3"],
			["6:00 AM",		"30",	"3",	"178.3",	"6.3",	"57",	"183",	"7"],
			["7:00 AM",		"38",	"0",	"173.0",	"9.4",	"65",	"173",	"9"],
			["8:00 AM",		"42",	"2",	"173.8",	"8.9",	"71",	"176",	"9"],
			["9:00 AM",		"46",	"5",	"20.0",		"10.0",	"74",	"18",	"10"],
			["10:00 AM",	"50",	"4",	"36.4",		"10.0",	"74",	"36",	"10"],
			["11:00AM",		"55",	"1",	"40.6",		"8.1",	"77",	"42",	"8"],
			["12:00 PM",	"60",	"-",	"19.5",		"4.0",	"81",	"22",	"5"],
			["1:00 PM",		"60",	"2",	"350.5",	"6.0",	"81",	"347",	"7"],
			["2:00 PM",		"64",	"1",	"23.4",		"7.8",	"81",	"23",	"8"],
			["3:00 PM",		"62",	"3",	"26.8",		"7.3",	"80",	"25",	"8"],
			["4:00 PM",		"59",	"2",	"37.2",		"6.1",	"79",	"39",	"6"],
			["5:00 PM",		"60",	"4",	"75.2",		"3.9",	"81",	"74",	"4"],
			["6:00 PM",		"56",	"11",	"318.3",	"2.2",	"78",	"304",	"3"],
			["7:00 PM",		"56",	"11",	"52.2",		"4.7",	"77",	"51",	"5"],
			["8:00 PM",		"46",	"19",	"233.5",	"1.8",	"69",	"245",	"3"],
			["9:00 PM",		"42",	"16",	"0.5",		"11.1",	"64",	"347",	"11"],
			["10:00 PM",	"43",	"5",	"15.7",		"8.8",	"61",	"18",	"9"],
			["11:00 PM",	"46",	"1",	"18.2",		"6.5",	"60",	"16",	"6"],
			["12:00AM",		"",		"",		"",			"",		"",		"",		""]]
		}
	}
 
 
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
test(".2 is a valid Float", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": ".2"
	}	
	TH.testType(obj, "Float");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.Val, .2, "obj.Val == .2");
	equal(obj.Type, "Float", "obj.isValid == Float");
	equal(obj.isValid, true, "obj.isValid == true");
});
test("-.2 is a valid Float", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "-.2"
	}	
	TH.testType(obj, "Float");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.Val, -.2, "obj.Val == -.2");
	equal(obj.Type, "Float", "obj.isValid == Float");
	equal(obj.isValid, true, "obj.isValid == true");
});

test("one is an invalid Float", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "one"
	}	
	TH.testType(obj, "Float");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.Type, "Float", "obj.isValid == Float");
	equal(obj.isValid, false, "obj.isValid == true");

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
test("-4.75 is not a valid Integer", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "-4.75"
	}	
	TH.testType(obj, "Integer");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.Val, 0, "obj.Val == -4.75");
	equal(obj.Type, "Integer", "obj.isValid == Integer");
	equal(obj.isValid, false, "obj.isValid == false");
});

test("one is not a valid Integer", function()
{
	var TH = new TypeHandler();
	var obj = 
	{
		"RawVal": "one"
	}	
	TH.testType(obj, "Integer");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.Type, "Integer", "obj.Type == Integer");
	equal(obj.isValid, false, "obj.isValid == false");
});

/*
 *
 */
test("2001 is a valid float and int", function()
{
	var TH = new TypeHandler();

	obj = TH.acceptingTypes("2001");
	
	equal(true, true, "Raw Data:" + JSON.stringify(obj));
	equal(obj.length, 2, "Length 2");
	//equal(obj.Type, "Date", "obj.isValid == Date");
	//equal(obj.isValid, true, "obj.isValid == true");
});


test("SampleTableParse 1 (Float, Integer)", function()
{
	var TH = new TypeHandler();

	TH.processTable(sTbl);
	
	equal(true, true, "Raw Data:" + JSON.stringify(sTbl));
	equal(sTbl.Data.ColumnType[0], "Float", "Col 0 is Float");
	equal(sTbl.Data.ColumnType[1], "Integer", "Col 1 is Integer");
	
});

test("SampleTableParse 2 (Float, String)", function()
{
	var TH = new TypeHandler();

	TH.processTable(sTbl2);
	
	equal(true, true, "Raw Data:" + JSON.stringify(sTbl2));
	equal(sTbl2.Data.ColumnType[0], "Float", "Col 0 is Float");
	equal(sTbl2.Data.ColumnType[1], "String", "Col 1 is String");
	
});



test("SampleTableParse 4 (Integer, Integer) With Empty Fields", function()
{
	var TH = new TypeHandler();

	TH.processTable(sTbl4);
	
	equal(true, true, "Raw Data:" + JSON.stringify(sTbl4));
	equal(sTbl4.Data.ColumnType[0], "Integer", "Col 0 is Integer");
	equal(sTbl4.Data.ColumnType[1], "Integer", "Col 1 is Integer");
	equal(sTbl4.Data.Values[2][1], 0, "Empty string replaced");
	equal(sTbl4.Data.Values[5][1], 0, "Empty string replaced");
	equal(sTbl4.Data.Values[8][1], 0, "Empty string replaced");
	
});

test("SampleTableParse 5 (Integer, Integer) with headers", function()
{
	var TH = new TypeHandler();

	TH.processTable(sTbl5);
	
	equal(true, true, "Raw Data:" + JSON.stringify(sTbl5));
	equal(sTbl5.Data.ColumnType[0], "Integer", "Col 0 is Integer");
	equal(sTbl5.Data.ColumnType[1], "Integer", "Col 1 is Integer");
	equal(sTbl5.Data.ColumnLabel[0], "Index", "Header 0 is Index");
	equal(sTbl5.Data.ColumnLabel[1], "Data", "Header 1 is Data");
	
});

test("SampleTableParse 6 (Chatfield data) with headers", function()
{
	var TH = new TypeHandler();

	TH.processTable(sTbl6);
	
	equal(true, true, "Raw Data:" + JSON.stringify(sTbl6));

	
});


