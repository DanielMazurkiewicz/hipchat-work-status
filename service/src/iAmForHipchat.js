'use strict';

const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const workStatus = require('./workStatus.js');
const {
    getNextWord
} = require('./stringHelpers.js');
const {
    prepareResponse
} = require('./hipChat.js');

const config = require('../config.json');
const {
    urlKey,
    whoIsWhereFile,
    port
} = config;

const app = express();


app.use(bodyParser.json());

const readWhoIsWhere = () => {
    if (fs.existsSync(whoIsWhereFile)) {
        const content = fs.readFileSync(whoIsWhereFile);
        try {
            return JSON.parse(content);
        } catch (error) {
            console.log(error);
        }
    }
    return {};
}

const whoIsWhere = readWhoIsWhere();

const writeWhoIsWhere = () => {
    fs.writeFile(whoIsWhereFile, JSON.stringify(whoIsWhere), function(err) {
        if (err) throw err;
    });
}

const appCommands = require('./appCommands.js')(whoIsWhere);

/*
	Example payload

	{
	    "event": "room_message",
	    "item": {
		"message": {
		    "message": "/iam something something",
		    "from": {
		        "id": 1,
		        "name": "John Kowalski"
		    }
		}
	    }
	}
*/

app.post(`/${urlKey}/iam`, function(req, res) {

    const roomMessage = req.body;

    if (roomMessage.event !== 'room_message') {
        console.log('Unknown event: ' + roomMessage.event)
        return;
    }

    const {
        message,
        from
    } = roomMessage.item.message;
    let nextWord = getNextWord(message);
    const command = nextWord.word;

    nextWord = getNextWord(message, nextWord.end);
    const status = nextWord.word;

    let response;
    switch (status) {
        case '':
            response = prepareResponse(`They call you: ${from.name}, but most probably you are Elvis Presley`, 'red');
            break;

        default:
            if (workStatus[status]) {
                const previous = whoIsWhere[from.id];
                if (previous) {
                    delete previous.previous;
                }
                delete whoIsWhere[from.id]; // updates will appear at the end of list
                whoIsWhere[from.id] = {
                    where: status,
                    timestamp: (new Date()).toISOString(),
                    name: from.name,
                    reason: message.substr(nextWord.end).trim(),
                    previous
                };
                response = prepareResponse(`${from.name} ${workStatus[status]}`);
                writeWhoIsWhere();
            } else if (appCommands[status]) {
                response = appCommands[status](from.name, from.id, message, nextWord.end, writeWhoIsWhere);
            } else {
                response = prepareResponse(`And now talk to the hand: ${status}`, 'red');
            }
    }
    res.send(JSON.stringify(response));
});

//TODO: HTTPS

app.listen(port, function() {
    console.log(`Listening on port ${port}. URL postfix /${urlKey}/iam`);
});