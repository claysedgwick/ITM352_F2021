// Used starting code from Assignmnet 1 instructions to build server
// Require Express and Product Data JSON file
var express = require('express');
var app = express();
var myParser = require("body-parser");
var fs = require('fs');
var products_array = require('./product_data.json');

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

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

app.get("/store", function (request, response) {
   var contents = fs.readFileSync('./views/store.template', 'utf8');
   response.send(eval('`' + contents + '`')); // render template string

   // function display_products() {
   //     str = '';
   //     for (i = 0; i < products.length; i++) {
   //         str += `
   //             <section class="item">
   //                 <h2>${products[i].brand}</h2>
   //                 <p>$${products[i].price}</p>
   //                 <label id="quantity${i}_label"}">Quantity</label>
   //                 <input type="text" placeholder="0" name="quantity${i}" 
   //                 onkeyup="checkQuantityTextbox(this);">
   //                 <img src="${products[i].image}">
   //             </section>
   //         `;
   //     }
   //     return str;
   // }
   next();
});

// process purchase request (validate quantities, check quantity available)
// Used code from Lab13
// Rule to handle process_form request from order_page.html
app.post("/process_form", function (request, response) {
   let POST = request.body;
   let brand = products[0]['name'];
   let brand_price = products[0]['price'];

   if (typeof POST['quantity_textbox'] != 'undefined') {
       let quantity = POST['quantity_textbox'];
       if (isNonNegativeInteger(quantity)) {
           products[0]['total_sold'] += Number(quantity);
           response.send(`<h2>Thank you for ordering ${quantity} ${brand}! Your total is \$${(quantity * brand_price).toFixed(2)}</h2>`);
       }
       else {
           response.send(`<i>${quantity} is not a valid quantity. Hit the back button and try again.</i>`)
       }
   }
});


// route all other GET requests to files in public 
app.use(express.static('./static'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));