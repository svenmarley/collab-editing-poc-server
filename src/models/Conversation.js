const { breakMutation } = require( '../tests/shared' );
const { MutationPeer } = require( './MutationPeer' );
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

    constructor( inConversationId, inContent = '', inOrigin = '', inLastMutation = '' ) {

        this.ID = inConversationId;
        this.content = inContent;
        this.origin = inOrigin;
        this.lastMutation = inLastMutation;

    }

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

    /** algorithm
     *
     * STEP: search the tblMUTATIONS table and see if we have already seen this inOrigin for this Conversation
     *
     * STEP if (false ) {
     *     return the original inOrigin, inIndex
     * }
     * transform the inOrigin based on all the mutations that have occurred since
     *  tblMUTATION                                                                 tblCONVERSATION
     * testMutation1
     *   1    1    2    (0,0)    bob (0,0)INS 0:'The'       2021-06-13 00:08:31     (0,1) 'The'
     *   2    1    2    (0,1)    bob (0,1)INS 3:' house'    2021-06-13 00:08:31     (0,2) 'The house'
     *   3    1    2    (0,2)    bob (0,2)INS 9:' is'       2021-06-13 00:08:31     (0,3) 'The house is'
     *   4    1    2    (0,3)    bob (0,3)INS 12:' red'     2021-06-13 00:08:31     (0,4) 'The house is red'
     * testMutation2
     *   5    1    2    (0,4)    bob (0,4)DEL 12:4          2021-06-13 00:08:31     (0,5) 'The house is'
     *   6    1    2    (0,5)    bob (0,5)INS 12:' blue'    2021-06-13 00:08:31     (0,6) 'The house is blue'
     * testMutation3
     *   7    1    1    (0,6)    alice (0,6)DEL 13:4        2021-06-13 00:08:31     (1,6) 'The house is '
     *   8    1    1    (1,6)    alice (1,6)INS 13:'green'  2021-06-13 00:08:31     (2,6) 'The house is green'
     *
     * if ( insert ) {
     *      if ( 2ndIndex > 1stIndex ) {
     *          return 2ndIndex + 1stIndex
     *      }
     *
     * }
     *
     * tests:
     * testMutation4                    (2,6) 'the house is green'
     *  alice (2,6)INS 3:' big'     => (3,6) 'the big house is green'
     *  bob (2,6)INS 18:' and yellow'   -> bob (3,7)INS 22:' and yellow'    => (3,8) 'the big house is green and yellow'
     *
     *                                 'the big house is green and yellow'
     *  alice (2,7)INS 3:' very'    => (3,8) 'the very big house is green and yellow''
     *  bob (2,7)INS 7:' ugly'      ->  convert to bob (2,8)INS 12:' ugly'  => (3,9) 'the very big ugly house is green and yellow'
     *
     *                                 'the very big ugly house is green and yellow'
     *  alice(2,8)DEL 0:4  (-the )   => 'very big ugly house is green and yellow'
     *  bob(2,8)DEL 13:5  (- ugly)   ->  bob (2,8)DEL 9:5                  => 'very big house is green and yellow'
     **/

    calcNewMutation( inOrigin, inType, inIndex ) {
        let sFunc = this.#sFunc + '.calcNewMutation()-->';
        const debug = false;

        return new Promise( ( respond, /*reject*/ ) => {

            debug && console.log( sFunc + 'here', 'inOrigin', inOrigin, 'inType', inType, 'inIndex', inIndex );
            MutationPeer.findOne( { MUTATIONS_ORIGIN : inOrigin } )
                        .then( ( mut ) => {
                            sFunc += '.MutPeer.findOne()-->';
                            debug && console.log( sFunc + 'mut', mut );

                            let retOrigin = inOrigin;
                            let retIndex = inIndex;

                            if ( mut ) {
                                const originStruct = breakMutation( mut.mutation );
                                debug && console.log( sFunc + 'originStruct', originStruct );
                                const { author : mutAuthor, length : mutLength, index : mutIndex } = originStruct;

                                retOrigin = this.moveOrigin( inOrigin, mutAuthor );

                                if ( isInsert( inType ) ) {
                                    if ( mutIndex < inIndex )
                                        retIndex = inIndex + mutLength;
                                }
                                else if ( isDelete( inType ) ) {
                                    if ( mutIndex < inIndex )
                                        retIndex = ( inIndex - mutIndex );
                                }
                            }

                            const ret = { newCalculatedOrigin : retOrigin, newIndex : retIndex };
                            debug && console.log( sFunc + 'returning', ret );
                            respond( ret );

                        } );

        } );

    }

    /**
     *
     * @param inOrigin
     * @param inType
     * @param inIndex
     * @param inLength
     * @param inText
     * @return {Promise<boolean>}
     */
    applyMutation( inOrigin, inType, inIndex, inLength, inText ) {
        const sFunc = this.#sFunc + '.applyMutation()-->';
        const debug = false;

        return new Promise( ( respond, reject ) => {

            // figures out what the mutations should be in case there is a "tie"
            // possibly recalculates origin and index

            this.calcNewMutation( inOrigin, inType, inIndex, inLength, inText )
                .then( ( ret ) => {
                    const newIndex = ret.newIndex;
                    const newCalculatedOrigin = ret.newCalculatedOrigin;

                    debug && console.log( sFunc + 'inOrigin', inOrigin, 'inIndex', inIndex
                        , 'newCalculatedOrigin', newCalculatedOrigin, 'newIndex', newIndex );
                    this.origin = newCalculatedOrigin;

                    // "lastMutation": "alice(11, 2)INS 0:'H'",
                    this.lastMutation = this.createMutationText( this.origin, inType, newIndex, inLength, inText );

                    // apply the mutation
                    let mut = new Mutation( this.ID, this.origin, this.lastMutation );
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

                           this.origin = this.moveOrigin( newCalculatedOrigin );

                           this.save()
                               .then( () => {
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
        } );

    }

    // move the origin
    moveOrigin( sentOrigin, inAuthor = global.currAuthor ) {
        const sFunc = this.#sFunc + '.moveOrigin()-->';
        const debug = true;

        const user = UserPeer.getUser( inAuthor );
        // alice = { id: 1, name: 'alice' }
        debug && console.log( sFunc + 'sentOrigin', sentOrigin, 'inAuthor', inAuthor, 'user', user );

        //  (1, 2)  =>  [1, 2]
        let a = sentOrigin.replace( ')', '' ).replace( '(', '' ).split( ',' ).map( ( z ) => {
            return parseInt( z.trim() );
        } );
        debug && console.log( sFunc + 'a', a );

        a[user.id - 1]++;        // increment the right currAuthor's index

        let newOrigin = '(' + a.join( ',' ) + ')';
        debug && console.log( sFunc + 'returning', newOrigin );

        return newOrigin;
    }

    createMutationText( origin, type, index, length, text ) {
        // const sFunc = this.#sFunc + '.createMutation()-->';
        // const debug = true;

        let sRet = `${currAuthor} ${origin}`;

        if ( isInsert( type ) )
            sRet += `INS ${index}:'${text}'`;
        else
            sRet += `DEL ${index}:${length}`;

        return sRet;
    }

    returnBlockToSend() {
        return {
            id : this.ID,
            lastMutation : this.lastMutation,
            origin : this.origin,
            content : this.getContent(),
        };
    }

}

module.exports = { Conversation, isInsert, isDelete };

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