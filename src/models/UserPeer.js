const { User } = require( './User' );

class UserPeer {

    static getUser( searchName ) {
        //  todo:  shortcut
        const users = [ { id : 1, name : 'alice' }, { id : 2, name : 'bob' } ];

        return users.find( ( u ) => {
            return ( u.name === searchName );
        } );
    }

    static findOne( searchName = '' ) {
        const sFunc = 'UserPeer.findOne()-->';
        const debug = false;

        return new Promise( ( respond, reject ) => {
            UserPeer.find( searchName )
                    .then( ( aUsers ) => {
                        debug && console.log( sFunc + 'isArray(aUsers)', Array.isArray( aUsers ), 'aUsers', aUsers );
                        if ( aUsers.length ) {
                            respond( aUsers[0] );
                        }
                        else
                            reject( null );
                    } )
                    .catch( ( e ) => {
                        console.log( sFunc + 'e', e );
                        reject( null );
                    } );

        } );
    }

    static find( searchName ) {
        const sFunc = 'UserPeer::find()-->';
        const debug = false;

        let query;
        let vars = [];
        if ( typeof ( searchName ) === 'string' ) {
            query = 'SELECT * FROM tblUSERS where NAME like ?';
            vars.push( searchName.replace( '*', '%' ) );
        }
        else if ( typeof ( searchName ) === 'object' ) {
            //{ SHORTNAME : userShortName }
            let fields = [];
            let tVars = [];
            Object.keys( searchName ).map( ( f ) => {
                fields.push( f );
                tVars.push( searchName[f] );
            } );
            console.log( sFunc + 'fields', fields, 'tVars', tVars );

            query = 'SELECT * FROM tblUSERS where ';
            for ( let x = 0; x < fields.length; x++ ) {
                query += ` ${fields[x]} = ?`;
                vars.push( tVars[x] );
            }
        }
        console.log( sFunc + 'query', query, 'vars', vars );

        return new Promise( ( respond, reject ) => {
            let go = dbConnection.query( query, vars, ( err, rows ) => {
                debug && console.log( sFunc + 'rows ', rows );
                if ( !err ) {
                    let aUsers = [];
                    rows.map( ( row ) => {
                        let user = new User();
                        user.name = row.NAME;
                        user.email = row.EMAIL;
                        user.shortName = row.SHORT_NAME;

                        console.log( sFunc + 'user', user );

                        aUsers.push( user );

                    } );
                    console.log( sFunc + 'returning', aUsers );
                    respond( aUsers );
                }

                console.log( sFunc + 'err', err );
                reject( -1 );
            } );
            console.log( sFunc + 'sql', go.sql );

        } );
    }
}

module.exports = { UserPeer };