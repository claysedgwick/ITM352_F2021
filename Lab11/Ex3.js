var attributes = "<name>;<age>;<age + 0.5>;<0.5 - age>";

var pieces = attributes.split(";");

for (i=0; i<pieces.length; i++) {
    console.log(pieces[i] + " " + typeof(pieces[i]));
}