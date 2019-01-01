/*
*Restful JSON API
*/



//Dependencies
var server = require('./lib/server');
//var workers = require('./lib/workers');

//index container
var index = {};

index.init = function(){
	server.init();
	
	//workers.init();
	
	
}

index.init();


module.exports = index;


