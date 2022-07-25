module.exports = (string) => {
    if (string[0] != "{") throw new Error("Unexpected value, expected {");
    return readJSON(string, 1)[0];
}

const readJSON = (string, pos) => {
    let name = null;
    let expecting = false;
    let end = false;
    const json = {}
    while (!end) {
        pos++;
        let char = string[pos-1];
        let increment = 0;
        let value;
        if (char == "}") end = true;
        else if (char == " " || char == "\n" || char == String.fromCharCode(13)) {} //ignored chars
        else if (!name) {
            if (expecting) {
                if (char != ",") throw new Error(`Unexpected value. Expected , received ${char}`);
                expecting = false;
            }
            if (char == "\"") {
                [name, increment] = readString(string, pos);
                expecting = true;
            }
            else if (char == ",") {}
            else throw new Error(`Unexpected character: ${char} (${char.charCodeAt(0)})`);
        } 
        else {
            if (expecting) {
                if (char != ":") throw new Error(`Unexpected value. Expected : received ${char}`);
                expecting = false;
            }
            else if (char == "{") [value, pos] = readJSON(string, pos);
            else if (char == "\"") [value, increment] = readString(string, pos);
            else if (char == "t") [value, increment] = checkTrue(string, pos);
            else if (char == "f") [value, increment] = checkFalse(string, pos);
            else if (char == "n") [value, increment] = checkNull(string, pos);
            else if ((47 < char.charCodeAt(0) && char.charCodeAt(0) < 58) || char == "-") [value, increment] = readNumber(string, pos);
            else if (char == "[") [value, increment] = readArray(string, pos);
            else throw new Error(`Unexpected character: ${char} (${char.charCodeAt(0)})`);
            if (value) expecting = true;
        }
        pos += increment;
        if (value !== undefined) {
            json[name] = value;
            name = null;
            expecting = true
        }
    }
    return [json, pos];
}

const readString = (string, pos) => {
    let str = "";
    let increment = 0;
    while (string[pos+increment] != "\"") {
        str += string[pos+increment];
        increment++;
    }
    return [str, increment+1];
}

const readNumber = (string, pos) => {
    let mult = string[pos-1] == "-" ? -1 : 1;
    let increment = -1 + (mult == -1);
    let res = 0;
    while (true) {
        let char = string[pos+increment];
        if (char == " " || char == "\n" || char == String.fromCharCode(13) || char == ",") break;
        let value = char.charCodeAt(0) - "0".charCodeAt(0);
        if (!(-1 < value && value < 10)) throw new Error(`Expected decimal number. Received ${char}`);
        res = res*10 + value*mult; //mult for negative values
        increment++;
    }
    return [res, increment]
}

const readArray = (string, pos) => {
    let res = [];
    let increment = 0;
    let expecting = false
    let char = string[pos];
    while (char != "]") {
        increment++;
        let value;
        let shift = 0;
        if (char == " " || char == "\n" || char == String.fromCharCode(13)) {}
        else if (expecting) {
            if (char != ",") throw new Error(`Expected , , received ${char}`);
            expecting = false;
        }
        else if (char == "{") {
            [value, shift] = readJSON(string, pos+increment);
            shift = shift - pos - increment;
        }
        else if (char == "[") [value, shift] = readArray(string, pos+increment);
        else if (char == "\"") [value, shift] = readString(string, pos+increment);
        else if (char == "t") [value, shift] = checkTrue(string, pos+increment);
        else if (char == "f") [value, shift] = checkFalse(string, pos+increment);
        else if (char == "n") [value, shift] = checkNull(string, pos+increment);
        else if ((47 < char.charCodeAt(0) && char.charCodeAt(0) < 58) || char == "-") [value, shift] = readNumber(string, pos+increment);
        increment += shift;
        if (value !== undefined) {
            res.push(value);
            expecting = true;
        }
        char = string[pos+increment];
        console.log(increment, shift, char, string[pos+increment])
        console.log(res)
    }
    return [res, increment+1];
}

const checkTrue = (string, pos) => {
    if (
        string[pos-1] != "t" || 
        string[pos] != "r" || 
        string[pos+1] != "u" || 
        string[pos+2] != "e" ||
        (string[pos+3] != " " && string[pos+3] != "\n" && string[pos+3] != "," && string[pos+3] != String.fromCharCode(13))
        ) throw new Error("Unexpected value. Expected true");
    return [true, 3];
}

const checkFalse = (string, pos) => {
    if (
        string[pos-1] != "f" || 
        string[pos] != "a" || 
        string[pos+1] != "l" || 
        string[pos+2] != "s" ||
        string[pos+3] != "e" ||
        (string[pos+4] != " " && string[pos+4] != "\n" && string[pos+4] != "," && string[pos+4] != String.fromCharCode(13))
        ) throw new Error("Unexpected value. Expected true");
    return [false, 4];
}

const checkNull = (string, pos) => {
    if (
        string[pos-1] != "n" || 
        string[pos] != "u" || 
        string[pos+1] != "l" || 
        string[pos+2] != "l" ||
        (string[pos+3] != " " && string[pos+3] != "\n" && string[pos+3] != "," && string[pos+3] != String.fromCharCode(13))
        ) throw new Error("Unexpected value. Expected true");
    return [null, 3];
}