/**
 * @file Take instructions and data from the Controller and draw a visualization.
 * @module Visualizer
 */

var currentVisualization = NaN;
var globalPadding = 25;

/**
 * Create a Treemap object.
 *
 * @function
 * @param dataSet   Set of data to visualize.
 * @param labels    Set of labels associated with the data.
 * @param title     Title of visualization.
 * @param width     Width of the visualization.
 * @param height    Height of the visualization.
 * @param colors    Colors to use in the visualization.
 * @param margin    Margin specifications for the visualization.
 */
function Treemap(dataSet, labels, title, width, height, colors, margin) 
{
    this.dataSet = dataSet;
    this.labels = labels;
    this.title = title;
    this.width = width;
    this.height = height;
    this.colors = colors;
    this.margin = margin;
    console.log("this.dataSet: " + this.dataSet.toString());
}

/**
 * Draw the Treemap.
 *
 * @function
 * @param divId   The id of the div into which the visualization should be drawn.
 */
Treemap.prototype.draw = function(divId) 
{

    currentVisualization = this;
    // var margin = {top: 50, right: 20, bottom: 20, left: 20};
    var margin = this.margin;

    var w = this.width;
    var h = this.height;
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    // Determine axis labels and title.
    var xAxisLabel = this.labels[0];
    var yAxisLabel = this.labels[1];
    var title = this.title;
    if (title == "") 
    {
        title = yAxisLabel + " by " + xAxisLabel;
    }

    var titleLabelHeight = margin.top/3;
    var titleLabelPaddingTop = (margin.top - titleLabelHeight)/2;
    var numValuesPerDataSet = this.dataSet.length;
    var categories = [];
    var data = [];
    var dataTotal = 0;
    var highlightTextHeight = 12;

    // Determine duplicate x values and condense into categories.
    for (var j = 0; j < numValuesPerDataSet; j++) 
    {
        isDuplicate = false;
        for (var t = 0; t < categories.length; t++) 
        {
            if (categories[t][0] == this.dataSet[j][0]) 
            {
                categories[t].push(j);
                isDuplicate = true;
            }
        }
        if (!isDuplicate) 
        {
            categories.push([this.dataSet[j][0], j]);
        }
    }

    console.log("categories: " + categories.toString());

    // Sum up category totals and overal data total.
    var categoryTotal = 0;
    for (var i = 0; i < categories.length; i++) 
    {
        categoryTotal = 0;
        for (var j = 1; j < categories[i].length; j++) 
        {
            categoryTotal = categoryTotal + parseInt(this.dataSet[categories[i][j]][1]);
        }
        console.log("categoryTotal: " + categoryTotal);
        if (categoryTotal > 0) 
        {
            data.push([categories[i][0], categoryTotal]);
            console.log("pushing to data: [" + categories[i][0] + ", " + categoryTotal + "]");
        }
        dataTotal += categoryTotal;
    }

    console.log("data: " + data.toString());

    // Sort the categories from largest to smallest.
    data.sort( function(a,b) 
        { 
            return b[1] - a[1]; 
        });

    // Base visualization area.
    var base = d3.select("#" + divId)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
    // Background.
    base.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("fill", "white")
            .style("stroke", "black");
    // Canvas.
    var svg = base.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set the toggle for each section to false.
    var toggle = [];
    for (var i = 0; i < categories.length; i++) 
    {
        toggle.push(false);
    }

    var rects = [];
    var currentWidth = width;
    var currentHeight = height;
    var currentX = 0;
    var currentY = 0;
    var fraction = 0;
    var thisWidth = 0;
    var thisHeight = 0;
    var nextX = 0;
    var nextY = 0;
    var currentTotal = dataTotal;

    // Get a set of color gradients based on given colors and randomize the set.
    var mixedColorSet = getMixedColors(data.length, this.colors);
    mixedColorSet = shuffleArray(mixedColorSet);

    // Calculate each section information by continually bisecting the canvas.
    for (var i = 0; i < data.length; i++) 
    {
        fraction = (data[i][1]/currentTotal);
        if (currentWidth > currentHeight) 
        {
            thisHeight = currentHeight;
            thisWidth = fraction*currentWidth;
            nextX = currentX + thisWidth;
            nextY = currentY;
            nextWidth = currentWidth - thisWidth;
            nextHeight = currentHeight;
        } 
        else 
        {
            thisWidth = currentWidth;
            thisHeight = fraction*currentHeight;
            nextY = currentY + thisHeight;
            nextX = currentX;
            nextHeight = currentHeight - thisHeight;
            nextWidth = currentWidth;
        }

        var fill = mixedColorSet[i];
        var category = data[i][0];

        newRect = [fill, thisHeight, thisWidth, currentX, currentY, category, data[i][1]];

        rects.push(newRect);

        currentX = nextX;
        currentY = nextY;
        currentWidth = nextWidth;
        currentHeight = nextHeight;
        currentTotal = currentTotal - data[i][1];
    }

    console.log("rects: " + rects.toString());

    // Draw the sections.
    svg.selectAll("rect")
        .data(rects)
        .enter()
        .append("rect")
        .attr("class", "treemap-section")
        .attr("fill", function(d) 
            { 
                return d[0]; 
            })
        .attr("height", function(d) 
            { 
                return d[1]; 
            })
        .attr("width", function(d) 
            { 
                return d[2]; 
            })
        .attr("x", function(d) 
            { 
                return d[3]; 
            })
        .attr("y", function(d) 
            { 
                return d[4]; 
            })
        .on("mouseover", function(d, i) 
        {
            var newX = (parseFloat(this.getAttribute("x")) + parseFloat(this.getAttribute("width"))/2);
            var newY = parseFloat(this.getAttribute("y")) + parseFloat(this.getAttribute("height"))/2 + highlightTextHeight/2;

            // Highlight the section orange.
            d3.select(this)
                .attr("fill", "orange")
                .style("stroke", "black")

            // Draw the text information.
            if (!toggle[i]) 
            {
                svg.append("text")
                    .attr("id", ("treemap-text-tooltip2-" + i))
                    .attr("x", newX)
                    .attr("y", newY - highlightTextHeight)
                    .attr("text-anchor", "middle")
                    .attr("font-family", "arial")
                    .attr("font-size", highlightTextHeight)
                    .attr("font-weight", "bold")
                    .style("pointer-events", "none")
                    .text( function() 
                    {
                        return Math.floor((d[6]/dataTotal)*10000)/100 + "%";
                    });
                svg.append("text")
                    .attr("id", ("treemap-text-tooltip3-" + i))
                    .attr("x", newX)
                    .attr("y", newY + highlightTextHeight)
                    .attr("text-anchor", "middle")
                    .attr("font-family", "arial")
                    .attr("font-size", highlightTextHeight)
                    .attr("font-weight", "bold")
                    .style("pointer-events", "none")
                    .text( function() 
                    {
                        return Math.floor(d[6]*100)/100;
                    });
            }
        })
        .on("click", function(d, i) 
        {
            d3.selectAll(("#treemap-text-tooltip2-" + i)).remove();
            d3.selectAll(("#treemap-text-tooltip3-" + i)).remove();

            toggle[i] = !toggle[i];

            // If the tooltips are already drawn, remove them.
            if (!toggle[i]) 
            {
                d3.selectAll(("#treemap-text-tooltip2-" + i)).remove();
                d3.selectAll(("#treemap-text-tooltip3-" + i)).remove();                
                return;
            }

            // Draw the tooltips.
            var newX = (parseFloat(this.getAttribute("x")) + parseFloat(this.getAttribute("width"))/2);
            var newY = parseFloat(this.getAttribute("y")) + parseFloat(this.getAttribute("height"))/2 + highlightTextHeight/2;
            
            svg.append("text")
                .attr("id", ("treemap-text-tooltip2-" + i))
                .attr("x", newX)
                .attr("y", newY - highlightTextHeight)
                .attr("text-anchor", "middle")
                .attr("font-family", "arial")
                .attr("font-size", highlightTextHeight)
                .attr("font-weight", "bold")
                .style("pointer-events", "none")
                .text( function() 
                {
                    return Math.floor((d[6]/dataTotal)*10000)/100 + "%";
                });
            svg.append("text")
                .attr("id", ("treemap-text-tooltip3-" + i))
                .attr("x", newX)
                .attr("y", newY + highlightTextHeight)
                .attr("text-anchor", "middle")
                .attr("font-family", "arial")
                .attr("font-size", highlightTextHeight)
                .attr("font-weight", "bold")
                .style("pointer-events", "none")
                .text( function() 
                {
                    return Math.floor(d[6]*100)/100;
                });
        })
        .on("mouseout", function(d, i) 
        {
            // Remove the tooltips according to the toggle state.
            d3.select(this).attr("fill", d[0])
            if (!toggle[i]) 
            {
                d3.select(this)
                    .style("stroke", "none")
                d3.selectAll(("#treemap-text-tooltip2-" + i)).remove();
                d3.selectAll(("#treemap-text-tooltip3-" + i)).remove();
            }
        });

    // Draw the non-toggleable category label for each section.
    svg.selectAll("rect")
        .each(function(d) 
        {
            var newX = (parseFloat(this.getAttribute("x")) + parseFloat(this.getAttribute("width"))/2);
            var newY = parseFloat(this.getAttribute("y")) + parseFloat(this.getAttribute("height"))/2 + highlightTextHeight/2;
            if (d[6] > 0) 
            {
                svg.append("text")
                    .attr("id", "treemap-text-tooltip1")
                    .attr("text-anchor", "middle")
                    .attr("font-size", highlightTextHeight)
                    .attr("font-family", "arial")
                    .attr("font-weight", "bold")
                    .style("pointer-events", "none")
                    .attr("x", newX)
                    .attr("y", newY)
                    .text(d[5]);
            }
        });

    // Draw the title.
    base.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("font-size", titleLabelHeight)
        .attr("font-family", "arial")
        .attr("x", margin.left + width/2)
        .attr("y", titleLabelPaddingTop + titleLabelHeight/2)
        .text(title);  
}

/**
 * Create a Bubble chart object.
 *
 * @function
 * @param dataSet               Set of data to visualize.
 * @param labels                Set of labels associated with the data.
 * @param title                 Title of visualization.
 * @param width                 Width of the visualization.
 * @param height                Height of the visualization.
 * @param colors                Colors to use in the visualization.
 * @param margin                Margin specifications for the visualization.
 * @param xAxisLabelOrientation Orientation at which to position the x axis labels.
 */
function Bubble(dataSet, labels, columnTypes, title, width, height, colors, margin, xAxisLabelOrientation) 
{
    this.dataSet = dataSet;
    this.labels = labels;
    this.columnTypes = columnTypes;
    this.title = title;
    this.width = width;
    this.height = height;
    this.colors = colors;
    this.margin = margin;
    this.xAxisLabelOrientation = xAxisLabelOrientation;
}

/**
 * Draw the Bubble chart.
 *
 * @function
 * @param divId   The id of the div into which the visualization should be drawn.
 */
