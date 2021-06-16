const fetch = require( 'node-fetch' );
const config = require( '../config' );

const gHeaders = {
    'Accept' : 'application/json',
    'Content-Type' : 'application/json',
};

function apiSend( path, sendOptions ) {
    let sFunc = 'apiSend()-->';
    const debug = true;


    const newPath = config.apiServerPath + path;

    if ( typeof ( sendOptions.headers ) === 'undefined' )
        sendOptions = { headers : sendOptions };

    debug && console.log( sFunc + 'path', newPath, 'options', sendOptions );

    return new Promise( ( respond /* reject*/ ) => {
        fetch( newPath, sendOptions )
            .then( res => {
                debug && console.log( sFunc + 'res', res );
                if ( res.size )
                    return res.json()

                return res;
            } )
            .then( body => {
                respond( body );
            } );
    } );
}

function breakMutation( inMutation ) {
    const sFunc = 'breakMutation()-->';
    const debug = false;

    // alice (2,6)INS 3:' big'
    // bob (1,1)DEL 3:2

    let length;
    let text = '';
    let x = inMutation.indexOf( ' ' );
    let author = inMutation.substring( 0, x ).trim();
    let y = inMutation.indexOf( ')' );
    let origin = inMutation.substring( x + 1, y + 1 );
    let type = inMutation.substring( y + 1, y + 4 );
    let z = inMutation.indexOf( ':' );
    let index = inMutation.substring( y + 6, z - 1 );
    if ( type === 'DEL' ) {
        length = inMutation.substring( z + 1 );
    }
    else {
        text = inMutation.substring( z + 2 ).splice( -1, '', 1 );
        length = text.length;
    }

    debug && console.log( sFunc + `returning: inMutation[${inMutation}] => author[${author}] origin[${origin}] type[${type}] index[${index}] length[${length}] text[${text}]` );

    return ( { author, origin, type, index, length, text } );
}

String.prototype.splice = function( offset, text, removeCount = 0 ) {
    let calculatedOffset = offset < 0 ? this.length + offset : offset;
    return this.substring( 0, calculatedOffset ) +
        text + this.substring( calculatedOffset + removeCount );
};

module.exports = { apiSend, gHeaders, breakMutation };


