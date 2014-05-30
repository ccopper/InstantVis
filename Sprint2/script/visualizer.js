//This is our code for the visualizer. 

var globalPadding = 25;

function Pie(dataSet, width, height) 
{
    this.dataSet = dataSet;
    this.width = width;
    this.height = height;
}

Pie.prototype.draw = function(divId)
{
    console.log("Drawing Pie Chart ------------------------");
    var w = this.width;
    var h = this.height;
    var labelLinePadding = 20;
    var outerRadius = (w - 2*80 - 2*labelLinePadding)/2;
    var innerRadius = 0;
    var labelRadius = outerRadius + labelLinePadding;
    var highlightTextHeight = 15;

    var centerX = (outerRadius + 80 + labelLinePadding);
    var centerY = (outerRadius + 80 + labelLinePadding);

    console.log("centerX: " + centerX);
    console.log("centerY: " + centerY);

    var numDataSets = this.dataSet[0].length;
    var numValuesPerDataSet = this.dataSet.length;

    var categories = [];
    var data = [];
    var dataTotal = 0;
    var colors = [];

    console.log("this.dataSet");
    for (var i = 0; i < this.dataSet.length; i++) {
        printArray(this.dataSet[i]);
    }

    for (var j = 0; j < numValuesPerDataSet; j++) {
        isDuplicate = false;
        for (var t = 0; t < categories.length; t++) {
            if (categories[t][0] == this.dataSet[j][0]) {
                categories[t].push(j);
                isDuplicate = true;
            }
        }
        if (!isDuplicate) {
            categories.push([this.dataSet[j][0], j]);
            colors.push(randRGB(100,200));                   
        }
    }

    console.log("categories:");
    for (var i = 0; i < categories.length; i++) {
        printArray(categories[i]);
    }

    var categoryTotal = 0;
    for (var i = 0; i < categories.length; i++) {
        categoryTotal = 0;
        for (var j = 1; j < categories[i].length; j++) {
            categoryTotal += this.dataSet[categories[i][j]][1];
        }
        data.push(categoryTotal);
        dataTotal += categoryTotal;
    }

    console.log("data: " + data);
    console.log("data.toString(): " + data.toString());
    console.log("printArray(data): ");
    printArray(data);

    var color = d3.scale.category10();

    var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);

    var pie = d3.layout.pie();

    var line = d3.svg.line()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; });

    var svg = d3.select("#" + divId)
            .append("svg")
            .attr("width", w)
            .attr("height", h);

    var arcs = svg.selectAll("g.arc")
                .data(pie(data))
                .enter()
                .append("g")
                .attr("class", "arc")
                .attr("transform", "translate(" + centerX + ", " + centerY + ")");
                // .attr("transform", "translate(" + (outerRadius + legendHeight) + ", " + (outerRadius + globalPadding) + ")");

    arcs.append("path")
        .attr("fill", function(d, i) {
            return colors[i];
        })
        .attr("d", arc)
        .on("mouseover", function(d, i) {
            this.setAttribute("fill", "orange");
            svg.append("text")
                .attr("id", "tooltip-text")
                .attr("x", (centerX + arc.centroid(d)[0]))
                .attr("y", (centerY + arc.centroid(d)[1]) + highlightTextHeight/2)
                .attr("text-anchor", "middle")
                .attr("text-family", "sans-serif")
                .attr("font-size", highlightTextHeight)
                .attr("font-weight", "bold")
                .style("pointer-events", "none")
                .text( function(d) {
                    return Math.floor((data[i]/dataTotal)*10000)/100 + "%";
            });
            svg.append("text")
                .attr("id", "tooltip-text2")
                .attr("x", (centerX + arc.centroid(d)[0]))
                .attr("y", (centerY + arc.centroid(d)[1]) - highlightTextHeight/2)
                .attr("text-anchor", "middle")
                .attr("text-family", "sans-serif")
                .attr("font-size", highlightTextHeight)
                .attr("font-weight", "bold")
                .style("pointer-events", "none")
                .text( function(d) {
                    return data[i];
            });
        })
        .on("mouseout", function(d, i) {
            this.setAttribute("fill", colors[i]);
            d3.select("#tooltip-text").remove();
            d3.select("#tooltip-text2").remove();
        });

    arcs.append("text")
        .attr("transform", function(d) {

            console.log("d: " + d);
            console.log("d.toString(): " + d.toString());

            var thisX = centerX - (centerX - arc.centroid(d)[0]);
            var thisY = centerY - (centerY - arc.centroid(d)[1]);
            var hyp = Math.sqrt(Math.pow(thisX, 2) + Math.pow(thisY, 2));
            var ratio = labelRadius/hyp;
            var ratio2 = (labelRadius*0.75)/hyp;
            var ratio3 = (labelRadius-5)/hyp;

            var newDx = thisX * ratio;
            var newDy = thisY * ratio;

            console.log("arc.centroid(d)[0]: " + arc.centroid(d)[0]);
            console.log("arc.centroid(d)[1]: " + arc.centroid(d)[1]);

            console.log("thisX: " + thisX);
            console.log("thisY: " + thisY);

            console.log("ratio: " + ratio);

            console.log("newDx: " + newDx);
            console.log("newDy: " + newDy);

            var lineStartX = thisX * ratio2;
            var lineStartY = thisY * ratio2;

            var lineEndX = thisX * ratio3;
            var lineEndY = thisY * ratio3;

            console.log("lineStartX: " + lineStartX);
            console.log("lineStartY: " + lineStartY);
            console.log("lineEndX: " + lineEndX);
            console.log("lineEndY: " + lineEndY);

            var labelLineData = [[lineStartX,lineStartY],[lineEndX,lineEndY]];
    
            arcs.append("path")
                .attr("class", "label-line")
                .attr("d", line(labelLineData));

            return "translate(" + (newDx) + ", " + (newDy) + ")";
        })
        .attr("text-anchor", function(d) {
            var centroidX = arc.centroid(d)[0];
            if (centroidX >= 0) {
                return "start";
            } else if (Math.abs(centroidX) < outerRadius/10) {
                return "middle";
            }
            return "end";
        })
        .attr("font-family", "sans-serif")
        .attr("font-weight", "bold")
        .style("pointer-events", "none")
        .text(function(d, i) {
            return categories[i][0];
        });

        console.log("Finished Drawing Pie Chart ---------------------------");
}

