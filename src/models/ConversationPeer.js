const { Conversation } = require( './Conversation' );

class ConversationPeer {

    static findOne( searchFileId = '' ) {
        const sFunc = 'ConversationPeer.findOne()--> ';
        const debug = false;

        return new Promise( ( respond, /*reject*/ ) => {
            ConversationPeer.find( searchFileId )
                            .then( ( aConversations ) => {
                                debug &&
                                console.log( sFunc + 'isArray(aConversations)', Array.isArray( aConversations ), 'aConversations', aConversations );
                                respond( aConversations.length ? aConversations[0] : null );
                            } )
                            .catch( ( e ) => {
                                console.log( sFunc + 'e', e );
                            } );

        } );

    }

    static find( searchFileId = '%' ) {
        const sFunc = 'ConversationPeer::find()-->';
        const debug = false;

        let query = 'SELECT * FROM tblCONVERSATIONS where ID like ?';
        //debug && console.log( sFunc + 'query', query );

        return new Promise( ( respond, /*reject*/ ) => {
            let go = dbConnection.query( query, [ searchFileId ], ( err, rows ) => {
                debug && console.log( sFunc + 'rows ', rows );
                if ( !err ) {
                    let aConversations = [];
                    rows.forEach( ( row ) => {
                        let conversation = new Conversation();

                        conversation.ID = row.ID;
                        conversation.setContent( row.CONTENT );
                        conversation.origin = row.ORIGIN;
                        conversation.lastMutation = row.LAST_MUTATION;

                        debug && console.log( sFunc + 'conversation', conversation );

                        aConversations.push( conversation );

                    } );
                    debug && console.log( sFunc + 'returning', aConversations );
                    respond( aConversations );
                }
                debug && console.log( sFunc + 'sql', go.sql );

            } )
        } );

    }

}

module.exports = { ConversationPeer };