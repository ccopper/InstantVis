//This is our code for the visualizer. 
function Scatter(dataSet, width, height) {
	this.dataSet = dataSet;
	this.width = width;
	this.height = height;
}

Scatter.prototype.draw = function(divId) 
{
console.log('InstantLog!');


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

    svg.selectAll("circle")
        .data(this.dataSet)
        .enter()
        .append("circle")
        .attr({
            cx: function(d) { return xScale(d[0]); },
            cy: function(d) { return yScale(d[1]); },
            r: 3//function(d) { return rScale(d[1]); }
            //fill: function(d) { return "rgb(0,0," + (d*10) + ")"; }
        });

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
}

function Line(dataSet, width, height) {
	this.dataSet = dataSet;
	this.width = width;
	this.height = height;
}

Line.prototype.draw = function (divId) {
	console.log('InstantLog!');


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


    console.log("A");

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

    svg.selectAll("circle")
        .data(this.dataSet)
        .enter()
        .append("circle")
        .attr({
            cx: function(d) { return xScale(d[0]); },
            cy: function(d) { return yScale(d[1]); },
            r: 3//function(d) { return rScale(d[1]); }
            //fill: function(d) { return "rgb(0,0," + (d*10) + ")"; }
        });

	console.log("B");

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

    console.log("C");

    svg.append("path")
    	.attr("class", "line")
    	.attr("d", line(this.dataSet));  

    console.log("D");
};

function Bar (dataSet, width, height) {
	this.dataSet = dataSet;
	this.width = width;
	this.height = height;
}

Bar.prototype.draw = function(divId) {
	// console.log('Drawing!')

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

    					// ordinal()
         //                    .domain(d3.range(this.dataSet.length))
         //                    .rangeRoundBands([0, w], 0.05);

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
    				// .x(function(d) {
    				// 	return xAxisLineCoords[0];
    				// })
    				// .y(function(d) {
    				// 	return yScale(d[1]);
    				// });				

    // console.log("xScale(0): " + xScale(0));
    // console.log("xScale(1): " + xScale(1));
    // console.log("xScale(2): " + xScale(2));
    // console.log("xScale(3): " + xScale(3));

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

    // console.log("Done Drawing!");

};


function visualize(dataPackage, parentId) {

	var dataPackage = {		
		"Visualizations":		
			[{			
				"Type": "Bar",			
				"DataColumns": [0, 1]		
			},{			
				"Type": "Line",			
				"DataColumns": [0, 1]		
			},{			
				"Type": "Scatter",			
				"DataColumns": [0, 1]		
			}],		
		"Data":		
			{			
				"ColumnLabel": ["X", "Y"],			
				"ColumnType": ["Integer", "Integer"],			
				"Values":				
					[[0, 0],					
					[1,	1],				
					[2,	4],				
					[3,	9],				
					[4,	16],				
					[5,	25],				
					[6,	15],				
					[7,	21],				
					[8,	23],				
					[9,	15]]		
			}		
		};

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
	return;
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

		// console.log("columns: " + d.Visualizations.DataColumns);
		// console.log("columns (type): " + typeof(d.Visualizations.DataColumns));

		columns = d.Visualizations[i].DataColumns;
		numColumns = columns.length;


		// Instantiate a visualization of the appropriate type.
		switch(type) {
			case "Line":

				// Pull out visualization specific data according to AI instructions.
				var row = [];
				for (var j = 0; j < numValues; j++) {
					row = [];
					for (var k = 0; k < numColumns; k++) {
						row[k] = d.Data.Values[j][columns[k]];
					}
					data.push(row);
				}

				// Create new Line object and append it to the list of visualizations.
				v = new Line(data, width, height);
				visList.push(v);
				break;
			case "Bar":

				// Pull out visualization specific data according to AI instructions.
				var row = [];
				for (var j = 0; j < numValues; j++) {
					row = [];
					for (var k = 0; k < numColumns; k++) {
						row[k] = d.Data.Values[j][columns[k]];
					}
					data.push(row);
				}

				// Create new Bar object and append it to the list of visualizations.
				v = new Bar(data, width, height);
				visList.push(v);
				break;
			case "Scatter":

				// Pull out visualization specific data according to AI instructions.
				var row = [];
				for (var j = 0; j < numValues; j++) {
					row = [];
					for (var k = 0; k < numColumns; k++) {
						row[k] = d.Data.Values[j][columns[k]];
					}
					data.push(row);
				}

				// Create new Bar object and append it to the list of visualizations.
				v = new Scatter(data, width, height);
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



/**
 *  Insert a new <div> tag into the DOM as a child of the element
 *  with id parentId and give it an id of newDivId, a width and a height.
 *
 *  @method parseHTML
 *  @param {string} parentId        The id of the element into which to insert the new <div>
 *  @param {string} newDivId        The id of the new <div>
 *  @param {int}                    The width of the new <div>
 *  @param {int}                    The height of the new <div>
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