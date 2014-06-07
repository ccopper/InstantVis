//This is our code for the visualizer. 

var globalPadding = 25;

function Treemap(dataSet, labels, width, height) {
    this.dataSet = dataSet;
    this.labels = labels;
    this.width = width;
    this.height = height;
}

Treemap.prototype.draw = function(divId) 
{
    var margin = {top: 50, right: 20, bottom: 20, left: 20};

    var w = this.width;
    var h = this.height;
    var colors = [];
    var colorSet = getRandColors();

    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    var xAxisLabel = this.labels[0];
    var yAxisLabel = this.labels[1];
    var title = yAxisLabel + " by " + xAxisLabel;

    var titleLabelHeight = margin.top/3;
    var titleLabelPaddingTop = (margin.top - titleLabelHeight)/2;

    var numValuesPerDataSet = this.dataSet.length;
    var categories = [];
    var data = [];
    var dataTotal = 0;
    var highlightTextHeight = 12;

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

    var categoryTotal = 0;
    for (var i = 0; i < categories.length; i++) {
        categoryTotal = 0;
        for (var j = 1; j < categories[i].length; j++) {
            categoryTotal += this.dataSet[categories[i][j]][1];
        }
        data.push([categories[i][0], categoryTotal]);
        dataTotal += categoryTotal;
    }

    data.sort(function(a,b) { return b[1] - a[1]; });

    var base = d3.select("#" + divId)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
    var svg = base.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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
    for (var i = 0; i < data.length; i++) {
        fraction = (data[i][1]/currentTotal);
        if (currentWidth > currentHeight) {
            thisHeight = currentHeight;
            thisWidth = fraction*currentWidth;
            nextX = currentX + thisWidth;
            nextY = currentY;
            nextWidth = currentWidth - thisWidth;
            nextHeight = currentHeight;
        } else {
            thisWidth = currentWidth;
            thisHeight = fraction*currentHeight;
            nextY = currentY + thisHeight;
            nextX = currentX;
            nextHeight = currentHeight - thisHeight;
            nextWidth = currentWidth;
        }

        var fill = colorSet[i%colorSet.length];//colors[i];
        var category = data[i][0];

        newRect = [fill, thisHeight, thisWidth, currentX, currentY, category, data[i][1]];

        rects.push(newRect);

        currentX = nextX;
        currentY = nextY;
        currentWidth = nextWidth;
        currentHeight = nextHeight;
        currentTotal = currentTotal - data[i][1];
    }

    svg.selectAll("rect")
        .data(rects)
        .enter()
        .append("rect")
        .attr("class", "treemap-section")
        .attr("fill", function(d) { return d[0]; })
        .attr("height", function(d) { return d[1]; })
        .attr("width", function(d) { return d[2]; })
        .attr("x", function(d) { return d[3]; })
        .attr("y", function(d) { return d[4]; })
        .on("mouseover", function(d) {
            var newX = (parseFloat(this.getAttribute("x")) + parseFloat(this.getAttribute("width"))/2);
            var newY = parseFloat(this.getAttribute("y")) + parseFloat(this.getAttribute("height"))/2 + highlightTextHeight/2;
            d3.select(this)
                .attr("fill", "orange")
                .style("stroke", "black")
            svg.append("text")
                .attr("id", "treemap-text-tooltip2")
                .attr("x", newX)
                .attr("y", newY - highlightTextHeight)
                .attr("text-anchor", "middle")
                .attr("text-family", "sans-serif")
                .attr("font-size", highlightTextHeight)
                .attr("font-weight", "bold")
                .style("pointer-events", "none")
                .text( function() {
                    return Math.floor((d[6]/dataTotal)*10000)/100 + "%";
                });
            svg.append("text")
                .attr("id", "treemap-text-tooltip3")
                .attr("x", newX)
                .attr("y", newY + highlightTextHeight)
                .attr("text-anchor", "middle")
                .attr("text-family", "sans-serif")
                .attr("font-size", highlightTextHeight)
                .attr("font-weight", "bold")
                .style("pointer-events", "none")
                .text( function() {
                    return Math.floor(d[6]*100)/100;
                });
        })
        .on("mouseout", function(d) {
            d3.select(this)
                .attr("fill", d[0])
                .style("stroke", "none")
            d3.selectAll("#treemap-text-tooltip2").remove();
            d3.selectAll("#treemap-text-tooltip3").remove();
        });

    svg.selectAll("rect")
        .each(function(d) {
            var newX = (parseFloat(this.getAttribute("x")) + parseFloat(this.getAttribute("width"))/2);
            var newY = parseFloat(this.getAttribute("y")) + parseFloat(this.getAttribute("height"))/2 + highlightTextHeight/2;
            svg.append("text")
                .attr("id", "treemap-text-tooltip1")
                .attr("text-anchor", "middle")
                .attr("font-size", highlightTextHeight)
                .attr("font-family", "sans-serif")
                .attr("font-weight", "bold")
                .style("pointer-events", "none")
                .attr("x", newX)
                .attr("y", newY)
                .text(d[5]);
        });

    base.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("font-size", titleLabelHeight)
        .attr("font-family", "sans-serif")
        .attr("x", margin.left + width/2)
        .attr("y", titleLabelPaddingTop + titleLabelHeight/2)
        .text(title);  
}

function Bubble(dataSet, labels, columnTypes, width, height) {
    this.dataSet = dataSet;
    this.labels = labels;
    this.columnTypes = columnTypes;
    this.width = width;
    this.height = height;
}

