const { ConversationPeer } = require( '../models/ConversationPeer' );
const { Conversation } = require( '../models/Conversation' );
const { UserPeer } = require( '../models/UserPeer' );

const sFunc = __filename + '-->';

const express = require( 'express' );
const bp = require( 'body-parser' );
const cors = require( 'cors' );
const config = require( '../config' );

const app = express();

global.mysql = require( 'mysql' );
global.dbConnection = mysql.createConnection( {
                                                  host : 'localhost',
                                                  port : 3389,
                                                  user : 'user',
                                                  password : 'Password01!',
                                                  database : 'collab_editing_poc_server_db',
                                              } );

dbConnection.connect( ( err ) => {
    if ( err ) {
        console.log( 'err', err );
        throw err;
    }

    console.log( 'Connected to database' );
} );

// global.mysql = require( 'mysql2/promise' );

// ****************************************************************************************************************
// ****************************************************************************************************************
// ****************************************************************************************************************

const WebSocketServer = require( 'websocket' );
const http = require( 'http' );

const server = http.createServer( ( req, res ) => {
    const sFunc = sFunc + '.http.createServer()-->';

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

wsServer.on( 'connection', function( connection ) {
    const sFunc = sFunc + '.wsServer.on(connection) -->';
    //console.log( sFunc + 'Connection' );

    const connectionID = getUniqueID();
    console.log( sFunc + 'wsServer connected to browser on connectionID', connectionID );

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
    debug && console.log( sFunc + 'connected: ' + tempID ); //, 'connection', connection );// + Object.getOwnPropertyNames( clients ) );

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

function sendConversationUpdate( con ) {
    const sFunc = 'server.js.sendConversationUpdate( con )-->';
    const debug = true;

    debug && console.log( sFunc + 'client.length', clients.length );

    clients.forEach( ( c ) => {
        let toSend = {
            id : con.id,
            lastMutation : con.lastMutation,
            content : con.getContent(),
        };

        debug && console.log( sFunc + 'sending con to ', c.id, 'toSend', toSend );

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
    const sFunc = 'app.get()  /info-->';

    let userShortName = req.get( 'Authorization' );

    console.log( sFunc + 'userShortName', userShortName );

    UserPeer.findOne( { SHORT_NAME : userShortName } )
            .then( ( user ) => {
                let t = {
                    'ok' : true,
                    'author' : {
                        'email' : user.email,
                        'name' : user.name,
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
                };

                console.log( sFunc + 'returning', t );

                res.json( t );

            } );

} );

app.get( '/conversations', ( req, res ) => {
    const sFunc = 'app.get()  /conversations  -->';
    const debug = true;

    console.log( sFunc + 'req.path', req.path );

    ConversationPeer.find()
                    .then( ( aCons ) => {
                        let aRetConInfos = aCons.map( ( con ) => {
                            let t = {
                                id : con.ID,
                                lastMutation : con.lastMutation,
                                text : con.getContent(),
                            };

                            return ( t );
                        } );

                        const oRet = {
                            conversations : aRetConInfos,
                            msg : '',
                            ok : true,
                        };

                        debug && console.log( sFunc + 'oRet', oRet );

                        res.send( oRet );
                    } );

} );

app.get( '/conversations/:conversationId', ( req, res ) => {
    const { conversationId } = req.params;

    const sFunc = `app.get()  /cons/${conversationId}  -->`;
    const debug = true;

    debug && console.log( sFunc + 'conversationId', conversationId );

    ConversationPeer.findOne( conversationId )
                    .then( ( con ) => {
                        debug && console.log( sFunc + 'con', con );

                        if ( con ) {
                            let t = {
                                id : con.ID,
                                lastMutation : con.lastMutation,
                                text : con.getContent(),
                            };
                            debug && console.log( sFunc + 'returning ', t );
                            res.send( t );
                        }
                        else {
                            res.status( 404 );
                            res.send();
                        }
                    } )
                    .catch( ( e ) => {
                        console.log( sFunc + 'e', e );
                        res.status( 404 );
                        res.send();
                    } );

} );

app.post( '/conversations/', ( req, res ) => {
    const sFunc = 'server.js.app.post(/cons)   /conversations/-->';

    let Con = new Conversation();

    Con.content = '';

    Con.save()
       .then( ( ret ) => {
           console.log( sFunc + 'ret', ret );

           const t = {
               ID : ret.ID,
           };
           res.send( t );
       } )
       .catch( ( e ) => {
           console.log( sFunc + 'e', e );
       } );

} );

app.post( '/mutations', ( req, res ) => {
    const sFunc = `app.post()  /mutations/  -->`;
    const debug = true;

    const author = req.get( 'Authorization' );
    debug && console.log( sFunc + 'author', author );

    debug && console.log( sFunc + 'req.body ', req.body );

    let conversationId = req.body.conversationId;

    // validate "type"

    let validTypes = [ 'INS', 'DEL' ];
    let type = req.body.data.type;
    if ( !validTypes.includes( type ) ) {
        res.status( 404 ); // todo:  wrong code
        res.send( 'Type must be either INS or DEL' );
    }

    ConversationPeer.findOne( conversationId )
                    .then( ( conversation ) => {
                        debug && console.log( sFunc + ' findOne', conversation );

                        if ( conversation ) {
                            const { data, origin : originBlock } = req.body;
                            const { index, length, text, type } = data;

                            let origin = '(';
                            Object.getOwnPropertyNames( originBlock ).forEach( ( k ) => {
                                origin += originBlock[k] + ', ';
                            } );
                            origin = origin.splice( -2, '', 2 ) + ')';
                            console.log( sFunc + 'origin', origin );

                            conversation.applyMutation( origin, type, index, length, text, author )
                                        .then( ( bResult ) => {

                                            if ( bResult ) {
                                                const body = {
                                                    msg : '',
                                                    'ok' : true,
                                                    'text' : conversation.getContent(),
                                                };
                                                res.send( body );
                                            }
                                            else {

                                            }

                                        } )
                                        .catch( ( e ) => {
                                            console.log( sFunc + 'e1', e );
                                            res.status( 404 );
                                            res.send();
                                        } );

                        }
                        else {
                            res.status( 404 );
                            res.send();
                        }
                    } )
                    .catch( ( e ) => {
                        console.log( sFunc + 'e2', e );
                        res.status( 404 );
                        res.send();
                    } );

} );

app.use( ( req, res, next ) => {
    const sFunc = 'server.js.app.use()--> ';
    const token = req.get( 'Authorization' );

    if ( token ) {
        req.token = token;

        console.log( sFunc + 'author', token );

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
