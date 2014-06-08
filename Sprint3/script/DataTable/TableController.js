/*
 *	Table Controller JavaScript
 *
 *
 */
  
TCIns =
{
	"isInit": false,
	"AIObj": {},
	"VisID": -1,
	"titleCallBack": function()
	{
		populateTableSelect();
	},
	"headerCallBack": function ()
	{
		visTypeClickHandler(TCIns.AIObj.Visualizations[TCIns.VisID].Type);
	},
	"selUpdCallBack": function ()
	{
		visTypeClickHandler(TCIns.AIObj.Visualizations[TCIns.VisID].Type);
	},
	"dataCallBack": function()
	{
		visTypeClickHandler(TCIns.AIObj.Visualizations[TCIns.VisID].Type);
	},
	"updCallBack": function() { console.log("CallBack Fired") }	
};

TSConfig =
{
	theme : 'blue',
	headers : { 0 : { sorter: false } },
	cssNone: "DTNone",
	widgets: ["zebra"],
};

function showSelectRows(rList)
{ 	
	$("#DTBody tr").hide();
	
	for(var row in rList)
	{
		$("#DTRow" + rList[row]).show();
	}
}

function showAllRows()
{
	$("#DTBody tr").show();
}

 
function TableSorterInit()
{
	$("#editTitle").click(editTitle);
	$("#saveTitle").click(saveTitle);

	TCIns.isInit = true;
} 
 
function populateTable(data, vis)
{
	if(!TCIns.isInit)
	{
		TableSorterInit()
	}
	
	//Save the reference
	TCIns.AIObj = data;
	//Clear any existing data
	clearTable();
	
	//$("#DataTable").tablesorter(TSConfig);

	$("#TitleLabel").text(data.Data.Caption);
	
	//Populate the header
	$("#DTHead").append("<tr />");
	$("#DTHead tr").append("<td />");
	
	$("#DTHeadEdit").append("<tr />");
	$("#DTHeadEdit tr").append("<th />");
	//Selections matricies
	$("#DTSelMatInd").append("<tr />");
	$("#DTSelMatInd tr").append("<th>Independent</th>");
	
	$("#DTSelMatD1").append("<tr /><");
	$("#DTSelMatD1 tr").append("<th>Dependent</th>");
	
	$("#DTSelMatD2").append("<tr /><");
	$("#DTSelMatD2 tr").append("<th>Dependent</th>");
	
	for(var hItem in data.Data.ColumnLabel)
	{
		$("#DTHead tr").append(createHeaderLabel(hItem));
		$("#DTHeadEdit tr").append(createHeaderEditor(hItem));
		
		$("#DTSelMatInd tr").append(createRadio("Ind", hItem, false));
		$("#DTSelMatD1 tr").append(createRadio("D1", hItem, true));
		$("#DTSelMatD2 tr").append(createRadio("D2", hItem, true));
	}
  
	//Populate the body
	for(var row in data.Data.Values)
	{
		$("#DTBody").append($("<tr>", {
			"id": "DTRow" + row,
			"data": { "rowNum" : row }
		}));
		$("#DTBody tr:last").append("<td><span class=\"mButton\">DEL</span></td>");
		for(var col in data.Data.Values[row])
		{
			$("#DTBody tr:last").append("<td>" + data.Data.Values[row][col] + "</td>")
		}
	}
	//Enable Sorting
	$("#DataTable").tablesorter(TSConfig);
	$("#DataTable").bind("sortEnd", reSortData);
	
	//$("#DataTable .DTNone").removeClass().addClass("DTNone");
	
}

function reSortData(e, table)
{
	var newData = []
	var newRow = 0;
	$("#DTBody tr").each(function ()
	{
		var rowNum = $(this).data("rowNum");
		newData.push( TCIns.AIObj.Data.Values[rowNum]);
		
		$(this).data("rowNum", newRow);
		newRow+=1;
	});
	
	TCIns.AIObj.Data.Values = newData;
	
	TCIns.dataCallBack();
	
}

function updateTableVis(visType)
{
	$("#DTSelMatInd").show();
	$("#DTSelMatD1").show();
	$("#DTSelMatD2").show();
	
	for(var id in TCIns.AIObj.Visualizations)
	{
		if(TCIns.AIObj.Visualizations[id].Type == visType)
		{
			TCIns.VisID = id;
			break
		}
	}
	
	//To set the value it must be passed as an array
	$("input:radio[name=Ind]").val([TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns[0]]);
	$("input:radio[name=D1]").val([TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns[1]]);
	$("input:radio[name=D2]").val([TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns[2]]);
		
	switch(visType)
	{
		case "Bar":
		case "BarHorizontal":
			
		break;
		
		case "Pie":
			$("#DTSelMatD2").hide();
		break;
		
		case "Tree":
		
		break;
		case "Bubble":
		
		break;
		
		case "Line":
		case "Scatter":
		
		break;
		
		default:
		
		
	}
	
	
}

