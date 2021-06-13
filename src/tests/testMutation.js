const { apiSend, gHeaders } = require( './shared' );

function sendMutation() {

    return new Promise( ( respond, reject ) => {
        gHeaders.Authorization = 'bob';
        apiSend( '/resetDb', gHeaders )
            .then( body => {
                       let sFunc = 'sendMutation()-->apiSend().then()';
                       console.log( '/resetDb', body );

                       gHeaders.Authorization = 'bob';
                       let options = {
                           method : 'POST',
                           body : null,     // create empty conversation
                           headers : gHeaders,
                       };
                       // creating a new doc
                       apiSend( '/conversations', options )
                           .then( (results ) => {
                               sFunc += '.POST /conversations-->';

                               console.log( sFunc + 'results', results );

                               const newDocID = results.ID;

                               options.method = 'GET';
                               apiSend( '/conversations/' + newDocID, options )
                                   .then( (results ) => {
                                       sFunc += '/conv  '
                                       console.log( sFunc + 'results', results );

                                       // again, as bob
                                       let tBody = {
                                           'author' : gHeaders.Authorization,
                                           'conversationId' : newDocID,
                                           'data' : {
                                               'index' : 0,
                                               'length' : 3,
                                               'text' : 'The',
                                               'type' : 'ins',
                                           },
                                           'origin' : {
                                               'alice' : 0,
                                               'bob' : 0,
                                           },
                                       };

                                       options = {
                                           method : 'POST',
                                           body : JSON.stringify( tBody ),
                                           headers : gHeaders,
                                       };

                                       apiSend( '/mutations', options )
                                           .then( (results) => {
                                               sFunc = '1st mutation-->';
                                               console.log( sFunc + 'tBody', tBody, 'results', results );

                                               // again as bob
                                               tBody.data.index = 3;
                                               tBody.data.length = 6
                                               tBody.data.text = ' house'
                                               tBody.origin.bob++;
                                               options.body = JSON.stringify( tBody )

                                               apiSend( '/mutations', options )
                                                   .then( (results) => {
                                                       sFunc = 'after 2nd mutation-->';
                                                       console.log( sFunc + 'tBody', tBody, 'results', results );

                                                       tBody.data.index = 9;
                                                       tBody.data.length = 3
                                                       tBody.data.text = ' is'
                                                       tBody.origin.bob++;
                                                       options.body = JSON.stringify( tBody )

                                                       apiSend( '/mutations', options )
                                                           .then( (results) => {
                                                               sFunc = 'after 3rd mutation-->';
                                                               console.log( sFunc + 'tBody', tBody, 'results', results );

                                                               tBody.data.index = 12;
                                                               tBody.data.length = 4
                                                               tBody.data.text = ' red'
                                                               tBody.origin.bob++;
                                                               options.body = JSON.stringify( tBody )

                                                               apiSend( '/mutations', options )
                                                                   .then( (results) => {
                                                                       sFunc = 'after 4th mutation-->';
                                                                       console.log( sFunc + 'tBody', tBody, 'results', results );

                                                                       const tText = 'The house is red';
                                                                       const tOrigin = '(0,4)';

                                                                       console.log( sFunc +
                                                                                        `expected text' [${tText}] received [${results.text}] expected origin [${tOrigin}] received [${results.origin}]` );
                                                                       if ( ( tText !== results.text ) || ( tOrigin !== results.origin ) ) {
                                                                           console.log( 'ERROR: didnt match' );
                                                                           reject( 'didnt match' );
                                                                       }
                                                                       else
                                                                           console.log( 'SUCCESS' );


                                                                       respond( {ok: true })
                                                                   });
                                                           });

                                                   });

                                           })


                                   })

                           })
                           .catch( (e) => {
                               console.log( sFunc + 'error', e );

                               reject( { 'msg' : e } )
                           })

                       // let tBody = {
                       //     'author' : 'bob',
                       //     'conversationId' : 1,
                       //     'data' : {
                       //         'index' : 13,
                       //         'length' : 4,
                       //         'text' : '',
                       //         'type' : 'del',
                       //     },
                       //     'origin' : {
                       //         'alice' : 0,
                       //         'bob' : 1,
                       //     },
                       //
                       // };
                       //
                       // options = {
                       //     method : 'POST',
                       //     body : JSON.stringify( tBody ),
                       //     headers : gHeaders,
                       // };
                       // apiSend( '/mutations', options )
                       //     .then( ( result ) => {
                       //         sFunc += '.apiSend().then()-->';
                       //
                       //         console.log( 'POST /mutations  => result', result );
                       //
                       //         if ( result.text !== 'The house is ' ) {
                       //             console.log( 'ERROR:  Returned text didn\'t match' );
                       //             reject( 1 );
                       //         }
                       //
                       //         tBody.origin.bob = 2;
                       //         tBody.data.index = 13;
                       //         tBody.data.text = 'blue';
                       //         tBody.data.type = 'ins';
                       //
                       //         let options = {
                       //             method : 'POST',
                       //             body : JSON.stringify( tBody ),
                       //             headers : gHeaders,
                       //         };
                       //         apiSend( '/mutations', options )
                       //             .then( ( result ) => {
                       //                 console.log( '2nd POST /mutations  => result', result );
                       //
                       //                 const tText = 'The house is blue';
                       //                 const tOrigin = '(0,3)';
                       //                 if ( ( result.text !== tText ) && ( result.origin === tOrigin ) ) {
                       //                     console.log( 'ERROR: returned text', result.text, 'didnt match', tText, 'received origin', result.origin,
                       //                                  'expected origin', tOrigin );
                       //                     reject( 1 );
                       //                 }
                       //                 console.log( 'SUCCESS:  Text has been mutated correctly - expected', tText, 'got', result.text, 'received' +
                       //                     ' origin', result.origin, 'expected origin', tOrigin );
                       //                 respond( true );
                       //             } );
                       //     } )
                       //     .catch( ( e ) => {
                       //         sFunc += '.catch()-->';
                       //         console.log( sFunc + 'e', e );
                       //     } );

                   },
            );
    } );
}

module.exports = { sendMutation };