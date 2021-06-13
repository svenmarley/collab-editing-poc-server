const { apiSend, gHeaders } = require( './shared' );
const { sendMutation2 } = require( './testMutation2' );

function sendMutation3() {

    return new Promise( ( respond, /*reject*/ ) => {
        sendMutation2()
            .then( result => {
                let sFunc = 'after Mutation2';
                console.log( sFunc + 'from testMutation 2 returned', result );
                gHeaders.Authorization = 'alice';
                let newDocID = 1;

                let tBody = {
                    'author' : gHeaders.Authorization,
                    'conversationId' : newDocID,
                    'data' : {
                        'index' : 13,
                        'length' : 4,
                        'text' : '',
                        'type' : 'del',     // deleting ' red'
                    },
                    'origin' : {
                        'alice' : 0,
                        'bob' : 6,
                    },
                };
                let options = {
                    method : 'POST',
                    body : JSON.stringify( tBody ),
                    headers : gHeaders,
                };

                apiSend( '/mutations', options )
                    .then( ( results ) => {
                        sFunc = 'after 1st mutation-->';
                        console.log( sFunc + 'tBody', tBody, 'results', results );

                        // also as alice
                        tBody.data.index = 13;
                        tBody.data.length = 5
                        tBody.data.text = 'green'
                        tBody.data.type = 'INS';
                        tBody.origin.alice++;
                        options.body = JSON.stringify( tBody )

                        apiSend( '/mutations', options )
                            .then( ( results ) => {
                                sFunc = 'after 2nd mutation-->';

                                const tText = 'The house is green';
                                const tOrigin = '(2,6)';

                                console.log( sFunc +
                                                 `expected text' [${tText}] received [${results.text}] expected origin [${tOrigin}] received [${results.origin}]` );
                                if ( ( tText !== results.text ) || ( tOrigin !== results.origin ) ) {
                                    console.log( 'ERROR: didnt match' );
                                }
                                else
                                    console.log( 'SUCCESS' );

                                respond( {ok: true })
                            } );
                    });
            } );

    } );
}

module.exports = { sendMutation3 };
