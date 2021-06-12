const fetch = require( 'node-fetch' );
const config = require( '../config' );

const gHeaders = {
    'Accept' : 'application/json',
    'Content-Type': 'application/json',
    'Authorization' : 'alice',
};

function apiSend( path, sendOptions ) {
    const sFunc = 'apiSend()-->';
    const debug = false;

    debug && console.log( sFunc + 'path', path );

    const newPath = config.apiServerPath + path

    if ( typeof( sendOptions.headers ) === 'undefined' )
        sendOptions = { headers: sendOptions }

    return new Promise( ( respond /* reject*/ ) => {
        fetch( newPath, sendOptions )
            .then( res => res.json() )
            .then( body => {
                respond( body );
            } );
    } );
}

module.exports = { apiSend, gHeaders };

