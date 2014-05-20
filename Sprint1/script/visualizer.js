//This is our code for the visualizer. 
function Line(dataSet) {
	this.dataSet = dataSet;
}

Line.prototype.draw = function () {
	//d3.js code here
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
		console.log("Could not find parent " + parentId + ". No child added.")
		return false;
	}
	var newDiv = document.createElement('div');
	newDiv.setAtrribute('id',newDivId);
	parentDiv.appendChild(newDiv);
	return true;
}