Bubble.prototype.draw = function(divId) 
{
    currentVisualization = this;

    // var margin = {top: 50, right: 40, bottom: 40, left: 55};
    var margin = this.margin;
    var w = this.width;
    var h = this.height;
    var highlightRadius = 6;
    var defaultRadius = 3;
    var highlightTextHeight = 12;
    var highlightTextPadding = 2;
    var highlightRectPadding = 6;
    var highlightRectFillColor = "rgb(225,225,225)";
    var highlightRectHeight = highlightTextHeight + highlightTextPadding * 2;
    var highlightRectWidth;
    var characterWidth = 6;
    var data = [];
    var dataPoints = [];
    var minBubbleRadius = 5;
    var maxBubbleRadius = 20;
    var xAxisLabelPaddingBottom = 2;
    var titleLabelHeight = margin.top/3;
    var titleLabelPaddingTop = (margin.top - titleLabelHeight)/2;
    var yAxisLabelPaddingLeft = 2;
    var axisLabelHeight = 12;
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;
    var rightGraphBoundary = width;//w - margin.right;    
    var numDataSets = this.dataSet[0].length;
    var numValuesPerDataSet = this.dataSet.length;
    var numXAxisTicks = numValuesPerDataSet;
    var numYAxisTicks = height/15;

    // Determine the min and max Y value for the datasets.
    var maxY = 0;
    var minY = 0;
    for (var j = 0; j < numValuesPerDataSet; j++) 
    {
        if (this.dataSet[j][1] > maxY) 
        {
            maxY = this.dataSet[j][1];
        }
        if (this.dataSet[j][1] < minY) 
        {
            minY = this.dataSet[j][1];
        }
    }
    
    // Determine if there is one or more data sets.
    var multiset = false;
    multiset = (numDataSets > 2) ? true : false;

    // Determine axis labels and title.
    var xAxisLabel = this.labels[0];
    var yAxisLabel = this.labels[1];
    var title = this.title;
    if (title == "") 
    {
        title = yAxisLabel + " vs. " + xAxisLabel;
    }
    
    // Determine scales.
    var xValues = [];
    if (this.columnTypes[0] != "String") 
    {
        var xScale = d3.scale.linear()
                 .domain([d3.min(this.dataSet, function(d) 
                    { 
                        return d[0]; 
                    }), d3.max(this.dataSet, function(d) 
                    { 
                        return d[0]; 
                    })])
                 .range([0, width]);
    } 
    else 
    {
        for (var i = 0; i < this.dataSet.length; i++) 
        {
            xValues.push(this.dataSet[i][0]);
        }
        var xScale = d3.scale.ordinal()
                        .domain(xValues)
                        .rangePoints([0,width]);
    }             

    var yScale = d3.scale.linear()
                        .domain([minY, maxY])
                        .range([height, 0])
                        .clamp(true);

    var rScale = d3.scale.linear()
                        .domain([0, d3.max(this.dataSet, function(d) 
                            {
                                return d[2]; 
                            })])
                        .range([minBubbleRadius, maxBubbleRadius]);

    if (numValuesPerDataSet > 25) 
    {
        numXAxisTicks = 25;
    }

    // Create axes.
    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(numXAxisTicks);

    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(numYAxisTicks);

    // Base visualization area.
    var base = d3.select("#" + divId)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
    // Background.
    base.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("fill", "white")
            .style("stroke", "black");
    // Canvas.
    var svg = base.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var line = d3.svg.line()
        .x(function(d) 
            { 
                return d[0]; 
            })
        .y(function(d) 
            { 
                return d[1]; 
            });

    var color = this.colors[0];
    var highlightColor = "orange";

    // If negative y values, draw guideline at y=0.
    if (minY < 0) 
    {
        svg.append("path")
            .attr("id", ("bubble-zero-line"))
            .style("stroke", "grey")
            .attr("d", line([[0, yScale(0)], [width, yScale(0)]]));
    }

    // Draw the x-axis.
    var xAxisObject = svg.append("g")
        .attr({
            class: "axis",
            transform: "translate(0," + (height) + ")"
            })
        .attr("width", width)
        .call(xAxis)

    styleXAxis(xAxisObject, this.xAxisLabelOrientation);

    // Draw the y-axis.
    var yAxisObject = svg.append("g")
        .attr("height", height)
        .attr({
            class: "y-axis",
            transform: "translate(" + 0 + ",0)"
            })
        .style("stroke", "black")
        .style("shape-rendering", "crispEdges")
        .attr("font-family", "arial")
        .attr("font-size", "11px")
        .attr("font-style", "normal")
        .call(yAxis);

    styleYAxis(yAxisObject, "end");

    // Draw x label.
    base.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "arial")
        .attr("x", margin.left + width/2)
        .attr("y", (h - (margin.bottom/4) - axisLabelHeight/2))
        .text(xAxisLabel);

    // Draw y label.
    base.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "arial")
        .attr("x", (0 + margin.left/5 + axisLabelHeight))
        .attr("transform", "rotate(-90, " + (0 + margin.left/5 + axisLabelHeight) + "," + h/2 + ")")
        .text(yAxisLabel);

    // Draw title.
    base.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("font-size", titleLabelHeight)
        .attr("font-family", "arial")
        .attr("x", margin.left + width/2)
        .attr("y", titleLabelPaddingTop + titleLabelHeight/2)
        .text(title);    

    // Set the toggle for each bubble to false.
    var toggle = [];
    for (var i = 0; i < numValuesPerDataSet; i++) 
    {
        toggle.push(false);
    }

    // Draw the bubbles.
    svg.selectAll("circle")
        .data(this.dataSet)
        .enter()
        .append("circle")
        .attr("cx", function(d) 
            { 
                return xScale(d[0]); 
            })
        .attr("cy", function(d) 
            { 
                return yScale(d[1]); 
            })
        .attr("r", function(d) 
            { 
                return rScale(d[2]); 
            })
        .attr("fill", color)
        .style("stroke", "black")
        .on("mouseover", function(d, i) 
        {
            this.setAttribute("fill", highlightColor);
            if (!toggle[i]) 
            {
                
                var x = Math.floor(this.getAttribute("cx")*100)/100;
                var y = Math.floor(this.getAttribute("cy")*100)/100;
                var r = Math.floor(this.getAttribute("r")*100)/100;
                var ind = (Math.floor(d[0]*100)/100);
                var dep = (Math.floor(d[1]*100)/100);
                var rad = (Math.floor(d[2]*100)/100);
                var labelText =  ind + ", " + dep + ": " + rad;
                var length = labelText.length;
                var rectWidth = length*characterWidth;

                // If the tooltip will go over the right edge, reposition them.
                var rightEdge = x + r + highlightRectPadding + rectWidth;
                if (rightEdge > width) 
                {
                    var lineData = [[x - r, y], [x - r - highlightRectPadding, y]];
                    var rectX = x - r - highlightRectPadding - rectWidth;
                } 
                else 
                {
                    var lineData = [[x + r, y], [x + r + highlightRectPadding, y]];
                    var rectX = x + r + highlightRectPadding;
                }

                var textX = rectX + highlightTextPadding;

                // Draw the tooltip.
                svg.append("path")
                    .attr("id", ("bubble-line-label"+i))
                    .style("stroke", "black")
                    .attr("d", line(lineData));
                svg.append("rect")
                    .attr("id", ("bubble-rect-label"+i))
                    .attr("x", rectX)
                    .attr("y", y - (highlightTextHeight + 2*highlightTextPadding)/2)
                    .attr("width", rectWidth)
                    .attr("height", highlightTextHeight + 2*highlightTextPadding)
                    .attr("fill", highlightRectFillColor)
                    .style("stroke", 'black');
                svg.append("text")
                    .attr("id", ("bubble-text-label"+i))
                    .attr("x", textX)
                    .attr("y", y + highlightTextHeight/3)
                    .attr("font-size", highlightTextHeight)
                    .attr("font-family", "arial")
                    .attr("font-weight", "bold")
                    .text(labelText);
            }
        })
        .on("click", function(d, i) 
        {
            d3.select(this).moveToFront()
            // Remove the tooltip created by the mouseover.
            d3.select(("#bubble-text-label"+i)).remove();
            d3.select(("#bubble-rect-label"+i)).remove();  
            d3.select(("#bubble-line-label"+i)).remove(); 

            toggle[i] = !toggle[i];

            // If the tooltip already existed, remove it immediately and return.
            if (!toggle[i]) 
            {
                d3.select(("#bubble-text-label"+i)).remove();
                d3.select(("#bubble-rect-label"+i)).remove();  
                d3.select(("#bubble-line-label"+i)).remove();
                return; 
            }

            // Otherwise create the tooltip.
            var x = Math.floor(this.getAttribute("cx")*100)/100;
            var y = Math.floor(this.getAttribute("cy")*100)/100;
            var r = Math.floor(this.getAttribute("r")*100)/100;
            var ind = (Math.floor(d[0]*100)/100);
            var dep = (Math.floor(d[1]*100)/100);
            var rad = (Math.floor(d[2]*100)/100);
            var labelText =  ind + ", " + dep + ": " + rad;
            var length = labelText.length;
            var rectWidth = length*characterWidth;
            
            // If the tooltip will go over the right edge, reposition them.
            var rightEdge = x + r + highlightRectPadding + rectWidth;
            if (rightEdge > width) 
            {
                var lineData = [[x - r, y], [x - r - highlightRectPadding, y]];
                var rectX = x - r - highlightRectPadding - rectWidth;
            } 
            else 
            {
                var lineData = [[x + r, y], [x + r + highlightRectPadding, y]];
                var rectX = x + r + highlightRectPadding;
            }

            var textX = rectX + highlightTextPadding;

            // Draw the tooltip.
            svg.append("path")
                .attr("id", ("bubble-line-label"+i))
                .style("stroke", "black")
                .attr("d", line(lineData));
            svg.append("rect")
                .attr("id", ("bubble-rect-label"+i))
                .attr("x", rectX)
                .attr("y", y - (highlightTextHeight + 2*highlightTextPadding)/2)
                .attr("width", rectWidth)
                .attr("height", highlightTextHeight + 2*highlightTextPadding)
                .attr("fill", highlightRectFillColor)
                .style("stroke", "black");
            svg.append("text")
                .attr("id", ("bubble-text-label"+i))
                .attr("x", textX)
                .attr("y", y + highlightTextHeight/3)
                .attr("font-size", highlightTextHeight)
                .attr("font-family", "arial")
                .attr("font-weight", "bold")
                .text(labelText);
        })
        .on("mouseout", function(d, i) 
        {
            this.setAttribute("fill", color);
            // If the tooltip should not persist, remove it.
            if (!toggle[i]) 
            {
                d3.select(("#bubble-text-label"+i)).remove();
                d3.select(("#bubble-rect-label"+i)).remove();  
                d3.select(("#bubble-line-label"+i)).remove();  
            }
        });
}

/**
 * Create a Pie chart object.
 *
 * @function
 * @param dataSet               Set of data to visualize.
 * @param labels                Set of labels associated with the data.
 * @param title                 Title of visualization.
 * @param width                 Width of the visualization.
 * @param height                Height of the visualization.
 * @param colors                Colors to use in the visualization.
 * @param margin                Margin specifications for the visualization.
 */
function Pie(dataSet, labels, title, width, height, colors, margin) 
{
    this.dataSet = dataSet;
    this.labels = labels;
    this.title = title;
    this.width = width;
    this.height = height;
    this.colors = colors;
    this.margin = margin;
}

/**
 * Draw the Pie chart.
 *
 * @function
 * @param divId   The id of the div into which the visualization should be drawn.
 */
