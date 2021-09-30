var num_days = 0;
var month = 'January';
var now = new Date();
var year = now.getFullYear;
var isLeapYear;

if (year % 4 == 0) {
    if (year % 100 == 0) {
        if (year % 400 == 0) {
            isLeapYear = true;
        }
        else {
            isLeapYear = false;
        }
    }
    else {
        isLeapYear = true;
    }
}
else {
    isLeapYear = false;
}

switch (month.toLowerCase()) {
    case 'january':
        num_days = 31;
        break;
    case 'february':
        if (isLeapYear) {
            num_days = 28;
        }
        else {
            num_days = 29;
        }
        break;
    case 'march':
        num_days = 31;
        break;
    case 'april':
        num_days = 30;
        break;
    case 'may':
        num_days = 31;
        break;
    case 'june':
        num_days = 30;
        break;
    case 'july':
        num_days = 31;
        break;
    case 'august':
        num_days = 31;
        break;
    case 'september':
        num_days = 30;
        break;
    case 'october':
        num_days = 31;
        break;
    case 'november':
        num_days = 30;
        break;
    case 'december':
        num_days = 31;
        break;
    default: 
        num_days = -1;
        console.log("Error: Invalid month entered.");
        break;
}

console.log("In the month of " + month + ", there are " + num_days + " days.");