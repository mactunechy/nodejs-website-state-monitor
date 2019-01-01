/*
* Helpers for varieus tasks
*
*/

//Dependecies
var crypto = require('crypto');
var config  = require('./config');
var queryString = require('querystring');
var https = require('https');
// Declare the module container
var helpers = {};


 //helper for parsing a json string into an object
helpers.parseJson = str=>{
	if(typeof(str)=='string' && str.length>0){
		try{
		return JSON.parse(str);
	}catch(e){
		console.log(e,'failed to parse json');
		return {};
	}
	}else{
		return {};
	}	
}


//hashing method using sha256
helpers.hash = str=>{
	if(typeof(str)=='string' && str.length > 0){
		var hash = crypto.createHmac('sha256',config.hashingSecret).update(str).digest('hex');
		return hash;
	}else{
		return false;
	}
}


helpers.createRandomString = function(strLength){
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false;
  if(strLength){
    // Define all the possible characters that could go into a string
    var possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789';

    // Start the final string
    var str = '';
    for(i = 1; i <= strLength; i++) {
        // Get a random character from the possibleCharacters string
        var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length));
        // Append this character to the string
        str+=randomCharacter;
    }
    // Return the final string
    return str;
  } else {
    return false;
  }
};

//sending twilio sms method
helpers.sendSms = (phone,msg,callback)=>{
	//validate the input
	phone = typeof(phone)=='string' && phone.trim().length == 20?phone:false;
	msg = typeof(msg) == 'string' && msg.trim().length >0?msg:false;
	
	//building the stringPayload
	var payload = {
		'To':+1+phone,
		'From':config.twilio.fromPhone,
		'Body':msg
	}
	
	
	var requestDetails = {
		'method': 'POST',
		'protocol':'https'
		'hostname':'twilio.com',
		'path':`/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
		'auth':`${config.twilio.accountSid}:${	config.twilio.authToken}`,
		'headers' : {
        'Content-Type' : 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(stringPayload)
      }
	}
	
	var req = https.request(requestDetails,res=>{
		var statusCode = res.status;
		
		if(statusCode==200 || statusCode==201){
			
		}else{
			callback()
		}
		
		
	});
	
	
	
	
	
	
}






//export the module
module.exports = helpers;