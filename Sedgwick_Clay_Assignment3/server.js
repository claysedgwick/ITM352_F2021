// Used code from MVC Server folder to create this server -- adjusted to meet the needs of my website
// Require appropriate modules and load the necessary JSON files for products and login information
var express = require('express');
var myParser = require("body-parser");
const fs = require('fs');
var filename = "./user_data.json";
var products = require("./products.json");
var queryString = require("query-string");
var session = require('express-session');
const { request } = require('http');
var cookieParser = require('cookie-parser');

var app = express();
var errors = {}; // keep errors on server to share with registration page
products.forEach((prod, i) => { prod.total_sold = 0 });

app.use(express.urlencoded({extended:true}));
app.use(myParser.urlencoded({ extended: true }));
app.use(express.static('./static'));
app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));
app.use(cookieParser());

var cartItemNumber = 0;
var productIDNumber = 0;
theme = "style.css";

// Used from Lab 14
// Check if a valid file name to read in from exists
// Either way, a message is printed to the console to print the results
if (fs.existsSync(filename)) {
    data = fs.readFileSync(filename, 'utf-8');
    user_data = JSON.parse(data);
    fileStats = fs.statSync(filename);
    console.log("File " + filename + " has been properly loaded containing " + fileStats.size + " characters");
}
else {
    console.log("Please enter a correct filename.");
}

// Add the isNonNegativeInteger function to check for valid quantities on the store page
function isNonNegativeInteger(inputString, returnErrors = false) {
    // Validate that an input value is a non-negative integer
    // @inputString - input string
    // @returnErrors - how the function returns: true mean return an array, false a boolean
    errors = []; // assume no errors at first
    if (Number(inputString) != inputString) {
        errors.push('Not a number!'); // Check if string is a number value
    }
    else {
        if (inputString < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(inputString) != inputString) errors.push('Not an integer!'); // Check that it is an integer
        if (products[inputString].quantityAvailable < inputString) errors.push('<font color="red">Not enough in stock!</font>'); // Check if enough item stock exists
    }
    return returnErrors ? errors : (errors.length == 0);
}

