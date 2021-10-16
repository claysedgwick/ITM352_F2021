function convertTemperature(tempIn, units) {
    // Function to convert temperatures from C to F and from F to C
    // @tempIn - the temperature you wish to convert in either units
    // @units - either "C" or "F", the direction of conversion
    if (units == "F") {
        return (tempIn - 32) * 5/9;
    }
    else if (units == "C") {
        return (tempIn * (9/5)) + 32;
    }
    else {
        return NaN;
    }
}

// console.log("24 C = ", convertTemperature(24, "C"));

function isNonNegativeInteger(inputString, returnErrors = false) {
    // Validate that an input value is a non-negative integer
    // @inputString - input string
    // @returnErrors - how the function returns: true mean return an array, false a boolean
    errors = []; // assume no errors at first
    if(Number(inputString) != inputString) errors.push('Not a number!'); // Check if string is a number value
    if(inputString < 0) errors.push('Negative value!'); // Check if it is non-negative
    if(parseInt(inputString) != inputString) errors.push('Not an integer!'); // Check that it is an integer
    return returnErrors ? errors : (errors.length == 0);
}

var attributes = "5;-3;0;xxx;7.5;13";
var pieces = attributes.split(";");

for (testVal in pieces) {
    console.log(testVal + ": " + pieces[testVal] + " - " + isNonNegativeInteger(pieces[testVal], true));
}

