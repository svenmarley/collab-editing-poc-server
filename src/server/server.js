const DocPeer = require( './DocPeer' ).DocPeer;

const sFunc = 'server.js-->';
const Data = require( './Data' ).Data;

const express = require( 'express' );
const bp = require( 'body-parser' );
const cors = require( 'cors' );
const config = require( '../config' );

const app = express();

global.dataConfig = new Data();
dataConfig.setConfig( config.dataDir );

dataConfig.readDocsConfig();
console.log( sFunc + 'gDataConfig.store.currDocsConfig ', dataConfig.store.currDocsConfig );

// ****************************************************************************************************************
// ****************************************************************************************************************
// ****************************************************************************************************************

const WebSocketServer = require( 'websocket' );
const http = require( 'http' );

const server = http.createServer( ( req, res ) => {
    const sFunc = 'server.js.http.createServer()-->';

    console.log( sFunc + 'Received req for ' + req.url );
    res.writeHead( 404 );
    res.end();
} );

server.listen( config.msgServerPort, () => {
    console.log( 'Starting web socket server on port', config.msgServerPort );
} );

const wsServer = new WebSocketServer.server( {
                                                 httpServer : server,

                                             } );

function originIsAllowed( origin ) {
    return true;
}

wsServer.on( 'connection', function( connection ) {
    const sFunc = 'server.js.wsServer.on(connection) -->';
    console.log( sFunc + 'Connection' );

    const connectionID = getUniqueID();
    clients[connectionID] = connection;
} );

let clients = [];
let x = 0;
wsServer.on( 'request', function( request ) {
    const sFunc = 'wsServer.on(\'request\')-->';
    const debug = true;

    debug && console.log( sFunc + 'inside' );
    const tempID = getUniqueID();
    debug && console.log( sFunc + 'Received a new connection from origin ' + request.origin + '.' );
    // You can rewrite this part of the code to accept only the requests from allowed origin
    const connection = request.accept( null, request.origin );
    connection.id = tempID;
    clients.push( connection );
    debug && console.log( sFunc + 'connected: ' + tempID, 'connection', connection );// + Object.getOwnPropertyNames( clients ) );

    connection.on( 'message', function( message ) {
        const sFunc = 'wsServer. connection.on()-->';
        debug && console.log( sFunc + 'Message received: ', message.utf8Data );
        const m = JSON.parse( message.utf8Data );
        debug && console.log( sFunc + 'test', m.value );

        if ( !( ++x % 9 ) ) {
            // send something up every X chars

            x = 0;
            connection.send( JSON.stringify( {
                                                 type : 'fileUpdate',
                                                 author : 'bob',
                                                 value : m.value + '#',
                                             } ) );
        }

    } );

} );

function sendDocUpdate( doc ) {
    const sFunc = 'server.js.sendDocUpdate( doc )-->';
    const debug = true;

    debug && console.log( sFunc + 'here  client size', clients.length );

    clients.forEach( ( c ) => {
        let toSend = {
            id : doc.name,
            lastMutation : doc.lastMutation,
            content : doc.getContent(),
        };

        debug && console.log( sFunc + 'sending doc to ', c.id, 'toSend', toSend );

        c.send( JSON.stringify( toSend ) );
    } );
}

// *********************************************************************************************************
// *********************************************************************************************************
// *********************************************************************************************************

app.use( express.static( 'public' ) );
app.use( bp.json() );
app.use( bp.urlencoded( { extended : true } ) );
app.use( cors() );
//app.disable( 'etag' );        // disables caching


console.log( 'starting API Server' );

app.get( '/ping', ( req, res ) => {
    console.log( req.path );

    res.json( { 'ok' : true, 'msg' : 'pong' } );
} );

app.get( '/info', ( req, res ) => {
    const sFunc = 'app.get()  /info';

    console.log( sFunc + 'path', req.path );
    res.json(
        {
            'ok' : true,
            'author' : {
                'email' : config.authorEmail,
                'name' : config.authorName,
            },
            'frontend' : {
                'url' : config.webURL,
            },
            'language' : 'node.js',
            'sources' : config.githubURL,
            'answers' : {
                '1' : config.q1,
                '2' : config.q2,
                '3' : config.q3,
            },
        },
    );

} );

