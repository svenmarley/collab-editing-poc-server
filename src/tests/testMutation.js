//
const { apiSend, gHeaders } = require( './shared' );


function sendMutation() {

    return new Promise( ( respond, reject ) => {
        apiSend( '/resetDb', gHeaders )
            .then( body => {
                       console.log( '/resetDb', body );

                       let tBody = {
                           'author' : 'alice',
                           'conversationId' : 1,
                           'data' : {
                               'index' : 0,
                               'length' : 1,
                               'text' : 'X',
                               'type' : 'del',
                           },
                           'origin' : {
                               'alice' : 1,
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

                               if ( result.text !== 'ello world' ) {
                                   console.log( 'ERROR:  Returned text didn\'t match' );
                                   reject( 1 );
                               }

                               respond( true );
                           } );

                   },
            );
    } );
}



module.exports = { sendMutation };