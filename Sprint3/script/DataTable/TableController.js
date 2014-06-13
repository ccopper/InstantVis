/**
 *	Table Controller JavaScript
 *
 *	@module TableController
 */
/**
 *	Contains properties of the currently drawn table
 *	@property TCIns
 *	@type JSON
 */  
TCIns =
{
	"isInit": false,
	"AIObj": {},
	"VisID": -1,
	"isEditing": false,
	"cellEditing": NaN,
	"needD1": true,
	"needD2": true,
	"titleCallBack": function()
	{
		populateTableSelect();
		visTypeClickHandler(TCIns.AIObj.Visualizations[TCIns.VisID].Type);
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
/**
 *	Contains properties  for TableSorter
 *	@property TSConfit
 *	@type JSON
 */  
TSConfig =
{
	theme : 'blue',
	headers : { 0 : { sorter: false } },
	cssNone: "DTNone",
	widgets: ["zebra"],
};

/**
 *	Initializes the table
 *
 */
function TableSorterInit()
{
	$("#editTitle").click(editTitle);
	$("#saveTitle").click(saveTitle);
	
	$("#editVisTitle").click(editVisTitle);
	$("#saveVisTitle").click(saveVisTitle);
	$("#resetVisTitle").click(resetVisTitle);

	TCIns.isInit = true;
} 

 /**
 *	Uses the provided object to display the table
 *
 *	@param {Object} data	The AI Data object to display
 */
function populateTable(data)
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
	if(data.Data.Caption == "")
	{
		$("#TitleLabel").text("Unlabeled Table");
	} else
	{
		$("#TitleLabel").text(data.Data.Caption);
	}
	
	
	//Populate the header
	$("#DTHead").append("<tr />");
	$("#DTHead tr").append("<td />");
	
	$("#DTHeadEdit").append("<tr />");
	$("#DTHeadEdit tr").append("<th />");
	//Selections matricies
	$("#DTSelMatInd").append("<tr />");
	$("#DTSelMatInd tr").append("<th id=\"IndLbl\">X</th>");
	
	$("#DTSelMatD1").append("<tr /><");
	$("#DTSelMatD1 tr").append("<th id=\"D1Cell\"><span id=\"D1Lbl\" >Y</span></th>");
	
	$("#DTSelMatD2").append("<tr /><");
	$("#DTSelMatD2 tr").append("<th id=\"D2Cell\"><span id=\"D2Lbl\" >Y</span></th>");
	
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
		var rowEle = $("<tr>", {
			"id": "DTRow" + row,
			"data": { "rowNum" : row }
		}).hover(function ()
		{
			$(this).children("td:first-child").children().show();
		}, function ()
		{
			$(this).children("td:first-child").children().hide();
		});
		
		$("#DTBody").append(rowEle);
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

 /**
 *	Called when the colors change  
 *  
 */
function tableColorUpdate()
{
	var c1 = visColors[0];
	var c2 = visColors[1];
	
	$("#DTSelMatD1 th").css("background-color", "hsla(" + c1.hue + "," + c1.saturation + "," + c1.lightness + ",1.0)");
	
	if(!TCIns.needD2)
	{
		$("#DTSelMatD2 th").css("background-color", "hsla(" + c2.hue + "," + c2.saturation + "," + c2.lightness + ",1.0)");
	} else
	{
		$("#DTSelMatD2 th").css("background-color", "hsla(0,0,0,0)");
	}

}

 /**
 *	Called when TableSorter sorts the table.  
 *  This resorts the underlying structure to match the table and then orders a redraw.
 *
 *	@param {Object} e	jQuery Event
 *	@param {Object} table	The table element
 */
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

 /**
 *	Called when the vis changes 
 *  The selection matrix is updated to reflect the new vis.
 *
 *	@param {String} visType	The vis type requested (Bar, Line, Pie, etc)
 */
function updateTableVis(visType)
{

	$("#DTSelMatInd").show();
	$("#DTSelMatD1").show();
	$("#DTSelMatD2").show();
	
	$("#D1Cell").css("border-radius", "0px 0px 0px 0px");
	
	for(var id in TCIns.AIObj.Visualizations)
	{
		if(TCIns.AIObj.Visualizations[id].Type == visType)
		{
			TCIns.VisID = id;
			break
		}
	}
	
	$("#VisLabel").text(TCIns.AIObj.Visualizations[TCIns.VisID].VisTitle);

	
	//To set the value it must be passed as an array
	$("input:radio[name=Ind]").val([TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns[0]]);
	$("input:radio[name=D1]").val([TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns[1]]);
	$("input:radio[name=D2]").val([TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns[2]]);
		
	switch(visType)
	{
		case "Bar":
		case "BarHorizontal":
		case "Line":
		case "Scatter":
			$("#IndLbl").text("X");
			$("#D1Lbl").text("Y1");
			$("#D2Lbl").text("Y2");

			TCIns.needD2 = false;
			TCIns.needD1 = true;
		break;
		
		case "Tree":
		case "Pie":
			$("#D1Cell").css("border-radius", "0px 0px 0px 5px");
			$("#DTSelMatD2").hide();
			TCIns.needD2 = false;
			TCIns.needD1 = false;
		break;
		
		case "Bubble":
			$("#IndLbl").text("X");
			$("#D1Lbl").text("Y");
			$("#D2Lbl").text("SIZE");

			TCIns.needD2 = true;
			TCIns.needD1 = true;
		break;
		
		default:
	}
	
	tableColorUpdate()
}
 /**
 *	Removes all existing data from the table
 *
 */
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
 /**
 *	Creates a Header label item.  This is use in the construction of the table.
 *
 *	@param {Inteer} colNum	The Column Number this will be placed in
 * 	@returns {Element} The constructed element.
 */
function createHeaderLabel(colNum)
{
	var cont = $("<td>", {});
	
	var label = $("<span>",
	{ 
		"id": "hLbl" + colNum, 
		"text": TCIns.AIObj.Data.ColumnLabel[colNum] 
	});
	
	cont.append(label);
	
	return cont;
}
 /**
 *	Creates a Header label item.  This is use in the construction of the table.
 *
 *	@param {Integer} colNum	The Column Number this will be placed in
 * 	@returns {Element} The constructed element.
 */
function createHeaderEditor(colNum)
{
	
	var cont = $("<th>", 
	{ 
		"data": { "colNum": colNum }
	});
	cont.hover(function ()
	{
		var col = $(this).data("colNum");
		$("#hDel" + col).css("visibility", "visible");
	}, function ()
	{
		var col = $(this).data("colNum");
		$("#hDel" + col).css("visibility", "hidden");
	});
	
	cont.append($("<span>",
	{ 
		"id": "hEdit" + colNum,
		"class": "mButton",
		"text": "EDIT",
		"click": editHeader,
		"data": { "colNum": colNum }
	}));
	cont.append("<br>");
	cont.append($("<span>",
	{ 
		"id": "hDel" + colNum, 
		"style": "visibility: hidden;",
		"class": "mButton",
		"text": "DEL",
		"click": deleteColumn,
		"data": { "colNum": colNum }
	}));
	
	var save = $("<span>", { "id": "hEditor" + colNum }).css("display", "none");
	save.append("<input type=\"text\"><br>");	
	save.append($("<span>",
	{ 
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
/**
 *	Creates the cell with del button for the ros
 *
 *	@param {Integer} rowNum	The Row Number this will be placed in
 * 	@returns {Element} The constructed element.
 */
function createDelRow(rowNum)
{
	var cont = $("<td>", { })
	cont.append($("<span>", 
	{
		"text": "DEL",
		"class": "mButton",
		"style": "display: none;",
		"click": deleteRow,
		"data": { "rowNum": rowNum }
	}));
	return cont;
}

 /**
 *	Creates a radio item.  This is use in the construction of the table.
 *
 *	@param {String} gName The group name for the radio 
 *	@param {Integer} colNum	The Column Number this will be placed in
 *  @param {bool} isDep This radio is for a dependent data column
 * 	@returns {Element} The constructed element.
 */
function createRadio(gName,colNum,isDep)
{
	var cont = $("<th>", { })
	cont.append($("<input>", 
	{
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

/**
 *	Generates a default title for a vis if one has not be provided.
 *
 */
function getDefaulVisTitle()
{
	var visTitle;
	var visualization = TCIns.AIObj.Visualizations[TCIns.VisID];

	if (visualization.DataColumns.length == 2) // one independent and one dependent 
	{
		visTitle = "" + TCIns.AIObj.Data.ColumnLabel[visualization.DataColumns[1]] + " vs " + 
		TCIns.AIObj.Data.ColumnLabel[visualization.DataColumns[0]];
	}
	else if (visualization.DataColumns.length == 3) // one independent and two dependents
	{
		visTitle = "" +  TCIns.AIObj.Data.ColumnLabel[visualization.DataColumns[1]] + " and " + 
					TCIns.AIObj.Data.ColumnLabel[visualization.DataColumns[2]] + " vs " + 
					TCIns.AIObj.Data.ColumnLabel[visualization.DataColumns[0]];
	}
	else // some other combo of vars, just use the independent var name as the title
	{
		visTitle = "" + TCIns.AIObj.Data.ColumnLabel[visualization.DataColumns[0]];
	}
	visTitle = visTitle.trim();	
	console.log("\"" + visTitle + "\"");
	if(visTitle == "vs" || visTitle == "and  vs" || visTitle == "")
	{
		visTitle = "Unlabeled Visualization";
	}
			
	return visTitle;
}


/**
 *	Event handler to delete a column.
 *
 *	@param {Event} event jQuery event object
 */
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
/**
 *	Event handler to delete a column.
 *
 *	@param {Event} event jQuery event object
 */
function deleteRow(event)
{
	var rowNum = $(this).data("rowNum");
	
	TCIns.AIObj.Data.Values.splice(rowNum,1);
		
	TCIns.AIObj.Data.Rows--;

	TCIns.rowDelCallBack();
}
/**
 *	Event handler to edit a header.
 *
 *	@param {Event} event jQuery event object
 */
function editHeader(event)
{
	var colNum = $(this).data("colNum")
	
	$("#hEditor"+ colNum +" input").val(TCIns.AIObj.Data.ColumnLabel[colNum]);
	
	//$("#hLbl" + colNum).hide();
	$("#hEdit" + colNum).hide();
	
	$("#hEditor" + colNum).show();
	
	
}
/**
 *	Event handler to save a header.
 *
 *	@param {Event} event jQuery event object
 */
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

/**
 *	Event handler to edit title.
 *
 *	@param {Event} event jQuery event object
 */
function editTitle()
{
	$("#TitleEditor input").val(TCIns.AIObj.Data.Caption);
	$("#TitleLabelContainer").hide();
	$("#TitleEditor").show();
	
}
/**
 *	Event handler to save title.
 *
 *	@param {Event} event jQuery event object
 */
function saveTitle()
{
	TCIns.AIObj.Data.Caption = $("#TitleEditor input").val().trim();
	
	$("#TitleLabelContainer").show();
	$("#TitleEditor").hide();
	
	if(TCIns.AIObj.Data.Caption == "")
	{
		$("#TitleLabel").text("Unlabeled Table");
	} else
	{
		$("#TitleLabel").text(TCIns.AIObj.Data.Caption);
	}
	
	TCIns.titleCallBack();
}

/**
 *	Event handler for radio clicks.
 *
 *	@param {Event} event jQuery event object
 */
function updateSelMat(event)
{
	var Ind = $("input:radio[name=Ind]:checked").val();
	var D1 = $("input:radio[name=D1]:checked").val();
	var D2 = $("input:radio[name=D2]:checked").val();
	
	if($(this).attr("name") != "Ind")
	{
		
		if(	$(this).attr("name") == "D1" && 
			$(this).val() == TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns[1] && 
			(typeof D2 != "undefined" || !TCIns.needD1) &&
			!TCIns.needD2)
		{
			$("input:radio[name=D1]").attr("checked", false);
		}
		
		if(	$(this).attr("name") == "D2" && 
			$(this).val() == TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns[2] && 
			typeof D1 != "undefined" && 
			!TCIns.needD2 )
		{
			$("input:radio[name=D2]").attr("checked", false);
		}
	
	}
	
	var Ind = parseInt($("input:radio[name=Ind]:checked").val());
	var D1 = parseInt($("input:radio[name=D1]:checked").val());
	var D2 = parseInt($("input:radio[name=D2]:checked").val());

	TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns = [];
	TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns.push(Ind);
	
	if(!isNaN(D1))
		TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns.push(D1);
	
	if(!isNaN(D2))
		TCIns.AIObj.Visualizations[TCIns.VisID].DataColumns.push(D2);
	
	
	if(typeof TCIns.AIObj.Visualizations[TCIns.VisID]["isDefault"] == "undefined" || TCIns.AIObj.Visualizations[TCIns.VisID]["isDefault"] == true)
	{
		var visTitle = getDefaulVisTitle();
		TCIns.AIObj.Visualizations[TCIns.VisID].VisTitle = visTitle;
		$("#VisLabel").text(visTitle);
	}
	

	
	TCIns.selUpdCallBack();
}

/**
 *	Event handler to edit a cell.
 *
 *	@param {Event} event jQuery event object
 */
function editCell(event)
{

	if(TCIns.isEditing)
	{ 
		var cellRow = $(TCIns.cellEditing).data("cellRow");
		var cellCol = $(TCIns.cellEditing).data("cellCol");
		
	
		$(TCIns.cellEditing).empty();
		$(TCIns.cellEditing).text(TCIns.AIObj.Data.Values[cellRow][cellCol]);
		
		$(TCIns.cellEditing).bind("click", editCell);
		
	}
	
	TCIns.cellEditing = $(this);
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

/**
 *	Event handler to save cell.
 *
 *	@param {Event} event jQuery event object
 */
function saveCell(event)
{
	TCIns.isEditing = false;
	
	var cellRow = $(this).data("cellRow");
	var cellCol = $(this).data("cellCol");
	var cellPtr = $(this).data("cellPtr");
	
	var val = $("#cellEditor").val();
	
	if(TCIns.AIObj.Data.ColumnType[cellCol] != "String" && isNaN(parseFloat(val)))
	{
		
		$("#dWarn").css("top", event.pageY).css("left", event.pageX).show().fadeOut(2000);
			
			
		return;
	} else if(TCIns.AIObj.Data.ColumnType[cellCol] != "String" && !isNaN(parseFloat(val)))
	{
		val = parseFloat(val);
	}

	TCIns.AIObj.Data.Values[cellRow][cellCol] = val;	
	
	$(cellPtr).empty();
	$(cellPtr).text(val);
	
	$("table").trigger("updateCell", [cellPtr, false]);

	$(cellPtr).bind("click", editCell);
	
	$("#DTRow" + cellRow).children("td:first-child").children().hide();	
	
	TCIns.dataCallBack();
	
	//Stops propagation of click up to the reattached cell
	return false;
}
/**
 *	Event handler to reset the Vis title to defaults.
 *
 *	@param {Event} event jQuery event object
 */
function resetVisTitle()
{
	TCIns.AIObj.Visualizations[TCIns.VisID]["isDefault"] = true;
	
	var visTitle = getDefaulVisTitle();
	TCIns.AIObj.Visualizations[TCIns.VisID].VisTitle = visTitle;
	$("#VisLabel").text(visTitle);
	
	TCIns.titleCallBack();
}
/**
 *	Event handler to edit the vis title
 *
 *	@param {Event} event jQuery event object
 */
function editVisTitle()
{
	$("#VisTitleEditor input").val(TCIns.AIObj.Visualizations[TCIns.VisID].VisTitle);
	$("#VisLabelContainer").hide();
	$("#VisTitleEditor").show();
}

/**
 *	Event handler to save the vis title
 *
 *	@param {Event} event jQuery event object
 */
function saveVisTitle()
{
	var visTitle = $("#VisTitleEditor input").val().trim();
	
	$("#VisLabelContainer").show();
	$("#VisTitleEditor").hide();
	
	if(visTitle == "")
	{
		visTitle = getDefaulVisTitle();
		TCIns.AIObj.Visualizations[TCIns.VisID].VisTitle = visTitle;
		$("#VisLabel").text(visTitle);
		
		TCIns.AIObj.Visualizations[TCIns.VisID]["isDefault"] = true;
		
	} else
	{
		if(visTitle != TCIns.AIObj.Visualizations[TCIns.VisID].VisTitle)
		{
			TCIns.AIObj.Visualizations[TCIns.VisID]["isDefault"] = false;
		}
		
		TCIns.AIObj.Visualizations[TCIns.VisID].VisTitle = visTitle;
		$("#VisLabel").text(visTitle);
	}
	
	TCIns.titleCallBack();
}


