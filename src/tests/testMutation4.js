const { apiSend, gHeaders } = require( './shared' );
const { sendMutation3 } = require( './testMutation3' );

function sendMutation4() {

    return new Promise( ( respond, /*reject*/ ) => {
        sendMutation3()
            .then( result => {
                let sFunc = 'after Mutation3';
                console.log( sFunc + 'from testMutation 3 returned', result );
                gHeaders.Authorization = 'alice';
                let newDocID = 1;

                let tBody = {
                    'author' : gHeaders.Authorization,
                    'conversationId' : newDocID,
                    'data' : {
                        'index' : 3,
                        'length' : 4,
                        'text' : ' big',
                        'type' : 'ins',
                    },
                    'origin' : {
                        'alice' : 2,
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

                        // reject(1)
                        // return;

                        // here is the test - old origin
                        gHeaders.Authorization = 'bob';

                        tBody.author= gHeaders.Authorization

                        tBody.data.index = 18;
                        tBody.data.length = 11;      //ignored for insert, i think
                        tBody.data.text = ' and yellow';
                        tBody.data.type = 'INS';
                        //tBody.origin.alice++;
                        options.body = JSON.stringify( tBody );
                        options.headers = gHeaders;

                        apiSend( '/mutations', options )
                            .then( ( results ) => {
                                sFunc = 'MONEY:  after 3nd mutation-->';
                                console.log( sFunc + 'tBody', tBody, 'results', results );

                                const tText = 'The big house is green and yellow';
                                const tOrigin = '(3,7)';

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

module.exports = { sendMutation4 };
