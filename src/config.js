const fs = require( 'fs' );

let apiHost;
if ( fs.existsSync( process.cwd() + '/temp.log' ) ) {
    apiHost = '127.0.0.1/';
    exports.DB_SERVER = 'localhost';
    exports.DB_PORT = 3389;
    exports.DB_USERNAME = 'user';
    exports.DB_PASSWORD = `Password01!`;
    exports.DB_DATABASE = 'collab_editing_poc_server_db';
    exports.webPort = 3000; //process.env.UI_PORT || 3000;
    exports.apiServerPort = exports.webPort + 2; //process.env.PORT || exports.webPort + 2;

}
else {
    apiHost = 'floating-hamlet-81896.herokuapp.com/';
    exports.DB_SERVER = 'u3r5w4ayhxzdrw87.cbetxkdyhwsb.us-east-1.rds.amazonaws.com';
    exports.DB_PORT = 3306;
    exports.DB_USERNAME = 'w9tvz0v7owbqkdgd';
    exports.DB_PASSWORD = 'txgukn5y06hd1k0p';
    exports.DB_DATABASE = 'n9cmqi0btiolj9xe';

}
exports.apiServerPort = process.env.PORT || exports.webPort + 2;
exports.msgServerPort = process.env.PORT || exports.webPort + 1; //process.env.PORT || exports.webPort + 1;

exports.webURL = process.env.UI_PATH || `http://${apiHost}:${exports.webPort}`;

exports.msgServerPath = process.env.ORIGIN || `ws:${apiHost}:${exports.msgServerPort}`;

exports.apiServerPath = process.env.ORIGIN || `http://${apiHost}:${exports.apiServerPort}`;
exports.apiServerPathRaw = process.env.ORIGIN || `http://${apiHost}`;

exports.githubURL = 'https://github.com/svenmarley/collab-editing-poc';
exports.authorName = 'Mike Anderson';
exports.authorEmail = 'mike.anderson@checkone.com';

exports.q1 = '1';
exports.q2 = '2';
exports.q3 = '3';

exports.dataDir = __dirname + '/data';