Bubble.prototype.draw = function(divId) 
{

    var margin = {top: 50, right: 40, bottom: 40, left: 55};

    var w = this.width;
    var h = this.height;
    var padding = 20;
    var colors = [];
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
    var axisLabelHeight = 15;

    var xAxisLabel = this.labels[0];
    var yAxisLabel = this.labels[1];
    var title = yAxisLabel + " vs. " + xAxisLabel;

    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    var rightGraphBoundary = width;//w - margin.right;    

    var numDataSets = this.dataSet[0].length;
    var numValuesPerDataSet = this.dataSet.length;

    // Determine the maximum Y value for the datasets.
    var maxY = 0;
    for (var j = 0; j < numValuesPerDataSet; j++) {
        if (this.dataSet[j][1] > maxY) {
            maxY = this.dataSet[j][1];
        }
    }
    
    var numXAxisTicks = numValuesPerDataSet;
    var numYAxisTicks = height/15;

    var multiset = false;
    multiset = (numDataSets > 2) ? true : false;

    
    var xValues = [];
    if (this.columnTypes[0] != "String") {

        var xScale = d3.scale.linear()
                 .domain([0, d3.max(this.dataSet, function(d) { return d[0]; })])
                 .range([0, width]);

    } else {

        for (var i = 0; i < this.dataSet.length; i++) {
            xValues.push(this.dataSet[i][0]);
        }

        var xScale = d3.scale.ordinal()
                        .domain(xValues)
                        .rangePoints([0,width]);
    }             

    var yScale = d3.scale.linear()
                        .domain([0, maxY])
                        .range([height, 0])
                        .clamp(true);

    var rScale = d3.scale.linear()
                        .domain([0, d3.max(this.dataSet, function(d) {return d[2]; })])
                        .range([minBubbleRadius, maxBubbleRadius]);

    if (numValuesPerDataSet > 25) {
        numXAxisTicks = 25;
    }

    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(numXAxisTicks);

    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(numYAxisTicks);

    var base = d3.select("#" + divId)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
    var svg = base.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var line = d3.svg.line()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; });

    var color = randRGB(50,200);
    var highlightColor = "orange";

    // Draw the x-axis.
    svg.append("g")
        .attr({
            class: "axis",
            transform: "translate(0," + (height) + ")"
            })
        .attr("width", width)
        .call(xAxis); 

    // Draw the y-axis.
    svg.append("g")
        .attr("height", height)
        .attr({
            class: "y-axis",
            transform: "translate(" + 0 + ",0)"
            })
        .call(yAxis);

    base.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "sans-serif")
        .attr("x", margin.left + width/2)
        .attr("y", h - xAxisLabelPaddingBottom)
        .text(xAxisLabel);

    base.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "sans-serif")
        .attr("y", h/2)
        .attr("x", (0 + yAxisLabelPaddingLeft + axisLabelHeight))
        .attr("transform", "rotate(-90, " + (0 + yAxisLabelPaddingLeft + axisLabelHeight) + "," + h/2 + ")")
        .text(yAxisLabel);

    base.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("font-size", titleLabelHeight)
        .attr("font-family", "sans-serif")
        .attr("x", margin.left + width/2)
        .attr("y", titleLabelPaddingTop + titleLabelHeight/2)
        .text(title);    

    var toggle = [];
    for (var i = 0; i < numValuesPerDataSet; i++) {
        toggle.push(false);
    }

    svg.selectAll("circle")
        .data(this.dataSet)
        .enter()
        .append("circle")
        .attr("cx", function(d) { return xScale(d[0]); })
        .attr("cy", function(d) { return yScale(d[1]); })
        .attr("r", function(d) { 
            return rScale(d[2]); 
        })
        .attr("fill", color)
        .on("mouseover", function(d, i) {
            this.setAttribute("fill", highlightColor);
            if (!toggle[i]) {
                
                var x = Math.floor(this.getAttribute("cx")*100)/100;
                var y = Math.floor(this.getAttribute("cy")*100)/100;
                var r = Math.floor(this.getAttribute("r")*100)/100;
                var ind = d[0];
                var dep = d[1];
                var rad = d[2];
                var labelText =  ind + ", " + dep + ": " + rad;
                var length = labelText.length;
                var rectWidth = length*characterWidth;

                var rightEdge = x + r + highlightRectPadding + rectWidth;

                if (rightEdge > width) {
                    var lineData = [[x - r, y], [x - r - highlightRectPadding, y]];
                    var rectX = x - r - highlightRectPadding - rectWidth;
                } else {
                    var lineData = [[x + r, y], [x + r + highlightRectPadding, y]];
                    var rectX = x + r + highlightRectPadding;
                }

                var textX = rectX + highlightTextPadding;

                svg.append("path")
                    .attr("id", ("bubble-line-label"+i))
                    .style("stroke", color)
                    .attr("d", line(lineData));
                svg.append("rect")
                    .attr("id", ("bubble-rect-label"+i))
                    .attr("x", rectX)
                    .attr("y", y - (highlightTextHeight + 2*highlightTextPadding)/2)
                    .attr("width", rectWidth)
                    .attr("height", highlightTextHeight + 2*highlightTextPadding)
                    .attr("fill", highlightRectFillColor)
                    .style("stroke", color);
                svg.append("text")
                    .attr("id", ("bubble-text-label"+i))
                    .attr("x", textX)
                    .attr("y", y + highlightTextHeight/3)
                    .attr("font-size", highlightTextHeight)
                    .attr("font-family", "sans-serif")
                    .attr("font-weight", "bold")
                    .text(labelText);
            }
        })
        .on("click", function(d, i) {
            // Remove the popup created by the mouseover.
            d3.select(("#bubble-text-label"+i)).remove();
            d3.select(("#bubble-rect-label"+i)).remove();  
            d3.select(("#bubble-line-label"+i)).remove(); 

            toggle[i] = !toggle[i];

            // If the popup already existed, remove if immediately and return.
            if (!toggle[i]) {
                d3.select(("#bubble-text-label"+i)).remove();
                d3.select(("#bubble-rect-label"+i)).remove();  
                d3.select(("#bubble-line-label"+i)).remove();
                return; 
            }

            // Otherwise create the popup.
            var x = Math.floor(this.getAttribute("cx")*100)/100;
            var y = Math.floor(this.getAttribute("cy")*100)/100;
            var r = Math.floor(this.getAttribute("r")*100)/100;
            var ind = d[0];
            var dep = d[1];
            var rad = d[2];
            var labelText =  ind + ", " + dep + ": " + rad;
            var length = labelText.length;
            var rectWidth = length*characterWidth;
            

            var rightEdge = x + r + highlightRectPadding + rectWidth;

            if (rightEdge > width) {
                var lineData = [[x - r, y], [x - r - highlightRectPadding, y]];
                var rectX = x - r - highlightRectPadding - rectWidth;
            } else {
                var lineData = [[x + r, y], [x + r + highlightRectPadding, y]];
                var rectX = x + r + highlightRectPadding;
            }

            var textX = rectX + highlightTextPadding;

            svg.append("path")
                .attr("id", ("bubble-line-label"+i))
                .style("stroke", color)
                .attr("d", line(lineData));
            svg.append("rect")
                .attr("id", ("bubble-rect-label"+i))
                .attr("x", rectX)
                .attr("y", y - (highlightTextHeight + 2*highlightTextPadding)/2)
                .attr("width", rectWidth)
                .attr("height", highlightTextHeight + 2*highlightTextPadding)
                .attr("fill", highlightRectFillColor)
                .style("stroke", color);
            svg.append("text")
                .attr("id", ("bubble-text-label"+i))
                .attr("x", textX)
                .attr("y", y + highlightTextHeight/3)
                .attr("font-size", highlightTextHeight)
                .attr("font-family", "sans-serif")
                .attr("font-weight", "bold")
                .text(labelText);
        })
        .on("mouseout", function(d, i) {
            this.setAttribute("fill", color);
            // If the popup should not persist, remove it.
            if (!toggle[i]) {
                d3.select(("#bubble-text-label"+i)).remove();
                d3.select(("#bubble-rect-label"+i)).remove();  
                d3.select(("#bubble-line-label"+i)).remove();  
            }
        });
}


function Pie(dataSet, labels, width, height) 
{
    this.dataSet = dataSet;
    this.labels = labels;
    this.width = width;
    this.height = height;
}