Pie.prototype.draw = function(divId)
{
    currentVisualization = this;

    // var margin = {top: 50, right: 40, bottom: 25, left: 55};
    var margin = this.margin;

    var w = this.width;
    var h = this.height;
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;
    var labelLinePadding = 20;
    var outerRadius = height/2;
    var innerRadius = 0;
    var labelRadius = outerRadius + labelLinePadding;
    var highlightTextHeight = 15;
    var centerX = outerRadius;
    var centerY = outerRadius;
    var xAxisLabelPaddingBottom = 2;
    var titleLabelHeight = margin.top/3;
    var titleLabelPaddingTop = (margin.top - titleLabelHeight)/2;
    var yAxisLabelPaddingLeft = 2;
    var axisLabelHeight = 15;
    var rightGraphBoundary = width;
    var numDataSets = this.dataSet[0].length;
    var numValuesPerDataSet = this.dataSet.length;
    var categories = [];
    var data = [];
    var dataTotal = 0;
    var legendIconHeight = 15;
    var legendIconWidth = 15;
    var legendIconPadding = 3;
    var midWidth = 50;
    var legendTextHeight = legendIconHeight;
    var legendTextPadding = 5;

    // Determine axis labels and title.
    var xAxisLabel = this.labels[0];
    var yAxisLabel = this.labels[1];
    var title = this.title;
    if (title == "") 
    {
        title = yAxisLabel + " by " + xAxisLabel;
    }

    // Determine duplicates and condense into categories.
    for (var j = 0; j < numValuesPerDataSet; j++) 
    {
        isDuplicate = false;
        for (var t = 0; t < categories.length; t++) 
        {
            if (categories[t][0] == this.dataSet[j][0]) 
            {
                categories[t].push(j);
                isDuplicate = true;
            }
        }
        if (!isDuplicate) 
        {
            categories.push([this.dataSet[j][0], j]);
        }
    }

    // Calculate totals for each category.
    var categoryTotal = 0;
    for (var i = 0; i < categories.length; i++) 
    {
        categoryTotal = 0;
        for (var j = 1; j < categories[i].length; j++) 
        {
            categoryTotal += this.dataSet[categories[i][j]][1];
        }
        data.push(categoryTotal);
        dataTotal += categoryTotal;
    }

    var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);

    var pie = d3.layout.pie();

    var line = d3.svg.line()
        .x( function(d) 
            { 
                return d[0]; 
            })
        .y( function(d) 
            { 
                return d[1]; 
            });

    // Base visualization area.
    var base = d3.select("#" + divId)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
    // Background.
    base.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("fill", "white")
            .style("stroke", "black");
    // Canvas.
    var svg = base.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Retrieve colors/ gradients based on given colors and randomize the set.
    var mixedColorSet = getMixedColors(data.length, this.colors);
    mixedColorSet = shuffleArray(mixedColorSet);
    
    var arcs = svg.selectAll("g.arc")
                .data(pie(data))
                .enter()
                .append("g")
                .attr("class", "arc")
                .attr("transform", "translate(" + centerX + ", " + centerY + ")");

    // Set the toggle for each pie slice to false.
    var toggle = [];
    for (var i = 0; i < categories.length; i++) 
    {
        toggle.push(false);
    }

    // Draw icons for each pie slice.
    var iconX = outerRadius*2 + midWidth;
    for (var i = 0; i < data.length; i++) 
    {
        var iconY = i*(legendIconHeight+legendIconPadding);
        // Only draw the legend icons if they will be placed within the visualization window.
        if (iconY < height - legendIconHeight - legendIconPadding) 
        {
            svg.append("rect")
                .attr("x", iconX)
                .attr("y", iconY)
                .attr("height", legendIconHeight)
                .attr("width", legendIconWidth)
                .attr("fill", mixedColorSet[i])
                .style("stroke", "black");
            svg.append("text")
                .attr("id", ("legend-text-" + i))
                .attr("x", iconX + legendIconWidth + legendTextPadding)
                .attr("y", iconY)
                .attr("dx", 0)
                .attr("dy", legendTextHeight - 2)
                .attr("font-family", "arial")
                .attr("font-size", legendTextHeight)
                .text(categories[i][0]);
        }
    }

    // Draw the pie chart slices.
    arcs.append("path")
        .attr("fill", function(d, i) 
        {
            return mixedColorSet[i];
        })
        .attr("d", arc)
        .on("mouseover", function(d, i) 
        {
            if (!toggle[i]) 
            {
                // Bold the legend appropriate legend text.
                mouseover(categories[i][0], i);
                
                // Bold the appropriate legend text.
                this.setAttribute("fill", "orange");
                d3.select(this).style("stroke", "black");
                svg.append("text")
                    .attr("id", ("tooltip-text-" + i))
                    .attr("x", (centerX + arc.centroid(d)[0]))
                    .attr("y", (centerY + arc.centroid(d)[1]) + highlightTextHeight)
                    .attr("text-anchor", "middle")
                    .attr("text-family", "arial")
                    .attr("font-size", highlightTextHeight)
                    .attr("font-weight", "bold")
                    .style("pointer-events", "none")
                    .text( function(d) 
                    {
                        return Math.floor((data[i]/dataTotal)*10000)/100 + "%";
                    });
                svg.append("text")
                    .attr("id", ("tooltip-text2-" + i))
                    .attr("x", (centerX + arc.centroid(d)[0]))
                    .attr("y", (centerY + arc.centroid(d)[1]) - highlightTextHeight)
                    .attr("text-anchor", "middle")
                    .attr("text-family", "arial")
                    .attr("font-size", highlightTextHeight)
                    .attr("font-weight", "bold")
                    .style("pointer-events", "none")
                    .text( function(d) 
                    {
                        return Math.floor(data[i]*100)/100;
                    });
                svg.append("text")
                    .attr("id", ("tooltip-text3-" + i))
                    .attr("x", (centerX + arc.centroid(d)[0]))
                    .attr("y", (centerY + arc.centroid(d)[1]))
                    .attr("text-anchor", "middle")
                    .attr("text-family", "arial")
                    .attr("font-size", highlightTextHeight)
                    .attr("font-weight", "bold")
                    .style("pointer-events", "none")
                    .text( function(d) 
                    {
                        return categories[i][0];
                    });
            }
        })
        .on("click", function(d, i) 
        {
            d3.select(("#tooltip-text-" + i)).remove();
            d3.select(("#tooltip-text2-" + i)).remove();
            d3.select(("#tooltip-text3-" + i)).remove();

            toggle[i] = !toggle[i];

            // If the tooltips are already drawn, remove them.
            if (!toggle[i]) 
            {
                d3.select(("#tooltip-text-" + i)).remove();
                d3.select(("#tooltip-text2-" + i)).remove();
                d3.select(("#tooltip-text3-" + i)).remove();
                return;
            }

            // Bold the legend appropriate legend text.
            mouseover(categories[i][0], i);

            // Draw the tooltip texts.
            this.setAttribute("fill", "orange");
            d3.select(this).style("stroke", "black");
            svg.append("text")
                .attr("id", ("tooltip-text-" + i))
                .attr("x", (centerX + arc.centroid(d)[0]))
                .attr("y", (centerY + arc.centroid(d)[1]) + highlightTextHeight)
                .attr("text-anchor", "middle")
                .attr("text-family", "arial")
                .attr("font-size", highlightTextHeight)
                .attr("font-weight", "bold")
                .style("pointer-events", "none")
                .text( function(d) 
                {
                    return Math.floor((data[i]/dataTotal)*10000)/100 + "%";
                });
            svg.append("text")
                .attr("id", ("tooltip-text2-" + i))
                .attr("x", (centerX + arc.centroid(d)[0]))
                .attr("y", (centerY + arc.centroid(d)[1]) - highlightTextHeight)
                .attr("text-anchor", "middle")
                .attr("text-family", "arial")
                .attr("font-size", highlightTextHeight)
                .attr("font-weight", "bold")
                .style("pointer-events", "none")
                .text( function(d) 
                {
                    return Math.floor(data[i]*100)/100;
                });
            svg.append("text")
                .attr("id", ("tooltip-text3-" + i))
                .attr("x", (centerX + arc.centroid(d)[0]))
                .attr("y", (centerY + arc.centroid(d)[1]))
                .attr("text-anchor", "middle")
                .attr("text-family", "arial")
                .attr("font-size", highlightTextHeight)
                .attr("font-weight", "bold")
                .style("pointer-events", "none")
                .text( function(d) 
                {
                    return categories[i][0];
                });
        })
        .on("mouseout", function(d, i) 
        {
            // Unbold the appropriate legend text.
            mouseout(categories[i][0], i);

            // Remove the tooltips based on the toggle state.
            this.setAttribute("fill", mixedColorSet[i]);
            if (!toggle[i]) 
            {
                d3.select(this).style("stroke", "none");
                d3.select(("#tooltip-text-" + i)).remove();
                d3.select(("#tooltip-text2-" + i)).remove();
                d3.select(("#tooltip-text3-" + i)).remove();
            }
        });

        // Draw the title.
        base.append("text")
            .attr("class", "title")
            .attr("text-anchor", "middle")
            .attr("font-size", titleLabelHeight)
            .attr("font-family", "arial")
            .attr("x", margin.left + width/2)
            .attr("y", titleLabelPaddingTop + titleLabelHeight/2)
            .text(title); 

        // Bold the given legend text.
        function mouseover(labelName, i) 
        {
            if (!toggle[i]) 
            {
                svg.selectAll(("#legend-text-" + i))
                    .each(function() 
                    {
                        if (this.textContent == labelName) 
                        {
                            d3.select(this).attr("font-weight", "bold");
                        }
                    });
            }
        }

        // Unbold the given legend text.
        function mouseout(labelName, i) 
        {
            if (!toggle[i]) 
            {
                svg.selectAll(("#legend-text-" + i))
                    .each(function() 
                    {
                        if (this.textContent == labelName) 
                        {
                            d3.select(this).attr("font-weight", "normal");
                        }
                    });
            }
        }
}

/**
 * Create a Scatter plot object.
 *
 * @function
 * @param dataSet               Set of data to visualize.
 * @param labels                Set of labels associated with the data.
 * @param title                 Title of visualization.
 * @param width                 Width of the visualization.
 * @param height                Height of the visualization.
 * @param colors                Colors to use in the visualization.
 * @param margin                Margin specifications for the visualization.
 * @param xAxisLabelOrientation Orientation at which to position the x axis labels.
 */
function Scatter(dataSet, labels, columnTypes, title, width, height, colors, margin, xAxisLabelOrientation) 
{
    this.dataSet = dataSet;
    this.labels = labels;
    this.columnTypes = columnTypes;
    this.title = title;
    this.width = width;
    this.height = height;
    this.colors = colors;
    this.margin = margin;
    this.xAxisLabelOrientation = xAxisLabelOrientation;
}

/**
 * Draw the Scatter plot.
 *
 * @function
 * @param divId   The id of the div into which the visualization should be drawn.
 */
