/*
* Resquest Handlers
*
*/


//Dependencies
_data = require('./data');
var helpers = require('./helpers');
var config = require('./config');


//Container of the handlers module
var handlers = {};

//404 notFound handeler

handlers.notFound = (data,callback)=>{
	callback(404,{'Error':'not found'});
}

//ping handlers
handlers.ping = (data,callback)=>{
	callback(200);
};
	
//Users handler 
handlers.users = function(data,callback){
	var acceptedMethods = ['post','get','put','delete'];
	if(acceptedMethods.indexOf(data.method)> -1){
		var chosenHandler = handlers._users[data.method];
		chosenHandler(data,callback);
	}else{
		callback(400,{'message':'method not allowed'});
		console.log('error',data.method);
	}
}
//conatiner of the users subHandlers
handlers._users = {};


//User-post
handlers._users.post = (data,callback)=>{
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ?data.payload.firstName:false;
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ?data.payload.lastName:false;
	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ?data.payload.phone.trim():false;
		var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ?data.payload.password:false;
	var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ?true:false;

if(firstName && lastName && phone && password && tosAgreement ){
	_data.read('users',phone,function(err,data){
		if(err){
			//hash the password
			var hashedPassword = helpers.hash(password);
			if(hashedPassword){		
		//data object to be saved into the FS
			var userObject = {
				'firstName':firstName,
				'lastName':lastName,
				'hashedPassword':hashedPassword,
				'phone':phone,
				'tosAgreement':tosAgreement
			};			
			// Store Data into the fileSystem
			_data.create('users',phone,userObject,function(err){
				if(!err){
					callback(200);
				}else{
					console.log(err);
					callback(500,{'Error':'Failed to Create User'});
				}
			})
			}else{
				callback(500,{'Error':'Could not hash the password'})
			}		
		}else{
			callback(500,{'Error':'User with this phone number already exists'});
		}
	});
}else{
	callback(400,{'Error': 'Missing Required Fields '});
};
};

//User-delete
handlers._users.delete = (data,callback)=>{
	//required data
	var phone = typeof(data.queryStringObject.phone)=='string' && data.queryStringObject.phone.trim().length ==10?data.queryStringObject.phone.trim():false;
	var token = typeof(data.headers.token)=='string' && data.headers.token.trim().length?data.headers.token.trim():false;
	//callback error when phone is  false
	if(phone && token ){
		//verify token sent with the request
		handlers.verifyToken(phone,token,(tokenIsValid)=>{
			if(tokenIsValid){
				
		//check if the user is in the fileSystem
		_data.read('users',phone,(err,userData)=>{
			//callback error when user file cannot be read
			if(!err && userData){
				//delete the user from the fileSystem
				_data.delete('users',phone,(err)=>{
					if(!err){
						//delete users checks from the FS
						var checksToDelete = userData.checks.length;
						var checksDeleted = 0
						var deletionError = false;
						for(var i=0;i<checksToDelete;i++){
							checksDeleted++;
							_data.delete('checks',userData.checks[i],(err)=>{
								if(err){
									deletionError = true;
								}
							});
						} 
						//continue if there is no deletion error;
						if(!deletionError){
							
						}else{
							callback(500,{"Error":'Error whilst deleting of of the checks skipping it ...'});
							console.log('ChecksDeleted: ',checksDeleted,'Error deleting a check whilst deleting user');
						}
						
					}else{
						callback(500,{'Error':'failed to delete user'})
					}
				});
			}else{
				callback(400,{'Error':'User does not exist'});
			}
		});

			}else{
				callback(400,{'Error':'Invalid token'});
			}
		});
			} else{
		callback(400,{"Error":"Missing required field"});
	}
	
};