Pie.prototype.draw = function(divId)
{

    var margin = {top: 50, right: 40, bottom: 25, left: 55};

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

    var xAxisLabel = this.labels[0];
    var yAxisLabel = this.labels[1];
    var title = yAxisLabel + " by " + xAxisLabel;

    var rightGraphBoundary = width;

    var numDataSets = this.dataSet[0].length;
    var numValuesPerDataSet = this.dataSet.length;

    var categories = [];
    var data = [];
    var dataTotal = 0;
    var colors = [];

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

    var categoryTotal = 0;
    for (var i = 0; i < categories.length; i++) {
        categoryTotal = 0;
        for (var j = 1; j < categories[i].length; j++) {
            categoryTotal += this.dataSet[categories[i][j]][1];
        }
        data.push(categoryTotal);
        dataTotal += categoryTotal;
    }

    var color = d3.scale.category10();

    var arc = d3.svg.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);

    var pie = d3.layout.pie();

    var line = d3.svg.line()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; });

    var base = d3.select("#" + divId)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
    var svg = base.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var arcs = svg.selectAll("g.arc")
                .data(pie(data))
                .enter()
                .append("g")
                .attr("class", "arc")
                .attr("transform", "translate(" + centerX + ", " + centerY + ")");

    var legendIconHeight = 15;
    var legendIconWidth = 15;
    var legendIconPadding = 3;
    var midWidth = 50;
    var legendTextHeight = legendIconHeight;
    var legendTextPadding = 5;

    var iconX = outerRadius*2 + midWidth;
    for (var i = 0; i < data.length; i++) {
        var iconY = i*(legendIconHeight+legendIconPadding);
        svg.append("rect")
            .attr("x", iconX)
            .attr("y", iconY)
            .attr("height", legendIconHeight)
            .attr("width", legendIconWidth)
            .attr("fill", colors[i])
            .style("stroke", "black");
        svg.append("text")
            .attr("id", "legend-text")
            .attr("x", iconX + legendIconWidth + legendTextPadding)
            .attr("y", iconY)
            .attr("dx", 0)
            .attr("dy", legendTextHeight - 2)
            .attr("font-family", "sans-serif")
            .attr("font-size", legendTextHeight)
            .text(categories[i][0]);
    }

    arcs.append("path")
        .attr("fill", function(d, i) {
            return colors[i];
        })
        .attr("d", arc)
        .on("mouseover", function(d, i) {
            mouseover(categories[i][0]);
            this.setAttribute("fill", "orange");
            d3.select(this).style("stroke", "black");
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
                    return Math.floor(data[i]*100)/100;
                });
        })
        .on("mouseout", function(d, i) {
            mouseout(categories[i][0]);
            this.setAttribute("fill", colors[i]);
            d3.select(this).style("stroke", "none");
            d3.select("#tooltip-text").remove();
            d3.select("#tooltip-text2").remove();
        });

        base.append("text")
            .attr("class", "title")
            .attr("text-anchor", "middle")
            .attr("font-size", titleLabelHeight)
            .attr("font-family", "sans-serif")
            .attr("x", margin.left + width/2)
            .attr("y", titleLabelPaddingTop + titleLabelHeight/2)
            .text(title); 

        function mouseover(labelName) {
            svg.selectAll("#legend-text")
                .each(function() {
                    if (this.textContent == labelName) {
                        d3.select(this).attr("font-weight", "bold");
                    }
                });
        }

        function mouseout(labelName) {
            svg.selectAll("#legend-text")
                .each(function() {
                    if (this.textContent == labelName) {
                        d3.select(this).attr("font-weight", "normal");
                    }
                });
        }
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


function Scatter(dataSet, labels, columnTypes, width, height) {
    this.dataSet = dataSet;
    this.labels = labels;
    this.columnTypes = columnTypes;
    this.width = width;
    this.height = height;
}

