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
	"isEditing": false,
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
	"colDelCallBack": function ()
	{
		populateTable(TCIns.AIObj);
		visTypeClickHandler(TCIns.AIObj.Visualizations[TCIns.VisID].Type);
	},
	"rowDelCallBack": function ()
	{
		populateTable(TCIns.AIObj);
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
	
	//Destroy the tablesorter if it exists
	$("#DataTable").trigger("destroy");
	
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
		$("#DTBody tr:last").append(createDelRow(row));
		for(var col in data.Data.Values[row])
		{
			$("#DTBody tr:last").append($("<td>", 
			{
				"text": data.Data.Values[row][col],
				"data": {"cellRow": row, "cellCol": col },
				"click":editCell
			}));
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

		$(this).children("td").data("cellRow", newRow);
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
	cont.append("<br>");
	cont.append($("<span>",{ 
		"id": "hDel" + colNum, 
		"class": "mButton",
		"text": "DEL",
		"click": deleteColumn,
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

function createDelRow(rowNum)
{
	var cont = $("<td>", { })
	cont.append($("<span>", {
		"text": "DEL",
		"class": "mButton",
		"click": deleteRow,
		"data": { "rowNum": rowNum }
		}));
	return cont;
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

function deleteColumn(event)
{
	var colNum = $(this).data("colNum");

	for(var row in TCIns.AIObj.Data.Values)
	{
		TCIns.AIObj.Data.Values[row].splice(colNum, 1);
	}
	
	TCIns.AIObj.Data.ColumnLabel.splice(colNum, 1);
	TCIns.AIObj.Data.ColumnType.splice(colNum, 1);
	TCIns.AIObj.Data.ColumnUnique.splice(colNum, 1);
	TCIns.AIObj.Data.Cols--;

	TCIns.colDelCallBack();
}
function deleteRow(event)
{
	var rowNum = $(this).data("rowNum");
	
	TCIns.AIObj.Data.Values.splice(rowNum,1);
		
	TCIns.AIObj.Data.Rows--;

	TCIns.rowDelCallBack();
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

function editCell(event)
{
	if(TCIns.isEditing)
	{ return; }
	
	TCIns.isEditing = true;
	
	var cellRow = $(this).data("cellRow");
	var cellCol = $(this).data("cellCol");
	

	$(this).unbind("click");
	
	$(this).empty();
	$(this).append($("<input>", {
		"type": "text",
		"width": "100%",
		"value": TCIns.AIObj.Data.Values[cellRow][cellCol],
		"id": "cellEditor"
		}));
	$(this).append("<br>");
	$(this).append($("<span>", {
		"text": "SAVE",
		"class": "mButton",
		"click": saveCell,
		"data": { "cellRow": cellRow, "cellCol": cellCol , "cellPtr": this }
		}));
}

function saveCell(event)
{
	TCIns.isEditing = false;
	
	var cellRow = $(this).data("cellRow");
	var cellCol = $(this).data("cellCol");
	var cellPtr = $(this).data("cellPtr");
	
	var val = $("#cellEditor").val();
	
	TCIns.AIObj.Data.Values[cellRow][cellCol] = val;
	
	$(cellPtr).empty();
	$(cellPtr).text(val);
	
	$("table").trigger("updateCell", [cellPtr, false]);

	$(cellPtr).bind("click", editCell);
	
	TCIns.dataCallBack();
	
	//Stops propagation of click up to the reattached cell
	return false;
}

