var restify = require('restify');
var builder = require('botbuilder');
var azure = require('azure-storage');
var path = require('path');
var jsdom = require('jsdom');
var uuid = require('uuid');
var util = require('util');
var fs = require('fs');
const { JSDOM } = jsdom;
const { window } = new JSDOM();
const { document } = (new JSDOM('')).window;
global.document = document;

var $ = jQuery = require('jquery')(window);

var connectionString = 'DefaultEndpointsProtocol=https;AccountName=testblobza;AccountKey=FlewVgyJzhZntjqPuZ8BO3d9Us4Blh/fG6wRFqrfKE6SG+tQd7PxYhp1E+uBInC8UW8d3M/EhyfQzqe3SYlPfA==;EndpointSuffix=core.windows.net';
var blobService = azure.createBlobService(connectionString);
var USER_HOME = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
var DOCUMENT_FOLDER = path.join(USER_HOME, 'Documents');
if (!fs.existsSync(DOCUMENT_FOLDER)) {
  fs.mkdirSync(DOCUMENT_FOLDER);
}

var container = 'taskcontainer';

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});

var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

server.post('/api/messages', connector.listen());


    var bot = new builder.UniversalBot(connector, function(session) {
        var msg = session.message;
        if(msg.attachments && msg.attachments.length > 0) {
            var attachment = msg.attachments[0];
            var blobName = attachment.name;
            blobService.createBlockBlobFromLocalFile(container,blobName,attachment.name, function(error) {
                    handleError(error);
                });
    
        var blobUrl = blobService.getUrl(container,blobName);
    
        var subscriptionKey = "585ac8068c574ee99be927d0b5d204ce";
        var uriBase = "https://southcentralus.api.cognitive.microsoft.com/customvision/v1.1/Prediction/eeb89498-aa9a-48b0-8404-c4a9ad90cbaf/url";

      $.ajax({
        url: uriBase,

        // Request headers.
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Prediction-Key", subscriptionKey);
        },

        type: "POST",

        // Request body.
        data: '{"url": ' + '"' + blobUrl + '"}',
    })
    .done(function(data) {
        var json = data.Predictions[0].Tag;
        session.send("user said:" + json);
    })
            
        }
        else {
            session.send("you said %s", msg.text);
        }
    });


function handleError(error) {
        if (error) {
          console.error('Exception thrown:\n', error);
          process.abort();
        }
      }
