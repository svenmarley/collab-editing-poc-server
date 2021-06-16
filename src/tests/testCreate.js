const { apiSend, gHeaders } = require( './shared' );

function createConversation() {
    let sFunc = 'createConversation-->';

    return new Promise( ( respond,/* reject*/ ) => {

        gHeaders.Authorization = 'bob';
        let options = {
            method : 'POST',
            body : null,     // create empty conversation
            headers : gHeaders,
        };
        // creating a new doc
        apiSend( '/conversations', options )
            .then( ( results ) => {
                sFunc += '.POST /conversations-->';

                console.log( sFunc + 'results', results );

                const newDocID = results.ID;

                respond( { ID : newDocID } );
            } );
    } );
}

module.exports = { createConversation };