var fs = require('fs');
var express = require('express');
var app = express();
var myParser = require("body-parser");
var filename = './user_data.json';
var queryString = require('query-string');
var cookieParser = require('cookie-parser');
var session = require('express-session');

app.use(cookieParser());

app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));

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

app.get("/", function (request, response) {
    if (request.session.page_views) {
        request.session.page_views++;
        response.send("Welcome back. This is visit number " + request.session.page_views);
    }
    else {
        request.session.page_views = 1;
        response.send("Welcome to this page for the first time!");
    }
});

app.get("/set_cookie", function (request, response) {
    my_name = "Clay Sedgwick";
    response.cookie("My Name", my_name, {maxAge: 8000}).send("Cookie set.");
});

app.get("/get_cookie", function (request, response) {
    my_cookie_name = request.cookies["My Name"];
    response.send("User " + my_cookie_name + " is recognized.");
});

app.get("/set_session", function (request, response) {
    response.send(`Welcome! Your session id is: ${request.session.id}`);
    next();
});

app.get("/use_session", function (request, response) {
    response.send("Your session id is: " + request.session.id);
    request.session.destroy();
});

app.get("/fav_color", function (request, response) {
    // Give a simple login form
    
    str = `
        <body>
        Login info: ${login_time} by ${my_cookie_name}
        <form action="fav_color" method="POST">
        <input type="text" name="color" size="40" placeholder="enter favorite color" ><br />
        <input type="submit" value="Submit" id="submit">
        </form>
        </body>
    `;
    response.send(str);
});

app.get("/fav_color", function (request, response) {
    // Give a simple login form
    
    str = `
        <body>
        <form action="fav_color" method="POST">
        <input type="text" name="color" size="40" placeholder="enter favorite color" ><br />
        <input type="submit" value="Submit" id="submit">
        </form>
        </body>
    `;
    response.send(str);
});

app.post("/fav_color", function (request, response) {
    var POST = request.body;
    request.session.fav_color = POST["color"];
    response.send("Favorite color is: " + request.session.fav_color);
});

app.get("/login", function (request, response) {
    // Give a simple login form
    if (typeof request.session['last_login'] != "undefined") {
        login_time = "'s last login was " + request.session['last_login'];
    }
    else {
        login_time = "First login";
    }
    my_cookie_name = request.cookies["username"];
    str = `
        <body>
        Login info: ${login_time} by ${my_cookie_name}
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
    POST = request.body;

    user_name = POST["username"];
    user_pass = POST["password"];
    user_email = POST["email"];

    if (user_data[user_name] != undefined) {
        console.log("User name: " + user_name + "| Password: " + user_pass);
        if (user_data[user_name].password == user_pass) {
            // Good login
            request.session['last_login'] = Date();
            // Three ways of displaying name
            response.cookie("username", user_name, {maxAge: 10*1000});
            request.session['username'] = user_name;
            response.send("Welcome, " + user_name + "!");
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

app.get("/register", function (request, response) {
    // Give a simple register form
    str = `
        <body>
        <form action="/register" method="POST">
        <input type="text" name="username" size="40" placeholder="enter username" ><br />
        <input type="password" name="password" size="40" placeholder="enter password"><br />
        <input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
        <input type="email" name="email" size="40" placeholder="enter email"><br />
        <input type="submit" value="Submit" id="submit">
        </form>
        </body>
    `;
    response.send(str);
});

app.post("/register", function (request, response) {
    // process a simple register form
    console.log('Got a POST to login');
    POST = request.body;

    user_name = POST["username"];
    user_pass = POST["password"];
    user_email = POST["email"];

    if (user_data[user_name] == undefined) {
        console.log("User name: " + user_name + "| Password: " + user_pass);
        if (user_data[user_name].password == user_pass) {
            // Good login
            response.redirect("./products_page.html");
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

app.use(express.static('./public'));

app.listen(8080, () => console.log(`listening on port 8080`));