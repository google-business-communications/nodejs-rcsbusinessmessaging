// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const { GoogleAuth } = require('google-auth-library');
const {google} = require('googleapis');
const uuidv4 = require('uuid/v4');

const MISSING_INITIALIZATION = 'You must first initialize this library by calling initRbmApi.';

// RBM API library reference object
let rbmApi = false;

// JWT cloud authentication reference object
let authClient = false;

// wrapper object for interacting with the RBM API
let rbmApiHelper = {
    /**
     * Sends a synchronous capability check to the device.
     * @param {string} msisdn The phone number in E.164 format.
     * @param {function} callback Callback method for
     * after the method is complete.
     */
    checkCapability: function(msisdn, callback) {
        if (!authClient) {
            throw MISSING_INITIALIZATION;
        } else {
            checkCapability_(msisdn, authClient, callback);
        }
    },

    /**
     * Checks the list of user devices for reachability of RBM.
     * Maximum list size is 10,000.
     * @param {array} msisdns List of phone numbers in E.164 format.
     * @param {function} callback A callback function called at
     * the completion of getUsers
     */
    getUsers: function(msisdns, callback) {
        if (!authClient) {
            throw MISSING_INITIALIZATION;
        } else {
            getUsers_(msisdns, authClient, callback);
        }
    },

    /**
     * Sends an invite to the msisdn to become a tester.
     * @param {string} msisdn The phone number in E.164 format.
     * @param {function} callback Callback method for
     * after the method is complete.
     */
    sendTesterInvite: function(msisdn, callback) {
        if (!authClient) {
            throw MISSING_INITIALIZATION;
        } else {
            sendTesterInvite_(msisdn, authClient, callback);
        }
    },

    /**
     * Sends an is typing event back to the msisdn.
     * @param {string} msisdn The phone number in E.164 format.
     * @param {function} callback Callback method for
     * after the method is complete.
     */
    sendIsTypingMessage: function(msisdn, callback) {
        if (!authClient) {
            throw MISSING_INITIALIZATION;
        } else {
            sendIsTypingMessage_(msisdn, authClient, callback);
        }
    },

    /**
     * Sends a read event back to the msisdn.
     * @param {string} msisdn The phone number in E.164 format.
     * @param {string} messageId The identifier for the message that was read.
     * @param {function} callback Callback method for after
     * the method is complete.
     */
    sendReadMessage: function(msisdn, messageId, callback) {
        if (!authClient) {
            throw MISSING_INITIALIZATION;
        } else {
            sendReadMessage_(msisdn, messageId, authClient, callback);
        }
    },

    /**
     * Revokes the given message from being sent to the user.
     * @param {string} msisdn The phone number in E.164 format.
     * @param {string} messageId The identifier for the message that was sent.
     * @param {function} callback Function called once the message is revoked.
     */
    revokeMessage: function(msisdn, messageId, callback) {
        if (!authClient) {
            throw MISSING_INITIALIZATION;
        } else {
            revokeMessage_(msisdn, messageId, authClient, callback);
        }
    },

    /**
     * Sends the device an RBM message.
     * @param {object} params The params for the api call.
     * @param {string} params.messageText The message to
     * send the user.
     * @param {string} params.msisdn The phone number
     * in E.164 format.
     * @param {array} params.suggestions The suggested chip
     * list of replies.
     * @param {function} callback Callback method for after
     * the method is complete.
     */
    sendMessage: function(params, callback) {
        if (!authClient) {
            throw MISSING_INITIALIZATION;
        } else {
            sendMessage_(params, authClient, callback);
        }
    },

    /**
     * Sends the device a rich card over RCS.
     * @param {object} params An object of parameters needed for a richcard.
     * @param {string} params.messageText The message to
     * send the user.
     * @param {string} params.messageDescription The description
     * text to use in the rich card.
     * @param {string} params.msisdn The phone number
     * in E.164 format.
     * @param {string} params.imageUrl The public URL
     * of the image for the rich card.
     * @param {array} params.suggestions The suggested chip
     * list of replies.
     * @param {function} callback Callback method for after
     * the method is complete.
     */
    sendRichCard: function(params, callback) {
        if (!authClient) {
            throw MISSING_INITIALIZATION;
        } else {
            sendRichCard_(params, authClient, callback);
        }
    },

    /**
     * Sends the device a card carousel
     * @param {object} params An object of parameters needed for a richcard.
     * @param {string} params.cardWidth The width of a card.
     * @param {string} params.cardContents An array of
     * rich card objects.
     * @param {string} params.msisdn The phone number
     * in E.164 format.
     * @param {function} callback Callback method for after
     * the method is complete.
     */
    sendCarouselCard: function(params, callback) {
        if (!authClient) {
            throw MISSING_INITIALIZATION;
        } else {
            sendCarouselCard_(params, authClient, callback);
        }
    },

    /**
     * Initializes the RBM API and authentication credentials to
     * communicate with the RBM platform.
     * @param {object} serviceAccountJsonObject The JSON object for the service account key file.
     * @param {function} callback Callback method for after
     * the method is complete.
     */
    initRbmApi: async function(serviceAccountJsonObject, callback) {
        // Set the scope for API authentication
        const auth = new GoogleAuth({
            scopes: 'https://www.googleapis.com/auth/rcsbusinessmessaging',
        });


        // get the RCS business messaging API file
        let rcsbusinessmessaging = require(__dirname + '/v1');

        // set the private key to the service account file
        // let privatekey
        //     = require(__dirname + '/../resources/rbm-agent-service-account-credentials.json');

        if (serviceAccountJsonObject === undefined) {
            authClient = await auth.getClient();
        }
        else {
            // configure a JWT auth client
            authClient = new google.auth.JWT(
                serviceAccountJsonObject.client_email,
                null,
                serviceAccountJsonObject.private_key,
                ['https://www.googleapis.com/auth/rcsbusinessmessaging']
            );
        }

        // initialize the RBM API
        rbmApi
            = new rcsbusinessmessaging.rcsbusinessmessaging_v1.Rcsbusinessmessaging({}, google);

        if (callback != undefined) {
            callback();
        }
    },
};

