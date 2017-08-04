'use.strict';

const prepareResponse = (message, color = 'green') => ({
    color,
    message,
    notify: false,
    message_format: "text"
});

module.exports = {
    prepareResponse
}