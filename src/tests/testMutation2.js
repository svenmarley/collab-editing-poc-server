
const { apiSend, gHeaders } = require( './shared' );
const { sendMutation } = require( './testMutation' );

function sendMutation2() {

    return new Promise( ( respond, /*reject*/ ) => {
    sendMutation()
        .then( e => {
            console.log( 'sendMutation returned', e );

                let tBody = {
                    'author' : 'alice',
                    'conversationId' : 1,
                    'data' : {
                        'index' : 0,
                        'length' : 1,
                        'text' : 'X',
                        'type' : 'ins',
                    },
                    'origin' : {
                        'alice' : 2,
                        'bob' : 1,
                    },

                };

                let options = {
                    method : 'POST',
                    body : JSON.stringify( tBody ),
                    headers : gHeaders,
                };
                apiSend( '/mutations', options )
                    .then( ( result ) => {
                        console.log( 'POST /mutations  => result', result );

                        if ( result.text !== 'Xello world' ) {
                            console.log( 'ERROR:  Returned text didn\'t match' );
                            respond( 1 );
                        }
                        else
                        {
                            console.log( 'SUCCESS:  returned text matched', result.text )
                        }

                    } );
            } );
        } );

}

module.exports = { sendMutation2 };
