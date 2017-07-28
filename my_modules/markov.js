const fs = require( 'fs' );

/*
	this class will deconstruct training text, then use the data to generate random sentences
*/

class Markov {
	
	constructor() {
		this.initializeData();
	}
	
	initializeData() {
		this.data = {};
	}
	
	trainFromFile( filePath ) {
		this.trainFromText( fs.readFileSync( filePath, 'utf8' ) );
	}
	
	trainFromText( text ) {
		text = text.toLowerCase().replace( /\?|:/g, '.' );
		const textSentences = text.split( '.' );
		
		textSentences.forEach( sentence => {
			sentence = sentence.replace( /\s+/g, ' ' ).replace( /,|;|"/g, '' ).trim();
			const words = sentence.split( ' ' );
			
			this.processWordArray( words );
		} );
	}
	
	processWordArray( words ) {
		for ( var i = 0; i < words.length - 2; i++ ) {
			const key = `${ words[i] } ${ words[i + 1] }`;
			const value1 = words[i + 2];
			
			if ( !( key in this.data ) ) this.data[key] = {};
			this.data[key][value1] = true;
			if ( i < words.length - 3 ) {
				const value2 = `${ words[i + 2] } ${ words[i + 3] }`;
				this.data[key][value2] = true;
			}
		}
	}
	
	generateSentence( characterLimit = 140 ) {
		var sentence = this.randomProperty( this.data );
		
		if ( !sentence ) {
			return '';
		} else {
			while ( sentence.length <= characterLimit ) {
				const segment = this.generateSentenceSegment( sentence );
				if ( !segment || segment.length + sentence.length + 1 > characterLimit ) {
					break;
				} else {
					sentence = `${ sentence } ${ segment }`;
				}
			}
			return this.formatSentence( sentence );
		}
	}
	
	generateSentenceSegment( sentence ) {
		const words = sentence.split( ' ' );
		const key = `${ words[words.length - 2] } ${ words[words.length - 1] }`;
		if ( key in this.data ) {
			return this.randomProperty( this.data[key] );
		} else {
			return null;
		}
	}
	
	formatSentence( sentence ) {
		return `${ this.capitalizeFirstLetter( this.removeBadTrailingElements( this.capitalizeIs( sentence ) ) ) }.`;
	}
	
	capitalizeFirstLetter( string ) {
		return string.charAt( 0 ).toUpperCase() + string.slice( 1 );
	}
	
	removeBadTrailingElements( string ) {
		return string.replace( / and$| a$| an$| the$| but$| which$/, '' );
	}
	
	capitalizeIs( string ) {
		return string.replace( /(^|\s)i($|\s)/, '$1I$2' );
	}
	
	randomProperty( object ) {
		const keys = Object.keys( object );
		if ( keys.length == 0 ) {
			return null;
		} else {
			return keys[keys.length * Math.random() << 0];
		}
	}
}

module.exports = Markov;