Scatter.prototype.draw = function(divId) 
{

    var margin = {top: 50, right: 65, bottom: 40, left: 65};
    var colorSet = getRandColors();

    var w = this.width;
    var h = this.height;
    var padding = 20;
    var colors = [];
    var highlightRadius = 8;
    var defaultRadius = 4;
    var highlightTextHeight = 12;
    var highlightTextPadding = 2;
    var highlightRectFillColor = "rgb(225,225,225)";
    var highlightRectHeight = highlightTextHeight + highlightTextPadding * 2;
    var highlightRectWidth, highlightRectWidth2;
    var characterWidth = 6;
    var data = [];
    var data2 = [];
    var dataPoints = [];
    var colorIconHeight = 10;
    var colorIconWidth = 10;

    var xAxisLabelPaddingBottom = 2;
    var titleLabelHeight = margin.top/3;
    var titleLabelPaddingTop = (margin.top - titleLabelHeight)/2;
    var yAxisLabelPaddingLeft = 2;
    var yAxisLabelPaddingRight = 2;
    var axisLabelHeight = 15;

    var xAxisLabel = this.labels[0];
    var yAxisLabel = this.labels[1];

    var yValues = [];

    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    var rightGraphBoundary = width;//w - margin.right;    

    var numDataSets = this.dataSet[0].length;
    var numValuesPerDataSet = this.dataSet.length;

    console.log("numDataSets: " + numDataSets);

    // Determine the maximum Y value for the datasets.
    var maxY = 0;
    for (var i = 0; i < numValuesPerDataSet; i++) {
        yValues.push(this.dataSet[i][1]);
        if (this.dataSet[i][1] > maxY) {
            maxY = this.dataSet[i][1];
        }
    }


    var numXAxisTicks = numValuesPerDataSet;
    var numYAxisTicks = height/15;

    var xValues = [];

    var multiset = false;
    multiset = (numDataSets > 2) ? true : false;

    var title;
    if (!multiset) {
        title = this.labels[1] + " vs. " + this.labels[0];
    } else {
        title = this.labels[1] + " and " + this.labels[2] + " vs. " + this.labels[0];
        var yAxisLabel2 = this.labels[2];
    }

    if (multiset) {
        var yValues2 = [];
        var maxY2 = 0;
        for (var i = 0; i < numValuesPerDataSet; i++) {
            yValues2.push(this.dataSet[i][2]);
            if (this.dataSet[i][2] > maxY2) {
                maxY2 = this.dataSet[i][2];
            }
        }
    }

    if (this.columnTypes[0] != "String") {
        var xScale = d3.scale.linear()
                        .domain([0, d3.max(this.dataSet, function(d) { return d[0]; })])
                        .range([0, width]);

        var reverseXScale = d3.scale.linear()
                        .domain([0, width])
                        .range([0, d3.max(this.dataSet, function(d) { return d[0]; })]);
    } else {
        for (var i = 0; i < this.dataSet.length; i++) {
            xValues.push(this.dataSet[i][0]);
        }

        var xScale = d3.scale.ordinal()
                        .domain(xValues)
                        .rangePoints([0,width]);

        var reverseXScale = d3.scale.ordinal()
                        .domain([0,width])
                        .rangePoints(xValues);
    }

    var yScale = d3.scale.linear()
                        .domain([0, maxY])
                        .range([height, 0])
                        .clamp(true);

    var reverseYScale = d3.scale.linear()
                        .domain([height, 0])
                        .range([0, maxY])
                        .clamp(true);

    if (multiset) {
        var yScale2 = d3.scale.linear()
                        .domain([0, maxY2])
                        .range([height, 0])
                        .clamp(true);

        var reverseYScale2 = d3.scale.linear()
                        .domain([height, 0])
                        .range([0, maxY2])
                        .clamp(true);
    }

    var rScale = d3.scale.linear()
                        .domain([0, d3.max(this.dataSet, function(d) {return d[1]; })])
                        .range([2, 5]);

    if (numValuesPerDataSet > 25) {
        numXAxisTicks = 25;
    }

    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(numXAxisTicks);


    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(numYAxisTicks);

    if (multiset) {
        var yAxis2 = d3.svg.axis()
                        .scale(yScale2)
                        .orient("right")
                        .ticks(numYAxisTicks);
    }

    var xValuesScaled = [];
    var yValues2Scaled = [];
    var yValuesScaled = [];

    for (var i = 0; i < numValuesPerDataSet; i++) {
        xValuesScaled.push(xScale(this.dataSet[i][0]));
        yValuesScaled.push(yScale(this.dataSet[i][1]));
        if (multiset) {
            yValues2Scaled.push(yScale2(this.dataSet[i][2]));
        }
    }

    var base = d3.select("#" + divId)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
    var svg = base.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var line = d3.svg.line()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; });

    // Draw the x-axis.
    svg.append("g")
        .attr({
            class: "axis",
            transform: "translate(0," + (height) + ")"
            })
        .attr("width", width)
        .call(xAxis); 

    // Draw the y-axis.
    svg.append("g")
        .attr("height", height)
        .attr({
            class: "y-axis",
            id: "y-axis-scatter-1",
            transform: "translate(" + 0 + ",0)"
            })
        .call(yAxis);

    if (multiset) {
        // Draw the y-axis.
        svg.append("g")
            .attr("height", height)
            .attr({
                class: "y-axis",
                id: "y-axis-scatter-2",                
                transform: "translate(" + width + ",0)"
                })
            .call(yAxis2);
    }

    base.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "sans-serif")
        .attr("x", margin.left + width/2)
        .attr("y", h - xAxisLabelPaddingBottom)
        .text(xAxisLabel);

    base.append("text")
        .attr("class", "y-label")
        .attr("id", "y-label-scatter-1")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "sans-serif")
        .attr("font-weight", "normal")
        .attr("y", h/2)
        .attr("x", (0 + yAxisLabelPaddingLeft + axisLabelHeight))
        .attr("transform", "rotate(-90, " + (0 + yAxisLabelPaddingLeft + axisLabelHeight) + "," + h/2 + ")")
        .text(yAxisLabel);


    if (multiset) {
        base.append("text")
            .attr("class", "y-label2")
            .attr("id", "y-label-scatter-2")
            .attr("text-anchor", "middle")
            .attr("font-size", axisLabelHeight)
            .attr("font-family", "sans-serif")
            .attr("font-weight", "normal")
            .attr("y", h/2)
            .attr("x", (w - yAxisLabelPaddingRight - axisLabelHeight))
            .attr("transform", "rotate(90, " + (w - yAxisLabelPaddingRight - axisLabelHeight) + "," + h/2 + ")")
            .text(yAxisLabel2);
    }

    base.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("font-size", titleLabelHeight)
        .attr("font-family", "sans-serif")
        .attr("x", margin.left + width/2)
        .attr("y", titleLabelPaddingTop + titleLabelHeight/2)
        .text(title);    


    var toggle = [];
    for (var i = 0; i < numValuesPerDataSet; i++) {
        toggle.push(false);
        if (multiset) {
            toggle.push(false);
        }
    }

    //for (var k = 1; k < numDataSets; k++) {
    data = getData([0,1],this.dataSet);

    console.log("data: " + data.toString());

    
    var color = colorSet[0];

    svg.selectAll(("circle.set" + 1))
        .data(data)
        .enter()
        .append("circle")
        .attr("class", ("data-point-set" + 1))
        .attr("cx", function(d, i) {
            return xScale(d[0])
        })
        .attr("cy", function(d, i) {
            return yScale(d[1]);
        })
        .attr("r", defaultRadius)
        .attr("fill", color)
        .on("mouseover", function(d, i) {
            if(!toggle[i]) {
                var x = xScale(d[0]);
                var y = yScale(d[1]);
                var col = colorSet[0];
                var highlightText = d[0] + ", " + d[1];
                var xRect = x + 2*highlightRadius;
                var yRect = y - highlightRectHeight/2;
                var xText = xRect + highlightTextPadding;
                var yText = yRect + highlightTextHeight;
                var lineData = [[x+highlightRadius,y],[x+2*highlightRadius,y]]; 
                
                highlightRectWidth = (2*highlightTextPadding) + (characterWidth*highlightText.length);
                if (xRect + highlightRectWidth > width) {
                    lineData = [[x-2*highlightRadius, y],[x-highlightRadius, y]];
                    xRect = x - 2*highlightRadius - highlightRectWidth;
                    xText = xRect + highlightTextPadding;
                }

                console.log("appending circle-highlight...");
                svg.append("circle")
                    .attr("id", ("circle-highlight" + 1 + "-" + i))
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("fill", "none")
                    .style("stroke", col)
                    .attr("r", highlightRadius);

                console.log("appending tooltip-rect...");
                svg.append("rect")
                    .attr("id", ("tooltip-rect" + 1 + "-" + i))
                    .attr("x", xRect)
                    .attr("y", yRect)
                    .attr("fill", highlightRectFillColor)
                    .style("stroke", col)
                    .attr("width", highlightRectWidth)
                    .attr("height", highlightRectHeight);

                console.log("appending tooltip-text...");
                svg.append("text")
                    .attr("id", ("tooltip-text" + 1 + "-" + i))
                    .attr("x", xText)
                    .attr("y", yText)
                    .style("pointer-events", "none")
                    .attr("text-anchor", "start")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", highlightTextHeight)
                    .attr("font-weight", "bold")
                    .attr("fill", "black")
                    .text(highlightText);

                console.log("appending tooltip-line...");
                svg.append("path")
                    .attr("id", ("tooltip-line" + 1 + "-" + i))
                    .style("stroke", col)
                    .attr("d", line(lineData))
            }
        })
        .on("click", function(d, i) {
            d3.select(("#circle-highlight" + 1 + "-" + i)).remove();
            d3.select(("#tooltip-rect" + 1 + "-" + i)).remove();  
            d3.select(("#tooltip-text" + 1 + "-" + i)).remove();
            d3.select(("#tooltip-line" + 1 + "-" + i)).remove();  

            toggle[i] = !toggle[i];

            // If the popup already existed, remove if immediately and return.
            if (!toggle[i]) {
                d3.select(("#circle-highlight" + 1 + "-" + i)).remove();
                d3.select(("#tooltip-rect" + 1 + "-" + i)).remove();  
                d3.select(("#tooltip-text" + 1 + "-" + i)).remove();
                d3.select(("#tooltip-line" + 1 + "-" + i)).remove(); 
                return;
            }

                var x = xScale(d[0]);
                var y = yScale(d[1]);
                var col = colorSet[0];
                var highlightText = d[0] + ", " + d[1];
                var xRect = x + 2*highlightRadius;
                var yRect = y - highlightRectHeight/2;
                var xText = xRect + highlightTextPadding;
                var yText = yRect + highlightTextHeight;
                var lineData = [[x+highlightRadius,y],[x+2*highlightRadius,y]]; 
                
                highlightRectWidth = (2*highlightTextPadding) + (characterWidth*highlightText.length);
                if (xRect + highlightRectWidth > width) {
                    lineData = [[x-2*highlightRadius, y],[x-highlightRadius, y]];
                    xRect = x - 2*highlightRadius - highlightRectWidth;
                    xText = xRect + highlightTextPadding;
                }

                console.log("appending circle-highlight...");
                svg.append("circle")
                    .attr("id", ("circle-highlight" + 1 + "-" + i))
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("fill", "none")
                    .style("stroke", col)
                    .attr("r", highlightRadius);

                console.log("appending tooltip-rect...");
                svg.append("rect")
                    .attr("id", ("tooltip-rect" + 1 + "-" + i))
                    .attr("x", xRect)
                    .attr("y", yRect)
                    .attr("fill", highlightRectFillColor)
                    .style("stroke", col)
                    .attr("width", highlightRectWidth)
                    .attr("height", highlightRectHeight);

                console.log("appending tooltip-text...");
                svg.append("text")
                    .attr("id", ("tooltip-text" + 1 + "-" + i))
                    .attr("x", xText)
                    .attr("y", yText)
                    .style("pointer-events", "none")
                    .attr("text-anchor", "start")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", highlightTextHeight)
                    .attr("font-weight", "bold")
                    .attr("fill", "black")
                    .text(highlightText);

                console.log("appending tooltip-line...");
                svg.append("path")
                    .attr("id", ("tooltip-line" + 1 + "-" + i))
                    .style("stroke", col)
                    .attr("d", line(lineData))
        })
        .on("mouseout", function(d, i) {
        // If the popup should not persist, remove it.
        if (!toggle[i]) {
            d3.select(("#circle-highlight" + 1 + "-" + i)).remove();
            d3.select(("#tooltip-rect" + 1 + "-" + i)).remove();  
            d3.select(("#tooltip-text" + 1 + "-" + i)).remove();
            d3.select(("#tooltip-line" + 1 + "-" + i)).remove();  
        }
    });            

    if (multiset) {
        data2 = getData([0,2],this.dataSet);

        console.log("data2: " + data2.toString());

        var color2 = colorSet[1];

        svg.selectAll(("circle.set" + 2))
            .data(data2)
            .enter()
            .append("circle")
            .attr("class", ("data-point-set" + 2))
            .attr("cx", function(d, i) {
                return xScale(d[0])
            })
            .attr("cy", function(d, i) {
                return yScale2(d[1]);
            })
            .attr("r", defaultRadius)
            .attr("fill", color2)
            .on("mouseover", function(d, i) {
                if(!toggle[numValuesPerDataSet + i]) {
                    var x2 = xScale(d[0]);
                    var y2 = yScale2(d[1]);
                    var col2 = colorSet[1];
                    var highlightText2 = d[0] + ", " + d[1];
                    var xRect2 = x2 + 2*highlightRadius;
                    var yRect2 = y2 - highlightRectHeight/2;
                    var xText2 = xRect2 + highlightTextPadding;
                    var yText2 = yRect2 + highlightTextHeight;
                    var lineData2 = [[x2+highlightRadius,y2],[x2+2*highlightRadius,y2]]; 
                    
                    highlightRectWidth2 = (2*highlightTextPadding) + (characterWidth*highlightText2.length);
                    if (xRect2 + highlightRectWidth2 > width) {
                        lineData2 = [[x2-2*highlightRadius, y2],[x2-highlightRadius, y2]];
                        xRect2 = x2 - 2*highlightRadius - highlightRectWidth2;
                        xText2 = xRect2 + highlightTextPadding;
                    }

                    console.log("appending circle-highlight...");
                    svg.append("circle")
                        .attr("id", ("circle-highlight" + 2 + "-" + i))
                        .attr("cx", x2)
                        .attr("cy", y2)
                        .attr("fill", "none")
                        .style("stroke", col2)
                        .attr("r", highlightRadius);

                    console.log("appending tooltip-rect...");
                    svg.append("rect")
                        .attr("id", ("tooltip-rect" + 2 + "-" + i))
                        .attr("x", xRect2)
                        .attr("y", yRect2)
                        .attr("fill", highlightRectFillColor)
                        .style("stroke", col2)
                        .attr("width", highlightRectWidth2)
                        .attr("height", highlightRectHeight);

                    console.log("appending tooltip-text...");
                    svg.append("text")
                        .attr("id", ("tooltip-text" + 2 + "-" + i))
                        .attr("x", xText2)
                        .attr("y", yText2)
                        .style("pointer-events", "none")
                        .attr("text-anchor", "start")
                        .attr("font-family", "sans-serif")
                        .attr("font-size", highlightTextHeight)
                        .attr("font-weight", "bold")
                        .attr("fill", "black")
                        .text(highlightText2);

                    console.log("appending tooltip-line...");
                    svg.append("path")
                        .attr("id", ("tooltip-line" + 2 + "-" + i))
                        .style("stroke", col2)
                        .attr("d", line(lineData2));
                }
            })
            .on("click", function(d, i) {

                d3.select(("#circle-highlight" + 2 + "-" + i)).remove();
                d3.select(("#tooltip-rect" + 2 + "-" + i)).remove();  
                d3.select(("#tooltip-text" + 2 + "-" + i)).remove();
                d3.select(("#tooltip-line" + 2 + "-" + i)).remove();  

                toggle[numValuesPerDataSet + i] = !toggle[numValuesPerDataSet + i];

                // If the popup already existed, remove if immediately and return.
                if (!toggle[numValuesPerDataSet + i]) {
                    d3.select(("#circle-highlight" + 2 + "-" + i)).remove();
                    d3.select(("#tooltip-rect" + 2 + "-" + i)).remove();  
                    d3.select(("#tooltip-text" + 2 + "-" + i)).remove();
                    d3.select(("#tooltip-line" + 2 + "-" + i)).remove(); 
                    return;
                }

                var x2 = xScale(d[0]);
                var y2 = yScale2(d[1]);
                var col2 = colorSet[1];
                var highlightText2 = d[0] + ", " + d[1];
                var xRect2 = x2 + 2*highlightRadius;
                var yRect2 = y2 - highlightRectHeight/2;
                var xText2 = xRect2 + highlightTextPadding;
                var yText2 = yRect2 + highlightTextHeight;
                var lineData2 = [[x2+highlightRadius,y2],[x2+2*highlightRadius,y2]]; 
                
                highlightRectWidth2 = (2*highlightTextPadding) + (characterWidth*highlightText2.length);
                if (xRect2 + highlightRectWidth2 > width) {
                    lineData2 = [[x2-2*highlightRadius, y2],[x2-highlightRadius, y2]];
                    xRect2 = x2 - 2*highlightRadius - highlightRectWidth2;
                    xText2 = xRect2 + highlightTextPadding;
                }

                console.log("appending circle-highlight...");
                svg.append("circle")
                    .attr("id", ("circle-highlight" + 2 + "-" + i))
                    .attr("cx", x2)
                    .attr("cy", y2)
                    .attr("fill", "none")
                    .style("stroke", col2)
                    .attr("r", highlightRadius);

                console.log("appending tooltip-rect...");
                svg.append("rect")
                    .attr("id", ("tooltip-rect" + 2 + "-" + i))
                    .attr("x", xRect2)
                    .attr("y", yRect2)
                    .attr("fill", highlightRectFillColor)
                    .style("stroke", col2)
                    .attr("width", highlightRectWidth2)
                    .attr("height", highlightRectHeight);

                console.log("appending tooltip-text...");
                svg.append("text")
                    .attr("id", ("tooltip-text" + 2 + "-" + i))
                    .attr("x", xText2)
                    .attr("y", yText2)
                    .style("pointer-events", "none")
                    .attr("text-anchor", "start")
                    .attr("font-family", "sans-serif")
                    .attr("font-size", highlightTextHeight)
                    .attr("font-weight", "bold")
                    .attr("fill", "black")
                    .text(highlightText2);

                console.log("appending tooltip-line...");
                svg.append("path")
                    .attr("id", ("tooltip-line" + 2 + "-" + i))
                    .style("stroke", col2)
                    .attr("d", line(lineData2));
            })
            .on("mouseout", function(d, i) {
            // If the popup should not persist, remove it.
            if (!toggle[numValuesPerDataSet + i]) {
                console.log("mouseout2");
                d3.select(("#circle-highlight" + 2 + "-" + i)).remove();
                d3.select(("#tooltip-rect" + 2 + "-" + i)).remove();  
                d3.select(("#tooltip-text" + 2 + "-" + i)).remove();
                d3.select(("#tooltip-line" + 2 + "-" + i)).remove();  
            }
        });   
    }


    if (multiset) {
        base.append("rect")
            .attr("id", "colorIcon1")
            .attr("x", (margin.left/2 - colorIconWidth/2))
            .attr("y", (margin.top + (height - colorIconHeight)))
            .attr("height", colorIconHeight)
            .attr("width", colorIconWidth)
            .style("stroke", "black")
            .style("fill", colorSet[0]);  

        base.append("rect")
            .attr("id", "colorIcon2")
            .attr("x", (w - (margin.right/2 - colorIconWidth/2)))
            .attr("y", (margin.top + (height - colorIconHeight)))
            .attr("height", colorIconHeight)
            .attr("width", colorIconWidth)
            .style("stroke", "black")
            .style("fill", colorSet[1]);
    }
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
function Line(dataSet, labels, columnTypes, width, height, showPoints) {
	this.dataSet = dataSet;
    this.labels = labels;
    this.columnTypes = columnTypes;
	this.width = width;
	this.height = height;
    this.showPoints = showPoints; // Boolean (show points?)
}

