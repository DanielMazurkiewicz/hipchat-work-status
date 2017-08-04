'use strict';

const workStatus = require('./workStatus.js');
const {getNextWord} = require('./stringHelpers.js');
const {prepareResponse} = require('./hipChat.js');


function commandsFactory (whoIsWhere) {
	const confused = (message, position) => {
	    let responseText = 'These are your options:\n';
	    for (let command in workStatus) {
		responseText += ` - ${command}\n`;
	    }
	    for (let command in appCommands) {
		responseText += ` - ${command}\n`;
	    }

	    return prepareResponse(responseText);
	};

	const curious = (message, position) => {
	    let responseText = '';

	    const nextWord = getNextWord(message, position);
	    const curiousAbout = nextWord.word;

	    switch (curiousAbout) {
		case 'details':
		    for (let employeeId in whoIsWhere) {
		        let employee = whoIsWhere[employeeId]
		        responseText += ` * ${employee.name} ${workStatus[employee.where]}\n`
		        responseText += `   since ${employee.timestamp}\n`
		        if (employee.reason) {
		            responseText += `   (${employee.reason})\n`
		        }
		    }
		    break;
		default:
		    for (let employeeId in whoIsWhere) {
		        let employee = whoIsWhere[employeeId]
		        responseText += `${employee.name} ${workStatus[employee.where]}\n`
		    }
	    }

	    return prepareResponse(responseText);
	};

	const appCommands = {
	    curious,
	    confused,
            help: confused
	};

	return appCommands;
}

module.exports = commandsFactory;