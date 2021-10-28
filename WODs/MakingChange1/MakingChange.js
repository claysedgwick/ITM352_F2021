// Declare variables
var initialAmount = 0.96;
var amount;
var quarters = 0;
var dimes = 0;
var nickles = 0;
var pennies = 0;

// Convert to pennies
amount = parseInt(initialAmount * 100);

// Get quaters
quarters = parseInt(amount / 25);
amount = amount % 25;

// Get dimes
dimes = parseInt(amount / 10);
amount = amount % 10;

// Get nickles
nickles = parseInt(amount / 5);
amount = amount % 5;

// Get pennies
pennies = parseInt(amount);

// Print to console
console.log("The initial amount entered is $" + initialAmount);
console.log("Quarters: " + quarters);
console.log("Dimes: " + dimes);
console.log("Nickles: " + nickles);
console.log("Pennies: " + pennies);