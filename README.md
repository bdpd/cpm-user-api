# User management API 

# Add user 
 - curl -H "Content-Type: application/json"  -X POST -d '{ "username": "username", "password": "password", "email": "mail@email.com" }' http://localhost:3000/api/users

# Get user 
 - curl http://localhost:3000/api/users/:username
 - after user get is submitted the result is cached in a redis cluster for 60 seconds an any subsequent requests are served from there

# Delete user
- curl -X DELETE http://localhost:3000/api/users/:username
