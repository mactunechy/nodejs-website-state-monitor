/*
*Settings and Configurations of the project
*/

//dependencies
var path = require('path');





//environments

environments = {};


//staging environment 
environments.staging = {
	'envName':'staging',
	'httpPort':3300,
	'httpsPort':3301,
	'hashingSecret':'thisIsASecret', 
	'maxChecks':5
};


//production environment
environments.production = {
	'envName':'production',
	'httpPort':5000,
	'httpsPort':5001,
		'hashingSecret':'thisIsAnotherSecret',
		'maxChecks':5 
}

//getting the environment or default to staging
var givenEnvName = typeof(process.env.NODE_ENV) == 'string'?process.env.NODE_ENV:'staging';


//choosing a environment based of the provided environment envName


var ChosenEnv = typeof(environments[givenEnvName])!== 'undefined'?environments[givenEnvName]:environments.staging;


module.exports = ChosenEnv;