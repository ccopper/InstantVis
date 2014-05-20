//This is our code for the visualizer. 
function Line(dataSet) {
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

	//Width and height
    var w = this.width;
    var h = this.height;
    var maxValue = 100;

    var xScale = d3.scale.ordinal()
                            .domain(d3.range(this.dataSet.length))
                            .rangeRoundBands([0, w], 0.05);

    var yScale = d3.scale.linear()
                    .domain([0, d3.max(this.dataSet)])
                    .range([0, h]);
 
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
        .data(this.dataSet)
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

};


function visualize(dataPackage, parentId) {
	// var visualizations = extractVisualizations(dataPackage);

	// var divId = "vis";

	// var numVisualizations = visualizations.length;
	// for (var i = 0; i < numVisualizations; i++) {
	// 	divId = divId + "i";
	// 	createDiv(parentId, divId);
	// 	visualizations[i].draw(divId);
	// }
	console.log("visualize called")

	var dataSet = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
                            11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ];
	var bar = new Bar(dataSet, width);
	var barId = 'bar';

	console.log("A");
	createDiv(parentId,barId);

	console.log("B");
	bar.draw(barId);
}

function extractVisualizations(dataPackage) {
	console.log("come on man");
}

function createDiv(parentId, newDivId) {
	//Find parent and append new div with id specified by newDivId
	var parentDiv = document.getElementById(parentId);
	if(!parentDiv){
		console.log("Could not find parent " + parentId + ". No child added.")
		return false;
	}
	var newDiv = document.createElement('div');
	newDiv.setAttribute('id',newDivId);
	newDiv.setAttribute('class', 'visualization');
	parentDiv.appendChild(newDiv);
	return true;
}