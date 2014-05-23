//This is our code for the visualizer. 

function Area(dataSet, width, height) {
    this.dataSet = dataSet;
    this.width = width;
    this.height = height;
}

Area.prototype.draw = function(divId)
{
    // TODO: Make the number of ticks on an axis somehow dynamic.

    var w = this.width;
    var h = this.height;
    var padding = 20;

    var numDataPoints = this.dataSet.length;

    var xScale = d3.scale.linear()
                 .domain([0, d3.max(this.dataSet, function(d) { return d[0]; })])
                 .range([padding, w - padding*2]);

    var yScale = d3.scale.linear()
                        .domain([0, d3.max(this.dataSet, function(d) { return d[1]; })])
                        .range([h - padding, padding]);

    var rScale = d3.scale.linear()
                        .domain([0, d3.max(this.dataSet, function(d) {return d[1]; })])
                        .range([2, 5]);

    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(5);

    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(5);

    var area = d3.svg.area()
                    .x(function(d) { return xScale(d[0]); })
                    .y0(yScale(0))
                    .y1(function(d) { return yScale(d[1]); });

    var svg = d3.select("#" + divId)
            .append("svg")
            .attr("width", w)
            .attr("height", h);

    svg.append("g")
        .attr({
            class: "axis",
            transform: "translate(0," + (h-padding) + ")"
            })
        .call(xAxis);

    svg.append("g")
        .attr({
            class: "y-axis",
            transform: "translate(" + padding + ",0)"
            })
        .call(yAxis); 

    svg.append("path")
        .datum(this.dataSet)
        .attr("class", "area")
        .attr("d", area);
}

function Scatter(dataSet, width, height) {
	this.dataSet = dataSet;
	this.width = width;
	this.height = height;
}

Scatter.prototype.draw = function(divId) 
{

	// TODO: Make the number of ticks on an axis somehow dynamic.

    var w = this.width;
    var h = this.height;
    var padding = 20;

    var xScale = d3.scale.linear()
                 .domain([0, d3.max(this.dataSet, function(d) { return d[0]; })])
                 .range([padding, w - padding*2]);

    var yScale = d3.scale.linear()
                        .domain([0, d3.max(this.dataSet, function(d) { return d[1]; })])
                        .range([h - padding, padding]);

    var rScale = d3.scale.linear()
                        .domain([0, d3.max(this.dataSet, function(d) {return d[1]; })])
                        .range([2, 5]);

    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(5);

    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(5);

    var svg = d3.select("#" + divId)
            .append("svg")
            .attr("width", w)
            .attr("height", h);

    // Draw the x-axis.
    svg.append("g")
        .attr({
            class: "axis",
            transform: "translate(0," + (h-padding) + ")"
            })
        .call(xAxis);

    // Draw the y-axis.
    svg.append("g")
        .attr({
            class: "y-axis",
            transform: "translate(" + padding + ",0)"
            })
        .call(yAxis);

    // Draw the scatter plot points.
    svg.selectAll("circle")
        .data(this.dataSet)
        .enter()
        .append("circle")
        .attr({
            cx: function(d) { return xScale(d[0]); },
            cy: function(d) { return yScale(d[1]); },
            r: 3,
            fill: "black"
        })
        // When moused over, change size and shape of point.
        .on("mouseover",function() {
            d3.select(this)
                .attr("fill", "orange")
                .attr("r", 6);
        })
        // When mouse leaves, revert the size and shape back to the default.
        .on("mouseout", function(d) {
            d3.select(this)
                .attr("fill", "black")
                .attr("r", 3);
        }); 
}

function Line(dataSet, width, height, showPoints) {
	this.dataSet = dataSet;
	this.width = width;
	this.height = height;
    this.showPoints = showPoints; // Boolean (show points?)
}

