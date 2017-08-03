'use strict';

const isEmptyChar = {
    ' ': true,
    '\t': true,
    '\n': true
}

function getNextWord(text, startFrom = 0) {
    let start = startFrom;
    if (text[startFrom] === undefined) {
        return {
            start,
            end: start,
            word: ''
        }
    }
    
    while (isEmptyChar[text[start]]) {
        start++;
    }

    let end = start;
    while (text[end] !== undefined && !isEmptyChar[text[end]]) {
        end++;
    }
    return {
        start,
        end,
        word: text.substring(start, end)
    }
}

module.exports = {
    getNextWord
}