Scatter.prototype.draw = function(divId) 
{
    currentVisualization = this;

    // var margin = {top: 50, right: 65, bottom: 40, left: 65};
    var margin = this.margin;

    var w = this.width;
    var h = this.height;
    var highlightRadius = 8;
    var defaultRadius = 4;
    var highlightTextHeight = 12;
    var highlightTextPadding = 2;
    var highlightRectFillColor = "rgb(225,225,225)";
    var highlightRectHeight = highlightTextHeight + highlightTextPadding * 2;
    var highlightRectWidth, highlightRectWidth2;
    var characterWidth = 6;
    var colorIconHeight = 10;
    var colorIconWidth = 10;
    var xAxisLabelPaddingBottom = 2;
    var titleLabelHeight = margin.top/3;
    var titleLabelPaddingTop = (margin.top - titleLabelHeight)/2;
    var yAxisLabelPaddingLeft = 2;
    var yAxisLabelPaddingRight = 2;
    var axisLabelHeight = 12;
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;
    var numDataSets = this.dataSet[0].length;
    var numValuesPerDataSet = this.dataSet.length;

    // Determine the maximum Y value for the datasets.
    var maxY = 0;
    var minY = 0;
    var yValues = [];
    for (var i = 0; i < numValuesPerDataSet; i++) 
    {
        yValues.push(this.dataSet[i][1]);
        if (this.dataSet[i][1] > maxY) 
        {
            maxY = this.dataSet[i][1];
        }
        if (this.dataSet[i][1] < minY) 
        {
            minY = this.dataSet[i][1];
        }
    }

    var xValues = [];

    // Set flag for whether or not there are multiple data sets.
    var multiset = false;
    multiset = (numDataSets > 2) ? true : false;

    // Determine the axis labels and chart title.
    var xAxisLabel = this.labels[0];
    var yAxisLabel = this.labels[1];
    if (multiset) 
    {
        var yAxisLabel2 = this.labels[2];
    }
    var title = this.title;
    if (title == "") 
    {
        if (!multiset) 
        {
            title = yAxisLabel + " vs. " + xAxisLabel;
        } 
        else 
        {
            title = yAxisLabel + " and " + yAxisLabel2 + " vs. " + xAxisLabel;       
        }
    }

    // If multiple data sets, retrieve second data set and calculate min/max. 
    if (multiset) 
    {
        var maxY2 = 0;
        var minY2 = 0;
        var yValues2 = [];
        for (var i = 0; i < numValuesPerDataSet; i++) 
        {
            yValues2.push(this.dataSet[i][2]);
            if (this.dataSet[i][2] > maxY2) 
            {
                maxY2 = this.dataSet[i][2];
            }
            if (this.dataSet[i][2] < minY2) 
            {
                minY2 = this.dataSet[i][2];
            }
        }
    }


    // Calculate scales.

    // If x-axis is String data, use ordinal scale, otherwise use linear.
    if (this.columnTypes[0] != "String") 
    {
        var xScale = d3.scale.linear()
                        .domain([d3.min(this.dataSet, function(d) 
                            { 
                                return d[0]; 
                            }), d3.max(this.dataSet, function(d) 
                            { 
                                return d[0]; 
                            })])
                        .range([0, width]);
    } 
    else 
    {
        for (var i = 0; i < this.dataSet.length; i++) 
        {
            xValues.push(this.dataSet[i][0]);
        }
        var xScale = d3.scale.ordinal()
                        .domain(xValues)
                        .rangePoints([0,width]);
    }

    var yScale = d3.scale.linear()
                        .domain([minY, maxY])
                        .range([height, 0])
                        .clamp(true);

    if (multiset) 
    {
        var yScale2 = d3.scale.linear()
                        .domain([minY2, maxY2])
                        .range([height, 0])
                        .clamp(true);
    }

    // Calculate number of axis ticks.
    if (numValuesPerDataSet > 25) 
    {
        numXAxisTicks = 25;
    }
    var numXAxisTicks = numValuesPerDataSet;
    var numYAxisTicks = height/15;

    // Create axes.
    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(numXAxisTicks);

    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(numYAxisTicks);

    if (multiset) 
    {
        var yAxis2 = d3.svg.axis()
                        .scale(yScale2)
                        .orient("right")
                        .ticks(numYAxisTicks);
    }


    // Get scaled data set values.
    var xValuesScaled = [];
    var yValues2Scaled = [];
    var yValuesScaled = [];
    for (var i = 0; i < numValuesPerDataSet; i++) 
    {
        xValuesScaled.push(xScale(this.dataSet[i][0]));
        yValuesScaled.push(yScale(this.dataSet[i][1]));
        if (multiset) 
        {
            yValues2Scaled.push(yScale2(this.dataSet[i][2]));
        }
    }

    // Visualization base object.
    var base = d3.select("#" + divId)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("id","visSvg");
    // Background.
    base.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("fill", "white")
            .style("stroke", "black");
    // Internal canvas.
    var svg = base.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var line = d3.svg.line()
        .x( function(d) 
            { 
                return d[0]; 
            })
        .y( function(d) 
            { 
                return d[1]; 
            });

    // If negative y values and single data set, draw a guideline at y=0.
    if (!multiset && minY < 0) 
    {
        svg.append("path")
            .attr("id", ("scatter-zero-line"))
            .style("stroke", "grey")
            .attr("d", line([[0, yScale(0)], [width, yScale(0)]]));
    }

    // Draw the x-axis.
    var xAxisObject = svg.append("g")
        .attr({
            class: "axis",
            transform: "translate(0," + (height) + ")"
            })
        .attr("width", width)
        .call(xAxis);

    styleXAxis(xAxisObject, this.xAxisLabelOrientation);

    // Draw the y-axis.
    var yAxisObject = svg.append("g")
        .attr("height", height)
        .attr({
            class: "y-axis",
            id: "y-axis-scatter-1",
            transform: "translate(" + 0 + ",0)"
            })
        .call(yAxis);

    styleYAxis(yAxisObject, "end");

    if (multiset) 
    {
        // Draw the y-axis.
        var y2AxisObject = svg.append("g")
            .attr("height", height)
            .attr({
                class: "y-axis",
                id: "y-axis-scatter-2",                
                transform: "translate(" + width + ",0)"
                })
            .call(yAxis2);

        styleYAxis(y2AxisObject, "start");
    }

    // X axis label.
    base.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "arial")
        .attr("x", margin.left + width/2)
        .attr("y", (h - (margin.bottom/4) - axisLabelHeight/2))
        .text(xAxisLabel);

    // Y axis label.
    base.append("text")
        .attr("class", "y-label")
        .attr("id", "y-label-scatter-1")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "arial")
        .attr("font-weight", "normal")
        .attr("y", h/2)
        .attr("x", (0 + margin.left/5 + axisLabelHeight))
        .attr("transform", "rotate(-90, " + (0 + margin.left/5 + axisLabelHeight) + "," + h/2 + ")")
        .text(yAxisLabel);

    // Second y axis label.
    if (multiset) 
    {
        base.append("text")
            .attr("class", "y-label2")
            .attr("id", "y-label-scatter-2")
            .attr("text-anchor", "middle")
            .attr("font-size", axisLabelHeight)
            .attr("font-family", "arial")
            .attr("font-weight", "normal")
            .attr("y", h/2)
            .attr("x", (w - (margin.right/5) - axisLabelHeight))
            .attr("transform", "rotate(90, " + (w - (margin.right/5) - axisLabelHeight) + "," + h/2 + ")")
            .text(yAxisLabel2);
    }

    // Title.
    base.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("font-size", titleLabelHeight)
        .attr("font-family", "arial")
        .attr("x", margin.left + width/2)
        .attr("y", titleLabelPaddingTop + titleLabelHeight/2)
        .text(title);    

    // Populate the toggle list with false for every data point.
    var toggle = [];
    for (var i = 0; i < numValuesPerDataSet; i++) 
    {
        toggle.push(false);
        if (multiset) 
        {
            toggle.push(false);
        }
    }

    // Get the first data set and color.
    var data = getData([0,1],this.dataSet);
    var color = this.colors[0];

    // Create the first data set circles.
    svg.selectAll(("circle.set" + 1))
        .data(data)
        .enter()
        .append("circle")
        .attr("class", ("data-point-set" + 1))
        .attr("cx", function(d, i) 
        {
            return xScale(d[0]);
        })
        .attr("cy", function(d, i) 
        {
            return yScale(d[1]);
        })
        .attr("r", defaultRadius)
        .attr("fill", color)
        .style("stroke", "black")
        .on("mouseover", function(d, i) 
        {
            if(!toggle[i]) 
            {
                var x = xScale(d[0]);
                var y = yScale(d[1]);
                var col = color;
                var highlightText = (Math.floor(d[0]*100)/100) + ", " + (Math.floor(d[1]*100)/100);
                var xRect = x + 2*highlightRadius;
                var yRect = y - highlightRectHeight/2;
                var xText = xRect + highlightTextPadding;
                var yText = yRect + highlightTextHeight;
                var lineData = [[x+highlightRadius,y],[x+2*highlightRadius,y]]; 
                
                // Determine if tooltip will go over right edge of screen, and if so, adjust position accordingly.
                highlightRectWidth = (2*highlightTextPadding) + (characterWidth*highlightText.length);
                if (xRect + highlightRectWidth > width) 
                {
                    lineData = [[x-2*highlightRadius, y],[x-highlightRadius, y]];
                    xRect = x - 2*highlightRadius - highlightRectWidth;
                    xText = xRect + highlightTextPadding;
                }

                // Create Tooltip.
                createTooltipCircle(1, i, x, y, col, highlightRadius);
                createTooltipRect(1, i, xRect, yRect, col, highlightRectWidth, highlightRectHeight);
                createTooltipText(1, i, xText, yText, highlightText);
                createTooltipLine(1, i, col, lineData);
            }
        })
        .on("click", function(d, i) 
        {
            removeTooltips(1, i);  

            toggle[i] = !toggle[i];

            // If the popup already existed, remove if immediately and return.
            if (!toggle[i]) 
            {
                removeTooltips(1, i);
                return;
            }

            var x = xScale(d[0]);
            var y = yScale(d[1]);
            var col = color;
            var highlightText = (Math.floor(d[0]*100)/100) + ", " + (Math.floor(d[1]*100)/100);
            var xRect = x + 2*highlightRadius;
            var yRect = y - highlightRectHeight/2;
            var xText = xRect + highlightTextPadding;
            var yText = yRect + highlightTextHeight;
            var lineData = [[x+highlightRadius,y],[x+2*highlightRadius,y]]; 
            
            highlightRectWidth = (2*highlightTextPadding) + (characterWidth*highlightText.length);
            if (xRect + highlightRectWidth > width) 
            {
                lineData = [[x-2*highlightRadius, y],[x-highlightRadius, y]];
                xRect = x - 2*highlightRadius - highlightRectWidth;
                xText = xRect + highlightTextPadding;
            }

            // Create Tooltip.
            createTooltipCircle(1, i, x, y, col, highlightRadius);
            createTooltipRect(1, i, xRect, yRect, col, highlightRectWidth, highlightRectHeight);
            createTooltipText(1, i, xText, yText, highlightText);
            createTooltipLine(1, i, col, lineData);
        })
        .on("mouseout", function(d, i) 
        {
        // If the popup should not persist, remove it.
        if (!toggle[i]) 
        {
            removeTooltips(1, i);  
        }
    });            

    // Create second data set.
    if (multiset) 
    {
        var data2 = getData([0,2],this.dataSet);
        var color2 = this.colors[1];

        svg.selectAll(("circle.set" + 2))
            .data(data2)
            .enter()
            .append("circle")
            .attr("class", ("data-point-set" + 2))
            .attr("cx", function(d, i) 
            {
                return xScale(d[0])
            })
            .attr("cy", function(d, i) 
            {
                return yScale2(d[1]);
            })
            .attr("r", defaultRadius)
            .attr("fill", color2)
            .style("stroke", "black")
            .on("mouseover", function(d, i) 
            {
                if(!toggle[numValuesPerDataSet + i]) 
                {
                    var x2 = xScale(d[0]);
                    var y2 = yScale2(d[1]);
                    var col2 = color2;
                    var highlightText2 = (Math.floor(d[0]*100)/100) + ", " + (Math.floor(d[1]*100)/100);
                    var xRect2 = x2 + 2*highlightRadius;
                    var yRect2 = y2 - highlightRectHeight/2;
                    var xText2 = xRect2 + highlightTextPadding;
                    var yText2 = yRect2 + highlightTextHeight;
                    var lineData2 = [[x2+highlightRadius,y2],[x2+2*highlightRadius,y2]]; 
                    
                    highlightRectWidth2 = (2*highlightTextPadding) + (characterWidth*highlightText2.length);
                    if (xRect2 + highlightRectWidth2 > width) 
                    {
                        lineData2 = [[x2-2*highlightRadius, y2],[x2-highlightRadius, y2]];
                        xRect2 = x2 - 2*highlightRadius - highlightRectWidth2;
                        xText2 = xRect2 + highlightTextPadding;
                    }

                    // Create Tooltip.
                    createTooltipCircle(2, i, x2, y2, col2, highlightRadius);
                    createTooltipRect(2, i, xRect2, yRect2, col2, highlightRectWidth2, highlightRectHeight);
                    createTooltipText(2, i, xText2, yText2, highlightText2);
                    createTooltipLine(2, i, col2, lineData2);
                }
            })
            .on("click", function(d, i) 
            {
                removeTooltips(2, i);  

                toggle[numValuesPerDataSet + i] = !toggle[numValuesPerDataSet + i];

                // If the popup already existed, remove if immediately and return.
                if (!toggle[numValuesPerDataSet + i]) 
                {
                    removeTooltips(2, i);
                    return;
                }

                var x2 = xScale(d[0]);
                var y2 = yScale2(d[1]);
                var col2 = color2;
                var highlightText2 = (Math.floor(d[0]*100)/100) + ", " + (Math.floor(d[1]*100)/100);
                var xRect2 = x2 + 2*highlightRadius;
                var yRect2 = y2 - highlightRectHeight/2;
                var xText2 = xRect2 + highlightTextPadding;
                var yText2 = yRect2 + highlightTextHeight;
                var lineData2 = [[x2+highlightRadius,y2],[x2+2*highlightRadius,y2]]; 
                
                highlightRectWidth2 = (2*highlightTextPadding) + (characterWidth*highlightText2.length);
                if (xRect2 + highlightRectWidth2 > width) 
                {
                    lineData2 = [[x2-2*highlightRadius, y2],[x2-highlightRadius, y2]];
                    xRect2 = x2 - 2*highlightRadius - highlightRectWidth2;
                    xText2 = xRect2 + highlightTextPadding;
                }

                // Create Tooltip.
                createTooltipCircle(2, i, x2, y2, col2, highlightRadius);
                createTooltipRect(2, i, xRect2, yRect2, col2, highlightRectWidth2, highlightRectHeight);
                createTooltipText(2, i, xText2, yText2, highlightText2);
                createTooltipLine(2, i, col2, lineData2);
            })
            .on("mouseout", function(d, i) 
            {
                // If the popup should not persist, remove it.
                if (!toggle[numValuesPerDataSet + i]) 
                {
                removeTooltips(2, i); 
                }
            });   
    }

    // If multiple data sets, place color icons on either side of the graph.
    if (multiset) 
    {
        base.append("rect")
            .attr("id", "colorIcon1")
            .attr("x", (margin.left/2 - colorIconWidth/2))
            .attr("y", (margin.top + (height - colorIconHeight)))
            .attr("height", colorIconHeight)
            .attr("width", colorIconWidth)
            .style("stroke", "black")
            .style("fill", this.colors[0]);  
        base.append("rect")
            .attr("id", "colorIcon2")
            .attr("x", (w - (margin.right/2 + colorIconWidth/2)))
            .attr("y", (margin.top + (height - colorIconHeight)))
            .attr("height", colorIconHeight)
            .attr("width", colorIconWidth)
            .style("stroke", "black")
            .style("fill", this.colors[1]);
    }

    function createTooltipCircle(set, i, x, y, color, radius) 
    {
        console.log("creating tooltip circle - set (" + set + ") - i (" + i + ")");
        svg.append("circle")
            .attr("id", ("circle-highlight" + set + "-" + i))
            .attr("cx", x)
            .attr("cy", y)
            .attr("fill", "none")
            .style("stroke", color)
            .attr("r", radius);
    }

    function createTooltipRect(set, i, x, y, color, width, height) 
    {
        console.log("creating tooltip rect - set (" + set + ") - i (" + i + ")");
        svg.append("rect")
            .attr("id", ("tooltip-rect" + set + "-" + i))
            .attr("x", x)
            .attr("y", y)
            .attr("fill", highlightRectFillColor)
            .style("stroke", color)
            .attr("width", width)
            .attr("height", height);
    }

    function createTooltipText(set, i, x, y, text) 
    {
        svg.append("text")
            .attr("id", ("tooltip-text" + set + "-" + i))
            .attr("x", x)
            .attr("y", y)
            .style("pointer-events", "none")
            .attr("text-anchor", "start")
            .attr("font-family", "arial")
            .attr("font-size", highlightTextHeight)
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .text(text); 
    }

    function createTooltipLine(set, i, color, lineData)
    {
        svg.append("path")
            .attr("id", ("tooltip-line" + set + "-" + i))
            .style("stroke", color)
            .attr("d", line(lineData));
    }

    function removeTooltips(set, i) 
    {
        console.log("remove tooltips - set (" + set + ") - i (" + i + ")");
        d3.select(("#circle-highlight" + set + "-" + i)).remove();
        d3.select(("#tooltip-rect" + set + "-" + i)).remove();  
        d3.select(("#tooltip-text" + set + "-" + i)).remove();
        d3.select(("#tooltip-line" + set + "-" + i)).remove();  
    }
}


