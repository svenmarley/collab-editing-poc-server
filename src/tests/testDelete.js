const { apiSend, gHeaders } = require( './shared' );

function deleteConversation( convId ) {
    let sFunc = 'deleteConversation-->';
    const debug = true;

    return new Promise( ( respond, /*reject*/ ) => {

        debug && console.log( sFunc + 'convId' );

        gHeaders.Authorization = 'bob';
        let options = {
            method : 'DELETE',
            headers : gHeaders,
        };
        // creating a new doc
        apiSend( '/conversations/' + convId, options )
            .then( ( results ) => {
                sFunc += '.DELETE /conversations-->';

                // console.log( sFunc + 'results', results );

                if ( results.status === 204 )
                    respond( "Conversation deleted" );
                else
                    respond( { statusCode: results.status } );
            } );
    } );
}

module.exports = { deleteConversation };