//User-get
handlers._users.get = (data,callback)=>{
	//check if the phone is valid
var phone = typeof(data.queryStringObject.phone)=='string'&&data.queryStringObject.phone.trim().length==10?data.queryStringObject.phone.trim():false;
var token = typeof(data.headers.token)=='string' && data.headers.token.trim().length?data.headers.token.trim():false;
//error if phone is not valid
if(phone && token){
	lib.verifyToken(phone,token,(tokenIsValid)=>{
		if(tokenIsValid){
			//reading the user from the file system
	_data.read('users',phone,(err,userData)=>{
		if(!err && userData){
			// removing the hash password from the userData
			delete userData.hashedPassword;
			callback(200,data);
		}else{
			callback(404,{'Error':'Could not find user'});
		}
	});
		}else{
			callback(400,{'Error':'Invalid token'});
		}
	});
}else{
	callback(400,{'Error':'Could not validate phone'});
}
}
//User-put
handlers._users.put = (data,callback)=>{
	//required data
	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ?data.payload.phone.trim():false;
	
	//optional data
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ?data.payload.firstName.trim():false;
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ?data.payload.lastName.trim():false;
			var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ?data.payload.password.trim():false;
	var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ?true:false;
	var token = typeof(data.headers.token)=='string' && data.headers.token.trim().length?data.headers.token.trim():false;


//Error if phone not valid
if(phone && token){
//verify token provided by the user
lib.verifyToken(phone,token,(tokenIsValid)=>{
	if(tokenIsValid){
		//checking if there is any field to update
if(firstName || lastName || password ){
		//lookup the user
	_data.read('users',phone,(err,userData)=>{
		console.log(phone);
		if(!err && userData){
			//updating the fields to be updated
			if(firstName){
				userData.firstName = firstName;
			};
			if(lastName){
				userData.lastName = lastName;
			};
			if(password){
				userData.hashedPassword = helpers.hash(password);
			};		
			//saving the new data into the fileSystem
			_data.update('users',phone,userData,(err)=>{
				if(!err){
					callback(200);
				}else{
					callback(500,{'Error':'failed to update the user'});
				}
			});
		}else{
			callback(500,{'Error':"could not read the user to update"});
		}
	});
}else{
	callback(400,{'Error':'Missing fields to update'});
}

	}else{
		callback(400,{'Error':'Invalid token'})
	}
});
}else{
	callback(400,{"Error":"Missing required field"});
}
	
};

handlers.tokens = (data,callback)=>{
	var acceptedMethods = ['post','put','delete','get'];
	if(acceptedMethods.indexOf(data.method)>-1){
		handlers._tokens[data.method](data,callback);
	}else{
		callback(400,{'Error':'Method not accepted'})
	}
}

//A container for the checks private handlers
handlers._tokens = {};



//post token subhandler
handlers._tokens.post = (data,callback)=>{
	//required data
	var phone = typeof(data.payload.phone)=='string' && data.payload.phone.trim().length==10?data.payload.phone.trim():false;
	var password = typeof(data.payload.password)=='string' && data.payload.password.trim().length>0?data.payload.password.trim():false;
//error if the required data id not provided

if(password && phone ){
		//lookup thet user
	_data.read('users',phone,(err,userData)=>{
		//continue if no error and there is userData
		if(!err && userData){
			//continue if the hash of the password provided matches with the hash of the hashedPassword stored if ht fileSystem
			var hashedPassword = helpers.hash(password);
			
			if(hashedPassword==userData.hashedPassword){
				//constructing the token
				var tokenId = helpers.createRandomString(20);
				tokenData = {
					'phone':phone,
					'id':tokenId,
					expires: Date.now() +(1000*60*60)
				}
				//adding token to the fileSystem
				
				_data.create('tokens',tokenId,tokenData,(err)=>{	
					if(!err){
						callback(200);
					}else{
						callback(500,{'Error':'Could not create token'});
					}		
				});
				
			}else{
				callback(400,{'Error':'password and user did not match'});
			}
		}else{
			callback(400,{'Error':'User does not exist'});
		}
	});
}else{
	callback(400,{'Error':'Missing required field'});
}
};


