const fs = require( 'fs' );

let apiHost;
if ( fs.existsSync( process.cwd() + '/temp.log' ) ) {
    apiHost = '127.0.0.1';
    exports.DB_SERVER = 'localhost';
    exports.DB_PORT = 3389;
    exports.DB_USERNAME = 'user';
    exports.DB_PASSWORD = `Password01!`;
    exports.DB_DATABASE = 'collab_editing_poc_server_db';
    exports.webPort = 3000;
    exports.apiServerPort = exports.webPort + 2;
    exports.msgServerPort = exports.webPort + 1;

    exports.webURL = process.env.UI_PATH || `http://${apiHost}:${exports.webPort}`;

    exports.msgServerPath = process.env.ORIGIN || `ws://${apiHost}:${exports.msgServerPort}`;

    exports.apiServerPath = process.env.ORIGIN || `http://${apiHost}:${exports.apiServerPort}`;
    exports.apiServerPathRaw = process.env.ORIGIN || `http://${apiHost}`;
}
else {
    // apiHost = 'floating-hamlet-81896.herokuapp.com';   // heroku

    exports.webURL = 'http://18.117.179.13:3000/';
    apiHost = '52.14.91.154';       // amazon
    exports.DB_SERVER = 'u3r5w4ayhxzdrw87.cbetxkdyhwsb.us-east-1.rds.amazonaws.com';

    exports.DB_PORT = 3306;
    exports.DB_USERNAME = 'w9tvz0v7owbqkdgd';
    exports.DB_PASSWORD = 'txgukn5y06hd1k0p';
    exports.DB_DATABASE = 'n9cmqi0btiolj9xe';

    exports.webPort = 3000;
    exports.apiServerPort = exports.webPort + 2;
    exports.msgServerPort = exports.webPort + 1;


    exports.msgServerPath = `ws:${apiHost}:${exports.msgServerPort}`;
    exports.apiServerPath = `http://${apiHost}:${exports.apiServerPort}`;
    exports.apiServerPathRaw = `http://${apiHost}`;
}

exports.githubURL = 'https://github.com/svenmarley/collab-editing-poc';
exports.githubREADME = 'https://github.com/svenmarley/collab-editing-poc/blob/develop/README.md';
exports.authorName = 'Mike Anderson';
exports.authorEmail = 'mike.anderson@checkone.com';

exports.q1 = "# How I approached the problem\n" +
    "Based on the requirements that I read, there needed to be an API for sending in mutations, and a push" +
    " mechanism back \n" +
    "to the browser when a conversation is updated.  So, I implemented a single server  that \n" +
    "supports a REST API for the main interface, and a WebSocket interface for pushing any changed conversations back to \n" +
    "all currently connected browsers.  It uses a MySQL database to track the conversations and the mutations (and users, \n" +
    "but not really used).  ([NodeJS](https://nodejs.org/en/),\n" +
    "[express](https://www.npmjs.com/package/express), [http](https://www.npmjs.com/package/http), [websocket]\n" +
    "(https://www.npmjs.com/package/websocket), [mysql](https://www.npmjs.com/package/mysql))\n" +
    "\n" +
    "On startup, the browser registers with the WebSocket server and will then receive any conversation changes that occur. \n" +
    "The browser then replaces the current <textarea\\> with the new conversation, updating the view for the User.\n" +
    "\n" +
    "Using React Redux allowed me to store the current conversation in the store, update it from the WebSocket \n" +
    "Server from anywhere in the code, and the ConversationEdit component would automatically change when the conversation \n" +
    "changed.  So, one-way data flow.\n" +
    "\n" +
    "I ran into many problems with the specification as I document below.  I had to make many presumptions and even some \n" +
    "modifications to get the POC to work as I expect was ... expected.";
exports.q2 = "# Things I didn't get to, but need to be done \n" +
    "* There is VERY little negative testing associated with the API calls\n" +
    "* There is no real login (i.e. password check nor authentication from the server)\n" +
    "* Real list of Users should be implemented\n" +
    "* the REST api should respond with 204 for update and 201 for insert with any new ID info  (ID info for insert not in the specification)\n" +
    "* If multiple conversations exist, the WebSocket server will send all changes to all connected browsers.  Currently, \n" +
    "  this could cause a problem because the browsers presume only a single conversation right now, so a second \n" +
    "  conversation could be pushed and replace the textarea.  TODO: \n";
exports.q3 = "# What would I change in the challenge?\n" +
    "* I don't believe this is a 6-8 hour challenge. It's at a minimum 2-3 days. It needs to be shortened, folks \n" +
    "  shouldn't have to invest this much time in an interview.\n" +
    "  - could shorten the challenge by providing either the backend or frontend as a done piece of code that the \n" +
    "    developer would use to complete the part of the challenge we are interested in seeing their skills sets in - that \n" +
    "    way they only have to provide 1/2 the challenge.\n" +
    "* Need to update the API - provide the full thing too.\n" +
    "  - /login\n" +
    "  - conversations need names/titles\n" +
    "  - /users\n" +
    "  - better explanations on origins vs mutations.\n" +
    "  - better explanation on authorization and how user tracking occurs  \n" +
    "* possibly provide a running database, or schema at least, to be used.  Again, depends on what skills we are seeking\n" +
    "* Why is the client/web responsible for sending /mutations to the server not only the client's origin, but other client's (bob) origins.  This seems fraught for potential errors\n" +
    "  \n" +
    "\n";

exports.dataDir = __dirname + '/data';