const { apiSend, gHeaders } = require( './shared' );
const { sendMutation4 } = require( './testMutation4' );

function sendMutation5() {

    return new Promise( ( respond, /*reject*/ ) => {
        sendMutation4()
            .then( result => {
                let sFunc = 'after Mutation4';
                console.log( sFunc + 'from testMutation 4 returned', result );

                let newDocID = 1;

                // alice (2,7)INS 3:' very'
                gHeaders.Authorization = 'alice';
                let tBody = {
                    'author' : gHeaders.Authorization,
                    'conversationId' : newDocID,
                    'data' : {
                        'index' : 3,
                        'length' : 5,
                        'text' : ' very',
                        'type' : 'ins',
                    },
                    'origin' : {
                        'alice' : 2,
                        'bob' : 8,
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

                        // here is the test - old origin
                        gHeaders.Authorization = 'bob';

                        // bob (2,7)INS 7:' ugly'
                        tBody.author= gHeaders.Authorization

                        tBody.data.index = 7;
                        tBody.data.length = 5;      //ignored for insert, i think
                        tBody.data.text = ' ugly';
                        tBody.data.type = 'INS';
                        //tBody.origin.alice++;
                        options.body = JSON.stringify( tBody );
                        options.headers = gHeaders;

                        apiSend( '/mutations', options )
                            .then( ( results ) => {
                                sFunc = 'MONEY:  after 3nd mutation-->';
                                console.log( sFunc + 'tBody', tBody, 'results', results );

                                const tText = 'the very big ugly house is green and yellow';
                                const tOrigin = '(2,8)';

                                console.log( sFunc +
                                                 `expected text' [${tText}] received [${results.text}] expected origin [${tOrigin}] received [${results.origin}]` );
                                if ( ( tText !== results.text ) || ( tOrigin !== results.origin ) ) {
                                    console.log( 'ERROR: didnt match' );
                                }
                                else
                                    console.log( 'SUCCESS' );

                                respond( { ok : true } );
                            } );
                    } );

            } );

    } );
}

module.exports = { sendMutation5 };
