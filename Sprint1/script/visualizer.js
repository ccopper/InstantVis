//This is our code for the visualizer. 
function Line(dataSet, width, height) {
	this.dataSet = dataSet;
}

Line.prototype.draw = function () {
	console.log('InstantLog!');
};

function Bar (dataSet, width, height) {
	this.dataSet = dataSet;
	this.width = width;
	this.height = height;
}

Bar.prototype.draw = function(divId) {
	console.log('Drawing!')

	xValues = [];
	yValues = [];

	numBars = this.dataSet.length;
	for(var i = 0; i < numBars; i++) {
		xValues[i] = this.dataSet[i][0];
		yValues[i] = this.dataSet[i][1];		
	}

	//Width and height
    var w = this.width;
    var h = this.height;

    var xScale = d3.scale.linear()
    				.domain([0, d3.max(xValues)])
    				.range([0, w]);

    					// ordinal()
         //                    .domain(d3.range(this.dataSet.length))
         //                    .rangeRoundBands([0, w], 0.05);

    var yScale = d3.scale.linear()
                    .domain([0, d3.max(yValues)])
                    .range([0, h]);
 

    console.log("xScale(0): " + xScale(0));
    console.log("xScale(1): " + xScale(1));
    console.log("xScale(2): " + xScale(2));
    console.log("xScale(3): " + xScale(3));

    //Create SVG element
    var svg = d3.select("#" + divId)
                .append("svg")
                .attr("width", w)
                .attr("height", h);

	//Create bars
    svg.selectAll("rect")
    	.data(this.dataSet)
        .enter()
        .append("rect")
        .attr("x", function(d) {
	        return xScale(d[0]);
	    })
	    .attr("y", function(d) {
	        return h - yScale(d[1]);
	    })
	    .attr("width", (w / numBars))//xScale.rangeBand())
	    .attr("height", function(d) {
	        return yScale(d[1]);
	    })
	    .attr("fill", function(d) {
	        return "rgb(0, 0, " + (d[1] * 10) + ")";
	    });

    //Create labels
    svg.selectAll("text")
        .data(this.dataSet)
        .enter()
        .append("text")
        .text(function(d) {
            return d[1];
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i) {
            return xScale(d[0]) + (w / numBars) / 2;
        })
        .attr("y", function(d) {
            return h - yScale(d[1]) + 14;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "white");

        console.log("Done Drawing!");

};


function visualize(dataPackage, parentId) {

	var obj = '{		"Visualizations":		[{			"Type": "Bar",			"DataColumns": [0, 1]		}],		"Data":		{			"ColumnLabel": ["X", "Y"],			"ColumnType": ["Integer", "Integer"],			"Values":				[[0, 0],					[1,	1],				[2,	4],				[3,	9],				[4,	16],				[5,	25],				[6,	36],				[7,	49],				[8,	64],				[9,	81]]		}		}';


	dataPackage = JSON.parse(obj);

	// Get a list of visualization objects based on the provided data.
	var visualizations = extractVisualizations(dataPackage);

	// For each visualization object, create a new <div> element to contain it, then draw the visualization.
	var numVisualizations = visualizations.length;
	for (var i = 0; i < numVisualizations; i++) {
		divId = "vis" + i;
		createDiv(parentId, divId, visualizations[i].width, visualizations[i].height);
		visualizations[i].draw(divId);
	}

	
	// var dataSet = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
 //                            11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];

	// var bar = new Bar(dataSet, width, height);
	// var barId = 'bar';

	// createDiv(parentId,barId,bar.width,bar.height);
	// bar.draw(barId);
}

// Search through the provided data object to instantiate a list
// containing each of the specified visualizations.
function extractVisualizations(dataPackage) {

	var height = 250;
	var width = 600;

	var visList = [];
	var data = [];

	var d = dataPackage;
	var type = "";
	var numValues;

	var columns = [];

	// Determine the total number of visualizations.
	var numVisualizations = d.Visualizations.length;

	// Iterate over each visualization.
	for (var i = 0; i < numVisualizations; i++ ) {
		data = [];
		type = d.Visualizations[i].Type;

		numValues = d.Data.Values.length;

		console.log("columns: " + d.Visualizations.DataColumns);
		console.log("columns (type): " + typeof(d.Visualizations.DataColumns));

		columns = d.Visualizations[i].DataColumns;
		numColumns = columns.length;

		console.log("numValues: " + numValues);
		console.log("numColumns: " + numColumns);

		// Instantiate a visualization of the appropriate type.
		switch(type) {
			case "Line":
				// v = new Line(XXXXXXXXXX, width, height);
				visList.push(v);
				break;
			case "Bar":

				var row = [];
				for (var j = 0; j < numValues; j++) {
					row = [];
					for (var k = 0; k < numColumns; k++) {
						row[k] = d.Data.Values[j][columns[k]];
					}
					console.log("Row: " + row.toString());
					data.push(row);
					console.log(data.toString()); 
				}

				

				v = new Bar(data, width, height);
				visList.push(v);
				break;
			default:
				// The type extracted from the data object did not match any of the defined visualization types.
				console.log("ERROR: Could not match visualization type with definition in visualizer.");
		}
	}

	return visList;

	console.log("come on man");
}

// Insert a new <div> tag into the DOM as a child of the element
// with id parentId and give it an id of newDivId, a width and a height.
function createDiv(parentId, newDivId, width, height) {
	//Find parent and append new div with id specified by newDivId
	var parentDiv = document.getElementById(parentId);
	if(!parentDiv){
		console.log("ERROR: Could not find parent " + parentId + ". No child added.")
		return false;
	}
	var newDiv = document.createElement('div');
	newDiv.setAttribute('id',newDivId);
	newDiv.setAttribute('class','visualization');
	newDiv.style.width= width+"px";
	newDiv.style.height= height+"px";
	parentDiv.appendChild(newDiv);
	return true;
}