/*
*Crud operations module
*/


//dependencies
var fs = require('fs');
var config = require('./config');
var path = require('path');
var helpers = require('./helpers');

//define the lib
var lib = {};

lib.baseDir = path.join(__dirname,'/./../.data/'); 


lib.create = (dir,filename,data,callback)=>{
	//opneing the file in the fileSystem
	fs.open(lib.baseDir+dir+'/'+filename+'.json','wx',(err,fileDescriptor)=>{
		if(!err && fileDescriptor){
			
			//stringifying the data to be written in the file
			var dataString = JSON.stringify(data);
			//writing data to the file
			fs.writeFile(fileDescriptor,dataString,(err)=>{
				if(!err){
					fs.close(fileDescriptor,(err)=>{
						if(!err){
							callback(false)
						}else{
							callback('Error in closing the file ')
						}
					})
				}else{
					callback('Error in writing the file')
				}
			});
		}else{
			callback(400,{'error':'could not open the file, maybe it already exists'})
		}
	});	
}

//the reading data from a file
lib.read = function(dir,filename,callback){
	//building the filename 
	var filename_  = lib.baseDir+dir+'/'+filename+'.json';
	fs.readFile(filename_,'utf8',function(err,data){
		if(!err && data){
			var parsedData = helpers.parseJson(data);
			callback(false,parsedData);
		}else{
			callback('Error, could read the file')
		}
	});
}

//Update data inside a file
lib.update = function(dir,filename,data,callback){
	//buoilding the filename
	var filname_ = lib.baseDir+dir+'/'+filename+'.json';
	//opening the file and get a fileDescriptor object
	fs.open(filname_,'r+',function(err,fileDescriptor){
		if(!err && fileDescriptor){
			fs.ftruncate(fileDescriptor,function(err){
				if(!err){
					var stringData = JSON.stringify(data);
					fs.writeFile(fileDescriptor,stringData,err=>{
						if(!err){
							fs.close(fileDescriptor,err=>{
								if(!err){
									callback(false);
								}else{
									callback('Error during closing the file');
								}
							});
						}else{
							callback('Error : failed to write into the file to be updated');
						}
					})
				}else{
					callback('Error : failes to truncate file');
				}
			});
		}else{
			callback('Error, Could not open the file to Update');
		}
	});
}


//deleleting a file from th e fileSystem
lib.delete = function(dir,filename,callback){
	//building the filename
	var filename_ = lib.baseDir+dir+'/'+filename+'.json';
	//unlink the file from the fileSystem
	fs.unlink(filename_,(err)=>{
		if(!err){
			callback(false)
		}else{
			callback('Could not delete the use');
		}
	});
}


lib.list = function(dir,callback){
	dir = typeof(dir)=='string' && dir.trim().length >0?dir:false;
	if(dir){
		fs.readdir(dir,function(err,fileList){
			if(!err && fileList){
				//stip off the .JSON
				var strippedList = [];
				fileList.forEach(function(file){
					strippedList.push(file.replace('.json',''));
					//callback an  error false
					callback(false,strippedList);
				});
			}else{
				callback('Failed to read the contents of the dir');
			}
		})
	}else{
		callback('the directory name if invalid')
	}
}






//exporting the module
module.exports = lib;