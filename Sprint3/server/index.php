<?php
	/**
	*	InstantVIS REST Server API
	*	For explicit API documentation see: 
	*	https://github.com/ccopper/InstantVis/wiki/API-Definition
	*	
	*	Slim is released under the MIT Public License 
	*	See: http://www.slimframework.com/
	*/
	
	error_reporting(E_ALL);
	
	//Import the Slim REST API
	require 'Slim/Slim.php';
	\Slim\Slim::registerAutoloader();
	
	$app = new \Slim\Slim();
	
	//Set the not found handler
	$app->notFound(function () use ($app)
	{
		echo "{ \"Status\": 0 }";
	});

	
	//Register the REST API Calls
	$app->post('/parseHTML', function () use ($app)
	{
		parseHTML($app);
	});
 
	$app->run();
	
	/**
	*	Parses the HTML contained at URL.	
	*	
	*	@method parseHTML
	*	@param	app		Instance of the Slim App
	*	@ 
	*/
	function parseHTML($app)
	{
		//URLs are possibly unsanitized data.
		//Can arbitrary commands be executed
		$URL = $app->request->post('URL');

		chdir(dirname(__FILE__));
		echo exec("phantomjs phantomScripts/parseHTML.js \"$URL\"");
		
	}	
?>