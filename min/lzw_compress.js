#!/usr/bin/env node

var LZW = {
    encode: function encode(s) {
        var dict = {};
        var data = (s + "").split("");
        var out = [];
        var currChar;
        var phrase = data[0];
        var code = 128;
        var i, l;
        for (i = 1, l = data.length; i < l; i++) {
            currChar = data[i];
            if (dict[phrase + currChar]) {
                phrase += currChar;
            } else {
                out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                dict[phrase + currChar] = code;
                code++;
                phrase = currChar;
            }
        }
        out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
        for (i = 0, l = out.length; i < l; i++) {
            out[i] = String.fromCharCode(out[i]);
        }
        return out.join("");
    },
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
            } else {
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


var fs = require('fs');
var data = fs.readFileSync(0, 'utf-8');

var enc = LZW.encode(data);
if (data !== LZW.decode(enc))
    throw "decompression assertion failed!";

console.log(LZW.encode(data).replace('\\', '\\\\'));
// console.log(LZW.decode(LZW.encode(data)));