// Handles login page request displaying a login form. This code was used from Lab14
app.get("/login", function (request, response) {
    let params = new URLSearchParams(request.query);

    // Give a simple login form
    var contents = fs.readFileSync('./views/login.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    // Function to display the login page utilized in login.template
    function display_login() {
        str = `
            <body>
            <form action="?${params.toString()}" method="POST">
            <input type="text" name="username" size="40" placeholder="enter username" >
            ${(typeof errors['invalid_username'] != 'undefined') ? '<br>' + errors['invalid_username'] : ''}
            <br>
            <br>
            <input type="password" name="password" size="40" placeholder="enter password">
            ${(typeof errors['invalid_password'] != 'undefined') ? '<br>' + errors['invalid_password'] : ''}
            <br>
            <br>
            <input class="homepageButton" type="submit" value="Submit" id="submit">
            <br>
            New user? Register Now!
            <a href="./register?${params.toString()}">
                <button class="homepageButton" type="button"><b>Register</b></button>
            </a>
            </form>
            </body>
        `;
        return str;
    }
});

// Post for login information that is entered utilizing code from Lab14
// If a user enters a correct username (not case sensitive) and password (case sensitive), they are redirected to the store page
app.post("/login", function (request, response) {
    let page = request.cookies['lastPage'];
    let params = new URLSearchParams(request.query);
    username = request.body.username.toLowerCase();


    // Process login form POST and redirect to logged in page if ok, back to login page if not
    console.log("Got a POST to login");

    // Grabbing names from forms to use in POST array
    // Username is set to lowercase in order to ignore case for username entries
    // Passwords are cass-sensitive so this is not applied for user_pass
    POST = request.body;
    user_name = POST["username"].toLowerCase();
    user_pass = POST["password"];
    let name = user_data[user_name].firstName;

    // Determine if correct login information has been entered
    if (user_data[user_name] != undefined) {
        if (user_data[user_name].password == user_pass) {
            // Good login
            console.log("User " + user_name + " logged in on " + Date() + " from the IP " + request.ip);
            request.session.isLogged = "yes";
            request.session.name = user_data[user_name].firstName;
            response.redirect('.' + page);
        }
        else {
            // Bad login, redirect
            console.log("Incorrect password entered by " + user_name);
            errors['invalid_password'] = `<br>Invalid password entered`;
            response.redirect('./login'+ "?" + params.toString());
        }
    }
    else {
        // Bad username
        console.log("Invalid username entered by " + user_name);
        errors['invalid_username'] = `<br>The username '${user_name}' is not a valid username`;
        response.redirect('./login'+ "?" + params.toString());
    }
});

// Utlized code from the Assignemtn 2 example in tandem with a function display_register to display registration page
app.get("/register", function (request, response) {
    let params = new URLSearchParams(request.query);

    // Give a simple register form
    var contents = fs.readFileSync('./views/register.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    // Function to display the registration page utilized in register.template
    function display_register() {
        // Intial setup for registration form
        str = `
            <body>
            <form action="?${params.toString()}" method="POST">
        `;
        // Sticky to keep username if registration fails
        if (request.query["name_err"] == undefined) {
            str += `
            <input type="text" name="username" size="40" placeholder="enter username" >
            <br>
            <br>
            `;
        }
        else {
            str += `
                <input type="text" name="username" size="40" value="${request.query['name_err']}" >
                ${(typeof errors['no_username'] != 'undefined') ? '<br>' + errors['no_username'] : ''}
                ${(typeof errors['username_taken'] != 'undefined') ? '<br>' + errors['username_taken'] : ''}
                <br>
                <br>
            `;
        }
        // Setup for password forms
        str += `
            <input type="firstName" name="firstName" size="40" placeholder="enter first name"><br>
            <br>
            <input type="lastName" name="lastName" size="40" placeholder="enter last name"><br>
            <br>
            <input type="password" name="password" size="40" placeholder="enter password"><br>
            <br>
            <input type="password" name="repeat_password" size="40" placeholder="enter password again">
            ${(typeof errors['password_mismatch'] != 'undefined') ? '<br>' + errors['password_mismatch'] : ''}
            ${(typeof errors['password_length_error'] != 'undefined') ? '<br>' + errors['password_length_error'] : ''}
            ${(typeof errors['password_alphanumeric'] != 'undefined') ? '<br>' + errors['password_alphanumeric'] : ''}
            <br>
            <br>
        `;
        // Sticky to keep email if registration fails
        if (request.query["name_err"] == undefined) {
            str += `
                <input type="email" name="email" size="40" placeholder="enter email"><br>
                <br>
                <br>
            `;
        }
        else {
            str += `
                <input type="email" name="email" size="40" value="${request.query['email_err']}"><br>
                <br>
                <br>
            `;
        }
        // End of form for registration page
        str += `
            <input class="homepageButton" type="submit" value="Register" id="submit">
            </form>
            </body>
        `;
        // reset errors object for new registration attempts
        errors = {};
        return str;
    }
});

app.post("/register", function (request, response) {
    let params = new URLSearchParams(request.query);

    // process a simple register form
    username = request.body.username.toLowerCase();
    firstName = request.body.firstName;
    lastname = request.body.lastName;
    email = request.body.email;

    // check is username taken
    if (typeof user_data[username] != 'undefined') {
        errors['username_taken'] = `<br>Hey! ${username} is already registered!`;
    }
    // check if usnername field is blank
    if (request.body.username == '') {
        errors['no_username'] = `<br>You need to select a username`;
    }
    // check if password matches repeat password
    if (request.body.password != request.body.repeat_password) {
        errors['password_mismatch'] = `<br>Password and repeat password do not match`;
    }
    // check if password is between 4 to 10 characters long
    if (request.body.password.length < 4 || request.body.password.length > 10) {
        errors['password_length_error'] = `<br>Password must be between 4 and 10 characters long`;
    }
    // check if password only contains alphanumeric characters
    let pass_string = request.body.password;
    let pass_array = pass_string.split('');
    for (i in pass_array) {
        if (pass_array[i] < '0' || pass_array[i] > 'z') {
            errors['password_alphanumeric'] = `<br>Password must only contain letters or numbers`;
            break;
        }
    }
    if (Object.keys(errors).length == 0) {
        user_data[username] = {};
        user_data[username].firstName = request.body.firstName;
        user_data[username].lastName = request.body.lastName;
        user_data[username].password = request.body.password;
        user_data[username].email = request.body.email;
        fs.writeFileSync(filename, JSON.stringify(user_data));
        console.log("Saved: " + user_data);
        response.redirect("./login"+ "?firstName=" + firstName + "&" + params.toString());
    } else {
        params += "&name_err=" + username + "&email_err=" + email;
        response.redirect("./register" + "?"+ params.toString());
    }
});

// Process the invoice from the entered quantities on the store page
// Checks for valid quantities and if enough quantity is available
// Invalid quantities are not added to inovice and message is displayed if not enough inventory exists
// display_inovice_table_rows adds orders line-by-line to a string that is printed in invoice.template
app.get("/process_invoice", function (request, response, next) {
    // Logs to console the IP of purchase being made as well as the request of which items and the quantity requested
    console.log(Date.now() + ': Purchase made from ip ' + request.ip + ' data: ' + JSON.stringify(POST));
    params = request.query['firstName'];

    var contents = fs.readFileSync('./views/invoice.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_invoice_table_rows() {
        let name = '';
        if (request.session.name == undefined) {
            name = '';
        }
        else {
            name = request.session.name;
        }
        subtotal = 0;
        str = '';
        str += (`<div class="welcome">Thank you for your order today, <b>${name}</b>! Here's the delicious that are on the way:</div><br>`);

        for (i = 1; i <= productIDNumber; i++) {
            for (k = 0; k < products.length; k++) {
                if (products[k].id_number == request.cookies["id_ordered" + i]) {
                    id = request.cookies["id_ordered" + i];
                    quant = request.cookies["quantity_ordered" + i];
                    if (quant > 0) {
                        if ((parseInt(quant) != quant)) {
                            continue;
                        }
                        // product row
                        if (quant > products[k].quantity_available) {
                            str += (`
                            <tr>
                                <td align="center" width="43%">Sorry, you wanted ${quant} ${products[k].name} but we only have ${products[k].quantity_available} available!</td>
                                <td align="center" width="11%">-</td>
                                <td align="center" width="13%">-</td>
                                <td align="center" width="54%">-</td>
                            </tr>
                            `)
                        }
                        // If there is enough stock to meet the order, this row is displayed and computes extended price
                        // The quantity ordered is then removed from the quantity available.
                        else {
                            extended_price = quant * products[k].price
                            subtotal += extended_price;
                            str += (`
                            <tr>
                                <td width="43%">${products[k].name}</td>
                                <td align="center" width="11%">${quant}</td>
                                <td width="13%">\$${products[k].price.toFixed(2)}</td>
                                <td width="54%">\$${extended_price.toFixed(2)}</td>
                            </tr>
                            `);
                            products[k].quantity_available -= quant;
                            products[k].total_sold += Number(quant);
                            response.cookie("quantity_ordered" + i, 0, {maxAge: 0});
                        }
                    }
                }
            }
        }
        // Compute tax
        tax_rate = 0.0575;
        tax = tax_rate * subtotal;

        // Compute shipping
        if (subtotal == 0) {
            shipping = 0;
        }
        else if (subtotal <= 50) {
            shipping = 2;
        }
        else if (subtotal <= 100) {
            shipping = 5;
        }
        else {
            shipping = 0.05 * subtotal; // 5% of subtotal
        }

        // Compute grand total
        total = subtotal + tax + shipping;

        // Redirct to store page if the user tries to submit with 0 quantity for all items
        if (total == 0) {
            response.redirect("./lightbeer");
        }
        return str;
    }
});

// Handles requests to the store page (from the homepage or invoice redirct)
// Reads in display_prodcuts.template calling on the display_products function
// Function iterates through each product in products.json to create a module for the item
// Function displays product name, image, description, rating, price, and quantities available/sold
app.get("/lightbeer", function (request, response) {
    response.cookie("lastPage", "/lightbeer");
    var contents = fs.readFileSync('./views/item_page.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_products() {
        let name = '';
        if (request.session.name == undefined) {
            name = '';
        }
        else {
            name = request.session.name;
        }
        str = (`<br><div class="welcome">Hey<b>${" " + name}</b>! Let's buy some beer!</div><br><div class="products">`);
        for (i = 0; i < products.length; i++) {
            var beerType = "lightbeer";
            if (products[i].type == beerType) {
                // Assign rating image address based off of rating attribute in product_data.js 
                if (products[i].rating >= 4.5) {
                    ratingImage = "images/beer5.png";
                }
                else if (products[i].rating >= 3.5) {
                    ratingImage = "images/beer4.png";
                }
                else if (products[i].rating >= 2.5) {
                    ratingImage = "images/beer3.png";
                }
                else if (products[i].rating >= 1.5) {
                    ratingImage = "images/beer2.png";
                }
                else if (products[i].rating >= 0.5) {
                    ratingImage = "images/beer4.png";
                }
                else {
                    ratingImage = "images/beer0.png";
                }
                str += `
                <FORM action="/itemsadded" method="GET">
                    <input type="hidden" name="id" value ="${products[i].id_number}">
                    <section class="item">
                    <h2>${products[i].name}</h2>
                        <p>$${products[i].price.toFixed(2)}</p>
                        <img class="beerPicture" src="${products[i].image}" height="200px">
                        <a href="${products[i].beer_link}">
                            <p><img class="rating" src="${ratingImage}" width="120px"></p>
                        </a>
                        <p>${products[i].description}</p>
                        <label for="quantity" id="quantity${i}_label"}">Quantity</label>
                        <input type="text" placeholder="0" name="quantity${i}" 
                        onkeyup="checkQuantityTextbox(this);">
                        <p>Total Available: ${products[i].quantity_available}</p>
                        <p>Total Sold: ${products[i].total_sold}</p>
                        <input class="homepageButton" type="submit" value="Add to Cart" name="add">
                    </section>
                </FORM>
                `;
            }
        }
        str += '</div>';
        return str;
    }
});

app.get("/darkbeer", function (request, response) {
    response.cookie("lastPage", "/darkbeer");
    var contents = fs.readFileSync('./views/item_page.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_products() {
        let name = '';
        if (request.session.name == undefined) {
            name = '';
        }
        else {
            name = request.session.name;
        }
        str = (`<br><div class="welcome">Hey<b>${" " + name}</b>! Let's buy some beer!</div><br><div class="products">`);
        for (i = 0; i < products.length; i++) {
            var beerType = "darkbeer";
            if (products[i].type == beerType) {
                // Assign rating image address based off of rating attribute in product_data.js 
                if (products[i].rating >= 4.5) {
                    ratingImage = "images/beer5.png";
                }
                else if (products[i].rating >= 3.5) {
                    ratingImage = "images/beer4.png";
                }
                else if (products[i].rating >= 2.5) {
                    ratingImage = "images/beer3.png";
                }
                else if (products[i].rating >= 1.5) {
                    ratingImage = "images/beer2.png";
                }
                else if (products[i].rating >= 0.5) {
                    ratingImage = "images/beer4.png";
                }
                else {
                    ratingImage = "images/beer0.png";
                }
                str += `
                <FORM action="/itemsadded" method="GET">
                    <input type="hidden" name="id" value ="${products[i].id_number}">
                    <section class="item">
                    <h2>${products[i].name}</h2>
                        <p>$${products[i].price.toFixed(2)}</p>
                        <img class="beerPicture" src="${products[i].image}" height="200px">
                        <a href="${products[i].beer_link}">
                            <p><img class="rating" src="${ratingImage}" width="120px"></p>
                        </a>
                        <p>${products[i].description}</p>
                        <label for="quantity" id="quantity${i}_label"}">Quantity</label>
                        <input type="text" placeholder="0" name="quantity${i}" 
                        onkeyup="checkQuantityTextbox(this);">
                        <p>Total Available: ${products[i].quantity_available}</p>
                        <p>Total Sold: ${products[i].total_sold}</p>
                        <input class="homepageButton" type="submit" value="Add to Cart" name="add">
                    </section>
                </FORM>
                `;
            }
        }
        str += '</div>';
        return str;
    }
});

app.get("/ipas", function (request, response) {
    response.cookie("lastPage", "/ipas");
    var contents = fs.readFileSync('./views/item_page.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_products() {
        let name = '';
        if (request.session.name == undefined) {
            name = '';
        }
        else {
            name = request.session.name;
        }
        str = (`<br><div class="welcome">Hey<b>${" " + name}</b>! Let's buy some beer!</div><br><div class="products">`);
        for (i = 0; i < products.length; i++) {
            var beerType = "ipa";
            if (products[i].type == beerType) {
                // Assign rating image address based off of rating attribute in product_data.js 
                if (products[i].rating >= 4.5) {
                    ratingImage = "images/beer5.png";
                }
                else if (products[i].rating >= 3.5) {
                    ratingImage = "images/beer4.png";
                }
                else if (products[i].rating >= 2.5) {
                    ratingImage = "images/beer3.png";
                }
                else if (products[i].rating >= 1.5) {
                    ratingImage = "images/beer2.png";
                }
                else if (products[i].rating >= 0.5) {
                    ratingImage = "images/beer4.png";
                }
                else {
                    ratingImage = "images/beer0.png";
                }
                str += `
                <FORM action="/itemsadded" method="GET">
                    <input type="hidden" name="id" value ="${products[i].id_number}">
                    <section class="item">
                    <h2>${products[i].name}</h2>
                        <p>$${products[i].price.toFixed(2)}</p>
                        <img class="beerPicture" src="${products[i].image}" height="200px">
                        <a href="${products[i].beer_link}">
                            <p><img class="rating" src="${ratingImage}" width="120px"></p>
                        </a>
                        <p>${products[i].description}</p>
                        <label for="quantity" id="quantity${i}_label"}">Quantity</label>
                        <input type="text" placeholder="0" name="quantity${i}" 
                        onkeyup="checkQuantityTextbox(this);">
                        <p>Total Available: ${products[i].quantity_available}</p>
                        <p>Total Sold: ${products[i].total_sold}</p>
                        <input class="homepageButton" type="submit" value="Add to Cart" name="add">
                    </section>
                </FORM>
                `;
            }
        }
        str += '</div>';
        return str;
    }
});

app.get("/merch", function (request, response) {
    response.cookie("lastPage", "/merch");
    var contents = fs.readFileSync('./views/item_page.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_products() {
        let name = '';
        if (request.session.name == undefined) {
            name = '';
        }
        else {
            name = request.session.name;
        }
        str = (`<br><div class="welcome">Hey<b>${" " + name}</b>! Let's buy some beer!</div><br><div class="products">`);
        for (i = 0; i < products.length; i++) {
            var beerType = "merch";
            if (products[i].type == beerType) {
                // Assign rating image address based off of rating attribute in product_data.js 
                if (products[i].rating >= 4.5) {
                    ratingImage = "images/beer5.png";
                }
                else if (products[i].rating >= 3.5) {
                    ratingImage = "images/beer4.png";
                }
                else if (products[i].rating >= 2.5) {
                    ratingImage = "images/beer3.png";
                }
                else if (products[i].rating >= 1.5) {
                    ratingImage = "images/beer2.png";
                }
                else if (products[i].rating >= 0.5) {
                    ratingImage = "images/beer4.png";
                }
                else {
                    ratingImage = "images/beer0.png";
                }
                str += `
                <FORM action="/itemsadded" method="GET">
                    <input type="hidden" name="id" value ="${products[i].id_number}">
                    <section class="item">
                    <h2>${products[i].name}</h2>
                        <p>$${products[i].price.toFixed(2)}</p>
                        <img class="beerPicture" src="${products[i].image}" height="200px">
                        <a href="${products[i].beer_link}">
                            <p><img class="rating" src="${ratingImage}" width="120px"></p>
                        </a>
                        <p>${products[i].description}</p>
                        <label for="quantity" id="quantity${i}_label"}">Quantity</label>
                        <input type="text" placeholder="0" name="quantity${i}" 
                        onkeyup="checkQuantityTextbox(this);">
                        <p>Total Available: ${products[i].quantity_available}</p>
                        <p>Total Sold: ${products[i].total_sold}</p>
                        <input class="homepageButton" type="submit" value="Add to Cart" name="add">
                    </section>
                </FORM>
                `;
            }
        }
        str += '</div>';
        return str;
    }
});

app.get("/itemsadded", function (request, response) {
    response.cookie("lastPage", "/items_added");
    var contents = fs.readFileSync('./views/itemsadded.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_items_added() {
        let name = '';
        if (request.session.name == undefined) {
            name = '';
        }
        else {
            name = request.session.name;
        }
        str = '';
        str_add = '';
        let displayName = '';
        if (request.query['firstName'] != undefined) {
            displayName = request.query['firstName'];
        }
        str += (`<br><div class="welcome2">Thanks<b>${" " + name}</b>! The following has been added to your shopping cart:</div><br><div class="welcome">`);
        for (i = 0; i < products.length; i++) {
            if ((typeof request.query['quantity' + i] != 'undefined') && request.query['quantity' + i] > 0) {
                str_add += `${request.query['quantity' + i]} ${products[i].name}<br>`;
                cartItemNumber += parseInt(request.query['quantity' + i]);
                productIDNumber++;
                response.cookie("id_ordered" + productIDNumber, products[i].id_number);
                response.cookie("quantity_ordered" + productIDNumber, request.query['quantity' + i]);
            }
        }
        if (str_add == '') {
            str_add += `
            </div>
            <br>
            <div class="welcome">Uh oh! It looks like you entered an invalid quantity, please try again!</div>
            <br>
            <div class="navBar">
            <a href="./lightbeer">
                <button class="navButton" type="button"><b>STORE</b></button>
            </a>
            </div>
            `;
            return str + str_add;
        }
        else {
            str_add += `
            </div>
            <br>
            <div class="navBar">
            <a href="./cart">
                <button class="navButton" type="button"><b>GO TO CART</b></button>
            </a>
            </div>
            `;
            return str + str_add;
        }
        return str;
    }
});

app.get("/cart", function (request, response) {
    response.cookie("lastPage", "/cart");
    let loginCheck = request.session['isLogged'];
    var contents = fs.readFileSync('./views/cart.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_cart() {
        console.log(request.cookies['loggedIn']);
        let name = '';
        if (request.session.name == undefined) {
            name = '';
        }
        else {
            name = request.session.name;
        }
        str = '';
        str_add = '';
        let displayName = '';
        if (request.query['firstName'] != undefined) {
            displayName = request.query['firstName'];
        }
        str += (`<br><div class="welcome2">Hey<b>${" " + name}</b>! Here's what's in your shopping cart:</div><br>`);

        for (i = 1; i <= productIDNumber; i++) {
            for (k = 0; k < products.length; k++) {
                if (products[k].id_number == request.cookies["id_ordered" + i]) {
                    id = request.cookies["id_ordered" + i];
                    quant = request.cookies["quantity_ordered" + i];
                    str_add += `
                    <tr>
                    <td><img class="beerPicture" src="${products[k].image}" height="200px"></td>
                    <td>
                    <h2>${products[k].name}</h2><br>
                    <div class="welcome"><b>Quantity Desired: </b>${quant}</div><br>
                    <div class="welcome"><b>Price: </b>\$${products[k].price.toFixed(2)}</div>
                    </td>
                    </tr>
                    `;
                }
            }
        }
        if (str_add == '') {
            str_add += `
            <br>
            <div class="welcome">Uh oh! It looks like your shopping cart is empty. Add some items to checkout!</div>
            <br>
            <div class="navBar">
            <a href="./lightbeer">
                <button class="navButton" type="button"><b>STORE</b></button>
            </a>
            </div>
            `;
            return str + str_add;
        }
        else {
            if (loginCheck == undefined) {
                str_add += `
                <br>
                <div class="navBar">
                <a href="./login">
                    <button class="navButton" type="button"><b>CHECKOUT</b></button>
                </a></div>
                <div class="navBar">
                <a href="./lightbeer">
                    <button class="navButton" type="button"><b>STORE</b></button>
                </a>
                </div>
                `;
                return str + str_add;
            }
            else if (loginCheck.toString() == "yes") {
                str_add += `
                <br>
                <div class="navBar">
                <a href="./process_invoice">
                    <button class="navButton" type="button"><b>CHECKOUT</b></button>
                </a></div>
                <div class="navBar">
                <a href="./lightbeer">
                    <button class="navButton" type="button"><b>STORE</b></button>
                </a>
                </div>
                `;
                return str + str_add;
            }
            else {
                str_add += `
                <br>
                <div class="navBar">
                <a href="./login">
                    <button class="navButton" type="button"><b>CHECKOUT</b></button>
                </a>
                <a href="./lightbeer">
                    <button class="navButton" type="button"><b>STORE</b></button>
                </a>
                </div>
                `;
                return str + str_add;
            }
        }
    }
});

app.get("/thankyou", function (request, response) {
    response.cookie("lastPage", "/thankyou");
    var contents = fs.readFileSync('./views/thankyou.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_thanks() {
        str = '';
        str += (`<br><div class="welcome2">Thanks for your order! An email confirming your order will arrive shortly!</div><br><div class="welcome">`);
        
        return str;
    }
});

app.get("/about", function (request, response) {
    if (request.session.theme == undefined) {
        theme = "style.css";
    }
    else if (request.session.theme == "style2.css") {
        theme = "style2.css";
    }
    else {
        theme = "style.css";
    }
    response.cookie("lastPage", "/about");
    var contents = fs.readFileSync('./views/about.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_about() {
        str = '';
        str += (`
        <div class="homepageImage2">
        <img src="./images/about.jpg">
        </div>
        <br>
        <div class="cart">After a year of living abroad in Akita, Japan, Clay knew that he needed to share Japan's many delicious brews. Much like the US, Japan has a wide range of beers that are enjoyed daily by its citizens. By connecting with Japan's top distributors and working closely with some of Japan's finest microbreweries, Biiru International is about to offer a wide-range of craft and lights beers that can be delivered to your residence at the click of a button. We hope that you find a new beer that takes you to the heart of Japan!</div>
        <br>
        `);
        
        return str;
    }
});

app.get("/logout", function (request, response) {
    request.session.destroy();

    var contents = fs.readFileSync('./views/logout.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_logout() {
        str = '';
        str += (`<br><div class="welcome2">Successfully logged out, we'll see you next time!</div><br><div class="welcome">`);
        
        return str;
    }
});

app.get("/account", function (request, response) {
    response.cookie("lastPage", "/account");
    var contents = fs.readFileSync('./views/account.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_account() {
        str = '';
        str += (`
        <br>
        <div class="welcome">Welcome back, <b>${request.session.name}</b>! Would you like to switch to dark mode?</div>
        <br>
        <button onclick="${request.session.theme = "style2.css"}">Dark Mode ON</button>
        <button onclick="${request.session.theme = "style.css"}">Dark Mode OFF</button>
        `);
        
        return str;
    }
});

// Console log to show that the server is listening on port 8080
var listener = app.listen(8080, () => { console.log('server started listening on port ' + listener.address().port) });