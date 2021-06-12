
const { apiSend, gHeaders } = require( './shared' );

apiSend( '/info', gHeaders )
    .then( ( result ) => {
        console.log( 'result', result );

        const authorName = result.author.name

        if ( authorName === 'Alice Becker' ) {
            console.log( 'SUCCESS:  Name matches', authorName )
        }
        else
            console.log( 'ERROR:  inbound name ', authorName, 'doesn\'t match', 'Alice Becker')

    } );



