// Load required modules.
const AWS = require('aws-sdk');
const Alexa = require('alexa-sdk');
const nconf = require('nconf');

// Load the configuration file.
nconf.file('./config.json');

const sqsQueueUrl = nconf.get('sqsQueueUrl');
const appId = nconf.get('alexaAppId');

exports.handler = function(event, context, callback) {
    console.log('started');
    var alexa = Alexa.handler(event, context);
    alexa.appId = appId;
    alexa.registerHandlers(handlers);
    alexa.execute();
}

var handlers = {
    'RecordDiaperIntent': function() {
        var child = this.event.request.intent.slots.child.value;
        if (!child) {
            this.emit(':tell', 'Sorry, I did not hear which child.');
            return;
        }

        var diaperType = this.event.request.intent.slots.diaperType.value;
        if (!diaperType) {
            this.emit(':tell', 'Sorry, I did not hear what type of diaper.');
            return;
        }

        // Translate diaper type to expected value
        switch(diaperType) {
            case 'poopie':
            case 'dirty':
                diaperType = 'bm';
                break;

            case 'poopie and wet':
            case 'wet and poopie':
            case 'wet and dirty':
            case 'dirty and wet':
                diaperType = 'bmWet';
                break;
        }

        var _this = this;

        sendQueueMessage({
            type: 'diaper',
            parameters: {
                child: child,
                time: new Date(),
                type: diaperType
            }
        }, function(error) {
            if (error) {
                console.log(error);
                _this.emit(':tell', 'Sorry, something went wrong.');
            } else {
                _this.emit(':tell', 'Ok.');
            }
        })
    },

    'RecordBottleIntent': function() {
        var child = this.event.request.intent.slots.child.value;
        if (!child) {
            this.emit(':tell', 'Sorry, I did not hear which child.');
            return;
        }

        var bottleType = this.event.request.intent.slots.bottleType.value;
        if (!bottleType) {
            this.emit(':tell', 'Sorry, I did not hear what type of bottle.');
            return;
        }

        var amount = this.event.request.intent.slots.amount.value;
        if (!amount) {
            this.emit(':tell', 'Sorry, I did not hear the amount of the bottle.');
        }

        var _this = this;

        sendQueueMessage({
            type: 'bottle',
            parameters: {
                child: child,
                time: new Date(),
                amount: amount,
                type: bottleType
            }
        }, function(error) {
            if (error) {
                console.log(error);
                _this.emit(':tell', 'Sorry, something went wrong.');
            } else {
                _this.emit(':tell', 'Ok.');
            }
        });
    }
};

/**
 * Sends a message to an AWS SQS message queue.
 * 
 * @param {Object} payload
 *  An object to be turned into a JSON string and used as the message body.
 * 
 * @param {function(Object, Object): void} callback
 *  A callback function to invoke when done.
 */
function sendQueueMessage(payload, callback) {
    var SQS = new AWS.SQS();

    var parameters = {
        MessageBody: JSON.stringify(payload),
        QueueUrl: sqsQueueUrl
    };

    SQS.sendMessage(parameters, callback);
}