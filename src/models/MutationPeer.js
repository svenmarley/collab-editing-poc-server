class MutationPeer {

    static findOne( searchStruct = {} ) {
        const sFunc = 'MutationPeer.findOne()-->';
        const debug = false;

        return new Promise( ( respond, reject ) => {
            MutationPeer.find( searchStruct )
                        .then( ( aMutations ) => {
                            debug && console.log( sFunc + 'isArray(aMutations)', Array.isArray( aMutations ), 'aMutations', aMutations );
                            respond( aMutations.length ? aMutations[0] : null );
                        } )
                        .catch( ( e ) => {
                            console.log( sFunc + 'e', e );
                            reject( e );
                        } );

        } );
    }

    static find( searchStruct = {} ) {
        const { Mutation } = require( './Mutation' );

        const sFunc = 'MutationPeer::find()-->';
        const debug = true;

        debug && console.log( sFunc + 'searchStruct', searchStruct );
        let query;
        let vars = [];
        if ( typeof ( searchStruct ) === 'string' ) {
            query = 'SELECT * FROM tblMUTATIONS where ORIGIN like ?';
            vars.push( searchStruct.replace( '*', '%' ) );
        }
        else if ( typeof ( searchStruct ) === 'object' ) {
            if ( typeof ( searchStruct.className ) === 'string' ) {
                const mut = searchStruct;

                query = 'SELECT * FROM tblMUTATIONS where ';
                query += ' CONVERSATION_ID = ?';
                vars.push( mut.conversationId );
                query += ' and ORIGIN = ? ';
                vars.push( mut.origin );
            }
            else {
                //{ ORIGIN : inOrigin }
                let fields = [];
                let tVars = [];
                Object.keys( searchStruct ).map( ( f ) => {
                    fields.push( f );
                    tVars.push( searchStruct[f] );
                } );
                console.log( sFunc + 'fields', fields, 'tVars', tVars );

                query = 'SELECT * FROM tblMUTATIONS where ';
                for ( let x = 0; x < fields.length; x++ ) {
                    query += ` ${fields[x]} = ?`;
                    vars.push( tVars[x] );
                }
            }
        }
        debug && console.log( sFunc + 'query', query, 'vars', vars );

        return new Promise( ( respond, /*reject*/ ) => {
            let go = dbConnection.query( query, vars, ( err, rows ) => {
                debug && console.log( sFunc + 'rows ', rows );
                if ( !err ) {
                    let aMutations = [];
                    rows.map( ( row ) => {
                        let mut = new Mutation();
                        mut.ID = row.ID;
                        mut.conversationId = row.CONVERSATION_ID;
                        mut.origin = row.ORIGIN;
                        mut.mutation = row.MUTATION;
                        mut.auditDateTime = row.AUDIT_DATE_TIME;
                        mut.userId = row.USER_ID;

                        console.log( sFunc + 'mut', mut );

                        aMutations.push( mut );

                    } );
                    console.log( sFunc + 'returning', aMutations );
                    respond( aMutations );
                }
            } );
            console.log( sFunc + 'sql', go.sql );

        } );
    }

    static truncate() {
        const sFunc = 'MutationPeer.truncate()-->';
        const debug = true;

        return new Promise( ( respond, reject ) => {
            let q = 'truncate tblMUTATIONS;';
            let go = dbConnection.query( q, ( err, results ) => {

                debug && console.log( sFunc + 'err', err, 'results', results );

                if ( err ) {
                    reject( err );
                }
                respond( true );
            } );
            debug && console.log( sFunc + 'sql', go.sql )
        } );

    }

}

module.exports = { MutationPeer };