/**
 * Uses the RBM API to perform a synchronous capability check.
 * @param {string} msisdns The phone number in E.164 format.
 * @param {object} authClient The authorization client for Google services
 * @param {function} callback A callback function called at
 * the completion of getUsers
 */
function getUsers_(msisdns, authClient, callback) {
    // set the params
    let params = {
        auth: authClient,
        resource: {
            users: msisdns
        }
    };

    rbmApi.users.batchGet(params, {}, function(err, response) {
        if (callback != undefined) {
            callback(response);
        }
    });
}

/**
 * Uses the RBM API to perform a synchronous capability check.
 * @param {string} msisdn The phone number in E.164 format.
 * @param {object} authClient The authorization client for Google services
 * @param {function} callback Callback method for
 * after the method is complete.
 */
function checkCapability_(msisdn, authClient, callback) {
    let requestId = randomstring.generate();

    // set the params
    let params = {
        name: 'phones/' + msisdn,
        requestId: requestId,
        auth: authClient
    };

    rbmApi.phones.getCapabilities(params, {}, function(err, response) {
        // prints the RBM capabilities of the phone
        console.log(response);

        if (callback != undefined) {
            callback(response);
        }
    });
}

/**
 * Uses the RBM API to send an invite to become a tester.
 * @param {string} msisdn The phone number in E.164 format.
 * @param {object} authClient The authorization client for Google services
 * @param {function} callback Callback method for
 * after the method is complete.
 */
function sendTesterInvite_(msisdn, authClient, callback) {
    // set the params
    let params = {parent: 'phones/' + msisdn, auth: authClient};

    // send a tester request
    rbmApi.phones.testers.create(params, {}, function(err, response) {
        console.log(response);
    
        if (callback != undefined) {
            callback(response);
        }
    });
}

/**
 * Uses the RBM API to send an IS_TYPING event to the msisdn.
 * @param {string} msisdn The phone number in E.164 format.
 * @param {google.auth.JWT} authClient The authenticated cloud client.
 * @param {function} callback Callback method for
 * after the method is complete.
 */
function sendIsTypingMessage_(msisdn, authClient, callback) {
    // generate a random message id for this event
    let eventId = uuidv4();

    // create the JSON message payload to send
    let options = {
        eventType: 'IS_TYPING',
    };

    // setup the parameters for the API call
    let params = {
        parent: 'phones/' + msisdn,
        eventId: eventId,
        auth: authClient,
        resource: options, // POST body
    };

    // send the client the message
    rbmApi.phones.agentEvents.create(params, options, function(err, response) {
        console.log(response);

        if (callback != undefined) {
            callback();
        }
    });
}

/**
 * Uses the RMB API to send a READ event to the msisdn.
 * @param {string} msisdn The phone number in E.164 format.
 * @param {string} messageId The identifier for the message that was read.
 * @param {google.auth.JWT} authClient The authenticated cloud client.
 * @param {function} callback Callback method for after the method is complete.
 */
function sendReadMessage_(msisdn, messageId, authClient, callback) {
    // generate a random message id for this event
    let eventId = uuidv4();

    // create the JSON message payload to send
    let options = {
        eventType: 'READ',
        messageId: messageId,
    };

    // setup the parameters for the API call
    let params = {
        parent: 'phones/' + msisdn,
        eventId: eventId,
        auth: authClient,
        resource: options, // POST body
    };

    // send the client the message
    rbmApi.phones.agentEvents.create(params, options, function(err, response) {
        if (callback != undefined) {
            callback(response);
        }
    });
}