function clearTable()
{
	$("#TitleLabels").empty();
	$("#DTHead").empty();
	$("#DTHeadEdit").empty();
	$("#DTSelMatInd").empty();
	$("#DTSelMatD1").empty();
	$("#DTSelMatD2").empty();
	$("#DTBody").empty();
}

function createHeaderLabel(colNum)
{
	var cont = $("<td>", {});
	
	var label = $("<span>",{ "id": "hLbl" + colNum, "text": TCIns.AIObj.Data.ColumnLabel[colNum] });
	
	cont.append(label)
	
	return cont;
}

function createHeaderEditor(colNum)
{
	
	var cont = $("<th>", { })
	
	cont.append($("<span>",{ 
		"id": "hEdit" + colNum, 
		"class": "mButton",
		"text": "EDIT",
		"click": editHeader,
		"data": { "colNum": colNum }
		}));
	
	var save = $("<span>", { "id": "hEditor" + colNum }).css("display", "none");
	save.append("<input type=\"text\"><br>");	
	save.append($("<span>",{ 
		"id": "hSave" + colNum, 
		"style": {"display": "none"},
		"class": "mButton",
		"text": "SAVE",
		"click": saveHeader,
		"data": { "colNum": colNum }
		}));
		
	cont.append(save);
		
	return cont
}

function createRadio(gName,colNum,isDep)
{
	var cont = $("<th>", { })
	cont.append($("<input>", {
		"type": "radio",
		"disabled": (isDep && TCIns.AIObj.Data.ColumnType[colNum] == "String"),
		"name": gName,
		"value": colNum,
		"class": "DTSelMat",
		"title": (isDep && TCIns.AIObj.Data.ColumnType[colNum] == "String")? "Inappropriate data for a dependent variable": "",
		"click": updateSelMat,
		"data": { "colNum": colNum }
		}));
	return cont;
}



function editHeader(event)
{
	var colNum = $(this).data("colNum")
	
	$("#hEditor"+ colNum +" input").val(TCIns.AIObj.Data.ColumnLabel[colNum]);
	
	//$("#hLbl" + colNum).hide();
	$("#hEdit" + colNum).hide();
	
	$("#hEditor" + colNum).show();
	
	
}
function saveHeader()
{
	var colNum = $(this).data("colNum")
	
	TCIns.AIObj.Data.ColumnLabel[colNum] = $("#hEditor"+ colNum +" input").val();
	
	$("#hLbl" + colNum).text(TCIns.AIObj.Data.ColumnLabel[colNum]);
	$("#hLbl" + colNum).show();
	$("#hEdit" + colNum).show();
	
	$("#hEditor" + colNum).hide();
	TCIns.headerCallBack();
}


function editTitle()
{
	$("#TitleEditor input").val(TCIns.AIObj.Data.Caption);
	$("#TitleLabelContainer").hide();
	$("#TitleEditor").show();
	
}

function saveTitle()
{
	TCIns.AIObj.Data.Caption = $("#TitleEditor input").val().trim();
	
	$("#TitleLabelContainer").show();
	$("#TitleEditor").hide();
	
	$("#TitleLabel").text(TCIns.AIObj.Data.Caption);
	
	TCIns.titleCallBack();
}

function updateSelMat(event)
{
	var Ind = $("input:radio[name=Ind]:checked").val();
	var D1 = $("input:radio[name=D1]:checked").val();
	var D2 = $("input:radio[name=D2]:checked").val();
	
	if($(this).attr("name") != "Ind")
	{
		
		if($(this).attr("name") == "D1" && $(this).val() == TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns[1] && typeof D2 != "undefined")
		{
			$("input:radio[name=D1]").attr("checked", false);
		}
		
		if($(this).attr("name") == "D2" && $(this).val() == TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns[2] && typeof D1 != "undefined")
		{
			$("input:radio[name=D2]").attr("checked", false);
		}
	
	}
	
	var Ind = $("input:radio[name=Ind]:checked").val();
	var D1 = $("input:radio[name=D1]:checked").val();
	var D2 = $("input:radio[name=D2]:checked").val();

	TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns = [];
	TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns.push(Ind);
	
	if(typeof D1 != "undefined")
		TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns.push(D1);
	
	if(typeof D2 != "undefined")
		TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns.push(D2);
	
	
	TCIns.selUpdCallBack();
}
