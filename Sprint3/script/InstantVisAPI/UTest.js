/**
 *	Instant Vis API Unit Tests
 *
 *	@module InstantVisAPITests
 */
 
 
asyncTest("parseHTML for google.com returns non null", function()
{
	expect(1);
	
	parseHTML("www.google.com", function()
	{
		ok( true, "APICallBack was successfully called" );
		start();
	});
});