/**
 *	Instant Vis API
 *
 *	@module InstantVisAPI
 */

 /**
  *	JSON For the default API Configuration. 
  *
  * @property InstantVisAPI_Config
  * @type JSON
  */
var InstantVisAPI_Config = 
{ 
	"Host": "",
	"APIDir": "server",
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
	//Encode the URL properly to handle slashed and special chars
	var cleanURI = encodeURI(URL);
	//Make an ajax request for the data
	$.ajax({
		type: 'GET',
        url: InstantVisAPI_Config.Host + InstantVisAPI_Config.APIDir + "/parseHTML/" + cleanURI,
        dataType: "json", 
		success: function(data, textStatus, jqXHR)
		{
			APICallback(data);
		},
		error: InstantVisAPI_Error
		
	});	
}

/**
 *	Requests that the provided URL be scraped for tables.
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