Line.prototype.draw = function (divId) {

	// TODO: Make the number of ticks on an axis somehow dynamic.

    var w = this.width;
    var h = this.height;
    var padding = 20;

    var xScale = d3.scale.linear()
                 .domain([0, d3.max(this.dataSet, function(d) { return d[0]; })])
                 .range([padding, w - padding*2]);

    var yScale = d3.scale.linear()
                        .domain([0, d3.max(this.dataSet, function(d) { return d[1]; })])
                        .range([h - padding, padding]);

    var rScale = d3.scale.linear()
                        .domain([0, d3.max(this.dataSet, function(d) {return d[1]; })])
                        .range([2, 5]);

    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(5);

    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(5);

    var line = d3.svg.line()
    				.x(function(d) {
    					return xScale(d[0]);
    				})
    				.y(function(d) {
    					return yScale(d[1]);
    				});

    var svg = d3.select("#" + divId)
            .append("svg")
            .attr("width", w)
            .attr("height", h);

    svg.append("g")
        .attr({
            class: "axis",
            transform: "translate(0," + (h-padding) + ")"
            })
        .call(xAxis);

    svg.append("g")
        .attr({
            class: "y-axis",
            transform: "translate(" + padding + ",0)"
            })
        .call(yAxis); 

    svg.append("path")
        .attr("class", "line")
        .attr("d", line(this.dataSet));

    if (this.showPoints) {
        svg.selectAll("circle")
            .data(this.dataSet)
            .enter()
            .append("circle")
            .attr({
                cx: function(d) { return xScale(d[0]); },
                cy: function(d) { return yScale(d[1]); },
                r: 3,
                fill: "black"
            })
            .on("mouseover",function() {
                d3.select(this)
                    .attr("fill", "orange")
                    .attr("r", 6);
            })
            .on("mouseout", function(d) {
                d3.select(this)
                    .attr("fill", "black")
                    .attr("r", 3);
            });
    }
};

function Bar (dataSet, width, height) {
	this.dataSet = dataSet;
	this.width = width;
	this.height = height;
}

Bar.prototype.draw = function(divId) {

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
    var padding = 20;
    var barPadding = 5;
    var barWidth = ((w - 2*padding) / numBars) - barPadding;

    var xScale = d3.scale.linear()
    				.domain([0, d3.max(xValues)])
    				.range([padding + barPadding, w - (padding + barPadding + barWidth)]);

    var yScale = d3.scale.linear()
                    .domain([0, d3.max(yValues)])
                    .range([h - padding, padding]);
 
 	var xAxis = d3.svg.axis()
 					.scale(xScale)
 					.orient("bottom")
 					.ticks(numBars);

 	var yAxis = d3.svg.axis()
 					.scale(yScale)
 					.orient("left")
 					.ticks(5);

 	var xAxisLineCoords = [[padding,h-padding],[w-padding,h-padding]]

 	var xAxisLine = d3.svg.line(xAxisLineCoords);

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
	        return (yScale(d[1]));
	    })
	    .attr("width", barWidth)//xScale.rangeBand())
	    .attr("height", function(d) {
	        return h - yScale(d[1]) - padding;
	    })
	    .attr("fill", function(d) {
	        return "rgb(0, 0, " + (d[1] * 10) + ")";
	    })
        .on("mouseover",function() {
            d3.select(this)
                .attr("fill", "orange");
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .attr("fill", "rgb(0, 0, " + (d[1] * 10) + ")");
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
            return xScale(d[0]) + (w / numBars - barPadding) / 2;
        })
        .attr("y", function(d) {
            return yScale(d[1]) + 14;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "white");

    // Create x-axis
    svg.append("g")
    	.attr({
    		class: "x-axis",
    		"transform": "translate(" + (barWidth/2) + "," + (h - padding) + ")"
    	})
    	.call(xAxis);

   	// Create y-axis
    svg.append("g")
    	.attr({
    		class: "y-axis",
    		"transform": "translate(" + padding + ",0)"
    	})
    	.call(yAxis);

	svg.append("path")
    	.attr("class", "line")
    	.attr("d", xAxisLine(xAxisLineCoords)); 
};