app.get( '/conversations', ( req, res ) => {
    const sFunc = 'app.get()  /conversations  -->';
    const debug = true;

    console.log( sFunc + 'req.path', req.path );

    let aDocs = DocPeer.find( '', 'EVERYTHING' );

    let aRetDocInfos = aDocs.map( ( doc ) => {
        let t = {
            id : doc.name,
            lastMutation : doc.lastMutation,
            text : doc.getContent(),
        };

        return ( t );
    } );

    const oRet = {
        'conversations' : aRetDocInfos,
        msg : '',
        ok : true,
    };

    debug && console.log( sFunc + 'oRet', oRet );

    res.send( oRet );

} );

app.get( '/docs/:docId', ( req, res ) => {
    const { docId } = req.params;

    const sFunc = `app.get()  /docs/${docId}  -->`;
    const debug = true;

    debug && console.log( sFunc + 'docId', docId, 'req.body', req.body );

    let doc = DocPeer.findOne( docId );

    debug && console.log( sFunc + 'doc', doc );

    let t;
    if ( doc ) {
        t = {
            id : doc.name,
            lastMutation : doc.lastMutation,
            text : doc.getContent(),
        };
        debug && console.log( sFunc + 'returning ', t );
        res.send( t );
    }
    else {
        res.status( 404 );
        res.send();
    }

} );

app.post( '/mutations/:docId', ( req, res ) => {
    const { docId } = req.params;
    const sFunc = `app.post() /mutations/${docId}  -->`;

    const token = req.get( 'Authorization' );

    if ( token ) {
        req.token = token;

        console.log( sFunc + 'author', token );
        dataConfig.setAuthor( token );
    }

    console.log( sFunc + ' req.body', req.body );

    const doc = DocPeer.findOne( docId );
    console.log( sFunc + 'findOne', doc );

    if ( doc ) {
        const { data, authorsCurrMutation } = req.body;
        const { index, length, text, type } = data;

        if ( type === 'insert' ) {
            doc.insert( index, text, length );
        } else if ( type === 'delete' ) {
            doc.delete( index, length );
        }

        const body = {
            msg : '',
            'ok' : true,
            'text' : doc.getContent(),
        };
        res.send( body );

        sendDocUpdate( doc );

        doc.writeDoc();

    }
    else {
        res.status( 404 );
        res.send();
    }

} );

app.use( ( req, res, next ) => {
    const sFunc = 'server.js.app.use()--> ';
    const token = req.get( 'Authorization' );

    if ( token ) {
        req.token = token;

        console.log( sFunc + 'author', token );
        dataConfig.setAuthor( token );

        next();
    }
    else {
        res.status( 403 ).send( {
                                    error : 'Please provide an Authorization header to identify yourself (can be whatever you want)',
                                } );
    }
} );

// app.get( '/contacts', ( req, res ) => {
//     res.send( contacts.get( req.token ) );
// } );
//
// app.delete( '/contacts/:id', ( req, res ) => {
//     res.send( contacts.remove( req.token, req.params.id ) );
// } );
//
// app.post( '/contacts', bodyParser.json(), ( req, res ) => {
//     const { name, handle } = req.body;
//
//     if ( name && handle ) {
//         res.send( contacts.add( req.token, req.body ) );
//     }
//     else {
//         res.status( 403 ).send( {
//                                     error : 'Please provide both a name and a handle',
//                                 } );
//     }
// } );

app.listen( config.apiServerPort, () => {
    console.log( 'Server listening on port %s, Ctrl+C to stop', config.apiServerPort );
} );

console.log( 'API server running on port ', config.apiServerPort );

// This code generates unique userid for every user.
const getUniqueID = () => {
    const s4 = () => Math.floor( ( 1 + Math.random() ) * 0x10000 ).toString( 16 ).substring( 1 );
    return s4() + s4() + '-' + s4();
};
