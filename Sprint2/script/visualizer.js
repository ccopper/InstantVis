//This is our code for the visualizer. 

var globalPadding = 25;


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
                 .range([globalPadding, w - globalPadding]);

    var yScale = d3.scale.linear()
                        .domain([0, d3.max(this.dataSet, function(d) { return d[1]; })])
                        .range([h - globalPadding, globalPadding]);

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
            transform: "translate(0," + (h-globalPadding) + ")"
            })
        .call(xAxis);

    svg.append("g")
        .attr({
            class: "y-axis",
            transform: "translate(" + globalPadding + ",0)"
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
                 .range([globalPadding, w - globalPadding]);

    var yScale = d3.scale.linear()
                        .domain([0, d3.max(this.dataSet, function(d) { return d[1]; })])
                        .range([h - globalPadding, globalPadding]);

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
            transform: "translate(0," + (h-globalPadding) + ")"
            })
        .call(xAxis);

    // Draw the y-axis.
    svg.append("g")
        .attr({
            class: "y-axis",
            transform: "translate(" + globalPadding + ",0)"
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


/**
 *  Create a Line object.
 *
 *  @method Line
 *  @param [[int*]*] dataSet        The 2-dimensional array of data values comprising the Line graph's data.
 *  @param int width                The width of the visualization in pixels.
 *  @param int height               The height of the visualization in pixels.
 *  @param Boolean showPoints       Whether or not points should be displayed on the lines.
 *
 */
function Line(dataSet, width, height, showPoints) {
	this.dataSet = dataSet;
	this.width = width;
	this.height = height;
    this.showPoints = showPoints; // Boolean (show points?)
}

Line.prototype.draw = function (divId) {

	// TODO: Make the number of ticks on an axis somehow dynamic.

    console.log("DRAWING LINE CHART");

    console.log("this.dataSet: " + this.dataSet.toString());

    var w = this.width;
    var h = this.height;
    var defaultRadius = 3;
    var highlightRadius = 6;
    var padding = 20;
    var data = [];

    var numDataSets = this.dataSet[0].length;
    var numValues = this.dataSet.length;

    console.log("numDataSets: " + numDataSets);
    console.log("numValues: " + numValues);

    var xScale = d3.scale.linear()
                 .domain([0, d3.max(this.dataSet, function(d) { return d[0]; })])
                 .range([globalPadding, w - globalPadding])
                 .clamp(true);

    var maxY = 0;

    for (var i = 1; i < numDataSets; i++) {
        for (var j = 0; j < numValues; j++) {
            console.log("this.dataSet[" + j + "][" + i + "]: " + this.dataSet[j][i]);
            if (this.dataSet[j][i] > maxY) {
                maxY = this.dataSet[j][i];
            }
        }
    }

    console.log("maxY: " + maxY);

    var yScale = d3.scale.linear()
                        .domain([0, maxY])
                        .range([h - globalPadding, globalPadding])
                        .clamp(true);

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

    var lineNoScale = d3.svg.line()
            .x(function(d) {
                return d[0];
            })
            .y(function(d) {
                return d[1];
            }); 

    var svg = d3.select("#" + divId)
            .append("svg")
            .attr("width", w)
            .attr("height", h);


    var focus = svg.append("g")
          .attr("class", "focus")
          .style("display", "none");

    var topLinePoint = [0, globalPadding];
    var bottomLinePoint = [0, h-globalPadding];
    var lineData = [topLinePoint, bottomLinePoint];

    focus.append("path")
        .attr("class", "guideline")
        .attr("style", "stroke: gray")
        .attr("d", lineNoScale(lineData));

    // focus.append("text")
    //       .attr("x", 9)
    //       .attr("dy", ".35em");

    

    function mousemove() {
        
        var mouseX = d3.mouse(this)[0];

        if (mouseX >= globalPadding) {
            focus.attr("transform", "translate(" + d3.mouse(this)[0] + "," + 0 + ")");
        }

        console.log("mouseX: " + mouseX);
        
        svg.selectAll(".circle-highlight")
            .attr("display", function() {
                console.log("cx: " + this.getAttribute("cx"));
                if ((this.getAttribute("cx") < mouseX + defaultRadius) && (this.getAttribute("cx") > mouseX - defaultRadius)) {
                    focus.attr("transform", "translate(" + this.getAttribute("cx") + "," + 0 + ")");
                    return null;
                } else {
                    return "none";
                }
            });

        svg.selectAll(".line-highlight")
            .attr("display", function() {
                var transform = this.getAttribute("transform");
                var openParen = transform.indexOf("(");
                var comma = transform.indexOf(",");
                var xPosition = transform.substr(openParen+1, comma-openParen-1);

                if ( (xPosition - mouseX > 0) && ((xPosition - mouseX <= defaultRadius + highlightRadius) && (xPosition - mouseX >= highlightRadius - defaultRadius))) {
                    return null;
                } else {
                    return "none";
                }
            });

        svg.selectAll(".text-highlight")
            .attr("display", function() {
                var xPosition = this.getAttribute("x");

                if ( (xPosition - mouseX > 0) && ((xPosition - mouseX <= 3*highlightRadius + defaultRadius + highlightTextPadding) && (xPosition - mouseX >= 2*highlightRadius + (highlightRadius - defaultRadius) + highlightTextPadding))) {
                    return null;
                } else {
                    return "none";
                }
            });
       
        // console.log("circleHighlights: " + circleHighlights);
        // var numCircleHighlights = circleHighlights.length;
        // console.log("numCircleHighlights:" + numCircleHighlights);

        // for (var i = 0; i < numCircleHighlights; i++) {
        //     circleHighlights[i].attr("display", null);
        // }

        // focus.select("text").text("|");
    }

    svg.append("g")
        .attr({
            class: "axis",
            transform: "translate(0," + (h-globalPadding) + ")"
            })
        .attr("width", w-2*globalPadding)
        .call(xAxis);

    svg.append("g")
        .attr({
            class: "y-axis",
            transform: "translate(" + globalPadding + ",0)"
            })
        .call(yAxis); 

    
    console.log("numDataSets: " + numDataSets);
    
    var colors = [];
    colors[0] = "green";

    for (var i = 1; i < numDataSets; i++) {
        data = getData([0,i],this.dataSet);

        if (numDataSets <= 2) {
            colors[i] = "black";
        }
        else {
            colors[i] = randRGB(100,200);
        }

        svg.append("path")
            .attr("class", "line")
            .attr("style", "stroke: " + colors[i])
            .attr("d", line(data));

        if (this.showPoints) {            
            for (var j = 0; j < numValues; j++) {
                console.log("p(x,y): " + xScale(data[j][0]) + "," + yScale(data[j][1]));
                svg.append("circle")
                    .attr("cx", xScale(data[j][0]))
                    .attr("cy", yScale(data[j][1]))
                    .attr("r", defaultRadius)
                    .attr("fill", colors[i])
                    .attr("color", colors[i])
                    .on("mouseover",function() {
                        if (this.getAttribute("cx") <= globalPadding || this.getAttribute("cx") > w+globalPadding 
                            || this.getAttribute("cy") >= h-globalPadding || this.getAttribute("cy") < globalPadding) {
                            return;
                        }
                        if (numDataSets <= 2) {
                            d3.select(this)
                                .attr("fill", function() {
                                    if (numDataSets <= 2) {
                                        return "orange";    
                                    }// } else {
                                //     return this.getAttribute("color");
                                // }
                                })
                                .attr("r", function() {
                                    if (numDataSets <= 2) {
                                        return highlightRadius;    
                                    }
                                });
                        }
                    })
                    .on("mouseout", function() {
                        d3.select(this)
                            .attr("fill", this.getAttribute("color"))
                            .attr("r", defaultRadius);
                    });

                svg.append("circle")
                    .attr("class", "circle-highlight")
                    .attr("cx", xScale(data[j][0]))
                    .attr("cy", yScale(data[j][1]))
                    .attr("r", highlightRadius)
                    .attr("fill", "none")
                    .attr("display", "none")
                    .attr("stroke", colors[i]);

                //var lineHighlightData = [ [ (xScale(data[j][0])+highlightRadius), yScale(data[j][1]) ] , [ (xScale(data[j][0])+3*highlightRadius) , yScale(data[j][1]) ] ];
                var lineHighlightData = [ [ 0 , 0 ] , [ 2*highlightRadius , 0 ] ];
                console.log("||||||||||||  " +lineHighlightData.toString());
                svg.append("path")
                    .attr("class", "line-highlight")
                    .attr("style", "stroke: " + colors[i])
                    .attr("display", "none")
                    .attr("transform", "translate(" + (xScale(data[j][0])+highlightRadius) + "," + yScale(data[j][1]) + ")")
                    .attr("d", lineNoScale(lineHighlightData));

                var highlightTextHeight = 12;
                var highlightTextPadding = 2;
                svg.append("text")
                    .attr("class", "text-highlight")
                    .attr("x", xScale(data[j][0]) + 3*highlightRadius + highlightTextPadding)
                    .attr("y", yScale(data[j][1]) + (highlightTextHeight/3))
                    .attr("style", "font-size: " + highlightTextHeight + "px; font-family: sans-serif")
                    .attr("display", "none")
                    .text( data[j][0] + ", " + data[j][1]);
                // focus.append("text")
    //       .attr("x", 9)
    //       .attr("dy", ".35em");
            }
        }
    }

    if (numDataSets > 2) {

        svg.append("rect")
            .attr("x", globalPadding-1)
            .attr("y", globalPadding-1)
            .attr("class", "overlay")
            .attr("width", w-(2*globalPadding)+2)
            .attr("height", h-(2*globalPadding)+2)
            .on("mouseover", function() { 
              focus.style("display", null); 
            })
            .on("mouseout", function() { 
              focus.style("display", "none");
              svg.selectAll(".circle-highlight").attr("display", "none");
              svg.selectAll(".line-highlight").attr("display", "none");
              svg.selectAll(".text-highlight").attr("display", "none");
            })
            .on("mousemove", mousemove);
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
    var barWidth = ((w - 2*globalPadding) / numBars) - barPadding;

    var xScale = d3.scale.linear()
    				.domain([0, d3.max(xValues)])
    				.range([globalPadding + barPadding, w - (globalPadding + barPadding + barWidth)]);

    var yScale = d3.scale.linear()
                    .domain([0, d3.max(yValues)])
                    .range([h - globalPadding, globalPadding]);
 
 	var xAxis = d3.svg.axis()
 					.scale(xScale)
 					.orient("bottom")
 					.ticks(numBars);

 	var yAxis = d3.svg.axis()
 					.scale(yScale)
 					.orient("left")
 					.ticks(5);

 	var xAxisLineCoords = [[globalPadding,h-globalPadding],[w-globalPadding,h-globalPadding]]

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
	        return h - yScale(d[1]) - globalPadding;
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
    		"transform": "translate(" + (barWidth/2) + "," + (h - globalPadding) + ")"
    	})
    	.call(xAxis);

   	// Create y-axis
    svg.append("g")
    	.attr({
    		class: "y-axis",
    		"transform": "translate(" + globalPadding + ",0)"
    	})
    	.call(yAxis);

	svg.append("path")
    	.attr("class", "line")
    	.attr("d", xAxisLine(xAxisLineCoords)); 
};



function visualize(dataPackage, parentId) {

    // KEEP THIS FOR CONTINUAL TESTING PURPOSES DURING DEVELOPMENT...for now...
	// var dataPackage = {		
	// 	"Visualizations":		
	// 		[{			
	// 			"Type": "Bar",			
	// 			"DataColumns": [0, 1]		
	// 		},{			
	// 			"Type": "Line",			
	// 			"DataColumns": [0, 1, 2, 3]		
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
	// 				[[0, 0, randNum(0,50), randNum(0,50)],					
	// 				[1,	1, randNum(0,50), randNum(0,50)],				
	// 				[2,	4, randNum(0,50), randNum(0,50)],				
	// 				[3,	9, randNum(0,50), randNum(0,50)],				
	// 				[4,	16, randNum(0,50), randNum(0,50)],				
	// 				[5,	25, randNum(0,50), randNum(0,50)],				
	// 				[6,	15, randNum(0,50), randNum(0,50)],				
	// 				[7,	21, randNum(0,50), randNum(0,50)],				
	// 				[8,	23, randNum(0,50), randNum(0,50)],				
	// 				[9,	15, randNum(0,50), randNum(0,50)]]		
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

	var height = 300;
	var width = 650;

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


function randRGB(min, max)
{
    var range = max - min;
    return "rgb(" + (min + Math.floor(Math.random() * range)) + "," + (min + Math.floor(Math.random() * range)) + "," + (min + Math.floor(Math.random() * range)) + ")";
}

function randNum(min, max)
{
    return Math.floor(Math.random()*(max-min))+min;
}