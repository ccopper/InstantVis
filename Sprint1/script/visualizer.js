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

function createDiv(parentId, divId) {

}