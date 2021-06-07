//const Doc = require( './Doc' ).Doc;
const fs = require( 'fs' );

class Data {
    #sFunc = 'data';

    store = {
        dataPath : null,
        configFileFullPath : null,

        currDocsConfig : null,

        currAuthor : null,
    };

    setConfig( dataPath ) {

        this.store.dataPath = dataPath;
        this.store.configFileFullPath = dataPath + '/data.json';

        this.readDocsConfig();
    }

    setAuthor( author ) {
        this.store.currAuthor = author;
    }

    readDocsConfig() {
        const sFunc = this.#sFunc + '.readConfig()-->';
        const debug = false;
        debug && console.log( sFunc, 'inside' );

        let data = fs.readFileSync( this.store.configFileFullPath );
        this.store.currDocsConfig = JSON.parse( data.toString() );

        debug && console.log( sFunc + 'after read -> data', data );
    }

    writeConfig() {
        const sFunc = this.#sFunc + '.writeConfig()-->';

        const c = JSON.stringify( this.store.currDocsConfig );
        console.log( sFunc + 'writing this content', c );

        fs.writeFile( this.store.configFileFullPath, c
            , { flag : 'w+' }, err => {
                if ( err ) {
                    console.err( err );
                }
            } );
    }

    getDocList() {
        const sFunc = 'data.getDocList()-->';
        const debug = false;

        let fileNames = fs.readdirSync( this.store.dataPath );
        let docNames = ( fileNames.filter( ( f ) => f !== 'data.json' ) );

        debug && console.log( sFunc + 'docNames', docNames );

        return docNames;
    }

    getDocInfo( docName ) {
        const sFunc = this.#sFunc + '.getDocInfo()-->';
        const debug = false;

        let jDoc = this.store.currDocsConfig.docs[docName];

        debug && console.log( sFunc + 'docName', docName, 'jDoc', jDoc );

        return ( jDoc );
    }

    getDocContent( docName ) {
        const sFunc = this.#sFunc + '.getDoc()-->';
        const debug = false;

        if ( !this.isValidFile( docName ) ) {
            debug && console.log( sFunc + 'Document named [%s] does not exist', docName );
            return false;
        }

        let f = fs.readFileSync( this.store.dataPath + '/' + docName );
        debug && console.log( sFunc + 'f', f.toString() );

        return ( f.toString() );
    }

    isValidFile( docName ) {
        const sFunc = this.#sFunc + '.isValidFile()-->';
        const debug = false;

        let files = this.getDocList();

        debug && console.log( sFunc + 'searching for', docName, 'files', files );

        let t = files.find( ( fileName ) => {
            debug && console.log( 'fileName', fileName, 'docName', docName, '( fileName === docName )', ( fileName === docName ) );
            return ( fileName === docName );
        } );
        debug && console.log( sFunc + 't', t, 'und', typeof ( t ) );
        if ( typeof ( t ) === 'undefined' ) {
            debug && console.log( 'xDocument named [%s] does not exist', docName );
            return false;
        }

        return true;
    }

    // getAuthor() {
    //     // todo:  fix this
    //     return this.store.currAuthor;
    // }
    //
    // addDoc( docName, content ) {
    //
    // }
    //

    writeDoc( doc ) {
        const sFunc = this.#sFunc + '.writeDoc()-->';
        const debug = true;

        const docName = doc.name;
        const newContent = doc.getContent();
        debug && console.log( sFunc + 'doc', doc );

        fs.writeFile( this.store.dataPath + '/' + docName, newContent, { flag : 'w+' }, ( err ) => {
            if ( err ) {
                console.error( err );
                return;
            }
            //file written successfully

            const { docs } = this.store.currDocsConfig;
            console.log( sFunc + 'docs', docs );

            const currDoc = docs[doc.name];
            console.log( sFunc + 'currDoc', currDoc );

            console.log( sFunc + 'this.store', this.store );
            let authorState = currDoc.authorState[this.store.currAuthor];
            console.log( sFunc + 'authorState', authorState );
            authorState.currIndex = doc.lastMutation;   // todo:  this isn't right
            authorState.lastEditDateTime = new Date().toUTCString();

            this.writeConfig();
        } );

    }

    //
    // removeDoc( docName ) {
    //
    // }

}

module.exports = { Data : Data };