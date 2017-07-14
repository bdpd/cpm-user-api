// Express variables
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 8080;

// AWS variables
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({'region': 'us-east-1',apiVersion: "2012-08-10"});

app.get('/api/users/:id', function (req, res) {
	var userFromDB = getUser(req.params.id);
	res.send(userFromDB);
})


app.use(bodyParser.json())

app.post('/api/users', function(req, res) {
    var userDetails = {
    	userName: req.body.username,
    	userPass: req.body.password,
    	userEmail: req.body.email
    }
    postUser(userDetails);

    res.send(userDetails.userName + ' ' + userDetails.userPass + ' ' + userDetails.userEmail);
})

app.listen(port, function () {
	console.log('Server started! At http://localhost:' + port);
});

function getUser(userName){
	if (!userName) { 
		console.log('No user name provided');
 		return {};
		}
 	var params = {
		Key: {
			"Username": {
		 		S: userName
			}
		}, 
		TableName: "Users"
	};
	dynamodb.getItem(params, function(err, data) {
	   if (err) console.log(err, err.stack); 
	   else {
	   		console.log(user(data));
	   		return user(data);
	   }
	});
}

function user(data) {
  if (!data || !data.Item) {
    return {};
  }
  const item = data.Item;
  const user = {
   "Username": item.Username.S,
   "Password": item.Password.S,
   "Email": item.Email.S
  };
  return story;
}



function postUser(userDetails) {
	if (!userDetails) { 
		console.log('No user details provided');
		return {};
	}
	var params = {
		Item: {
			"Username": {
		 		S: userDetails.userName
			}, 
			"Password": {
		 		S: userDetails.userPass
			}, 
			"Email": {
		 		S: userDetails.userEmail
			}
		}, 
		ReturnConsumedCapacity: "TOTAL", 
		TableName: "Users"
	};
	dynamodb.putItem(params, function(err, data) {
	if (err) console.log(err, err.stack);
	else     console.log(data); 
	});
}
