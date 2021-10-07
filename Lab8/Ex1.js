require("./products_data.js");

for (var count = 1; eval("typeof name"+count) != 'undefined'; count++) {
    console.log(`${count}. ${eval('name' + count)}`)
}

/*
var num_products = 5;
for (var count = 1; eval("typeof name"+count) != 'undefined'; count++) {
    if (count > num_products/2) {
        console.log("That's enough!");
        process.exit();
    }
    console.log(`${count}. ${eval('name' + count)}`);
}
*/ 
/*
var num_products = 5;
var count = 0;

while (count < num_products) {
    count++;
    if (count > num_products/2) {
        console.log("Don't ask for anything else.");
        process.exit();
    }
    else {
        console.log(`${count}. ${eval('name' + count)}`);
    }
}
*/

console.log("That's all we have!");