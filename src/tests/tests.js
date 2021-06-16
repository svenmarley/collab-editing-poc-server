const { sendMutation } = require( './testMutation' );
const { sendMutation2 } = require( './testMutation2' );
const { sendMutation3 } = require( './testMutation3' );
const { sendMutation4 } = require( './testMutation4' );
const { createConversation } = require( './testCreate')
const { deleteConversation } = require( './testDelete')

const myArgs = process.argv.slice( 2 );
const runThis = parseInt( myArgs[0] );
console.log( 'runThis', runThis );

if ( runThis === 1 ) {
    sendMutation()
        .then( e => {
            console.log( 'returned', e );
        } );

}
else if ( runThis === 2 ) {
    sendMutation2()
        .then( e => {
            console.log( '2 returned', e );
        } );

}
else if ( runThis === 3 ) {
    sendMutation3()
        .then( e => {
            console.log( '3 returned', e );
        } );

}
else if ( runThis === 4 ) {
    sendMutation4()
        .then( e => {
            console.log( '4 returned', e );
        } );
}
else if ( runThis === 6 ) {
    createConversation()
        .then( e => {
            console.log( '6 returned', e );
        })
}
else if ( runThis === 7 ) {
    const deleteId = parseInt( myArgs[1] );
    console.log( 'Deleting conversation:', deleteId)
    deleteConversation( deleteId )
        .then( e => {
            console.log( '7 returned', e );
        })
}













