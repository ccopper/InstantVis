/*
 *	Table Controller JavaScript
 *
 *
 */
  
TCIns =
{
	"isInit": false,
	"AIObj": {},
	"VisObj" : {},
	"titleCallBack": function()
	{
		populateTableSelect();
	},
	
	"updCallBack": function() { console.log("CallBack Fired") }	
};

TSConfig =
{
	theme : 'blue',
	
	widgets: ["zebra"],
};
 
 
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
	
	//Populate the header and
	$("#DTHead").append("<tr />");
	$("#DTHeadEdit").append("<tr />");
	$("#DTSelMat").append("<tr /><tr /><tr />");
	for(var hItem in data.Data.ColumnLabel)
	{
		$("#DTHead tr").append(createHeaderLabel(hItem));
		$("#DTHeadEdit tr").append(createHeaderEditor(hItem));
		
		$("#DTSelMat tr").append("<th><input type=\"radio\" /></th>");
	}
 
	$("#DTSelMat input[type=radio]").click(updateSelMat);
 
 
	//Populate the body
	for(var row in data.Data.Values)
	{
		$("#DTBody").append("<tr />");
		for(var col in data.Data.Values[row])
		{
			$("#DTBody tr:last").append("<td>" + data.Data.Values[row][col] + "</td>")
		}
	}
	//Enable Sorting
	$("#DataTable").tablesorter(TSConfig);
		
	
}

function clearTable()
{
	$("#TitleLabels").empty();
	$("#DTHead").empty();
	$("#DTHeadEdit").empty();
	$("#DTSelMat").empty();
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
	TCIns.updCallBack();
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
	$(this).parentsUntil("tr").find("input nput[type=radio]").attr("checked", false);
	
	$(this).attr("checked", true);
}

