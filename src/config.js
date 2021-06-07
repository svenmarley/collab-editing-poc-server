exports.webPort = process.env.UI_PORT || 3000;
exports.webURL = process.env.UI_PATH || `http://127.0.0.1:${exports.webPort}`;

exports.msgServerPort = process.env.PORT || exports.webPort + 1;
exports.msgServerPath = process.env.ORIGIN || `ws:127.0.0.1:${exports.msgServerPort}`;

exports.apiServerPort = process.env.PORT || exports.webPort + 2;
exports.apiServerPath = process.env.ORIGIN || `http://127.0.0.1:${exports.apiServerPort}`;

exports.githubURL = 'https://github.com/svenmarley/collab-editing-poc';
exports.authorName = 'Mike Anderson';
exports.authorEmail = 'mike.anderson@checkone.com';

exports.q1 = '1';
exports.q2 = '2';
exports.q3 = '3';

exports.dataDir = __dirname + '/data';