/**
 * Uses the RMB API to stop the message from being delivered to msisdn.
 * @param {string} msisdn The phone number in E.164 format.
 * @param {string} messageId The identifier for the message that was sent.
 * @param {google.auth.JWT} authClient The authenticated cloud client.
 * @param {function} callback Callback method for after the method is complete.
 */
function revokeMessage_(msisdn, messageId, authClient, callback) {
    // setup the parameters for the API call
    let params = {
        name: 'phones/' + msisdn + '/agentMessages/' + messageId,
        auth: authClient,
    };

    // remove the message from the delivery queue
    rbmApi.phones.agentMessages.delete(params, {}, function(err, response) {
        if (callback != undefined) {
            callback(err, response);
        }
    });
}

 /**
 * Sends the device a rich card over RCS.
 * @param {object} params An object of parameters needed for a richcard.
 * @param {google.auth.JWT} authClient The authenticated cloud client.
 * @param {function} callback Callback method for after
 * the method is complete.
 */
function sendRichCard_(params, authClient, callback) {
    let messageText = '';
    if (params.messageText != undefined) {
        messageText = params.messageText;
    }

    let messageDescription = '';
    if (params.messageDescription != undefined) {
        messageDescription = params.messageDescription;
    }

    // image for the card
    let imageUrl = params.imageUrl;

    // msisdn to send the message to
    let msisdn = params.msisdn;

    // generate a random message id for this message
    let messageId = uuidv4();

    // create the JSON message payload to send
    let options = {
        contentMessage: {
            richCard: {
                standaloneCard: {
                    cardOrientation: 'VERTICAL',
                    cardContent: {
                        media: {
                            height: 'TALL',
                            contentInfo: {
                                fileUrl: imageUrl,
                                forceRefresh: false,
                            },
                        },
                        title: messageText,
                        description: messageDescription,
                    },
                },
            },
        },
    };

    // add suggested replies if they exist
    if (params.suggestions != undefined
        && params.suggestions.length != null
        && params.suggestions.length > 0) {
        options.contentMessage.richCard.standaloneCard.cardContent.suggestions
            = params.suggestions;
    }

    // setup the parameters for the API call
    let apiParams = {
        parent: 'phones/' + msisdn,
        messageId: messageId,
        auth: authClient,
        resource: options, // POST body
    };

    // send the client the message
    rbmApi.phones.agentMessages.create(apiParams, options, function(err, response) {
        console.dir(err);
        if (callback != undefined) {
           callback(response);
        }
    });
}

/**
 * Sends the device a rich card over RCS.
 * @param {object} params An object of parameters needed for a carousel.
 * @param {google.auth.JWT} authClient The authenticated cloud client.
 * @param {function} callback Callback method for after
 * the method is complete.
 */
function sendCarouselCard_(params, authClient, callback) {
    let cardWidth = 'MEDIUM';
    if (params.cardWidth != undefined) {
        cardWidth = params.cardWidth;
    }

    let cardContents = params.cardContents;

    // msisdn to send the message to
    let msisdn = params.msisdn;

    // generate a random message id for this message
    let messageId = uuidv4();

    // create the JSON message payload to send
    let options = {
        contentMessage: {
            richCard: {
                carouselCard: {
                    cardWidth: cardWidth,
                    cardContents: cardContents,
                },
            },
        },
    };

    // setup the parameters for the API call
    let apiParams = {
        parent: 'phones/' + msisdn,
        messageId: messageId,
        auth: authClient,
        resource: options, // POST body
    };

    // send the client the message
    rbmApi.phones.agentMessages.create(apiParams, options, function(err, response) {
        if (callback != undefined) {
           callback(response);
        }
    });
}

/**
 * Uses the RBM API to send the device an RBM message.
 * @param {object} params An object of parameters needed for messaging.
 * @param {google.auth.JWT} authClient The authenticated cloud client.
 * @param {function} callback Callback method for after the method is complete.
 */
function sendMessage_(params, authClient, callback) {
    // generate a random message id for this message
    let messageId = uuidv4();

    // get the message text and msisdn from the parameters
    let messageText = params.messageText;
    let msisdn = params.msisdn;

    // create the JSON message payload to send
    let options = {
        contentMessage: {},
    };

    // add text if it exists
    if (messageText != undefined) {
        options.contentMessage.text = messageText;
    }

    // add suggested replies if they exist
    if (params.suggestions != undefined
        && params.suggestions.length != null
        && params.suggestions.length > 0) {
        options.contentMessage.suggestions = params.suggestions;
    }

    // add an image if a media item exists
    if (params.fileUrl != undefined) {
        options.contentMessage.contentInfo = {
            fileUrl: params.fileUrl
        }
    }

    // setup the parameters for the API call
    let apiParams = {
        parent: 'phones/' + msisdn,
        messageId: messageId,
        auth: authClient,
        resource: options, // POST body
    };

    // send the client the message
    rbmApi.phones.agentMessages.create(apiParams, options, function(err, response) {
        if (callback != undefined) {
            callback(response);
        }
    });
}

module.exports = rbmApiHelper;