/**
 * Create a Line graph object.
 *
 * @function
 * @param dataSet               Set of data to visualize.
 * @param labels                Set of labels associated with the data.
 * @param title                 Title of visualization.
 * @param width                 Width of the visualization.
 * @param height                Height of the visualization.
 * @param colors                Colors to use in the visualization.
 * @param margin                Margin specifications for the visualization.
 * @param xAxisLabelOrientation Orientation at which to position the x axis labels.
 */
function Line(dataSet, labels, columnTypes, title, width, height, colors, margin, xAxisLabelOrientation, showPoints) 
{
    this.dataSet = dataSet;
    this.labels = labels;
    this.columnTypes = columnTypes;
    this.title = title;
    this.width = width;
    this.height = height;
    this.colors = colors;
    this.margin = margin;
    this.xAxisLabelOrientation = xAxisLabelOrientation;
    this.showPoints = showPoints;
}

/**
 * Draw the Line graph.
 *
 * @function
 * @param divId   The id of the div into which the visualization should be drawn.
 */
Line.prototype.draw = function (divId) 
{

    currentVisualization = this;

    // var margin = {top: 50, right: 65, bottom: 40, left: 65};
    var margin = this.margin;

    var w = this.width;
    console.log("initial w: " + w);
    var h = this.height;
    var defaultRadius = 3;
    var highlightRadius = 6;
    var highlightLineWidth = highlightRadius;
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
    var xAxisLabelPaddingBottom = 2;
    var titleLabelHeight = margin.top/3;
    var titleLabelPaddingTop = (margin.top - titleLabelHeight)/2;
    var yAxisLabelPaddingLeft = 2;
    var yAxisLabelPaddingRight = 2;
    var axisLabelHeight = 12;
    var colorIconWidth = 10;
    var colorIconHeight = 10;
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;
    var rightGraphBoundary = width;    
    var numDataSets = this.dataSet[0].length;
    var numValues = this.dataSet.length;
    var numXAxisTicks = numValues;
    var numYAxisTicks = height/15;

    // Determine the min and max Y value for the first data set.
    var maxY = 0;
    var minY = 0;
    for (var i = 1; i < numValues; i++) 
    {
        if (this.dataSet[i][1] > maxY) 
        {
            maxY = this.dataSet[i][1];
        }
        if (this.dataSet[i][1] < minY) 
        {
            minY = this.dataSet[i][1];
        }
    }

    // Determine if there are multiple data sets or not.
    var multiline = false;
    multiline = (numDataSets > 2) ? true : false;

    // Determine the min and max y value for the second data set.
    if (multiline) 
    {
        var maxY2 = 0;
        var minY2 = 0;
        for (var i = 1; i < numValues; i++) 
        {
            if (this.dataSet[i][2] > maxY2) 
            {
                maxY2 = this.dataSet[i][2];
            }
            if (this.dataSet[i][2] < minY2) 
            {
                minY2 = this.dataSet[i][2];
            }
        }
    }
    
    // Determine the axis labels and title.
    var xAxisLabel = this.labels[0];
    var yAxisLabel = this.labels[1];
    if (multiline) 
    {
        var yAxisLabel2 = this.labels[2];
    }
    var title = this.title;
    if (title == "") 
    {
        if (multiline) 
        {
            title = yAxisLabel + " and " + yAxisLabel2 + " vs. " + xAxisLabel;
        } 
        else 
        {
            title = yAxisLabel + " vs. " + xAxisLabel;
        }
    }

    // Calculate scales.
    if (this.columnTypes[0] != "String") 
    {

        var xScale = d3.scale.linear()
                 .domain([d3.min(this.dataSet, function(d) 
                    { 
                        return d[0]; 
                    }), d3.max(this.dataSet, function(d) 
                    { 
                        return d[0]; 
                    })])
                 .range([0, width])
                 .clamp(true);

    } 
    else 
    {
        for (var i = 0; i < this.dataSet.length; i++) 
        {
            xValues.push(this.dataSet[i][0]);
        }

        var xScale = d3.scale.ordinal()
                        .domain(xValues)
                        .rangePoints([0,width]);
    }                 

    var yScale = d3.scale.linear()
                        .domain([minY, maxY])
                        .range([height, 0])
                        .clamp(true);

    if (multiline) 
    {
        var yScale2 = d3.scale.linear()
                        .domain([minY2, maxY2])
                        .range([height, 0])
                        .clamp(true);
    }

    if (numValues > 25) 
    {
        numXAxisTicks = 25;
    }

    // Create axes.
    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(numXAxisTicks);

    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(numYAxisTicks);

    if (multiline) 
    {
        var yAxis2 = d3.svg.axis()
                    .scale(yScale2)
                    .orient("right")
                    .ticks(numYAxisTicks);
    }

    var line = d3.svg.line()
            .x( function(d) 
                { 
                    return xScale(d[0]); 
                })
            .y( function(d) 
                { 
                    return yScale(d[1]); 
                });

    var line2 = d3.svg.line()
            .x( function(d) 
                { 
                    return xScale(d[0]); 
                })
            .y( function(d) 
                { 
                    return yScale2(d[1]); 
                });

    var unscaledLine = d3.svg.line()
            .x( function(d) 
                { 
                    return d[0]; 
                })
            .y( function(d) 
                { 
                    return d[1]; 
                }); 

    // Base visualization area.
    var base = d3.select("#" + divId)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
    // Background.
    base.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("fill", "white")
            .style("stroke", "black");
    // Canvas.
    var svg = base.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // If multiple data sets and negative y values, draw a guideline at y = 0.
    if (!multiline && minY < 0) 
    {
        svg.append("path")
            .attr("id", ("line-zero-line"))
            .style("stroke", "grey")
            .attr("d", unscaledLine([[0, yScale(0)], [width, yScale(0)]]));
    }

    // Setup the vertical guideline.
    var focus = svg.append("g")
          .style("display", "none");
    
    var lineData = [ [0, 0], [0, height] ];
    
    // Draw the vertical guideline.
    focus.append("path")
        .attr("class", "guideline")
        .attr("style", "stroke: gray")
        .attr("d", unscaledLine(lineData));


    // Actions that occur when the mouse moves within the graph.
    function mousemove() 
    {        
        var mouseX = d3.mouse(this)[0];

        // Move the guideline to align with the mouse movement.
        if (mouseX >= 0) 
        {    
            focus.attr("transform", "translate(" + mouseX + "," + 0 + ")");
        }

        // Determine which data points are highlighted by the guideline.
        var pointsHighlighted = [];
        svg.selectAll(".data-point")
            .each( function() 
            {
                if ( Math.abs(this.getAttribute("cx") - mouseX) < defaultRadius ) 
                {
                    pointsHighlighted.push([this.getAttribute("cx"),this.getAttribute("cy")]);
                }

            });

        var numPointsHighlighted = pointsHighlighted.length;
        var numDataPoints = dataPoints.length;
        
        var dataPointsHighlighted = [];
        // Determine which indices of dataPoints are highlighted
        for (var i = 0; i < numPointsHighlighted; i++) 
        {
            for (var j = 0; j < numDataPoints; j++) 
            {
                if (pointsHighlighted[i][0] == dataPoints[j][0][0] && pointsHighlighted[i][1] == dataPoints[j][0][1]) 
                {
                    if (dataPointsHighlighted.indexOf(j) == -1) 
                    {
                        dataPointsHighlighted.push(j);
                    }
                    else 
                    {
                        continue;
                    }
                    break;
                }
            }
        }

        // Look through all circle highlight elements and display those that correspond to the highlighted data points.
        var display = false;
        svg.selectAll(".circle-highlight")
            .attr("display", function() 
            {
                display = false;
                for (var i = 0; i < dataPointsHighlighted.length; i++) 
                {
                    if (this.getAttribute("cx") == dataPoints[dataPointsHighlighted[i]][0][0] && this.getAttribute("cy") == dataPoints[dataPointsHighlighted[i]][0][1] ) 
                    {
                        display = true;
                        break;
                    }
                }

                if (display) 
                {
                    focus.attr("transform", "translate(" + this.getAttribute("cx") + "," + 0 + ")");
                    return null;
                }
                else 
                {
                    return "none";
                }
            });

        // Look through all rectangle highlight elements and display those that correspond to the highlighted data points.
        svg.selectAll(".rect-highlight")
            .moveToFront()
            .attr("display", function() 
            {
                display = false;
                for (var i = 0; i < dataPointsHighlighted.length; i++) 
                {
                    if (this.getAttribute("x") == dataPoints[dataPointsHighlighted[i]][1][0] && this.getAttribute("y") == dataPoints[dataPointsHighlighted[i]][1][1] ) 
                    {
                        display = true;
                        break;
                    }
                }                

                // If display == true, return null, else return "none."
                return (display) ? null : "none";
            });

        // Look through all text highlight elements and display those that correspond to the highlighted data points.
        svg.selectAll(".text-highlight")
            .attr("display", function() 
            {
                display = false;
                for (var i = 0; i < dataPointsHighlighted.length; i++) 
                {
                    if (this.getAttribute("x") == dataPoints[dataPointsHighlighted[i]][2][0] && this.getAttribute("y") == dataPoints[dataPointsHighlighted[i]][2][1] ) 
                    {
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
    var xAxisObject = svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height) + ")")
        .attr("width", width)
        .call(xAxis);

    styleXAxis(xAxisObject, this.xAxisLabelOrientation);

    // Display the y-axis. 
    var yAxisObject = svg.append("g")
        .attr("height", height)
        .attr({
            class: "y-axis",
            id: "y-axis-line-1",                
            })
        .call(yAxis);

    styleYAxis(yAxisObject, "end");

    if (multiline) 
    {
        // Display the y-axis.        
        var y2AxisObject = svg.append("g")
            .attr("height", height)
            .attr({
                class: "y-axis",
                id: "y-axis-line-2",                
                transform: "translate(" + width + ",0)"
                })
            .call(yAxis2);

        styleYAxis(y2AxisObject, "start");
    }   

    // Draw x label.
    base.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "arial")
        .attr("x", margin.left + width/2)
        .attr("y", (h - (margin.bottom/4) - axisLabelHeight/2))
        .text(xAxisLabel);

    // Draw y label.
    base.append("text")
        .attr("class", "y-label")
        .attr("id", "y-label-line-2")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "arial")
        .attr("y", h/2)
        .attr("x", (0 + margin.left/5 + axisLabelHeight))
        .attr("transform", "rotate(-90, " + (0 + margin.left/5 + axisLabelHeight) + "," + h/2 + ")")
        .text(yAxisLabel);

    // Draw second y label.
    if (multiline) 
    {
        base.append("text")
            .attr("class", "y-label2")
            .attr("id", "y-label-line-2")
            .attr("text-anchor", "middle")
            .attr("font-size", axisLabelHeight)
            .attr("font-family", "arial")
            .attr("font-weight", "normal")
            .attr("y", h/2)
            .attr("x", (w - (margin.right/5) - axisLabelHeight))
            .attr("transform", "rotate(90, " + (w - (margin.right/5) - axisLabelHeight) + "," + h/2 + ")")
            .text(yAxisLabel2);
    }        

    // Draw the title.
    base.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("font-size", titleLabelHeight)
        .attr("font-family", "arial")
        .attr("x", margin.left + width/2)
        .attr("y", titleLabelPaddingTop + titleLabelHeight/2)
        .text(title);    

    // For each data set.
    for (var i = 1; i < numDataSets; i++) 
    {
        data = getData([0,i],this.dataSet);
        dataScaled = [];

        // Scale the data sets.
        for (var x = 0; x < data.length; x++) 
        {
            dataScaledX = xScale(data[x][0]);
            if (i == 1) 
            {
                dataScaledY = yScale(data[x][1]);
            } 
            else 
            {
                dataScaledY = yScale2(data[x][1]);
            }
            dataScaled.push([dataScaledX, dataScaledY]);
        }

        // Display the line for the dataset.
        svg.append("path")
            .attr("fill", "none")
            .attr("style", "stroke: " + this.colors[i-1])
            .attr("d", function() 
            {
                if (i == 1) 
                {
                    return line(data);
                } 
                else 
                {
                    return line2(data);
                }
            });

        // If instructed, display the data points.
        if (this.showPoints) 
        {            
            for (var j = 0; j < numValues; j++) 
            {
                pointX = dataScaled[j][0];
                pointY = dataScaled[j][1];


                // If this x-value has not been seen before, add it to the list of x-values.
                if (xValues.indexOf(pointX) == -1) 
                {
                    xValues.push(pointX);
                }

                // Display the data point circles.
                svg.append("circle")
                    .attr("class", "data-point")
                    .attr("cx", pointX)
                    .attr("cy", pointY)
                    .attr("r", defaultRadius)
                    .attr("fill", this.colors[i-1])
                    .attr("color", this.colors[i-1]);

                // Add hidden circle highlight elements.
                svg.append("circle")
                    .attr("class", "circle-highlight")
                    .attr("cx", pointX)
                    .attr("cy", pointY)
                    .attr("r", highlightRadius)
                    .attr("fill", "none")
                    .attr("display", "none")
                    .attr("stroke", this.colors[i-1]);

                // Determine the text associated with the data point when highlighted.
                highlightText[j] = (Math.floor(data[j][0]*100)/100) + ", " + (Math.floor(data[j][1]*100)/100);

                var highlightRectWidth = (highlightText[j].length*characterWidth)+highlightTextPadding;
                var highlightRectHeight = highlightTextHeight + (2 * highlightTextPadding);

                textY = pointY + (highlightTextHeight/3);
                rectY = pointY - highlightRectHeight/2;
                
                var rightHighlightEdge = pointX+highlightRadius+highlightTextExternalPadding+highlightRectWidth;

                // If the tooltip will go over the right edge, reposition it.
                var overRightEdge = false;
                if (rightHighlightEdge >= rightGraphBoundary) 
                {
                    overRightEdge = true;
                }
                if ( overRightEdge ) 
                {
                    textX = pointX - highlightRadius - highlightTextExternalPadding - highlightRectWidth + highlightTextPadding;
                    rectX = pointX - highlightRadius - highlightTextExternalPadding - highlightRectWidth;
                } 
                else 
                {
                    textX = pointX + highlightRadius + highlightTextExternalPadding + highlightTextPadding;
                    rectX = pointX + highlightRadius + highlightTextExternalPadding;
                } 
                
                // Store information about the data points.
                dataPoints[((i-1)*numValues)+j] = [ [pointX, pointY], [rectX, rectY], [textX, textY], highlightText[j].length*6+highlightTextPadding, this.colors[i-1], highlightText[j] ]; 

            }
        }
    }

    // If multiple data sets, draw color icons.
    if (multiline) 
    {
        base.append("rect")
            .attr("id", "colorIcon1")
            .attr("x", (margin.left/2 - colorIconWidth/2))
            .attr("y", (margin.top + (height - colorIconHeight)))
            .attr("height", colorIconHeight)
            .attr("width", colorIconWidth)
            .style("stroke", "black")
            .style("fill", this.colors[0]);  

        console.log("width: " + (margin.left/2 - colorIconWidth/2));
        console.log("w: " + w);
        console.log("width: " + (w - ((margin.right/2) - (colorIconWidth/2))));
        base.append("rect")
            .attr("id", "colorIcon2")
            .attr("x", (w - ((margin.right/2) + (colorIconWidth/2))))
            .attr("y", (margin.top + (height - colorIconHeight)))
            .attr("height", colorIconHeight)
            .attr("width", colorIconWidth)
            .style("stroke", "black")
            .style("fill", this.colors[1]);
    }

    // Sort first by data point's x position, they by y position.
    dataPoints.sort( function(a,b) 
    {
        var pxA = a[0][0];
        var pxB = b[0][0];
        var pyA = a[0][1];
        var pyB = b[0][1];
        if (pxA == pxB) 
        {
            return pyA - pyB;
        } 
        else 
        {
            return pxA - pxB;
        }
    });

    // Determine the placement of the highlight rects and text now that the data points have been sorted.
    var count = 0;
    var lastX = -0.112323;
    var currentX = 0;
    for (var d = 0; d < dataPoints.length; d++) 
    {
        currentX = dataPoints[d][0][0];
        if (currentX != lastX) 
        {
            count = 0;
        } 
        else 
        {
            count++;
        }
        
        var newRectY = dataPoints[d][1][1];
        var newTextY = dataPoints[d][2][1];

        if (multiline) 
        {
            newRectY = (count*(highlightRectHeight+2));
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
            .attr("style", "font-size: " + highlightTextHeight + "px; font-family: arial")
            .attr("display", "none")
            .text( dataPoints[d][5] );

        dataPoints[d][2][1] = newTextY;

        lastX = currentX;
    }

    // Detect mouse motion in the graph area.
    svg.append("rect")
        .attr("x", -1)
        .attr("y", -1)
        .attr("class", "overlay")
        .style("fill", "none")
        .attr("pointer-events", "all")
        .attr("width", width+2)
        .attr("height", height+2)
        .on("mouseover", function() 
        { 
          focus.style("display", null); 
        })
        .on("mouseout", function() 
        {
            // Clear the graph area.
            focus.style("display", "none");
            svg.selectAll(".circle-highlight").attr("display", "none");
            svg.selectAll(".line-highlight").attr("display", "none");
            svg.selectAll(".text-highlight").attr("display", "none");
            svg.selectAll(".rect-highlight").attr("display", "none");
        })
        .on("mousemove", mousemove);
   
};

/**
 * Create a Bar chart object.
 *
 * @function
 * @param dataSet               Set of data to visualize.
 * @param labels                Set of labels associated with the data.
 * @param title                 Title of visualization.
 * @param width                 Width of the visualization.
 * @param height                Height of the visualization.
 * @param colors                Colors to use in the visualization.
 * @param margin                Margin specifications for the visualization.
 * @param xAxisLabelOrientation Orientation at which to position the x axis labels.
 */
function Bar (dataSet, labels, columnTypes, title, width, height, colors, margin, xAxisLabelOrientation) 
{
    this.dataSet = dataSet;
    this.labels = labels;
    this.columnTypes = columnTypes;
    this.title = title;
    this.width = width;
    this.height = height;
    this.colors = colors;
    this.margin = margin;
    this.xAxisLabelOrientation = xAxisLabelOrientation;
}

/**
 * Draw the Bar chart.
 *
 * @function
 * @param divId   The id of the div into which the visualization should be drawn.
 */
Bar.prototype.draw = function(divId) 
{

    currentVisualization = this;

    // var margin = {top: 50, right: 55, bottom: 55, left: 55};
    var margin = this.margin;
    var numValuesPerDataSet = this.dataSet.length;
    var numDataSets = this.dataSet[0].length;
    var colorIconHeight = 10;
    var colorIconWidth = 10;
    numBars = this.dataSet.length;
    var fillColor = this.colors[0];
    var fillColor2 = this.colors[1];
    var highlightColor = "rgb(240,209,86)";
    var axisLabelHeight = 12;


    // Determine if multiple data sets.
    var multiset = false;
    if (numDataSets > 2) 
    {
        multiset = true;
    }

    xValues = [];
    yValues = [];
    y2Values = [];

    
    // Retrieve individual data set values.
    for(var i = 0; i < numBars; i++) 
    {
        xValues[i] = this.dataSet[i][0];
        yValues[i] = this.dataSet[i][1];
        if (multiset) 
        {
            y2Values[i] = this.dataSet[i][2];
        }       
    }
    
    // Condense the data set by summing up y-values for duplicate x-values.
    var condensedXValues = [];
    var condensedYValues = [];
    var condensedY2Values = [];
    var currentYTotal = 0;
    var currentY2Total = 0;
    for (var i = 0; i < xValues.length; i++) 
    {
        // If this is a duplicate x-value:
        if (condensedXValues.indexOf(xValues[i]) != -1) 
        {
            continue;
        } 
        currentYTotal = yValues[i];
        if (multiset) 
        {
            currentY2Total = y2Values[i];
        }
        for (var j = i + 1; j < xValues.length; j++) 
        {
            if (xValues[j] == xValues[i]) 
            {
                currentYTotal += yValues[j];
                if (multiset) 
                {
                    currentY2Total += y2Values[j];
                }
            }
        }
        condensedXValues.push(xValues[i]);
        condensedYValues.push(currentYTotal);
        if (multiset) 
        {
            condensedY2Values.push(currentY2Total);
        }
    }

    var condensedDataSet = [];
    var condensedDataSet2 = [];
    for (var i = 0; i < condensedXValues.length; i++) 
    {
        condensedDataSet.push([condensedXValues[i],condensedYValues[i]]);
        if (multiset) 
        {
            condensedDataSet2.push([condensedXValues[i], condensedY2Values[i]]);
        }
    }

    numBars = condensedXValues.length;

    //Width and height
    var w = this.width;
    var h = this.height;
    var highlightTextHeight = 12;
    var highlightTextPadding = 2;
    var barPadding = 5;
    var barSetPadding = 15;
    var xAxisLabelPaddingBottom = 2;
    var titleLabelHeight = margin.top/3;
    var titleLabelPaddingTop = (margin.top - titleLabelHeight)/2;
    var yAxisLabelPaddingLeft = 2;
    var yAxisLabelPaddingRight = 2;

    // Determine the axis labels and title.
    var xAxisLabel = this.labels[0];
    var yAxisLabel = this.labels[1];
    var title = this.title;
    if (multiset) 
    {
        var y2AxisLabel = this.labels[2];
        if (title == "") 
        {
            title = yAxisLabel + " and " + y2AxisLabel + " vs. " + xAxisLabel;   
        }
    } 
    else 
    {
        if (title == "") 
        {
            title = yAxisLabel + " vs. " + xAxisLabel;    
        }
    }

    // Determine the width of the visualization based on the number of bars.
    var totalWidth;
    var minBarWidth = 10;
    if (!multiset) 
    {
        totalWidth = (numBars * (minBarWidth+barPadding)) + barPadding;
    } 
    else 
    {
        totalWidth = (numBars * ((2*minBarWidth)+(barPadding)+(barSetPadding))) + barPadding - barSetPadding;
    }

    // Set canvas width and height.
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    var numYAxisTicks = height/15;

    // If the calculated width is larger than the communicated width, increase the width accordingly and use minimum bar width.
    if (totalWidth > width) 
    {
        width = totalWidth;
        barWidth = minBarWidth;
    } 
    else 
    {
        //Otherwise calculate bar widths.
        if (!multiset) 
        {
            var barWidth = ((width - barPadding) / numBars) - barPadding;
        } 
        else 
        {
            var barWidth = ((width - ((numBars-1)*barSetPadding) - ((3*numBars)*barPadding))/(2*numBars));
        }
    }

    
      
    // Calculate scales.
    if (multiset) 
    {
        var xScale = d3.scale.ordinal()
                        .domain(condensedXValues)
                        .rangePoints([barPadding,width - 2*barPadding - 2*barWidth]);
    } 
    else 
    {
        var xScale = d3.scale.ordinal()
                        .domain(condensedXValues)
                        .rangePoints([barPadding,width - barPadding - barWidth]);
    }
  
    var yScale = d3.scale.linear()
                    .domain([d3.min(condensedYValues), d3.max(condensedYValues)])
                    .range([height, 0]);

    if (multiset) 
    {
        var yScale2 = d3.scale.linear()
                        .domain([d3.min(condensedY2Values), d3.max(condensedY2Values)])
                        .range([height, 0]);
    }

    // Create axes.
    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(numBars);

    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(numYAxisTicks);

    if (multiset) 
    {
        var yAxis2 = d3.svg.axis()
                    .scale(yScale2)
                    .orient("right")
                    .ticks(numYAxisTicks);
    }


    var unscaledLine = d3.svg.line()
        .x(function(d) 
            { 
                return d[0]; 
            })
        .y(function(d) 
            { 
                return d[1]; 
            });                    

    // Line for x-axis to compensate for the default axis format.
    var xAxisLineCoords = [[0, height], [width, height]];

    var xAxisLine = d3.svg.line(xAxisLineCoords);

    // Create base visualization area.
    var base = d3.select("#" + divId)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom);
    // Background.
    base.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("fill", "white")
            .style("stroke", "black");
    // Canvas.
    var svg = base.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Set the toggle value for all bars to false.
    var toggle = [];
    for (var i = 0; i < numBars; i++) 
    {
        toggle.push(false);
        if (multiset) 
        {
            toggle.push(false);
        }
    }

    var unscaledLine = d3.svg.line()
            .x( function(d) 
                { 
                    return d[0]; 
                })
            .y( function(d) 
                { 
                    return d[1]; 
                }); 

    // If single data set and negative values exist, draw guideline at y=0.
    if (!multiset && (d3.min(condensedYValues)) < 0) 
    {
        svg.append("path")
            .attr("id", ("bar-zero-line"))
            .style("stroke", "grey")
            .attr("d", unscaledLine([[0, yScale(0)], [width, yScale(0)]]));
    }

    // Create data set 1 bars.
    svg.selectAll("rect.set1")
        .data(condensedDataSet)
        .enter()
        .append("rect")
        .attr("x", function(d) 
        {
            return xScale(d[0]);
        })
        .attr("y", function(d) 
        {
            return (yScale(d[1]));
        })
        .attr("width", barWidth)
        .attr("height", function(d) 
        {
            return height - yScale(d[1]);
        })
        .attr("fill", function(d) 
        {
            console.log("fillColor: " + fillColor);
            return fillColor;
        })
        .style("stroke", "black")
        .attr("class", "bar-set1")
        .on("mouseover", function(d, i) 
        {
            var xPosition = parseFloat(d3.select(this).attr("x"));
            var xTextPosition = xPosition + barWidth/2;
            var yPosition = parseFloat(d3.select(this).attr("y"));

            // If text will go over right edge of screen, reposition it.
            var yTextPosition = yPosition - highlightTextPadding;
            if (yTextPosition < highlightTextHeight) 
            {
                yTextPosition = yPosition + highlightTextHeight;
            }

            var barLineData = [ [0, yPosition], [width, yPosition] ];

            // Top of bar guideline.
            svg.append("path")
                .attr("class", "bar-line")
                .attr("id", "barline")
                .attr("style", "stroke: rgb(150,150,150)")
                .attr("d", unscaledLine(barLineData));

            // For other bars in the data set, color those with smaller values red, larger green, and even grey.
            svg.selectAll(".bar-set1")
                .attr("fill", function() 
                {
                    if (this.getAttribute("y") < barLineData[0][1]) 
                    {
                        return "rgb(161,219,136)";
                    } 
                    else if (this.getAttribute("y") > barLineData[0][1]) 
                    {
                        return "rgb(219,136,136)";
                    } 
                    else 
                    {
                        return "rgb(191,191,191)";
                    }
                });

            this.setAttribute("fill", highlightColor);

            // If not already drawn, draw the text tooltip.
            if (!toggle[i]) 
            {
                svg.append("text")
                    .attr("id", ("tooltip" + i))
                    .attr("x", xTextPosition)
                    .attr("y", yTextPosition)
                    .style("pointer-events", "none")
                    .attr("text-anchor", "middle")
                    .attr("font-family", "arial")
                    .attr("font-size", highlightTextHeight)
                    .attr("font-weight", "bold")
                    .attr("fill", "black")
                    .text(Math.floor(d[1]*100)/100);               
            }
        })
        .on("click", function(d, i) 
        {
            d3.select(("#tooltip" + i)).remove();
            d3.select("#barline").remove();

            toggle[i] = !toggle[i];

            // If tooltip has been toggled on, remove it.
            if (!toggle[i]) 
            {
                d3.select(("#tooltip" + i)).remove();
                d3.select("#barline").remove();
                return;
            }

            // Draw the tooltip if it's not already toggled on.
            var xPosition = parseFloat(d3.select(this).attr("x"));
            var xTextPosition = xPosition + barWidth/2;
            var yPosition = parseFloat(d3.select(this).attr("y"));
            var yTextPosition = yPosition - highlightTextPadding;
            if (yTextPosition < highlightTextHeight) 
            {
                yTextPosition = yPosition + highlightTextHeight;
            }

            svg.append("text")
                .attr("id", ("tooltip" + i))
                .attr("x", xTextPosition)
                .attr("y", yTextPosition)
                .style("pointer-events", "none")
                .attr("text-anchor", "middle")
                .attr("font-family", "arial")
                .attr("font-size", highlightTextHeight)
                .attr("font-weight", "bold")
                .attr("fill", "black")
                .text(Math.floor(d[1]*100)/100);

            var barLineData = [ [0, yPosition], [width, yPosition] ];

            svg.append("path")
                .attr("class", "bar-line")
                .attr("id", "barline")
                .attr("style", "stroke: rgb(150,150,150)")
                .attr("d", unscaledLine(barLineData));

            // Color the other bars in the data set appropriately.
            svg.selectAll(".bar-set1")
                .attr("fill", function() 
                {
                    if (this.getAttribute("y") < barLineData[0][1]) 
                    {
                        return "rgb(161,219,136)";
                    } 
                    else if (this.getAttribute("y") > barLineData[0][1]) 
                    {
                        return "rgb(219,136,136)";
                    } 
                    else 
                    {
                        return "rgb(191,191,191)";
                    }
                });

            this.setAttribute("fill", highlightColor);

        }) 
        .on("mouseout", function(d, i) 
        {
            // Remove the popups based on the toggle state.
            if (!toggle[i]) 
            {
                d3.select(("#tooltip" + i)).remove();
            }
            d3.select("#barline").remove();
            d3.select(this)
                .attr("fill", fillColor);
            svg.selectAll(".bar-set2")
                .attr("fill", fillColor2);
            svg.selectAll(".bar-set1")
                .attr("fill", fillColor);             
        });

    // Draw the second data set bars.
    if (multiset) 
    {
        svg.selectAll("rect.set2")
            .data(condensedDataSet2)
            .enter()
            .append("rect")
            .attr("x", function(d) 
            {
                return (xScale(d[0]) + barWidth + barPadding);
            })
            .attr("y", function(d) 
            {
                return (yScale2(d[1]));
            })
            .attr("width", barWidth)
            .attr("height", function(d) 
            {
                return height - yScale2(d[1]);
            })
            .attr("fill", function(d) 
            {
                return fillColor2;
            })
            .style("stroke", "black")
            .attr("class", "bar-set2")
            .on("mouseover",function(d, i) 
            {
                var xPosition = parseFloat(d3.select(this).attr("x"));
                var xTextPosition = xPosition + barWidth/2;
                var yPosition = parseFloat(d3.select(this).attr("y"));

                // If tooltip will go over right edge, reposition it.
                var yTextPosition = yPosition - highlightTextPadding;
                if (yTextPosition < highlightTextHeight) 
                {
                    yTextPosition = yPosition + highlightTextHeight;
                }
            
                var barLineData = [ [0, yPosition], [width, yPosition] ];

                // Draw the top of bar guideline.
                svg.append("path")
                    .attr("class", "bar-line")
                    .attr("id", "barline")
                    .attr("style", "stroke: rgb(150,150,150)")
                    .attr("d", unscaledLine(barLineData));

                // Color the other bars appropriately.
                svg.selectAll(".bar-set2")
                    .attr("fill", function() 
                    {
                        if (this.getAttribute("y") < barLineData[0][1]) 
                        {
                            return "rgb(161,219,136)";
                        } 
                        else if (this.getAttribute("y") > barLineData[0][1]) 
                        {
                            return "rgb(219,136,136)";
                        } 
                        else 
                        {
                            return "rgb(191,191,191)";
                        }
                    });

                this.setAttribute("fill", highlightColor);


                // Draw the tooltip text.
                if (!toggle[(numBars + i)]) 
                {
                    svg.append("text")
                        .attr("id", ("tooltip" + numBars + i))
                        .attr("x", xTextPosition)
                        .attr("y", yTextPosition)
                        .style("pointer-events", "none")
                        .attr("text-anchor", "middle")
                        .attr("font-family", "arial")
                        .attr("font-size", highlightTextHeight)
                        .attr("font-weight", "bold")
                        .attr("fill", "black")
                        .text(Math.floor(d[1]*100)/100);
                }
            })
            .on("click", function(d, i) 
            {
                d3.select(("#tooltip" + numBars + i)).remove();
                d3.select("#barline").remove();

                toggle[(numBars + i)] = !toggle[(numBars + i)];

                // If tooltip already toggled on, remove it.
                if (!toggle[(numBars + i)]) 
                {
                    d3.select(("#tooltip" + numBars + i)).remove();
                    d3.select("#barline").remove();
                    return;
                }

                // Draw the tooltip.
                var xPosition = parseFloat(d3.select(this).attr("x"));
                var xTextPosition = xPosition + barWidth/2;
                var yPosition = parseFloat(d3.select(this).attr("y"));
                var yTextPosition = yPosition - highlightTextPadding;
                if (yTextPosition < highlightTextHeight) 
                {
                    yTextPosition = yPosition + highlightTextHeight;
                }

                svg.append("text")
                    .attr("id", ("tooltip" + numBars + i))
                    .attr("x", xTextPosition)
                    .attr("y", yTextPosition)
                    .style("pointer-events", "none")
                    .attr("text-anchor", "middle")
                    .attr("font-family", "arial")
                    .attr("font-size", highlightTextHeight)
                    .attr("font-weight", "bold")
                    .attr("fill", "black")
                    .text(Math.floor(d[1]*100)/100);

                var barLineData = [ [0, yPosition], [width, yPosition] ];

                svg.append("path")
                    .attr("class", "bar-line")
                    .attr("id", "barline")
                    .attr("style", "stroke: rgb(150,150,150)")
                    .attr("d", unscaledLine(barLineData));

                svg.selectAll(".bar-set2")
                    .attr("fill", function() 
                    {
                        if (this.getAttribute("y") < barLineData[0][1]) 
                        {
                            return "rgb(161,219,136)";
                        } 
                        else if (this.getAttribute("y") > barLineData[0][1]) 
                        {
                            return "rgb(219,136,136)";
                        } 
                        else 
                        {
                            return "rgb(191,191,191)";
                        }
                    });

                this.setAttribute("fill", highlightColor);  

            })
            .on("mouseout", function(d, i) 
            {
                // Remove the tooltips according to the toggle state.
                if (!toggle[(numBars + i)]) 
                {
                    d3.select(("#tooltip" + numBars + i)).remove();
                }            d3.select("#barline").remove();
                d3.select(this)
                    .attr("fill", fillColor2);
                svg.selectAll(".bar-set2")
                    .attr("fill", fillColor2);
                svg.selectAll(".bar-set1")
                    .attr("fill", fillColor);    
            });    
    }

    if (multiset) 
    {
        // Draw x-axis for double data set.
        var xAxisObject = svg.append("g")
            .attr({
                class: "x-axis",
                "transform": "translate(" + (barWidth + barPadding/2) + "," + height + ")"
            })
            .call(xAxis);

        styleXAxis(xAxisObject, this.xAxisLabelOrientation);

        // Draw y-axis
        var y2AxisObect = svg.append("g")
            .attr({
                class: "y-axis",
                "transform": "translate(" + width + ",0)"
            })
            .call(yAxis2);

        styleYAxis(y2AxisObect, "start");

    } 
    else 
    {
        // Draw x-axis for single data set.
        var xAxisObject = svg.append("g")
        .attr({
            class: "x-axis",
            "transform": "translate(" + (barWidth/2) + "," + height + ")"
        })
        .call(xAxis);

        styleXAxis(xAxisObject, this.xAxisLabelOrientation);
    }

    // Create y-axis
    var yAxisObject = svg.append("g")
        .attr({
            class: "y-axis",
            "transform": "translate(" + 0 + ",0)"
        })
        .call(yAxis);

    styleYAxis(yAxisObject, "end");

    // Draw the x-axis line to compensate for generic axis format.
    svg.append("path")
        .style("stroke", "black")
        .attr("d", xAxisLine(xAxisLineCoords));

    // Draw x-axis label.
    base.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "arial")
        .attr("x", margin.left + width/2)
        .attr("y", (h - (margin.bottom/4) - axisLabelHeight/2))
        .text(xAxisLabel);

    // Draw y axis label.
    base.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "arial")
        .attr("y", h/2)
        .attr("x", (0 + margin.left/5 + axisLabelHeight))
        .attr("transform", "rotate(-90, " + (0 + margin.left/5 + axisLabelHeight) + "," + h/2 + ")")
        .text(yAxisLabel);

    if (multiset) 
    {
        // Draw second y axis label.
        base.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "middle")
            .attr("font-size", axisLabelHeight)
            .attr("font-family", "arial")
            .attr("y", h/2)
            .attr("x", ((width + margin.left + margin.right) - (margin.right/5) - axisLabelHeight))
            .attr("transform", "rotate(90, " + ((width + margin.left + margin.right) - (margin.right/5) - axisLabelHeight) + "," + h/2 + ")")
            .text(y2AxisLabel);
    }

    // Draw title.
    base.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("font-size", titleLabelHeight)
        .attr("font-family", "arial")
        .attr("x", margin.left + width/2)
        .attr("y", titleLabelPaddingTop + titleLabelHeight/2)
        .text(title);

    // If multiple data sets, draw color icons.
    if (multiset) 
    {
        base.append("rect")
            .attr("id", "colorIcon1")
            .attr("x", (margin.left/2 - colorIconWidth/2))
            .attr("y", (margin.top + (height - colorIconHeight)))
            .attr("height", colorIconHeight)
            .attr("width", colorIconWidth)
            .style("stroke", "black")
            .style("fill", fillColor);  

        base.append("rect")
            .attr("id", "colorIcon2")
            .attr("x", ((width + margin.left + margin.right) - (margin.right/2 + colorIconWidth/2)))
            .attr("y", (margin.top + (height - colorIconHeight)))
            .attr("height", colorIconHeight)
            .attr("width", colorIconWidth)
            .style("stroke", "black")
            .style("fill", fillColor2);
    }     
};