function visualize(dataPackage, parentId) {

	// var dataPackage = {		
	// 	"Visualizations":		
	// 		[{			
	// 			"Type": "Bar",			
	// 			"DataColumns": [0, 1]		
	// 		},{			
	// 			"Type": "Line",			
	// 			"DataColumns": [0, 1]		
	// 		},{			
	// 			"Type": "Scatter",			
	// 			"DataColumns": [0, 1]		
	// 		},{         
 //                "Type": "Area",          
 //                "DataColumns": [0, 1]       
 //            }],		
	// 	"Data":		
	// 		{			
	// 			"ColumnLabel": ["X", "Y"],			
	// 			"ColumnType": ["Integer", "Integer"],			
	// 			"Values":				
	// 				[[0, 0],					
	// 				[1,	1],				
	// 				[2,	4],				
	// 				[3,	9],				
	// 				[4,	16],				
	// 				[5,	25],				
	// 				[6,	15],				
	// 				[7,	21],				
	// 				[8,	23],				
	// 				[9,	15]]		
	// 		}		
	// 	};

	// Get a list of visualization objects based on the provided data.
	var visualizations = extractVisualizations(dataPackage);

	// For each visualization object, create a new <div> element to contain it, then draw the visualization.
	var numVisualizations = visualizations.length;
	for (var i = 0; i < numVisualizations; i++) {
		divId = "vis" + i;
		createDiv(parentId, divId, visualizations[i].width, visualizations[i].height);
		visualizations[i].draw(divId);
	}

	return;
}


// Search through the provided data object to instantiate a list
// containing each of the specified visualizations.
function extractVisualizations(dataPackage) {

	var height = 250;
	var width = 600;

	var visList = [];
	var type = "";
	var columns = [];

	// Determine the total number of visualizations.
	var numVisualizations = dataPackage.Visualizations.length;
    var values = dataPackage.Data.Values;

	// Iterate over each visualization.
	for (var i = 0; i < numVisualizations; i++ ) {
		type = dataPackage.Visualizations[i].Type;
		columns = dataPackage.Visualizations[i].DataColumns;

		// Instantiate a visualization of the appropriate type and append it to the list of visualizations.
		switch(type) {
			case "Line":
				v = new Line(getData(columns, values), width, height, true);
				visList.push(v);
				break;

			case "Bar":
				v = new Bar(getData(columns, values), width, height);
				visList.push(v);
				break;

			case "Scatter":
				v = new Scatter(getData(columns, values), width, height);
				visList.push(v);
				break;	

            case "Area":
                v = new Area(getData(columns, values), width, height);
                visList.push(v);
                break;  

			default:
				// The type extracted from the data object did not match any of the defined visualization types.
				console.log("ERROR: Could not match visualization type with definition in visualizer.");
		}
	}

	return visList;
}

/**
 *  Pull out and return from a 2-dimensional array of values some number of columns from that array.
 *
 *  @method getData
 *  @param [int*] columns           A list of indices indicting which columns to extract from values.
 *  @param [[int*]*] values         The 2-dimensional array of data values from which to extract data.
 *
 */
function getData(columns, values)
{
    var data = []; // The dataset extracted from values.
    var row = [];
    var numRows = values.length;
    var numColumns = columns.length;

    // For every row in values...
    for (var j = 0; j < numRows; j++) {
        // Create a new row to add to the extracted dataset.
        row = [];
        // For every column that needs to be extracted...
        for (var k = 0; k < numColumns; k++) {
            // Add the appropriate value from the column to the new row.
            row[k] = values[j][columns[k]];
        }
        // Add the row to the extracted dataset.
        data.push(row);
    }

    return data;
}

/**
 *  Insert a new <div> tag into the DOM as a child of the element
 *  with id parentId and give it an id of newDivId, a width and a height.
 *
 *  @method parseHTML
 *  @param {string} parentId        The id of the element into which to insert the new <div>
 *  @param {string} newDivId        The id of the new <div>
 *  @param {int} width              The width of the new <div>
 *  @param {int} height             The height of the new <div>
 *
 */
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
	newDiv.style.display = "none";
	parentDiv.appendChild(newDiv);
	return true;
}