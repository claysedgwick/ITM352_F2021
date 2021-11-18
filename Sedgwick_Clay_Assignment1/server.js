// Used code from MVC Server folder to create this server -- adjusted to meet the needs of my website
var express = require('express');
var myParser = require("body-parser");
var fs = require('fs');
var products = require("./products.json");

var app = express();

app.use(myParser.urlencoded({ extended: true }));

function isNonNegativeInteger(inputString, returnErrors = false) {
    // Validate that an input value is a non-negative integer
    // @inputString - input string
    // @returnErrors - how the function returns: true mean return an array, false a boolean
    errors = []; // assume no errors at first
    if(Number(inputString) != inputString) {
        errors.push('Not a number!'); // Check if string is a number value
    }
    else {
        if(inputString < 0) errors.push('Negative value!'); // Check if it is non-negative
        if(parseInt(inputString) != inputString) errors.push('Not an integer!'); // Check that it is an integer
    }
    return returnErrors ? errors : (errors.length == 0);
}

// POST from store form to invoice page
// Used parts of Lab13
app.post("/process_invoice", function (request, response, next) {
    let POST = request.body;

    if (typeof POST['quantity_textbox'] != 'undefined') {
        let quantity = POST['quantity_textbox'];
        if (isNonNegativeInteger(quantity)) {
            products[0]['total_sold'] += Number(quantity);
            response.redirect('receipt.html?quantity=' + quantity);
        }
        else {
            response.redirect(`order_page.html?error=Invalid%20Quantity&quantity_textbox=` + quantity);
        }
    }

    if(typeof POST['purchase_submit'] == 'undefined') {
        console.log('No purchase form data');
        next();
    }

    if (typeof POST['quantity_textbox'] != 'undefined') {
        let quantity = POST['quantity_textbox'];
        if (isNonNegativeInteger(quantity)) {
            products[0]['total_sold'] += Number(quantity);
            response.redirect('receipt.html?quantity=' + quantity);
        }
        else {
            response.redirect(`order_page.html?error=Invalid%20Quantity&quantity_textbox=` + quantity);
        }
    }

    console.log(Date.now() + ': Purchase made from ip ' + request.ip + ' data: ' + JSON.stringify(POST));

    var contents = fs.readFileSync('./views/invoice.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    // Function to display invoice table
    // Utilized Invoice4 for this section
    function display_invoice_table_rows() {
        subtotal = 0;
        str = '';
        for (i = 0; i < products.length; i++) {
            a_qty = 0;
            if(typeof POST[`quantity${i}`] != 'undefined') {
                a_qty = POST[`quantity${i}`];
            }
            if (a_qty > 0) {
                // product row
                extended_price =a_qty * products[i].price
                subtotal += extended_price;
                str += (`
                <tr>
                    <td width="43%">${products[i].name}</td>
                    <td align="center" width="11%">${a_qty}</td>
                    <td width="13%">\$${products[i].price.toFixed(2)}</td>
                    <td width="54%">\$${extended_price.toFixed(2)}</td>
                </tr>
                `);
            }
        }
        // Compute tax
        tax_rate = 0.0575;
        tax = tax_rate * subtotal;

        // Compute shipping
        if (subtotal <= 50) {
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
        
        return str;
    }

});

// Handle request for /store page
// Modified code from Invoice4 and Lab13
app.get("/store", function (request, response) {
    var contents = fs.readFileSync('./views/display_products.template', 'utf8');
    response.send(eval('`' + contents + '`')); // render template string

    function display_products() {
        str = '<div class="products">'; // Initial div tag to format items via .products in style.CSS
        for (i = 0; i < products.length; i++) {
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

            // Add HTML to string using for loop for each product in the JSON file
            str += `
                <section class="item">
                <h2>${products[i].name}</h2>
                    <p>$${products[i].price.toFixed(2)}</p>
                    <img class="beerPicture" src="${products[i].image}" height="200px">
                    <a href="${products[i].beer_link}">
                        <p><img class="rating" src="${ratingImage}" width="120px"></p>
                    </a>
                    <p>${products[i].description}</p>
                    <label for="quantity${i}" id="quantity${i}_label"}">Quantity</label>
                    <input type="text" placeholder="0" name="quantity${i}" 
                    onkeyup="checkQuantityTextbox(this);">
                </section>
            `;
        }
        str += '</div>'; // Close out div tag
        return str;
    }
});

// Look for index.html here if no domain specified
app.use(express.static('./static'));

var listener = app.listen(8080, () => { console.log('server started listening on port ' + listener.address().port) });