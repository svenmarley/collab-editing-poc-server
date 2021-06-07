const Doc = require( './Doc' ).Doc;
const Data = require( './Data' ).Data;

// const config = require( '../config' );
// let dataConfig = new Data();
// dataConfig.setConfig( config.dataDir );
//
// dataConfig.readDocsConfig();

//const dataConfig = require( './server').dataConfig;

class DocPeer {

    static find( searchStr = '', howDeep = 'NAME_ONLY' ) {
        const sFunc = 'DocPeer::find()-->';
        const debug = false;

        let fileNames = dataConfig.getDocList( howDeep );
        debug && console.log( sFunc + 'fileNames', fileNames );
        if ( howDeep === 'NAME_ONLY' ) {
            return fileNames;
        }

        let aDocs = [];

        fileNames.map( ( fileName ) => {
            debug && console.log( sFunc + 'inside filename', fileName, 'searchStr', searchStr );
            if ( ( !searchStr.length ) || ( fileName === searchStr ) ) {
                let newDoc = this._buildNewDoc( fileName );

                aDocs.push( newDoc );
            }

        } );

        debug && console.log( sFunc + 'returning', aDocs );

        return aDocs;
    }

    static findOne( docName ) {

        let docs = this.find( docName, 'EVERYTHING' );

        let retDoc = null;
        if ( docs.length ) {
            retDoc = docs[0];
        }

        return ( retDoc );
    }

    static _buildNewDoc( fileName ) {
        const sFunc = 'DocPeer::_buildNewDoc()--> ';
        const debug = false;

        let jDoc = dataConfig.getDocInfo( fileName );
        let docContent = dataConfig.getDocContent( fileName );

        let doc = new Doc();

        debug && console.log( sFunc + 'dataConfig.store.currAuthor', dataConfig.store.currAuthor );

        doc.name = fileName;
        doc.setContent( docContent );
        //doc.authorState = jDoc.authorState[dataConfig.store.currAuthor];
        //doc.author = dataConfig.store.currAuthor;

        doc.lastMutation = `(${jDoc.lastMutation.join(', ')})`;

        debug && console.log( sFunc + 'returning', doc );

        return doc;
    }
}

module.exports = { DocPeer : DocPeer };