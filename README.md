# Website state monitoring application in plain JAVASCRIPT and NODEJS 
this is an uptime monitor JSON RESTful api for an Application that calculate the state of a website considering its response Code every time the url is request.
## Features
Accounts \n checks \n workers \n notifications  \n

### Accounts
users can siginup login and logout

### checks
users can create checks of the urls they want to be monitored by entering
`url` \n
`timeoutSeconds` \n
`Protocol` \n
`successCodes` \n

### workers
are background  processes that actualy perfom the checks and notify user via text if the state of the site changes

### Notifications  with TWILIO
using TWILIO api to text the user every a website's state changes whether it goes up or down