/**
 * Given visualization and data information from the Controller, return a visualization object of the given type.
 *
 * @function
 * @param dataPackage               The data object containing all of the visualizaion objects and data.
 * @param type                      The visualization type.
 * @param colors                    The colors to use when drawing the visualization.
 * @param width                     The width to use for the visualization.
 * @param height                    The height to use for the visualization.
 * @param numDataPoints             The number of data points, starting with the first, in the data set to visualize.
 * @param margin                    The margin sizes to use for the visualization.
 * @param xAxisLabelOrientation     The orientation in which to draw the x axis labels.
 * @returns                         Visualization object.
 */
function getVisualization(dataPackage, type, colors, width, height, numDataPoints, margin, xAxisLabelOrientation)
{
    console.log("numDataPoints: " + numDataPoints);
    //var height = 300;
    var pieWidth = height*1.5;
    //var width = 650;
    for(var i = 0; i < dataPackage.Visualizations.length; i++)
    {
        var visType = dataPackage.Visualizations[i].Type;
        var columnSet = dataPackage.Visualizations[i].DataColumns;
        var visTitle = dataPackage.Visualizations[i].VisTitle;
        console.log("columnSet: " + columnSet.toString());
        var columnTypes = dataPackage.Data.ColumnType;
        var values = dataPackage.Data.Values;
        var labels = dataPackage.Data.ColumnLabel;
        var caption = dataPackage.Data.Caption;
        if(!margin)
        {
            console.log("Using default margins.")
            margin = {top: 50, right: 55, bottom: 55, left: 55};
        }
        if(!xAxisLabelOrientation)
        {
            console.log("Using default text orientation.")
            xAxisLabelOrientation = "Vertical";    
        }
        if(!colors)
        {
            console.log("Using default colors.");
            colors = [{hue: 250, saturation: 50, lightness: 50}, {hue: 250, saturation: 50, lightness: 50}];  
        }
        
        if(type == visType)
        {
            var v = NaN;
            // Instantiate a visualization of the appropriate type.
            switch(type) 
            {
                case "Line":
                    v = new Line(getData(columnSet, values), getLabels(columnSet, labels), getColumnTypes(columnSet, columnTypes), visTitle, width, height, getColors(colors), margin, xAxisLabelOrientation, true);
                    break;

                case "Bar":
                    v = new Bar(getData(columnSet, values), getLabels(columnSet, labels), getColumnTypes(columnSet, columnTypes), visTitle, width, height, getColors(colors), margin, xAxisLabelOrientation);
                    break;

                case "Scatter":
                    v = new Scatter(getData(columnSet, values), getLabels(columnSet, labels), getColumnTypes(columnSet, columnTypes), visTitle, width, height, getColors(colors), margin, xAxisLabelOrientation);
                    break;  

                case "Pie":
                    v = new Pie(getData(columnSet, values), getLabels(columnSet, labels), visTitle, pieWidth, height, colors, margin);
                    break;

                case "Tree":
                    v = new Treemap(getData(columnSet, values), getLabels(columnSet, labels), visTitle, width, 1.3*height, colors, margin);
                    break;

                case "Bubble":
                    v = new Bubble(getData(columnSet, values), getLabels(columnSet, labels), getColumnTypes(columnSet, columnTypes), visTitle, width, height, getColors(colors), margin, xAxisLabelOrientation);
                    break;

                default:
                    // The type extracted from the data object did not match any of the defined visualization types.
                    console.error("ERROR: Could not match visualization type:'"+type+"'' with definition in visualizer.");
            }
            return v;
        }
    }
}

