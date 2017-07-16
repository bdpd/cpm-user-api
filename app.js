// Express variables
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 3000;
const redis = require('redis');
const REDIS_PORT = 6379;
const redis_server = process.env.REDIS_SERVER || localhost;
const awsRegion = process.env.AWS_REGION || 'us-east-1';
const client = redis.createClient(REDIS_PORT,redis_server);
const dynamoTable = process.env.DYNAMODB_TABLE || "users";

// AWS variables
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({'region': awsRegion, apiVersion: "2012-08-10"});

client.on('error', function (err) {
    console.log('error event - ' + client.host + ':' + client.port + ' - ' + err);
});

app.get('/api/users/:id', cache, function (req, res) {
        getUser(req.params.id).then(function(data) {
                res.send(data);
        })
})

app.delete('/api/users/:id', function (req, res) {
        deleteUser(req.params.id);
        res.send('User deleted');
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

// Function definitions

function getUser(userName) {
        return new Promise(function(res, rej) {
                if (!userName) {
                        console.log('No user name provided');
                        rej({});
                }
                const params = {
                        Key: {
                                "Username": {
                                        S: userName
                                }
                        },
                        TableName: dynamoTable
                };
                dynamodb.getItem(params, function(err, data) {
                        if (err) rej(err, err.stack);
                        else {
                                var userData = user(data);
                                client.setex(userData.Username.toString(), 60, JSON.stringify(userData))
                                console.log(userData);
                                res(userData);
                        }
                });
        })
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
  return user;
}

function cache(req, res, next) {
    const id = req.params.id;
    console.log(req.params);
    client.get(id, function (err, data) {
        console.log(id+'this is data' + data);
        if (data != null) {
            console.log('Hit from the cache: ' + data);
            res.send(data);
        } else {
                console.log(err);
            next();
        }
    });
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
                TableName: dynamoTable
        };
        dynamodb.putItem(params, function(err, data) {
        if (err) console.log(err, err.stack);
        else     console.log(data);
        });
}

function deleteUser(username) {
        var params = {
                Key: {
                        "Username": {
                                S: username
                        }
                },
                TableName: dynamoTable
                };
        dynamodb.deleteItem(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);
        });
}