function Area(dataSet, width, height) 
{
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

};

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
    var colors = [];
    var highlightRadius = 6;
    var defaultRadius = 3;
    var highlightTextHeight = 12;
    var highlightTextPadding = 2;
    var highlightRectFillColor = "rgb(225,225,225)";
    var highlightRectHeight = highlightTextHeight + highlightTextPadding * 2;
    var highlightRectWidth;
    var characterWidth = 6;
    var data = [];
    var dataPoints = [];

    var numDataSets = this.dataSet[0].length;
    var numValuesPerDataSet = this.dataSet.length;

    var multiset = false;
    multiset = (numDataSets > 2) ? true : false;

    var xScale = d3.scale.linear()
                 .domain([0, d3.max(this.dataSet, function(d) { return d[0]; })])
                 .range([globalPadding, w - globalPadding]);

    // Determine the maximum Y value for the datasets.
    var maxY = 0;
    for (var i = 1; i < numDataSets; i++) {
        for (var j = 0; j < numValuesPerDataSet; j++) {
            if (this.dataSet[j][i] > maxY) {
                maxY = this.dataSet[j][i];
            }
        }
    }

    var yScale = d3.scale.linear()
                        .domain([0, maxY])
                        .range([h - globalPadding, globalPadding])
                        .clamp(true);

    // var yScale = d3.scale.linear()
    //                     .domain([0, d3.max(this.dataSet, function(d) { return d[1]; })])
    //                     .range([h - globalPadding, globalPadding]);

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

    var line = d3.svg.line()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; });

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


    function mousemove() {
        var mouseX = d3.mouse(this)[0];
        var mouseY = d3.mouse(this)[1];

        var pointHighlighted = false;

        for (var k = 0; k < dataPoints.length; k++) {
            var thisPointX = dataPoints[k][0][0];
            var thisPointY = dataPoints[k][0][1];
            var thisRectX = dataPoints[k][1][0];
            var thisRectY = dataPoints[k][1][1];
            var thisTextX = dataPoints[k][2][0];
            var thisTextY = dataPoints[k][2][1];
            var thisLineData = dataPoints[k][3];
            
            if (mouseX < thisPointX + defaultRadius && mouseX > thisPointX - defaultRadius &&
                mouseY > thisPointY - defaultRadius && mouseY < thisPointY + defaultRadius) {
                pointHighlighted = true;
                svg.selectAll(".circle-highlight")
                    .moveToFront()
                    .attr("display", function() {
                        if (this.getAttribute("cx") == thisPointX && this.getAttribute("cy") == thisPointY) {
                            return null;
                        }
                        return "none"
                    });
                svg.selectAll(".tooltip-rect")
                    .moveToFront()
                    .attr("display", function() {
                        if (this.getAttribute("x") == thisRectX && this.getAttribute("y") == thisRectY) {
                            return null;
                        }
                        return "none"
                    });
                svg.selectAll(".tooltip-text")
                    .moveToFront()
                    .attr("display", function() {
                        if (this.getAttribute("x") == thisTextX && this.getAttribute("y") == thisTextY) {
                            return null;
                        }
                        return "none"
                    });
                svg.selectAll(".tooltip-line")
                    .moveToFront()
                    .attr("display", function() {
                        if (this.getAttribute("d") == line(thisLineData)) {
                            return null;
                        }
                        return "none"
                    });
            }
        } 

        if (!pointHighlighted) {
            svg.selectAll(".circle-highlight").attr("display", "none");
            svg.selectAll(".tooltip-text").attr("display", "none");
            svg.selectAll(".tooltip-rect").attr("display", "none");
            svg.selectAll(".tooltip-line").attr("display", "none");
        }
    }

    for (var i = 1; i < numDataSets; i++) {
        data = getData([0,i],this.dataSet);

        if (!multiset) {
            colors[i-1] = "black";
        }
        else {
            colors[i-1] = randRGB(50,200);
        }

        for (var j = 0; j < numValuesPerDataSet; j++) {
            pointX = xScale(data[j][0]);
            pointY = yScale(data[j][1]);
            var dataX = data[j][0];
            var dataY = data[j][1];
            var highlightText = dataX + ", " + dataY;
            var xRectPosition = pointX + 2*highlightRadius;
            var yRectPosition = pointY - highlightRectHeight/2;
            var xTextPosition = xRectPosition + highlightTextPadding;
            var yTextPosition = yRectPosition  + highlightTextHeight;
            var highlightLineData = [[pointX+highlightRadius,pointY],[pointX+2*highlightRadius,pointY]]; 
            var color = colors[i-1];
            highlightRectWidth = (2*highlightTextPadding) + (characterWidth*highlightText.length);
            if (xRectPosition + highlightRectWidth > w-globalPadding) {
                highlightLineData = [[pointX-2*highlightRadius, pointY],[pointX-highlightRadius, pointY]];
                xRectPosition = pointX - 2*highlightRadius - highlightRectWidth;
                xTextPosition = xRectPosition + highlightTextPadding;
            }

            dataPoints.push([[pointX, pointY], [xRectPosition, yRectPosition], [xTextPosition, yTextPosition], highlightLineData, highlightText, color]); 
        }
    }

    for (var k = 0; k < dataPoints.length; k++) {
        var x = dataPoints[k][0][0];
        var y = dataPoints[k][0][1];
        var xRect = dataPoints[k][1][0];
        var yRect = dataPoints[k][1][1];
        var xText = dataPoints[k][2][0];
        var yText = dataPoints[k][2][1];
        var lineData = dataPoints[k][3];
        var text = dataPoints[k][4];
        var col = dataPoints[k][5];
        var highlightRectW = (2*highlightTextPadding) + (characterWidth*text.length);


        // Draw the scatter plot points.
        svg.append("circle")
            .attr("class", "data-point")
            .attr({
                cx: x,
                cy: y,
                r: defaultRadius,
                fill: col
            });

        svg.append("circle")
                .attr("class", "circle-highlight")
                .attr("cx", x)
                .attr("cy", y)
                .attr("fill", "none")
                .style("stroke", col)
                .attr("display", "none")
                .attr("r", highlightRadius);

            svg.append("rect")
                .attr("class", "tooltip-rect")
                .attr("x", xRect)
                .attr("y", yRect)
                .attr("fill", highlightRectFillColor)
                .style("stroke", col)
                .attr("display", "none")
                .attr("width", highlightRectW)
                .attr("height", highlightRectHeight);

            svg.append("text")
                .attr("class", "tooltip-text")
                .attr("x", xText)
                .attr("y", yText)
                .style("pointer-events", "none")
                .attr("display", "none")
                .attr("text-anchor", "start")
                .attr("font-family", "sans-serif")
                .attr("font-size", highlightTextHeight)
                .attr("font-weight", "bold")
                .attr("fill", "black")
                .text(text);

            svg.append("path")
                .attr("class", "tooltip-line")
                .style("stroke", col)
                .attr("display", "none")
                .attr("d", line(lineData))    
    }

    svg.append("rect")
        .attr("x", globalPadding - defaultRadius)
        .attr("y", globalPadding - defaultRadius)
        .attr("class", "overlay")
        .attr("width", w-(2*globalPadding)+2*defaultRadius)
        .attr("height", h-(2*globalPadding)+2*defaultRadius)
        .on("mouseout", function() {
            // Clear the graph area.
            svg.selectAll(".circle-highlight").attr("display", "none");
            svg.selectAll(".tooltip-text").attr("display", "none");
            svg.selectAll(".tooltip-rect").attr("display", "none");
            svg.selectAll(".tooltip-line").attr("display", "none");
        })
        .on("mousemove", mousemove);


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
    var w = this.width;
    var h = this.height;
    var rightGraphBoundary = w - globalPadding;
    var defaultRadius = 3;
    var highlightRadius = 6;
    var highlightLineWidth = highlightRadius;
    var padding = 20;
    var data = [];
    var highlightTextHeight = 12;
    var highlightTextPadding = 2;
    var highlightTextLength = 20;
    var highlightText = [];
    var dataPoints = [];
    var xValues = [];
    var pointX, pointY, lineTransformX, lineTransformY, rectX, rectY, textX, textY;
    var colors = [];
    var characterWidth = 6;
    var highlightTextExternalPadding = highlightRadius;
    var highlightRectFillColor = "rgb(225,225,225)";

    var numDataSets = this.dataSet[0].length;
    var numValues = this.dataSet.length;

    var multiline = false;
    multiline = (numDataSets > 2) ? true : false;

    var xScale = d3.scale.linear()
                 .domain([0, d3.max(this.dataSet, function(d) { return d[0]; })])
                 .range([globalPadding, w - globalPadding])
                 .clamp(true);

    // Determine the maximum Y value for the datasets.
    var maxY = 0;
    for (var i = 1; i < numDataSets; i++) {
        for (var j = 0; j < numValues; j++) {
            if (this.dataSet[j][i] > maxY) {
                maxY = this.dataSet[j][i];
            }
        }
    }

    var yScale = d3.scale.linear()
                        .domain([0, maxY])
                        .range([h - globalPadding, globalPadding])
                        .clamp(true);

    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(5);

    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(5);

    var line = d3.svg.line()
            .x(function(d) { return xScale(d[0]); })
            .y(function(d) { return yScale(d[1]); }); 

    var unscaledLine = d3.svg.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; }); 

    // Use the given <div> as the drawing area. This <svg> will contain all of the visualization elements.
    var svg = d3.select("#" + divId)
            .append("svg")
            .attr("width", w)
            .attr("height", h);

    // Setup the guideline.
    var focus = svg.append("g")
          .attr("class", "focus")
          .style("display", "none");
    
    var lineData = [ [0, globalPadding], [0, h-globalPadding] ];
    
    focus.append("path")
        .attr("class", "guideline")
        .attr("style", "stroke: gray")
        .attr("d", unscaledLine(lineData));

    // Actions that occur when the mouse moves within the graph.
    function mousemove() {        
        var mouseX = d3.mouse(this)[0];

        // Move the guideline to align with the mouse movement.
        if (mouseX >= globalPadding) {
            focus.attr("transform", "translate(" + mouseX + "," + 0 + ")");
        }

        // Determine which data points are highlighted by the guideline.
        var pointsHighlighted = [];
        svg.selectAll(".data-point")
            .each(function() {
                if ( Math.abs(this.getAttribute("cx") - mouseX) < defaultRadius ) {
                    pointsHighlighted.push([this.getAttribute("cx"),this.getAttribute("cy")]);
                }
            });

        var numPointsHighlighted = pointsHighlighted.length;
        var numDataPoints = dataPoints.length;
        
        var dataPointsHighlighted = [];
        // Determine which indices of dataPoints are highlighted
        for (var i = 0; i < numPointsHighlighted; i++) {
            for (var j = 0; j < numDataPoints; j++) {
                if (pointsHighlighted[i][0] == dataPoints[j][0][0] && pointsHighlighted[i][1] == dataPoints[j][0][1]) {
                    if (dataPointsHighlighted.indexOf(j) == -1) {
                        dataPointsHighlighted.push(j);
                    } else {
                        continue;
                    }
                    break;
                }
            }
        }

        // Look through all circle highlight elements and display those that correspond to the highlighted data points.
        var display = false;
        svg.selectAll(".circle-highlight")
            .attr("display", function() {
                display = false;
                for (var i = 0; i < dataPointsHighlighted.length; i++) {
                    if (this.getAttribute("cx") == dataPoints[dataPointsHighlighted[i]][0][0] && this.getAttribute("cy") == dataPoints[dataPointsHighlighted[i]][0][1] ) {
                        display = true;
                        break;
                    }
                }

                if (display) {
                    focus.attr("transform", "translate(" + this.getAttribute("cx") + "," + 0 + ")");
                    return null;
                } else {
                    return "none";
                }
            });

        // Look through all rectangle highlight elements and display those that correspond to the highlighted data points.
        svg.selectAll(".rect-highlight")
            .moveToFront()
            .attr("display", function() {
                display = false;
                for (var i = 0; i < dataPointsHighlighted.length; i++) {
                    if (this.getAttribute("x") == dataPoints[dataPointsHighlighted[i]][1][0] && this.getAttribute("y") == dataPoints[dataPointsHighlighted[i]][1][1] ) {
                        display = true;
                        break;
                    }
                }                

                // If display == true, return null, else return "none."
                return (display) ? null : "none";
            });

        // Look through all text highlight elements and display those that correspond to the highlighted data points.
        svg.selectAll(".text-highlight")
            .attr("display", function() {
                display = false;
                for (var i = 0; i < dataPointsHighlighted.length; i++) {
                    if (this.getAttribute("x") == dataPoints[dataPointsHighlighted[i]][2][0] && this.getAttribute("y") == dataPoints[dataPointsHighlighted[i]][2][1] ) {
                        display = true;
                        break;
                    }
                } 

                // If display == true, return null, else return "none."
                return (display) ? null : "none";
            })
            .moveToFront();
    }

    // Display the x-axis.
    svg.append("g")
        .attr({
            class: "axis",
            transform: "translate(0," + (h-globalPadding) + ")"
            })
        .attr("width", w-2*globalPadding)
        .call(xAxis);

    // Display the y-axis.
    svg.append("g")
        .attr({
            class: "y-axis",
            transform: "translate(" + globalPadding + ",0)"
            })
        .call(yAxis); 
    

    for (var i = 1; i < numDataSets; i++) {
        data = getData([0,i],this.dataSet);

        if (numDataSets <= 2) {
            colors[i-1] = "black";
        }
        else {
            colors[i-1] = randRGB(50,200);
        }

        // Display the line for the dataset.
        svg.append("path")
            .attr("class", "line")
            .attr("style", "stroke: " + colors[i-1])
            .attr("d", line(data));

        // If instructed, display the data points.
        if (this.showPoints) {            
            for (var j = 0; j < numValues; j++) {
                pointX = xScale(data[j][0]);
                pointY = yScale(data[j][1]);

                // If this x-value has not been seen before, add it to the list of x-values.
                if (xValues.indexOf(pointX) == -1) {
                    xValues.push(pointX);
                }

                // Display the data point circles.
                svg.append("circle")
                    .attr("class", "data-point")
                    .attr("cx", pointX)
                    .attr("cy", pointY)
                    .attr("r", defaultRadius)
                    .attr("fill", colors[i-1])
                    .attr("color", colors[i-1]);

                // Add hidden circle highlight elements.
                svg.append("circle")
                    .attr("class", "circle-highlight")
                    .attr("cx", pointX)
                    .attr("cy", pointY)
                    .attr("r", highlightRadius)
                    .attr("fill", "none")
                    .attr("display", "none")
                    .attr("stroke", colors[i-1]);

                // Determine the text associated with the data point when highlighted.
                highlightText[j] = data[j][0] + ", " + data[j][1];

                var highlightRectWidth = (highlightText[j].length*characterWidth)+highlightTextPadding;
                var highlightRectHeight = highlightTextHeight + (2 * highlightTextPadding);

                textY = pointY + (highlightTextHeight/3);
                rectY = pointY - highlightRectHeight/2;
                
                var rightHighlightEdge = pointX+highlightRadius+highlightTextExternalPadding+highlightRectWidth;

                var overRightEdge = false;
                if (rightHighlightEdge >= rightGraphBoundary) {
                    overRightEdge = true;
                }

                if ( overRightEdge ) {
                    textX = pointX - highlightRadius - highlightTextExternalPadding - highlightRectWidth + highlightTextPadding;
                    rectX = pointX - highlightRadius - highlightTextExternalPadding - highlightRectWidth;
                } else {
                    textX = pointX + highlightRadius + highlightTextExternalPadding + highlightTextPadding;
                    rectX = pointX + highlightRadius + highlightTextExternalPadding;
                } 
                    
                dataPoints[((i-1)*numValues)+j] = [ [pointX, pointY], [rectX, rectY], [textX, textY], highlightText[j].length*6+highlightTextPadding, colors[i-1], highlightText[j] ]; 

            }
        }
    }

    // Sort first by data point's x position, they by y position.
    dataPoints.sort(function(a,b) {
        var pxA = a[0][0];
        var pxB = b[0][0];
        var pyA = a[0][1];
        var pyB = b[0][1];
        if (pxA == pxB) {
            return pyA - pyB;
        } else {
            return pxA - pxB;
        }
    });

    // Determine the placement of the highlight rects and text now that the data points have been sorted.
    var count = 0;
    var lastX = -0.112323;
    var currentX = 0;
    for (var d = 0; d < dataPoints.length; d++) {
        currentX = dataPoints[d][0][0];
        if (currentX != lastX) {
            count = 0;
        } else {
            count++;
        }
        
        var newRectY = dataPoints[d][1][1];
        var newTextY = dataPoints[d][2][1];

        if (multiline) {
            newRectY = globalPadding+(count*(highlightRectHeight+2));
            newTextY = newRectY + highlightTextHeight;
        }

        // Add the rect highlight element.
        svg.append("rect")
            .attr("class", "rect-highlight")
            .attr("x", dataPoints[d][1][0])
            .attr("y", newRectY)
            .attr("width", dataPoints[d][3])
            .attr("height", highlightRectHeight)
            .attr("display", "none")
            .attr("style", "stroke: " + dataPoints[d][4] + "; fill: " + highlightRectFillColor + ";");

        dataPoints[d][1][1] = newRectY;

        // Add the text highlight element.
        svg.append("text")
            .attr("class", "text-highlight")
            .attr("x", dataPoints[d][2][0])
            .attr("y", newTextY)
            .attr("style", "font-size: " + highlightTextHeight + "px; font-family: sans-serif")
            .attr("display", "none")
            .text( dataPoints[d][5] );

        dataPoints[d][2][1] = newTextY;

        lastX = currentX;
    }

    // Detect mouse motion in the graph area.
    //if (multiline) {
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
                // Clear the graph area.
                focus.style("display", "none");
                svg.selectAll(".circle-highlight").attr("display", "none");
                svg.selectAll(".line-highlight").attr("display", "none");
                svg.selectAll(".text-highlight").attr("display", "none");
                svg.selectAll(".rect-highlight").attr("display", "none");
            })
            .on("mousemove", mousemove);
    //}
   
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
    var highlightTextHeight = 12;
    var highlightTextPadding = 2;
    var padding = 20;
    var barPadding = 5;
    var barWidth = ((w - 2*globalPadding) / numBars) - barPadding;

    var fillColor = randRGB(100, 200);
    var highlightColor = randRGB(100, 200);

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

    var unscaledLine = d3.svg.line()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; });                    

 	var xAxisLineCoords = [[globalPadding,h-globalPadding],[w-globalPadding,h-globalPadding]];

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
	    .attr("width", barWidth)
	    .attr("height", function(d) {
	        return h - yScale(d[1]) - globalPadding;
	    })
	    .attr("fill", function(d) {
	        return fillColor;
	    })
        .attr("class", "bar")
        .on("mouseover",function(d) {
            var xPosition = parseFloat(d3.select(this).attr("x"));
            var xTextPosition = xPosition + barWidth/2;
            var yPosition = parseFloat(d3.select(this).attr("y"));
            var yTextPosition = yPosition + highlightTextHeight;
            if (yTextPosition > h - globalPadding) {
                yTextPosition = yPosition - highlightTextPadding;
            }
            svg.append("text")
                .attr("id", "tooltip")
                .attr("x", xTextPosition)
                .attr("y", yTextPosition)
                .style("pointer-events", "none")
                .attr("text-anchor", "middle")
                .attr("font-family", "sans-serif")
                .attr("font-size", highlightTextHeight)
                .attr("font-weight", "bold")
                .attr("fill", "black")
                .text(d[1]);

            var barLineData = [ [globalPadding,yPosition], [w-globalPadding,yPosition] ];

            svg.append("path")
                .attr("class", "bar-line")
                .attr("id", "barline")
                .attr("style", "stroke: rgb(150,150,150)")
                .attr("d", unscaledLine(barLineData));

            d3.select(this)
                .attr("fill", highlightColor);

            svg.selectAll(".bar")
                .attr("fill", function() {
                    if (this.getAttribute("y") < barLineData[0][1]) {
                        return "rgb(161,219,136)";
                    } else if (this.getAttribute("y") > barLineData[0][1]) {
                        return "rgb(219,136,136)";
                    } else {
                        return "rgb(191,191,191)";
                    }
                });

            this.setAttribute("fill", "rgb(240,209,86)");
        })
        .on("mouseout", function(d) {
            d3.select("#tooltip").remove();
            d3.select("#barline").remove();
            d3.select(this)
                .attr("fill", fillColor);
            svg.selectAll(".bar")
                .attr("fill", fillColor);
            
        });

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
//  "Visualizations":
//  [{
//  "Type": "Pie",
//  "DataColumns": [0, 1]
//  }],
//  "Data":
//  {
//  "ColumnLabel": ["X", "Y"],
//  "ColumnType": ["String", "Integer"],
//  "Values":
//  [["California", 2],
//  ["Alaska", 1],
//  ["Kentucky", 4],
//  ["Ohio", 9],
//  ["Maine", 16],
//  ["Arizona", 25]]//,
//  // ["Arizona", 12],
//  // ["California", 7]]
//  }
//  };

  // {
