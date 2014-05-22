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
		echo "{ "Status": 1 }";
	});
	
	
	//Register the REST API Calls
	$app->post('/parseHTML', parseHTML);
 
	$app->run();
	
	/**
	*	
	*/
	function parseHTML($URL)
	{
		//URLs are unsanitized we a way to saftly pass these as a command arg
		//$encURL = base64_encode($url);
		
		$request = Slim::getInstance()->request();
		$URL = json_decode($request->getBody());
		
		echo exec("phantomjs phantomScripts/parseHTML.js \"" + $URL["URL"] "\"");
		
	}	
?>