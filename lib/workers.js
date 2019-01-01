/*
*all worker related tasks
*
*/


//Dependencies
var _data = require('./data');




//container of the workers module
var workers = {};

workers.getAllChecks = ()=>{
	//get all checkts from the checks dir
	_data.list('checks',(err,checklist)={
		if(!err checklist){
			
		}else{
			console.log('failed to get the checklist')
		}
	});
};








//worker initialisation funtion
workers.init = ()=>{
	//repeating after every hour
	setInterval(workers.getAllChecks,1000*60*60);
	//initial execuation of this funtion
	workers.getAllChecks();
	
};





//export the module

module.exports = workers;


