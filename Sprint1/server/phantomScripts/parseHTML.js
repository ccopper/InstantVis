/**
*	Phantom JS HTML Parsing/Scraping
*	
*	@module
*/

/*=========================================================
 *	Imports and prototypes
 *=========================================================*/
//Import the system module
var system = require('system');

 /**
  *	JSON For the defaults of the output 
  *
  * @property outputData
  * @type JSON
  */
var outputData = 
{
     "Status": 1,      
     "HTTPCode": 0,
	 "URL":	"",
     "Data": 
     {
          "Values": []
     }
}

/**
 *	Outputs the result to stdout and exits
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


if (system.args.length != 2) 
{
	writeQuit(outputData);
}

outputData.Status = 0;
outputData.HTTPCode = 200;
outputData.URL = system.args[1];


writeQuit(outputData);
//Exit just incase writeQuite doesn't get called
phantom.exit();