// saf
const { UserPeer } = require( './UserPeer' );
const { MutationPeer } = require( './MutationPeer' );

class Mutation {
    #sFunc = 'Mutation';
    ID = null;
    conversationId = null;
    userId = null;
    origin = null;    // todo: all should be made private
    mutation = null;
    auditDateTime = null;
    className = 'Mutation';

    constructor( inConversationId, inAuthor, inOrigin, inMutation ) {
        const sFunc = this.#sFunc + '.constructor()-->';
        const debug = true;

        this.conversationId = inConversationId;
        this.origin = inOrigin;
        this.mutation = inMutation;

        if ( typeof ( inAuthor ) === 'string' ) {
            let user = UserPeer.getUser( inAuthor );
            debug && console.log( sFunc + 'inAuthor', inAuthor, 'user', user );
            this.userId = user.id;
        }
        else {
            this.userId = inAuthor;
        }

    }

    toString() {
        return `ID[${this.ID}] conversationId[${this.conversationId}] origin[${this.origin}] mutation[${this.mutation}]`;
    }

    save() {
        let sFunc = this.#sFunc + '.save( )-->';
        const debug = true;

        debug && console.log( sFunc + 'this.mutation', this.toString() );

        return new Promise( ( respond, reject ) => {

            let sQuery = '';
            let vars = [];
            MutationPeer.findOne( this )
                        .then( ( mut ) => {
                            sFunc += '.MutationPeer.findOne().then()-->';
                            debug && console.log( sFunc + 'returned mut', mut );

                            if ( mut ) {
                                // updating old rec
                                vars = [ this.conversationId, this.origin, this.mutation, this.ID ];
                                sQuery = 'UPDATE tblMUTATIONS set CONVERSATION_ID = ?, ORIGIN = ?, MUTATION = ? where ID = ? ';
                                let go = dbConnection.query( sQuery, vars, ( err, rows ) => {
                                    debug && console.log( sFunc + 'err', err, 'rows', rows );
                                } );
                                console.log( sFunc + 'sql', go.sql );

                                respond( true );
                            }
                            else {
                                // inserting new rec
                                sQuery = 'INSERT INTO tblMUTATIONS SET ?';
                                vars = {
                                    CONVERSATION_ID : this.conversationId,
                                    ORIGIN : this.origin,
                                    MUTATION : this.mutation,
                                    USER_ID : this.userId,
                                };
                                let go = dbConnection.query( sQuery, vars, ( err, results ) => {
                                    debug && console.log( sFunc + 'err', err, 'results', results );

                                    if ( results.affectedRows === 1 ) {
                                        this.ID = results.insertId;
                                        respond( { ID : this.ID } );
                                    }
                                    console.log( sFunc + 'sql', go.sql );
                                } );
                            }

                        } )
                        .catch( ( e ) => {
                            console.log( sFunc + 'errX', e );
                            reject( 'Record not updated' );

                        } );
        } );

    }
}

module.exports = { Mutation };