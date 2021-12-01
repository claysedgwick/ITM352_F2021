var fs = require('fs');
var express = require('express');
var app = express();
var myParser = require("body-parser");
var filename = './user_data.json';
var queryString = require('query-string');

app.use(myParser.urlencoded({ extended: true }));

if (fs.existsSync(filename)) {
    data = fs.readFileSync(filename, 'utf-8');

    user_data = JSON.parse(data);
    console.log("User_data = ", user_data);

    fileStats = fs.statSync(filename);
    console.log("File " + filename + " has " + fileStats.size + " characters.");
}
else {
    console.log("Enter the correct file name homie.");
}

app.get("/login", function (request, response) {
    // Give a simple login form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

 app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    console.log('Got a POST to login');
    let POST = request.body;

    user_name = POST["username"];
    user_pass = POST["password"];
    console.log("User name: " + user_name + "| Password: " + user_pass);

    if (user_data[user_name] != undefined) {
        if (user_data[user_name].password == user_pass) {
            // Good login
            response.send("Good login dude");
        }
        else {
            // Bad login, redirect
            response.send("Bad password home slice");
        }
    }
    else {
        response.send("Bad user name homie");
    }
});

app.listen(8080, () => console.log(`listening on port 8080`));