/**
 * Pull out and return from a 2-dimensional array of values some number of columns from that array.
 * If only one column is requested, return that column, as well as another copy of that column.
 *
 * @function
 * @param columns   The list of columns to extract from the given values.
 * @param values    The 2D array of values comprising the data set.
 * @returns         2D array of data values.
 */
function getData(columns, values)
{   
    console.log("columns: " + columns.toString());
    var data = []; // The dataset extracted from values.
    var row = [];
    var numRows = values.length;
    var oneColumn = false;
    if (columns.length == 1) 
    {
        oneColumn = true;
        columns.push(columns[0]);
    }
    var numColumns = columns.length;

    // For every row in values...
    for (var j = 0; j < numRows; j++) 
    {
        // Create a new row to add to the extracted dataset.
        row = [];
        // For every column that needs to be extracted...
        for (var k = 0; k < numColumns; k++) 
        {
            // Add the appropriate value from the column to the new row.
            row[k] = values[j][columns[k]];
        }
        // Add the row to the extracted dataset.
        data.push(row);
    }
    if (oneColumn) 
    {
        columns.splice(columns.length-1, 1);
    }
    return data;
}

/**
 * Return a list of labels associated with the given columns.
 *
 * @function
 * @param columns   The list of columns for which to obtain the labels.
 * @param labels    The list of labels corresponding to each column.
 * @returns         List of column labels.
 */
