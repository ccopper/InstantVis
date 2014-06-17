/**
*	Phantom JS HTML Parsing/Scraping.
*	
*
*	@module parseHTML
*	@author Andrew Reisdorph
*	@author Chris Copper
*	@author Jeremiah Jekich
*	@author Phil Eittreim
*/

/*=========================================================
 *	Imports and prototypes
 *=========================================================*/
//Import the system module
var system = require('system');
var webpage = require('webpage');


 /**
  *	JSON For the defaults of the output  
  *
  * @property outputData
  * @type JSON
  */
var outputData = 
{
     "Status": 0,      
     "Data": [],
	 "B64": "",
	 "E64":""
}
/**
 *	Outputs the result to stdout and exits.
 *
 *	@method writeQuit
 *	@param {json} Data		The output data
 *	
 */
function writeQuit(data)
{
	system.stdout.writeLine(JSON.stringify(data));
	phantom.exit();
}
/*=========================================================
 *	Main code block below
 *=========================================================*/
//Verify that we were passed a url
if (system.args.length != 2) 
{
	writeQuit(outputData);
}

//URL of page to parse
var URL = atob(system.args[1]);
outputData.E64 = system.args[1];
outputData.B64 = URL;

//Create a webpage
var page = webpage.create();
//Page error handler

/*phantom.onError = function(msg, trace)
{
	system.stderr.writeLine(msg);
	system.stderr.writeLine(trace);
	writeQuit(outputData);
}*/

/**
 *	Loads the page. Writes any tables to stdout and then exits.
 *
 *	@method Main
 *	@param {json} Data		The output data
 *	
 */
page.onError = function(msg, trace) 
{
	system.stderr.writeLine(msg);
	system.stderr.writeLine(trace);
	outputData.Status = 0;
	outputData.Data = [];
	writeQuit(outputData);
};

//Request the page
page.open(URL, function(status)
{
	
	//If we failed to retrieve the page
	if(status == "fail")
	{
		writeQuit(outputData);
	}
	
	//Inject jquery and the table parsing script
	page.injectJs("phantomScripts/jquery-2.1.1.min.js");
	
	page.injectJs("phantomScripts/tableScraper.js");

	var table = page.evaluate(function()
	{
		return tableScraper();
	});
			
	outputData.Status = 1;
	outputData.Data = table.Data;
	writeQuit(outputData);		
	
});	

