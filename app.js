/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework. 
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');
var botbuilder_azure = require("botbuilder-azure");

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

var tableName = 'botdata';
var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', tableStorage);

bot.dialog('/', function (session) {
    var str = [...session.message.text];
    var stack = [];
    var first = 9999999, last = 0;
    for(var i = 0 ; i < str.length; i++){
        if(EmptyStack(last) && isOpenBracket(str[i])) {
            stack[last] = str[i];
            last++;
            first = 0;
        }
        else if(isOpenBracket(str[i])) {
            if(str[i] == '(' && stack[last-1] == '{' || stack[last-1] == '(') {
                stack[last] = str[i];
                last++;
            }
            else if(str[i] == '[' && stack[last-1] == '(') {
                stack[last] = str[i];
                last++;
            }
            else if(str[i] == '{' && stack[last-1] == '{') {
                stack[last] = str[i];
                last++;
            }
        }
        else if(isCloseBracket(str[i])){
            if(first != 0){
                break;
            }
            else {
                if(str[i].charCodeAt() - 1 == stack[last-1].charCodeAt() || str[i].charCodeAt() - 2 == stack[last-1].charCodeAt()) {
                    last--;
                }
            }
        }
    }
 

    if(last == first){
        session.send("You said: %s it's balance bracket Nice Guy", session.message.text);
    }
    else{
        session.send("error: %s syntax is error please fix it");
    }


function EmptyStack(last) {
    
    if (last == 0) {
        return true;
    }
    else {
        return false;
    }
}

function isOpenBracket(inputChar) {
    if(inputChar == '(' || inputChar == '[' || inputChar == '{') {
        return true;
    }
    else {
        return false;
    }
}

function isCloseBracket(inputChar) {
    if(inputChar == ')' || inputChar == ']' || inputChar == '}') {
        return true;
    }
    else {
        return false;
    }
}
});


///////////////////////////////
