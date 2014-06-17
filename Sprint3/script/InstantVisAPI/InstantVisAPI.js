/**
 *	Instant Vis API
 *
 *	@module InstantVisAPI
 *  @author Andrew Reisdorph
 *	@author Chris Copper
 *	@author Jeremiah Jekich
 *	@author Phil Eittreim
 */

 /**
  *	JSON For the default API Configuration.  Requires a host and relatve
defaults to "" and "server" respectivly.
  *
  * @property InstantVisAPI_Config
  * @type JSON
  * @default
  */
var InstantVisAPI_Config = 
{ 
	"Host": "",
	"APIDir": "server",
}

 /**
  *	Callback for a failed API call.
  *
  * @callback InstantVisAPI_Config
  * @param {string} errorThrown		Error Message that was thrown
  */
var errorCallBack = function(errorThrown)
{
	return
}

/**
 *	Requests that the provided URL be scraped for tables.
 *
 *	@method parseHTML
 *	@param {string} URL				The URL to Scrape
 *	@param {Function} APICallBack	The Resulting callback when the request completes
 *	
 */
function parseHTML(URL, APICallback)
{

	if(URL.indexOf("http://") != 0 && URL.indexOf("https://") != 0)
	{
		URL = "http://" + URL
	}	
	
	//Encode the URL properly to handle slashed and special chars
	var cleanURI = URL; //encodeURI(URL);
	//Make an ajax request for the data
	$.ajax({
		type: 'POST',
        url: InstantVisAPI_Config.Host + InstantVisAPI_Config.APIDir + "/parseHTML",
		data: { "URL": cleanURI },
        dataType: "json", 
		success: function(data, textStatus, jqXHR)
		{
			APICallback(data);
		},
		error: InstantVisAPI_Error
		
	});	
}

/**
 *	Error Handler if the API call fails to go through.  The call response
may still return no data.
 *
 *	@method InstantVisAPI_Error
 *	@param {string} URL				The URL to Scrape
 *	@param {Function} APICallBack	The Resulting callback when the request completes
 *	
 */
function InstantVisAPI_Error(jqXHR, textStatus, errorThrown)
{
	alert("API Call Failed: " + errorThrown); 
}

