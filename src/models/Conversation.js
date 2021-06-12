const { Mutation } = require( './Mutation' );
const { UserPeer } = require( './UserPeer' );

global.aInsertOptions = [ 'ins', 'insert' ];
global.aDeleteOptions = [ 'del', 'delete' ];

class Conversation {
    #sFunc = 'Conversation';
    ID = null;
    content = null;     // todo: all should  be made private
    origin = '(0, 0)';
    lastMutation = null;

    setContent( c ) {
        this.content = c;
    }

    getContent() {
        return ( this.content );
    }

    save() {
        const sFunc = this.#sFunc + '.save( )-->';
        const debug = false;
        const { ConversationPeer } = require( './ConversationPeer' );

        debug && console.log( sFunc + 'thisConversation', this );

        return new Promise( ( respond, reject ) => {

            ConversationPeer.findOne( this.ID )
                            .then( ( conversation ) => {
                                debug && console.log( sFunc + `does conversation for ID [${this.ID}] exist? conversation`, conversation );

                                if ( conversation ) {
                                    // updating old rec
                                    let vars = [ this.getContent(), this.origin, this.lastMutation, this.ID ];
                                    const sQuery = 'UPDATE tblCONVERSATIONS set CONTENT = ?, ORIGIN = ?, LAST_MUTATION = ? where ID = ? ';
                                    let go = dbConnection.query( sQuery, vars, ( err, results ) => {
                                        debug && console.log( sFunc + 'err', err, 'results', results );

                                        let bRet = false;
                                        if ( results.affectedRows >= 1 )
                                            bRet = true;
                                        else
                                            console.log( sFunc + 'ERROR: results', results );
                                        respond( bRet );
                                    } );
                                    debug && console.log( sFunc + 'sql', go.sql );

                                }
                                else {
                                    // inserting new rec
                                    let vars = {
                                        CONTENT : this.getContent(),
                                        ORIGIN : this.origin,
                                        LAST_MUTATION : this.lastMutation,
                                    };

                                    let go = dbConnection.query( 'INSERT INTO tblCONVERSATIONS SET ?', vars, ( err, results ) => {
                                        debug && console.log( sFunc + 'err', err, 'results', results );

                                        if ( results.affectedRows === 1 ) {
                                            this.ID = results.insertId;
                                            respond( { ID : this.ID } );
                                        }

                                        reject( 'Record not updated ' );

                                    } );
                                    debug && console.log( sFunc + 'sql', go.sql );
                                }

                            } )
                            .catch( ( e ) => {
                                console.log( sFunc + 'e', e );
                                reject( null );
                            } );
        } );

    }

    calcNewMutation( inOrigin, inType, inIndex ) { //, inLength, inText, inAuthor ) {

        return { newCalculatedOrigin : inOrigin, newIndex : inIndex };
    }

    applyMutation( inOrigin, inType, inIndex, inLength, inText, inAuthor ) {
        const sFunc = this.#sFunc + '.applyMutation()-->';
        const debug = true;

        return new Promise( ( respond ,reject ) => {

            // figures out what the mutations should be in case there is a "tie"
            // possibly recalculates origin and index

            const { newCalculatedOrigin, newIndex } = this.calcNewMutation( inOrigin, inType, inIndex, inLength, inText, inAuthor );
            debug && console.log( sFunc + 'inOrigin', inOrigin, 'inIndex', inIndex
                , 'newCalculatedOrigin', newCalculatedOrigin, 'newIndex', newIndex );
            this.origin = newCalculatedOrigin;

            // "lastMutation": "alice(11, 2)INS 0:'H'",
            this.lastMutation = this.createMutationText( this.origin, inType, newIndex, inLength, inText, inAuthor );

            // apply the mutation
            let mut = new Mutation( this.ID, inAuthor, this.origin, this.lastMutation );
            debug && console.log( sFunc + 'new mut', mut );
            mut.save()
               .then( ( ret ) => {
                   debug && console.log( sFunc + 'mut.save() returned()', ret );

                   let newContent;

                   if ( isInsert( inType ) ) {
                       newContent = this.content.splice( newIndex, inText );
                   }
                   else {
                       newContent = this.content.splice( newIndex, '', inLength );
                   }
                   if ( debug ) {
                       console.log( sFunc + 'mutation', this.lastMutation );
                       console.log( sFunc + 'oldContent', this.getContent(), 'newContent', newContent );
                   }
                   this.setContent( newContent );

                   this.origin = this.moveOrigin( inAuthor, newCalculatedOrigin );

                   this.save()
                       .then( ( ) => {
                           respond( true );

                       } )
                       .catch( ( e ) => {
                           console.log( sFunc + 'this.save().catch  e', e );
                           reject( e );
                       } );

               } )
               .catch( e => {
                   console.log( sFunc + 'e2', e );
               } );

        } );
    }

    // move the origin
    moveOrigin( author, sentOrigin ) {
        const sFunc = this.#sFunc + '.moveOrigin()-->';
        const debug = true;

        const user = UserPeer.getUser( author );
        // alice = { id: 1, name: 'alice' }
        debug && console.log( sFunc + 'user', user );

        //  (1, 2)  =>  [1, 2]
        let a = sentOrigin.replace( ')', '' ).replace( '(', '' ).split( ',' ).map( ( z ) => {
            return parseInt( z.trim() );
        } );
        debug && console.log( sFunc + 'a', a );

        a[user.id - 1]++;        // increment the right author's index

        let newOrigin = '(' + a.join( ',' ) + ')';
        console.log( sFunc + 'author', author, 'sentOrigin', sentOrigin, 'newOrigin', newOrigin );

        return newOrigin;
    }

    createMutationText( origin, type, index, length, text, author ) {
        // const sFunc = this.#sFunc + '.createMutation()-->';
        // const debug = true;

        let sRet = `${author} ${origin}`;

        const isInsert = aInsertOptions.findIndex( ( o ) => {
            return ( o.toLowerCase() === type.toLowerCase() );
        } );
        if ( isInsert )
            sRet += `INS ${index}:'${text}'`;
        else
            sRet += `DEL ${index}:${length}`;

        return sRet;
    }

    returnBlockToSend(){
        return {
            id : this.ID,
            lastMutation : this.lastMutation,
            origin: this.origin,
            content : this.getContent(),
        };
    }

}

module.exports = { Conversation, isInsert, isDelete };

String.prototype.splice = function( offset, text, removeCount = 0 ) {
    let calculatedOffset = offset < 0 ? this.length + offset : offset;
    return this.substring( 0, calculatedOffset ) +
        text + this.substring( calculatedOffset + removeCount );
};

function isInsert( inType ) {
    const sFunc = 'server.js.isInsert()-->';
    const debug = false;

    debug && console.log( sFunc + 'inType', inType, 'aInsertOptions', aInsertOptions );

    let found = false;
    aInsertOptions.forEach( ( o ) => {
        if ( o.toLowerCase() === inType.toLowerCase() )
            found = true;
    } );

    debug && console.log( sFunc + 'returning', found );

    return found;
}

function isDelete( inType ) {
    const sFunc = 'server.js.isDelete()-->';
    const debug = false;

    debug && console.log( sFunc + 'inType', inType, 'aDeleteOptions', aDeleteOptions );

    let found = false;
    aDeleteOptions.forEach( ( o ) => {
        if ( o.toLowerCase() === inType.toLowerCase() )
            found = true;
    } );

    debug && console.log( sFunc + 'returning', found );

    return found;
}