const { apiSend, gHeaders } = require( './shared' );
const { sendMutation } = require( './testMutation' );

function sendMutation2() {

    return new Promise( ( respond, reject ) => {
        sendMutation()
            .then( result => {
                let sFunc = 'after 4th Mutation';
                console.log( sFunc + 'from testMutation 1 returned', result );
                gHeaders.Authorization = 'bob';
                let newDocID = 1;

                let tBody = {
                    'author' : gHeaders.Authorization,
                    'conversationId' : newDocID,
                    'data' : {
                        'index' : 12,
                        'length' : 4,
                        'text' : '',
                        'type' : 'del',
                    },
                    'origin' : {
                        'alice' : 0,
                        'bob' : 4,
                    },
                };
                let options = {
                    method : 'POST',
                    body : JSON.stringify( tBody ),
                    headers : gHeaders,
                };

                apiSend( '/mutations', options )
                    .then( ( results ) => {
                        sFunc = '5th mutation-->';
                        console.log( sFunc + 'tBody', tBody, 'results', results );

                        tBody.data.index = 12;
                        tBody.data.length = 5
                        tBody.data.text = ' blue'
                        tBody.data.type = 'INS';
                        tBody.origin.bob++;
                        options.body = JSON.stringify( tBody )

                        apiSend( '/mutations', options )
                            .then( ( results ) => {
                                sFunc = '6th mutation-->';

                                const tText = 'The house is blue';
                                const tOrigin = '(0,6)';

                                console.log( sFunc +
                                                 `expected text' [${tText}] received [${results.text}] expected origin [${tOrigin}] received [${results.origin}]` );
                                if ( ( tText !== results.text ) || ( tOrigin !== results.origin ) ) {
                                    console.log( 'ERROR: didnt match' );
                                    reject( 'didnt match' );
                                }
                                else
                                    console.log( 'SUCCESS' );


                                respond( {ok: true })
                            } );
                    });
            } );

    } );
}

module.exports = { sendMutation2 };