Line.prototype.draw = function (divId) {

    var margin = {top: 50, right: 65, bottom: 40, left: 65};

    var w = this.width;
    var h = this.height;
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
    var xAxisLabelPaddingBottom = 2;
    var titleLabelHeight = margin.top/3;
    var titleLabelPaddingTop = (margin.top - titleLabelHeight)/2;
    var yAxisLabelPaddingLeft = 2;
    var yAxisLabelPaddingRight = 2;
    var axisLabelHeight = 15;
    var colorIconWidth = 10;
    var colorIconHeight = 10;

    var xAxisLabel = this.labels[0];
    var yAxisLabel = this.labels[1];
    var yAxisLabel2 = this.labels[2];
    

    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    var rightGraphBoundary = width;    

    var numDataSets = this.dataSet[0].length;
    var numValues = this.dataSet.length;

    // Determine the maximum Y value for the datasets.
    var maxY = 0;
    for (var i = 1; i < numValues; i++) {
        //for (var j = 0; j < numValues; j++) {
            if (this.dataSet[i][1] > maxY) {
                maxY = this.dataSet[i][1];
            }
        //}
    }



    var numXAxisTicks = numValues;
    var numYAxisTicks = height/15;

    var multiline = false;
    multiline = (numDataSets > 2) ? true : false;

    if (multiline) {
        var maxY2 = 0;
        for (var i = 1; i < numValues; i++) {
           // for (var j = 0; j < numValues; j++) {
                if (this.dataSet[i][2] > maxY2) {
                    maxY2 = this.dataSet[i][2];
                }
            //}
        }
    }
    
    if (multiline) {
        var title = this.labels[1] + " and " + this.labels[2] + " vs. " + this.labels[0];
    } else {
        var title = this.labels[1] + " vs. " + this.labels[0];
    }

    if (this.columnTypes[0] != "String") {

        var xScale = d3.scale.linear()
                 .domain([0, d3.max(this.dataSet, function(d) { return d[0]; })])
                 .range([0, width])
                 .clamp(true);

    } else {

        for (var i = 0; i < this.dataSet.length; i++) {
            xValues.push(this.dataSet[i][0]);
        }

        var xScale = d3.scale.ordinal()
                        .domain(xValues)
                        .rangePoints([0,width]);
    }                 

    var yScale = d3.scale.linear()
                        .domain([0, maxY])
                        .range([height, 0])
                        .clamp(true);

    if (multiline) {
        var yScale2 = d3.scale.linear()
                        .domain([0, maxY2])
                        .range([height, 0])
                        .clamp(true);
    }

    if (numValues > 25) {
        numXAxisTicks = 25;
    }

    var xAxis = d3.svg.axis()
                    .scale(xScale)
                    .orient("bottom")
                    .ticks(numXAxisTicks);

    var yAxis = d3.svg.axis()
                    .scale(yScale)
                    .orient("left")
                    .ticks(numYAxisTicks);

    if (multiline) {
        var yAxis2 = d3.svg.axis()
                    .scale(yScale2)
                    .orient("right")
                    .ticks(numYAxisTicks);
    }

    var line = d3.svg.line()
            .x(function(d) { return xScale(d[0]); })
            .y(function(d) { return yScale(d[1]); });

    var line2 = d3.svg.line()
            .x(function(d) { return xScale(d[0]); })
            .y(function(d) { return yScale2(d[1]); }); 

    var unscaledLine = d3.svg.line()
            .x(function(d) { return d[0]; })
            .y(function(d) { return d[1]; }); 

    // Use the given <div> as the drawing area. This <svg> will contain all of the visualization elements.
    var base = d3.select("#" + divId)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
    var svg = base.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // Setup the guideline.
    var focus = svg.append("g")
          .attr("class", "focus")
          .style("display", "none");
    
    var lineData = [ [0, 0], [0, height] ];
    
    focus.append("path")
        .attr("class", "guideline")
        .attr("style", "stroke: gray")
        .attr("d", unscaledLine(lineData));

    // Actions that occur when the mouse moves within the graph.
    function mousemove() {        
        var mouseX = d3.mouse(this)[0];

        // Move the guideline to align with the mouse movement.
        if (mouseX >= 0) {    
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
        .attr("class", "axis")
        .attr("transform", "translate(0," + (height) + ")")
        .attr("width", width)
        .call(xAxis);


    // Display the y-axis. 
    svg.append("g")
        .attr("height", height)
        .attr({
            class: "y-axis",
            id: "y-axis-line-1",                
            })
        .call(yAxis);

    if (multiline) {
        // Display the y-axis.        
        svg.append("g")
            .attr("height", height)
            .attr({
                class: "y-axis",
                id: "y-axis-line-2",                
                transform: "translate(" + width + ",0)"
                })
            .call(yAxis2);

    }   

    base.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "sans-serif")
        .attr("x", margin.left + width/2)
        .attr("y", h - xAxisLabelPaddingBottom)
        .text(xAxisLabel);

    base.append("text")
        .attr("class", "y-label")
        .attr("id", "y-label-line-2")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "sans-serif")
        .attr("y", h/2)
        .attr("x", (0 + yAxisLabelPaddingLeft + axisLabelHeight))
        .attr("transform", "rotate(-90, " + (0 + yAxisLabelPaddingLeft + axisLabelHeight) + "," + h/2 + ")")
        .text(yAxisLabel);

    if (multiline) {
        base.append("text")
            .attr("class", "y-label2")
            .attr("id", "y-label-line-2")
            .attr("text-anchor", "middle")
            .attr("font-size", axisLabelHeight)
            .attr("font-family", "sans-serif")
            .attr("font-weight", "normal")
            .attr("y", h/2)
            .attr("x", (w - yAxisLabelPaddingRight - axisLabelHeight))
            .attr("transform", "rotate(90, " + (w - yAxisLabelPaddingRight - axisLabelHeight) + "," + h/2 + ")")
            .text(yAxisLabel2);
    }        

    base.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("font-size", titleLabelHeight)
        .attr("font-family", "sans-serif")
        .attr("x", margin.left + width/2)
        .attr("y", titleLabelPaddingTop + titleLabelHeight/2)
        .text(title);    

    for (var i = 1; i < numDataSets; i++) {
        data = getData([0,i],this.dataSet);
        dataScaled = [];

        for (var x = 0; x < data.length; x++) {
            dataScaledX = xScale(data[x][0]);
            if (i == 1) {
                dataScaledY = yScale(data[x][1]);
            } else {
                dataScaledY = yScale2(data[x][1]);
            }
            dataScaled.push([dataScaledX, dataScaledY]);
        }

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
            .attr("d", function() {
                if (i == 1) {
                    return line(data);
                } else {
                    return line2(data);
                }
            });

        // If instructed, display the data points.
        if (this.showPoints) {            
            for (var j = 0; j < numValues; j++) {
                pointX = dataScaled[j][0];
                // if (i == 1) {
                pointY = dataScaled[j][1];
                // } else {
                    // pointY = yScale2(data[j][1]);
                // }

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

    if (multiline) {
        base.append("rect")
            .attr("id", "colorIcon1")
            .attr("x", (margin.left/2 - colorIconWidth/2))
            .attr("y", (margin.top + (height - colorIconHeight)))
            .attr("height", colorIconHeight)
            .attr("width", colorIconWidth)
            .style("stroke", "black")
            .style("fill", colors[0]);  

        base.append("rect")
            .attr("id", "colorIcon2")
            .attr("x", (w - (margin.right/2 - colorIconWidth/2)))
            .attr("y", (margin.top + (height - colorIconHeight)))
            .attr("height", colorIconHeight)
            .attr("width", colorIconWidth)
            .style("stroke", "black")
            .style("fill", colors[1]);
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
            .attr("style", "font-size: " + highlightTextHeight + "px; font-family: sans-serif")
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
        .attr("width", width+2)
        .attr("height", height+2)
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
   
};

function Bar (dataSet, labels, columnTypes, width, height) {
	this.dataSet = dataSet;
    this.labels = labels;
    this.columnTypes = columnTypes;
	this.width = width;
	this.height = height;
}

Bar.prototype.draw = function(divId) {

    var margin = {top: 50, right: 55, bottom: 40, left: 55};

    var numValuesPerDataSet = this.dataSet.length;
    var numDataSets = this.dataSet[0].length;

    var colorIconHeight = 10;
    var colorIconWidth = 10;

    var multiset = false;
    if (numDataSets > 2) {
        multiset = true;
    }

	xValues = [];
	yValues = [];
    y2Values = [];

	numBars = this.dataSet.length;

	for(var i = 0; i < numBars; i++) {
		xValues[i] = this.dataSet[i][0];
		yValues[i] = this.dataSet[i][1];
        if (multiset) {
            y2Values[i] = this.dataSet[i][2];
        }		
	}
    
    var condensedXValues = [];
    var condensedYValues = [];
    var condensedY2Values = [];
    var currentYTotal = 0;
    var currentY2Total = 0;
    for (var i = 0; i < xValues.length; i++) {
        // If this is a duplicate x-value:
        if (condensedXValues.indexOf(xValues[i]) != -1) {
            continue;
        } 
        currentYTotal = yValues[i];
        if (multiset) {
            currentY2Total = y2Values[i];
        }
        for (var j = i + 1; j < xValues.length; j++) {
            if (xValues[j] == xValues[i]) {
                currentYTotal += yValues[j];
                if (multiset) {
                    currentY2Total += y2Values[j];
                }
            }
        }
        condensedXValues.push(xValues[i]);
        condensedYValues.push(currentYTotal);
        if (multiset) {
            condensedY2Values.push(currentY2Total);
        }
    }

    var condensedDataSet = [];
    var condensedDataSet2 = [];

    for (var i = 0; i < condensedXValues.length; i++) {
        condensedDataSet.push([condensedXValues[i],condensedYValues[i]]);
        if (multiset) {
            condensedDataSet2.push([condensedXValues[i], condensedY2Values[i]]);
        }
    }

    // numBars = d3.max(xValues);
    // numBars = d3.max(condensedXValues);
    numBars = condensedXValues.length;

	//Width and height
    var w = this.width;
    var h = this.height;
    var highlightTextHeight = 12;
    var highlightTextPadding = 2;
    var padding = 20;
    var barPadding = 5;
    var barSetPadding = 10;
    
    var xAxisLabelPaddingBottom = 2;
    var titleLabelHeight = margin.top/3;
    var titleLabelPaddingTop = (margin.top - titleLabelHeight)/2;
    var yAxisLabelPaddingLeft = 2;
    var yAxisLabelPaddingRight = 2;
    var axisLabelHeight = 15;

    var xAxisLabel = this.labels[0];
    var yAxisLabel = this.labels[1];
    if (multiset) {
        var y2AxisLabel = this.labels[2];
        var title = yAxisLabel + " and " + y2AxisLabel + " vs. " + xAxisLabel;   
    } else {
        var title = yAxisLabel + " vs. " + xAxisLabel;    
    }
    

    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    var numYAxisTicks = height/15;

    if (!multiset) {
        var barWidth = (width / numBars) - barPadding;
    } else {
        var barWidth = ((width - ((numBars-1)*barSetPadding) - ((3*numBars)*barPadding))/(2*numBars));
    }


    //console.log("(width / numBars) - barPadding: " +  "(" + width + "/" + numBars + ")" + " - " + barPadding);

    var fillColor = randRGB(100, 200);
    var fillColor2 = randRGB(100,200);
    var highlightColor = randRGB(100, 200);  

      





    if (this.columnTypes[0] != "String") {

        var xScale = d3.scale.linear()
                    .domain([0, d3.max(condensedXValues)])
                    .range([barPadding, width - barPadding - barWidth]);

    } else {

        // for (var i = 0; i < this.dataSet.length; i++) {
        //     xValues.push(this.dataSet[i][0]);
        // }

        if (multiset) {
            var xScale = d3.scale.ordinal()
                            .domain(condensedXValues)
                            .rangePoints([barPadding,width - 2*barPadding - 2*barWidth]);
        } else {
            var xScale = d3.scale.ordinal()
                            .domain(condensedXValues)
                            .rangePoints([barPadding,width - barPadding - barWidth]);
        }
    }  






    var yScale = d3.scale.linear()
                    .domain([0, d3.max(condensedYValues)])
                    .range([height, 0]);

    if (multiset) {
        var yScale2 = d3.scale.linear()
                        .domain([0, d3.max(condensedY2Values)])
                        .range([height, 0]);
    }

 	var xAxis = d3.svg.axis()
 					.scale(xScale)
 					.orient("bottom")
 					.ticks(numBars);

 	var yAxis = d3.svg.axis()
 					.scale(yScale)
 					.orient("left")
 					.ticks(numYAxisTicks);

    if (multiset) {
        var yAxis2 = d3.svg.axis()
                    .scale(yScale2)
                    .orient("right")
                    .ticks(numYAxisTicks);
    }

    var unscaledLine = d3.svg.line()
        .x(function(d) { return d[0]; })
        .y(function(d) { return d[1]; });                    

    var xAxisLineCoords = [[0, height], [width, height]];

 	var xAxisLine = d3.svg.line(xAxisLineCoords);

    //Create SVG element
    var base = d3.select("#" + divId)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
    var svg = base.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	//Create bars
    svg.selectAll("rect.set1")
        .data(condensedDataSet)
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
            return height - yScale(d[1]);
        })
	    .attr("fill", function(d) {
	        return fillColor;
	    })
        .attr("class", "bar-set1")
        .on("mouseover",function(d) {
            var xPosition = parseFloat(d3.select(this).attr("x"));
            var xTextPosition = xPosition + barWidth/2;
            var yPosition = parseFloat(d3.select(this).attr("y"));
            var yTextPosition = yPosition + highlightTextHeight;
            if (yTextPosition > height) {
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

            var barLineData = [ [0, yPosition], [width, yPosition] ];

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
            svg.selectAll(".bar-set2")
                .attr("fill", fillColor2);
            svg.selectAll(".bar-set1")
                .attr("fill", fillColor); 
            
        });

    svg.selectAll("rect.set2")
        .data(condensedDataSet2)
        .enter()
        .append("rect")
        .attr("x", function(d) {
            return (xScale(d[0]) + barWidth + barPadding);
        })
        .attr("y", function(d) {
            return (yScale2(d[1]));
        })
        .attr("width", barWidth)
        .attr("height", function(d) {
            return height - yScale2(d[1]);
        })
        .attr("fill", function(d) {
            return fillColor2;
        })
        .attr("class", "bar-set2")
        .on("mouseover",function(d) {
            var xPosition = parseFloat(d3.select(this).attr("x"));
            var xTextPosition = xPosition + barWidth/2;
            var yPosition = parseFloat(d3.select(this).attr("y"));
            var yTextPosition = yPosition + highlightTextHeight;
            if (yTextPosition > height) {
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

            var barLineData = [ [0, yPosition], [width, yPosition] ];

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
                .attr("fill", fillColor2);
            svg.selectAll(".bar-set2")
                .attr("fill", fillColor2);
            svg.selectAll(".bar-set1")
                .attr("fill", fillColor);    
            
        });    

    if (multiset) {
        // Create x-axis
        svg.append("g")
            .attr({
                class: "x-axis",
                "transform": "translate(" + (barWidth + barPadding/2) + "," + height + ")"
            })
            .call(xAxis);

        // Create y-axis
        svg.append("g")
            .attr({
                class: "y-axis",
                "transform": "translate(" + width + ",0)"
            })
            .call(yAxis2);

    } else {
        // Create x-axis
        svg.append("g")
        .attr({
            class: "x-axis",
            "transform": "translate(" + (barWidth/2) + "," + height + ")"
        })
        .call(xAxis);
    }

   	// Create y-axis
    svg.append("g")
        .attr({
            class: "y-axis",
            "transform": "translate(" + 0 + ",0)"
        })
        .call(yAxis);

	svg.append("path")
    	.attr("class", "line")
    	.attr("d", xAxisLine(xAxisLineCoords));

    base.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "sans-serif")
        .attr("x", margin.left + width/2)
        .attr("y", h - xAxisLabelPaddingBottom)
        .text(xAxisLabel);

    base.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "middle")
        .attr("font-size", axisLabelHeight)
        .attr("font-family", "sans-serif")
        .attr("y", h/2)
        .attr("x", (0 + yAxisLabelPaddingLeft + axisLabelHeight))
        .attr("transform", "rotate(-90, " + (0 + yAxisLabelPaddingLeft + axisLabelHeight) + "," + h/2 + ")")
        .text(yAxisLabel);

    if (multiset) {
        base.append("text")
            .attr("class", "y-label")
            .attr("text-anchor", "middle")
            .attr("font-size", axisLabelHeight)
            .attr("font-family", "sans-serif")
            .attr("y", h/2)
            .attr("x", (w - yAxisLabelPaddingRight - axisLabelHeight))
            .attr("transform", "rotate(90, " + (w - yAxisLabelPaddingRight - axisLabelHeight) + "," + h/2 + ")")
            .text(y2AxisLabel);
    }

    base.append("text")
        .attr("class", "title")
        .attr("text-anchor", "middle")
        .attr("font-size", titleLabelHeight)
        .attr("font-family", "sans-serif")
        .attr("x", margin.left + width/2)
        .attr("y", titleLabelPaddingTop + titleLabelHeight/2)
        .text(title);

    if (multiset) {
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
            .attr("x", (w - (margin.right/2 - colorIconWidth/2)))
            .attr("y", (margin.top + (height - colorIconHeight)))
            .attr("height", colorIconHeight)
            .attr("width", colorIconWidth)
            .style("stroke", "black")
            .style("fill", fillColor2);
    }     
};

function visualize(dataPackage, parentId) {

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

function getVisualization(dataPackage,type)
{
    var height = 300;
    var pieWidth = height*1.5;
    var width = 650;
    for(var i = 0; i < dataPackage.Visualizations.length; i++)
    {
        var visType = dataPackage.Visualizations[i].Type;
        var columnSet = dataPackage.Visualizations[i].DataColumns;
        var columnTypes = dataPackage.Data.ColumnType;
        var values = dataPackage.Data.Values;
        var labels = dataPackage.Data.ColumnLabel;
        console.log('Checking ' + visType + ' == ' + type + ' -> ' + (visType==type));
        if(type == visType)
        {
            var v = NaN;
            // Instantiate a visualization of the appropriate type and append it to the list of visualizations.
            switch(type) {
                case "Line":
                    v = new Line(getData(columnSet, values), getLabels(columnSet, labels), getColumnTypes(columnSet, columnTypes), width, height, true);
                    break;

                case "Bar":
                    v = new Bar(getData(columnSet, values), getLabels(columnSet, labels), getColumnTypes(columnSet, columnTypes), width, height);
                    break;

                case "Scatter":
                    v = new Scatter(getData(columnSet, values), getLabels(columnSet, labels), getColumnTypes(columnSet, columnTypes), width, height);
                    break;  

                case "Area":
                    v = new Area(getData(columnSet, values), width, height);
                    break; 

                case "Pie":
                    v = new Pie(getData(columnSet, values), getLabels(columnSet, labels), pieWidth, height);
                    break;

                case "Tree":
                    v = new Treemap(getData(columnSet, values), getLabels(columnSet, labels), width, 1.3*height);
                    break;

                case "Bubble":
                    v = new Bubble(getData(columnSet, values), getLabels(columnSet, labels), getColumnTypes(columnSet, columnTypes), width, height);
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

function getLabels(columns, labels)
{
    var labelSet = [];
    for (var i = 0; i < columns.length; i++) {
        labelSet.push(labels[i]);
    }
    return labelSet;
}

function getColumnTypes(columns, types)
{
    var typeSet = [];
    for (var i = 0; i < columns.length; i++) {
        typeSet.push(types[i]);
    }
    return typeSet;
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

function getRandColors() {
    var colors = [  ['rgb(127,201,127)','rgb(190,174,212)','rgb(253,192,134)','rgb(255,255,153)','rgb(56,108,176)','rgb(240,2,127)'],
                    ['rgb(27,158,119)','rgb(217,95,2)','rgb(117,112,179)','rgb(231,41,138)','rgb(102,166,30)','rgb(230,171,2)'],
                    ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)'],
                    ['rgb(251,180,174)','rgb(179,205,227)','rgb(204,235,197)','rgb(222,203,228)','rgb(254,217,166)','rgb(255,255,204)'],
                    ['rgb(179,226,205)','rgb(253,205,172)','rgb(203,213,232)','rgb(244,202,228)','rgb(230,245,201)','rgb(255,242,174)'],
                    ['rgb(228,26,28)','rgb(55,126,184)','rgb(77,175,74)','rgb(152,78,163)','rgb(255,127,0)','rgb(255,255,51)'],
                    ['rgb(102,194,165)','rgb(252,141,98)','rgb(141,160,203)','rgb(231,138,195)','rgb(166,216,84)','rgb(255,217,47)'],
                    ['rgb(141,211,199)','rgb(255,255,179)','rgb(190,186,218)','rgb(251,128,114)','rgb(128,177,211)','rgb(253,180,98)'],
                    ['rgb(213,62,79)','rgb(252,141,89)','rgb(254,224,139)','rgb(230,245,152)','rgb(153,213,148)','rgb(50,136,189)'],
                    ['rgb(166,206,227)','rgb(31,120,180)','rgb(178,223,138)','rgb(51,160,44)','rgb(251,154,153)','rgb(227,26,28)'],
                    ['rgb(253,191,111)','rgb(255,127,0)','rgb(202,178,214)','rgb(106,61,154)','rgb(255,255,153)','rgb(177,89,40)'],
                    ['rgb(141,211,199)','rgb(255,255,179)','rgb(190,186,218)','rgb(251,128,114)','rgb(128,177,211)','rgb(253,180,98)'],
                    ['rgb(179,222,105)','rgb(252,205,229)','rgb(217,217,217)','rgb(188,128,189)','rgb(204,235,197)','rgb(255,237,111)']];


    return colors[Math.floor(Math.random()*colors.length)];
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

