/*
*All server related tasks
*
*/


//dependencies
var http = require('http');
var https = require('https');
var url = require('url');
// getting the StringDecoder constructor from the string_decoder module
var StringDecoder = require('string_decoder').StringDecoder
var handlers = require('./handlers');
var helpers = require('./helpers');
var config = require('./config');
var fs = require('fs');
var path = require('path');
var _data = require('./data');



//Server container
var server = {};

//instantiate HTTP server
server.httpServer = http.createServer((req,res)=>{
	server.unifiedServer(req,res);
});


//instantiate HTTPS server

//building the server options object
server.httpsServerOptions = {
	'key':fs.readFileSync('./https/key.pem'),
	'cert':fs.readFileSync('./https/cert.pem')
}; 

//instantiate HTTPS server
server.httpsServer = https.createServer(server.httpsServerOptions,(req,res)=>{
	server.unifiedServer(req,res);	
});

server.unifiedServer = (req,res)=>{
	
		
	//parsing the url from the request, true argument adds the queryString module to the url.parse method
	var parsedUrl = url.parse(req.url,true);
	
	//getting the path fron the parsedUrl object
	var path = parsedUrl.pathname;
	
	//trimming off the slashes fro from the path
	var trimmedPath = path.replace(/^\/+|\/+$/g,'');
	
	//getting the queryStringObject from the parsed url
	var queryStringObject = parsedUrl.query;
	
	//getting the HTTP method
	var method = req.method.toLowerCase();
	
	//getting the headers from the request method
	var headers = req.headers;
	
	//getting the payload object if any
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data',data=>{
	 buffer+= decoder.write(data);
	 
	 });
	
	req.on('end',()=>{
		buffer+=decoder.end();
		
		//data to be sent to the route handler	
		data = {
			'trimmedPath':trimmedPath	,
			'method':method,
			'queryStringObject':queryStringObject,
			'payload':helpers.parseJson(buffer),
			'headers':headers		
		}
		
		var chosenHandler = typeof(server.router[trimmedPath])!== 'undefined'?server.router[trimmedPath] : handlers.notFound;
		chosenHandler(data,function(statusCode,payload){
			//get statusCode from arguement of default to 200
			var statusCode = typeof(statusCode)=='number'? statusCode:200;
			
			//get the payload from the arguement of default to {}
			
			var payload = typeof(payload)=='object'?payload:{};
			var payloadString = JSON.stringify(payload);
			res.setHeader('Content-Type','application/json');
			res.writeHead(statusCode);
			res.end(payloadString);
			console.log(payloadString);
		});
	});	
};




//Define the routing pattern

server.router = {
	'users':handlers.users,
	'ping':handlers.ping,
	'tokens':handlers.tokens,
	'checks':handlers.checks
}


server.init = function(){
	
//satrting up the http server	
server.httpServer.listen(config.httpPort,()=>console.log(`http server in ${config.envName} mode listening on port ${config.httpPort}`));
	
	
//Start the HTTPS server
server.httpsServer.listen(config.httpsPort,()=>{
	console.log(`https server in ${config.envName} listening on port ${config.httpsPort}`);
});


	
	
}






//export the module
module.exports = server;





