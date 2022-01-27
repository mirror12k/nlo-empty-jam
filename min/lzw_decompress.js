
var LZW = {
    decode: function decode(s) {
        var dict = {};
        var data = (s + "").split("");
        var currChar = data[0];
        var oldPhrase = currChar;
        var out = [currChar];
        var code = 128;
        var phrase;
        for (var i = 1; i < data.length; i++) {
            var currCode = data[i].charCodeAt(0);
            if (currCode < 128) {
                phrase = data[i];
            }
            else {
                phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
            }
            out.push(phrase);
            currChar = phrase.charAt(0);
            dict[code++] = oldPhrase + currChar;
            oldPhrase = phrase;
        }
        return out.join("");
    }
};

// var fs = require('fs');
// var data = fs.readFileSync(0);

// console.log(LZW.decode(data));

