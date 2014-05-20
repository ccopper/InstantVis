//This is our code for the visualizer. 
function Line(dataSet) {
	this.dataSet = dataSet;
}

Line.prototype.draw = function () {
	//d3.js code here
}

function Bar(dataSet) {
	this.dataSet = dataSet;
}

Bar.prototype.draw = function(divId) {
	this.dataSet = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
                            11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];


	//Width and height
    var w = 600;
    var h = 250;
    var maxValue = 100;

    var xScale = d3.scale.ordinal()
                            .domain(d3.range(dataset.length))
                            .rangeRoundBands([0, w], 0.05);

    var yScale = d3.scale.linear()
                    .domain([0, d3.max(dataset)])
                    .range([0, h]);
 
    //Create SVG element
    var svg = d3.select("#" + divId)
                .append("svg")
                .attr("width", w)
                .attr("height", h);

	//Create bars
    svg.selectAll("rect")
    	.data(dataset)
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
	        return xScale(i);
	    })
	    .attr("y", function(d) {
	        return h - yScale(d);
	    })
	    .attr("width", xScale.rangeBand())
	    .attr("height", function(d) {
	        return yScale(d);
	    })
	    .attr("fill", function(d) {
	        return "rgb(0, 0, " + (d * 10) + ")";
	    });

    //Create labels
    svg.selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .text(function(d) {
            return d;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(d, i) {
            return xScale(i) + xScale.rangeBand() / 2;
        })
        .attr("y", function(d) {
            return h - yScale(d) + 14;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "11px")
        .attr("fill", "white");

}


function visualize(dataPackage, parentId) {
	var visualizations = extractVisualizations(dataPackage);

	var divId = "vis";

	var numVisualizations = visualizations.length;
	for (var i = 0; i < numVisualizations; i++) {
		divId = divId + "i";
		createDiv(parentId, divId);
		visualizations[i].draw(divId);
	}
}

function extractVisualizations(dataPackage) {

}

function createDiv(parentId, newDivId) {
	//Find parent and append new div with id specified by newDivId
	var parentDiv = document.getElementById(parentId);
	if(!parentDiv){
		console.log("Could not find parent "+parentId+". No child added.")
		return false;
	}
	var newDiv = document.createElement('div');
	newDiv.setAtrribute('id',newDivId);
	parentDiv.appendChild(newDiv);
	return true;
}