//get token subhandler
handlers._tokens.get = (data,callback)=>{
	var id = typeof(data.queryStringObject.id)=='string' && data.queryStringObject.id.trim().length ==20?data.queryStringObject.id.trim():false;
	
//validating the validating
if(id){
	//lookup token by id
	_data.read('tokens',id,(err,tokenData)=>{
		//continue if the re is data and no error
		if(!err && tokenData){
			callback(200,tokenData);
		}else{
			callback(404,{'Error':'Token not found'});
		}
	});
	
}else{
	callback(400,{'Error':'Missing required field'});
}
};


//put token subhandler
handlers._tokens.put = (data,callback)=>{
	var id = typeof(data.queryStringObject.id)=='string' && data.queryStringObject.id.trim().length == 20?data.queryStringObject.id.trim():false;
	
	//validate id
	if(id){
		//lookup the id
		_data.read('tokens',id,(err,tokenData)=>{
			//continue if no error and the there is data
			if(!err && tokenData){
				//check if token is still valid - not expired
				if(tokenData.expires>Date.now()){
					var newExpiry = Date.now() + 1000*60*60;
					//extending expiry by and hour
					tokenData.expires = newExpiry;
					//writing updates to disc
					_data.update('tokens',id,tokenData,(err)=>{
						if(!err){
							callback(200);
						}else{
							callback(500,{'Error':'Could not update token'});
						}
					});
					
				}else{
					callback(400,{'Error':'token has already expired'});
				}
			}else{
				callback(400,{'Error':'Token not found'})
			}
		});
	}else{
		callback(400,{'Error':'Missing required fields'});
	}	
};


//delete token subHandlers

handlers._tokens.delete = (data,callback)=>{
var id = typeof(data.queryStringObject.id)=='string' && data.queryStringObject.id.trim().length == 20?data.queryStringObject.id.trim():false;
	
	//validate id
	if(id){
	//veryfying if the token exists by reading it
	_data.read('tokens',id,(err,tokenData)=>{
		if(!err && tokenData){
			//delete the token
		_data.delete('tokens',id,(err)=>{
			if(!err){
				callback(200);
			}else{
				callback(500,{'Error':'failed to delete the token'})
			}
		});
		}else{
			callback(404)
		};
	});
			
}else{
	callback(400,{'Error':'Missing required fields'});
}

};



handlers.verifyToken = (phone,tokenId,callback)=>{
	//lookup the token
	_data.read('tokens',tokenId,(err,tokenData)=>{
		if(!err && tokenData){
			//check if the token has not expired
			if(tokenData.expires>Date.now() && tokenData.phone == phone){
				callback(true);
			}else{
				callback(false);
			}
		}else{
			callback(false);
		}
	});
};

handlers.checks = (data,callback)=>{
	var acceptedMethods=['post','get','put','delete'];
	if(acceptedMethods.indexOf(data.method)>-1){
		handlers._checks[data.method](data,callback);
	}else{
		callback(400,{'Error':'Method not allowed'});
	}	
};


//container of the checks subHandlers
handlers._checks = {};


