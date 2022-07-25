const fs = require("fs");
const read = require("./parse");

const file = fs.readFileSync("./files/index.json", "ascii");

console.log(file)
const json = read(file);
console.log(json)
