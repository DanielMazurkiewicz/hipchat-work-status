'use strict';

const workStatus = require('./workStatus.js');
const hiddenCommands = require('./hiddenCommands.js');
const commandsDescription = require('./commandsDescription.js');
const {
    getNextWord
} = require('./stringHelpers.js');
const {
    prepareResponse
} = require('./hipChat.js');

function commandsFactory(whoIsWhere) {
    const confused = (userName, userId, message, position, changedDbCallback) => {
        let responseText = 'These are your options:\n';
        [workStatus, appCommands].forEach(commands => {
            for (let command in commands) {
                if (!hiddenCommands[command]) {
                    responseText += ` - ${command}`;
                    if (commandsDescription[command]) {
                        responseText += `: ${commandsDescription[command]}`;
                    }
                    responseText += '\n';
                }
            }
        });

        return prepareResponse(responseText);
    };

    const curious = (userName, userId, message, position, changedDbCallback) => {
        let responseText = '';

        const nextWord = getNextWord(message, position);
        const curiousAbout = nextWord.word;

        switch (curiousAbout) {
            case 'details':
                for (let employeeId in whoIsWhere) {
                    let employee = whoIsWhere[employeeId];
                    responseText += ` * ${employee.name} ${workStatus[employee.where]}\n`;
                    responseText += `   since ${employee.timestamp}\n`;
                    if (employee.reason) {
                        responseText += `   (${employee.reason})\n`;
                    }
                }
                break;

            case 'all':
                for (let employeeId in whoIsWhere) {
                    let employee = whoIsWhere[employeeId];
                    responseText += `${employee.name} ${workStatus[employee.where]}\n`;
                }
                break;

            case 'ids':
                for (let employeeId in whoIsWhere) {
                    let employee = whoIsWhere[employeeId];
                    responseText += `${employee.name}: ${employeeId}\n`;
                }
                break;

            default:
                for (let employeeId in whoIsWhere) {
                    let employee = whoIsWhere[employeeId];
                    if (employee.where !== 'atoffice') {
                        responseText += `${employee.name} ${workStatus[employee.where]}\n`;
                    }
                }
        }

        return prepareResponse(responseText);
    };

    const back = (userName, userId, message, position, changedDbCallback) => {
        if (!whoIsWhere[userId]) {
            return prepareResponse(`${userName} is nowhere and wants to get back`, 'red');
        }
        if (!whoIsWhere[userId].previous) {
            return prepareResponse(`Access denied! Agent Smith is already looking for you ${userName}`, 'red');
        }
        whoIsWhere[userId] = whoIsWhere[userId].previous;
        whoIsWhere[userId].timestamp = (new Date()).toISOString();
        changedDbCallback();
        return prepareResponse(`${userName} ${workStatus[whoIsWhere[userId].where]}`);
    };

    const who = (userName, userId, message, position, changedDbCallback) => {
        return prepareResponse(`They call you: ${userName}, but most probably you are Elvis Presley`, 'red');
    };

    const kicking = (userName, userId, message, position, changedDbCallback) => {
        let response;

        const nextWord = getNextWord(message, position);
        const theOneToKickOutId = nextWord.word;

        const theOneToKickOut = whoIsWhere[theOneToKickOutId];
        if (theOneToKickOut) {
            delete whoIsWhere[theOneToKickOutId];
            response = prepareResponse(`${userName} says: You are fired ${theOneToKickOut.name}!!! Pick your toys and get the f*** out!`);
            changedDbCallback();
        } else {
            response = prepareResponse(`${userName} calm down, take it easy, think twice and then check again given id!`, 'red');
        }

        return response;
    };

    const appCommands = {
        kicking,
        who,
        back,
        curious,
        confused,
        help: confused,
        '': curious
    };

    return appCommands;
}

module.exports = commandsFactory;