//checks post
// required data: successCodes url protocol timeoutSeconds method phone
handlers._checks.post = (data,callback)=>{
	
	//required data
	var successCodes = typeof(data.payload.successCodes)=='object' && data.payload.successCodes instanceof Array && data.payload.successCodes !== 'null'?data.payload.successCodes:false;
	var protocol = typeof(data.payload.protocol) =='string' &&   ['https','http'].indexOf(data.payload.protocol)>-1?data.payload.protocol:false;
	var timeoutSeconds = typeof(data.payload.timeoutSeconds)=='number'&& data.payload.timeoutSeconds>0 && data.payload.timeoutSeconds<=5 && data.payload.timeoutSeconds%1==0?data.payload.timeoutSeconds:false;
	var method = typeof(data.payload.method)=='string' && data.payload.method.trim().length>0 ?data.payload.method.trim().toLowerCase():false;
	var url = typeof(data.payload.url)=='string' && data.payload.url.trim().length>0 ?data.payload.url.trim():false;
	var token = typeof(data.headers.token)=='string' && data.headers.token.trim().length == 20 ?data.headers.token.trim():false;
	//continue if the required data is given
	
	if(
	 token&&
	 protocol&&
	 timeoutSeconds&&
	 url&&
	 method&&
	 successCodes
	 ){
		//lookup the token 
		_data.read('tokens',token,(err,tokenData)=>{
			if(!err && tokenData){
				var userPhone = tokenData.phone;
						
	//continue if token is valid
	handlers.verifyToken(userPhone,token,(tokenIsValid)=>{
		if(tokenIsValid){
			//buiding the check object to be saved
			var checkId = helpers.createRandomString(20);
			var checkData = {
				'id':checkId,
				'userPhone':userPhone,
				'protocol': protocol,
				'method':method,
				'successCodes':successCodes,
				'url':url
			}
					_data.read('users',userPhone,(err,userData)=>{
						if(!err && userData ){
							//checking whether the user has once created a check before
							 var userChecks = userData.checks?userData.checks:[];
							 //adding the new check to the users checks array if currrent user checks don't exceed maxChecks
							 if(userChecks.length<config.maxChecks){
							 	//save new check into the fileSystem
			_data.create('checks',checkId,checkData,(err)=>{
				if(!err ){
					//attach check to the owner
						 userChecks.push(checkId);
						 userData.checks = userChecks;
							 //updating he users data
							 _data.update('users',userPhone,userData,(err)=>{
							 	if(!err){
							 		callback(200);
							 	}else{
							 		callback(500,{'Error':'failed to update user info with new check'})
							 	}
							 });
			}else{
					callback(500,{'Error':'could not create check'});
				    }			
					});
					}else{
						callback(405,{'Error':'maxchecks exceeded'});
					};
				}else{
							callback(400,{'Error':'Could not find the owner of this check'})
						}
			});
					}else{
			callback(400,{'Error':'Invalid token supplied'})
		}
	});
			}else{
				callback(404,{'Error':"token not found"});
			}
		});
	}else{
		callback(400,{'Error':'missing required fields'});
	}
	
	
	
	};
	