// "Visualizations":
// [{
// "Type": "Bar",
// "DataColumns": [0, 1]
// },{
// "Type": "Line",
// "DataColumns": [0, 1, 2]
// },{
// "Type": "Scatter",
// "DataColumns": [0, 1, 2, 3, 4, 5]
// },{
  // "Type": "Area",
  // "DataColumns": [0, 1]
  // }],
// "Data":
// {
// "ColumnLabel": ["X", "Y"],
// "ColumnType": ["Integer", "Integer"],
// "Values":
// [[0, 0, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
// [1, 1, 1, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
// [2, 4, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
// [3, 9, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
// [4, 16, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
// [5, 25, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
// [6, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
// [7, 21, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
// [8, 23, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
// [9, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
  // [10, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
  // [11, 10, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
  // [12, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
  // [13, 6, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
  // [14, 5, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
  // [15, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
  // [16, 1, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
  // [17, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
  // [18, 0, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
  // [19, 8, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
  // [20, 8, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)],
  // [21, 15, randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50), randNum(0,50)]]
// }
// };

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

function getVisualization(dataPackage,columnSet,type)
{
    var height = 300;
    var width = 650;
    for(var i = 0; i < dataPackage.Visualizations.length; i++)
    {
        var visType = dataPackage.Visualizations[i].Type;
        var visColumnSet = dataPackage.Visualizations[i].DataColumns;
        var values = dataPackage.Data.Values;
        if(arraysAreEqual(columnSet,visColumnSet) && type == visType)
        {
            var v = NaN;
            // Instantiate a visualization of the appropriate type and append it to the list of visualizations.
            switch(type) {
                case "Line":
                    v = new Line(getData(columnSet, values), width, height, true);
                    break;

                case "Bar":
                    v = new Bar(getData(columnSet, values), width, height);
                    break;

                case "Scatter":
                    v = new Scatter(getData(columnSet, values), width, height);
                    break;  

                case "Area":
                    v = new Area(getData(columnSet, values), width, height);
                    break; 
                case "Pie":
                    v = new Pie(getData(columnSet, values), width, width);
                    break; 

                default:
                    // The type extracted from the data object did not match any of the defined visualization types.
                    console.log("ERROR: Could not match visualization type:'"+type+"'' with definition in visualizer.");
            }
            return v;
        }
    }
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
function createDiv(parentId, newDivId, width, height,className) {
	//Find parent and append new div with id specified by newDivId
	var parentDiv = document.getElementById(parentId);
	if(!parentDiv){
		console.log("ERROR: Could not find parent " + parentId + ". No child added.")
		return false;
	}
	if(!/(\d+(%|px)|)/.test(width) || !/(\d+(%|px)|)/.test(height))
    {
        console.log("ERROR: Invalid width or height. Must specify px or %.")
        return false;
    }
    var newDiv = document.createElement('div');
	newDiv.setAttribute('id',newDivId);
	newDiv.setAttribute('class',className);
	newDiv.style.width= width;
	newDiv.style.height= height;
	// newDiv.style.display = "none";
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

d3.selection.prototype.moveToFront = function() {
    return this.each(function() {
        this.parentNode.appendChild(this);
    });
};

// function adjustRect(text) {
//     var boundingBox = text.getBBox();
// }