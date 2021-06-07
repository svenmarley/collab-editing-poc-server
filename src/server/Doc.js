// asdf

class Doc {
    #sFunc = 'Doc';
    name = null;    // todo: all should be made private
    //author = null;
    #authorState = null;
    content = null;
    lastMutation = null;

    printConfig() {
        const sFunc = this.#sFunc + '.printConfig()-->';
        console.log( sFunc + 'config', Object.keys( this ).toString() );
    }

    setContent( c ) {
        this.content = c;
    }

    getContent( c ) {
        return ( this.content );
    }

    insert( index, text, length ) {
        const sFunc = this.#sFunc + '.insert()-->';
        const debug = true;

        const c = this.content.splice( index, text.substring( 0, length ) );

        debug && console.log( sFunc + 'old', this.content, 'new', c );

        this.setContent( c );

        this.writeDoc();
    }

    delete( index, length ) {
        const sFunc = this.#sFunc + '.delete()-->';
        const debug = true;

        const c = this.content.splice( index, '', length );
        debug && console.log( sFunc + 'old', this.content, 'new', c );

        this.setContent( c );

        this.writeDoc();
    }

    writeDoc() {
        const sFunc = this.#sFunc + '.writeDoc()-->';

        dataConfig.writeDoc( this );

    }

}

module.exports = { Doc : Doc };

String.prototype.splice = function(offset, text, removeCount=0) {
    let calculatedOffset = offset < 0 ? this.length + offset : offset;
    return this.substring(0, calculatedOffset) +
        text + this.substring(calculatedOffset + removeCount);
};