//checks delete
handlers._checks.delete = (data,callback)=>{
	//required data 
	var id = typeof(data.queryStringObject.id)=='string' && data.queryStringObject.id.trim().length ==20?data.queryStringObject.id.trim():false;
	
	//continue if the required field is supplied
	if(id){
		//get the token from the headers and validate
		var token = typeof(data.headers.token)=='string' && data.headers.token.trim().length ==20?data.headers.token.trim():false;
		
		if(token){
			//read the token from the fileSystem
			_data.read('tokens',token,(err,tokenData)=>{
				if(!err && tokenData){
					var userPhone = tokenData.phone;
					//validate the token
					handlers.verifyToken(userPhone,token,(tokenIsValid)=>{
						if(tokenIsValid){
							//going ahead to delete the check
							_data.delete('checks',id,(err)=>{
								if(!err){
									//going head to remove that check from user's check Array
									_data.read('users',userPhone,(err,userData)=>{
										if(!err && userData){
											//get the checks array from  the user data;
											var userChecks = typeof(userData.checks)=='object'?userData.checks:[];
											var checkIndex = userChecks.indexOf(id);
											userChecks.splice(checkIndex,1);
											userData.checks = userChecks;
											//update the user with the user data
											_data.update('users',userPhone,userData,(err)=>{
												if(!err){
													//deletion completed
													callback(200);
												}else{
													callback(500,{'Error':'Failed to update user info'});		
												}
											});
										}else{
											callback(404,{'Error':'Owner of the check nor found'});
										}
									});
								}else{
									callback(500,{'Error':'Failed to delete check'});
								}
							});
						}else{
							callback(400,{'Error':'Invalid token supplied'});
						}
					});
				}else{
					callback(404,{'Error':'Token not found'});
				}
			});
		}else{
			callback(403,{'Error':'Missing required token in the headers'})
		}
		
	}else{
		callback(400,{'Error':'Missing required field'});
	}
};
//checks put
handlers._checks.put = (data,callback)=>{
	// required data
	var id = typeof(data.payload.id)=='string' && data.payload.id.trim().length==20?data.payload.id.trim():false;
	
		//get the token from the headers and validate
		var token = typeof(data.headers.token)=='string' && data.headers.token.trim().length ==20?data.headers.token.trim():false;
		
		//optional data
		var successCodes = typeof(data.payload.successCodes)=='object' && data.payload.successCodes instanceof Array && data.payload.successCodes !== 'null'?data.payload.successCodes:false;
	var protocol = typeof(data.payload.protocol) =='string' &&   ['https','http'].indexOf(data.payload.protocol)>-1?data.payload.protocol:false;
	var timeoutSeconds = typeof(data.payload.timeoutSeconds)=='number'&& data.payload.timeoutSeconds>0 && data.payload.timeoutSeconds<=5 && data.payload.timeoutSeconds%1==0?data.payload.timeoutSeconds:false;
	var method = typeof(data.payload.method)=='string' && data.payload.method.trim().length>0 ?data.payload.method.trim().toLowerCase():false;
	var url = typeof(data.payload.url)=='string' && data.payload.url.trim().length>0 ?data.payload.url.trim():false;


	if(id){
	//check whether there is any field to update supplied
	if(
	successCodes ||
	method ||
	url ||
	timeoutSeconds ||
	protocol
	){
		if(token){
			//read the token from the fileSystem
			_data.read('tokens',token,(err,tokenData)=>{
				if(!err && tokenData){
					var userPhone = tokenData.phone;
					//validate the token
					handlers.verifyToken(userPhone,token,(tokenIsValid)=>{
						if(tokenIsValid){
								//reading token from the fileSystem
								_data.read('checks',id,(err,checkData)=>{
									if(!err && checkData ){
										//updating the fields 
										 if( successCodes){
										 	checkData.successCodes = successCodes
										 }
										 if( url){
										 	checkData.url = url
										 }
										 if(protocol){
										 	checkData.protocol = protocol
										 }
										 if(method){
										 	checkData.method = method
										 }
										 if(timeoutSeconds){
										 	checkData.timeoutSeconds = timeoutSeconds
									 }


										//update the checkData in the FS
										_data.update('checks',id,checkData,(err)=>{
											if(!err){
												callback(200);
											}else{
												callback(500,{'Error':'Failed to upate check info'});
											}
										});									}else{
										callback(404,{'Error':'Check to found'});
									}
								});								
						}else{
							callback(400,{'Error':'Invalid token supplied'});
						}
					});
				}else{
					callback(404,{'Error':'Token not found'});
				}
			});
		}else{
			callback(403,{'Error':'Missing required token in the headers'})
		}

	}	else{
		callback(400,{'Error':'No field to update'});
	};
			}else{
		callback(400,{'Error':'Missing required fields'});
	};
	
	
};
//checks get method
handlers._checks.get = (data,callback)=>{
		//required data 
	var id = typeof(data.queryStringObject.id)=='string' && data.queryStringObject.id.trim().length ==20?data.queryStringObject.id.trim():false;
	
	//continue if the required field is supplied
	if(id){
		//get the token from the headers and validate
		var token = typeof(data.headers.token)=='string' && data.headers.token.trim().length ==20?data.headers.token.trim():false;
		
		if(token){
			//read the token from the fileSystem
			_data.read('tokens',token,(err,tokenData)=>{
				if(!err && tokenData){
					var userPhone = tokenData.phone;
					//validate the token
					handlers.verifyToken(userPhone,token,(tokenIsValid)=>{
						if(tokenIsValid){
								//reading token from the fileSystem
								_data.read('checks',id,(err,checkData)=>{
									if(!err && checkData ){
										 callback(200,checkData);
									}else{
										callback(404,{'Error':'Check to found'});
									}
								});								
						}else{
							callback(400,{'Error':'Invalid token supplied'});
						}
					});
				}else{
					callback(404,{'Error':'Token not found'});
				}
			});
		}else{
			callback(403,{'Error':'Missing required token in the headers'})
		}
		
	}else{
		callback(400,{'Error':'Missing required field'});
	}
};








//export the handler module
module.exports = handlers;