function getLabels(columns, labels)
{
    var labelSet = [];
    for (var i = 0; i < columns.length; i++) 
    {
        labelSet.push(labels[columns[i]]);
    }
    return labelSet;
}

/**
 * Return a list of types associated with the given columns.
 *
 * @function
 * @param columns   The list of columns for which to obtain the types.
 * @param types     The list of types corresponding to each column.
 * @returns         List of visualization types.
 */
function getColumnTypes(columns, types)
{
    var typeSet = [];
    for (var i = 0; i < columns.length; i++) 
    {
        typeSet.push(types[columns[i]]);
    }
    return typeSet;
}

/**
 * Convert a list of color objects into a list of hsl colors in string format and return.
 *
 * @function
 * @param colors   The list of color objects.
 * @returns        List of hsl colors in string format.
 */
function getColors(colors) 
{
    var newColors = [];
    for (var i = 0; i < colors.length; i++) 
    {
        newColors.push("hsl(" + colors[i].hue + ", " + colors[i].saturation + ", " + colors[i].lightness + ")");
    }
    console.log("newColors: " + newColors.toString());
    return newColors;
}

/**
 * Given some number of color objects and a specified number of output colors, return a list 
 * of hsl colors in string format that contains compenent colors of a gradient of each of the 
 * given colors, where each given color's gradient is evenly represented.
 *
 * @function
 * @param numColorsOut  The number of colors to return.
 * @param colors        The list of color objects from which to generate the list of new colors.
 * @returns             List of hsl colors in string format.
 */
function getMixedColors(numColorsOut, colors) 
{
    // var numColors = colors.length;
    var numColorsIn = colors.length;
    var newColors = [];
    for (var i = 0; i < numColorsIn; i++) 
    {
        var increment = 60/(numColorsOut/numColorsIn);
        var hue = colors[i].hue;
        var sat = colors[i].saturation;
        for (var j = 0; j < (numColorsOut/numColorsIn); j++) 
        {
            newColors.push("hsl(" + hue + ", " + sat + ", " + (25+(j*increment)) + "%)");
        }
    }
    console.log("newColors: " + newColors.toString());
    return newColors;
}

/**
 * Move the element to the front of the parent element.
 *
 * @function
 * @returns     D3 selection of the object that was moved to the front of the parent element.   
 */
d3.selection.prototype.moveToFront = function() 
{
    return this.each(function() 
    {
        this.parentNode.appendChild(this);
    });
};

/**
 * Style the given object as an x axis.
 *
 * @function
 * @param object            The object to style.
 * @param labelOrientation  The orientation at which to draw the labels of the object.
 */
function styleXAxis(object, labelOrientation) 
{
    object.selectAll(".domain")
        .style("stroke", "black")
        .style("fill", "none")
        .style("shape-rendering", "crispEdges")
        .attr("font-family", "arial")
        .attr("font-size", "11px")

    object.selectAll(".tick")
        .style("stroke", "black")
        .style("shape-rendering", "crispEdges")
        .attr("font-family", "arial")
        .attr("font-size", "11px")

    object.selectAll("text")
        .style("stroke", "none")
        .style("letter-spacing", "0.1em")

    switch(labelOrientation) 
    {
        case "Horizontal":
            object.selectAll("text")
                .style("text-anchor", "middle")
            break;
        case "Angled":
            object.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)");
            break;
        case "Vertical":
            object.selectAll("text")
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.45em")
                .attr("transform", "rotate(-90)");
            break;
        default:
            console.error("ERROR: Unidentified x-axis label orientation provided.");
    }
}

/**
 * Style the given object as a y axis.
 *
 * @function
 * @param object        The object to style.
 * @param textAnchor    The anchor point at which to draw the labels of the object.
 */
function styleYAxis(object, textAnchor) 
{
    object.selectAll(".domain")
        .style("stroke", "black")
        .style("fill", "none")
        .style("shape-rendering", "crispEdges")
        .attr("font-family", "arial")
        .attr("font-size", "11px")

    object.selectAll(".tick")
        .style("stroke", "black")
        .style("shape-rendering", "crispEdges")
        .attr("font-family", "arial")
        .attr("font-size", "11px")

    object.selectAll("text")
        .style("text-anchor", textAnchor)
        .style("stroke", "none")
        .style("letter-spacing", "0.1em")
}

/**
 * Randomly shuffle the given array.
 *
 * @function
 * @param array     The array to shuffle.
 * @returns         Randomly shuffled array.   
 */
function shuffleArray(array) 
{
    for (var i = array.length - 1; i > 0; i--) 
    {
        var j = Math.floor(Math.random()*(i+1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}