// saf

class User {
    #sFunc = 'User';
    ID = null;
    name = null;    // todo: all should be made private
    email = null;
    shortName = null;

    printConfig() {
        const sFunc = this.#sFunc + '.printConfig()-->';
        console.log( sFunc + 'config', Object.keys( this ).toString() );
    }

    save() {
        const sFunc = this.#sFunc + '.save()-->';
        const debug = true;

        return new Promise( ( respond, reject ) => {
            debug && console.log( sFunc + 'inside' );

            if ( this.ID ) {
                // updating old rec

            }
            else {
                // inserting new rec

                // let post = { name : this.name, content : this.getContent(), origin : '(0,0)' };
                // let go = connection.query( 'INSERT INTO tblDOCS SET ?', post, ( err, rows ) => {
                //
                // } );
                // console.log( sFunc + 'sql', go.sql );
            }

        } );

    }

}

module.exports = { User };

String.prototype.splice = function( offset, text, removeCount = 0 ) {
    let calculatedOffset = offset < 0 ? this.length + offset : offset;
    return this.substring( 0, calculatedOffset ) +
        text + this.substring( calculatedOffset + removeCount );
};