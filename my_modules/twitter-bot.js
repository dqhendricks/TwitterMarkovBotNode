
/*
	this class will control twitter interactions
*/

class TwitterBot {
	
	constructor( twit, markov ) {
		this.twit = twit;
		this.markov = markov;
		this.searchTerms = [
			'odin',
			'loki',
			'ragnarok',
			'norse ',
			'viking ',
			'valkyrie'
		];
	}
	
	beginStatusPosts() {
		setInterval( () => {
			this.twit.post( 'statuses/update', { status: this.markov.generateSentence() }, ( err, data, response ) => {
				console.log( data );
			} );
		}, 1000 * 60 * 60 * 6 );
	}
	
	beginTweetReactions() {
		setTimeout( () => {
			this.processTweetReactions();
			setInterval( () => {
				this.processTweetReactions();
				this.favoriteTaggedTweets();
			}, 1000 * 60 * 60 * 24 );
		}, this.millisecondsTillStartTime() );
	}
	
	millisecondsTillStartTime() {
		var startTime = new Date();
		startTime.setTime( Date.parse( startTime.toISOString().replace( /T.+/, 'T00:00:00.000Z' ) ) ); // get current day, midnight UTC
		startTime.setTime( startTime.getTime() + ( 1 * 24 * 60 * 60 * 1000 ) ); // get tonight's, midnight UTC
		startTime = startTime.getTime() - new Date().getTime()
		console.log( startTime / ( 1000 * 60 * 60 ) );
		return startTime + 1;
	}
	
	processTweetReactions() {
		const date = new Date();
		const formattedToday = date.toISOString().slice( 0, 10 );
		date.setTime( date.getTime() - ( 1 * 24 * 60 * 60 * 1000 ) );
		const formattedYesterday = date.toISOString().slice( 0, 10 );
		const searchString = this.searchTerms.forEach( term => {
			return `"${ term }"`;
		} ).join( ' OR ' );
		
		this.twit.get( 'search/tweets', { q: `${ searchString } since:${ formattedYesterday } until:${ formattedToday } -filter:retweets`, result_type: 'mixed', lang: 'en', count: 100 }, ( err, data, response ) => {
			data.statuses.forEach( status => {
				if ( !this.containsSearchTerm( status.user.screen_name ) ) { // filter out screen name search matches
					// favorite
					if ( status.favorite_count > 1 ) {
						this.twit.post( 'favorites/create', { id: status.id_str }, ( err, data, response ) => {
							console.log( data );
						} );
					}
					// reply
					const allowedLength = 140 - 2 - status.user.screen_name.length;
					this.twit.post( 'statuses/update', {
						status: `@${ status.user.screen_name } ${ this.markov.generateSentence( allowedLength ) }`,
						in_reply_to_status_id: status.id_str
					}, ( err, data, response ) => {
						console.log( data );
					} );
					// retweets
					if ( status.favorite_count >= 25 && 'media' in status && status.media[0].type == 'photo' && status.text.toLowerCase().includes( 'norse' ) ) {
						this.twit.post( `statuses/retweet/${ status.id_str }`, { id: status.id_str }, ( err, data, response ) => {
							console.log( data );
						} );
					}
				}
			} );
		} );
	}
	
	containsSearchTerm( string ) {
		string = string.toLowerCase();
		this.searchTerms.forEach( term => {
			if ( string.includes( term ) ) return true;
		} );
		return false;
	}
	
	favoriteTaggedTweets() {
		this.twit.get( 'search/tweets', { q: `@trialbyviking`, result_type: 'recent', count: 100 }, ( err, data, response ) => {
			data.statuses.forEach( status => {
				if ( status.favorited == 'false' ) {
					this.twit.post( 'favorites/create', { id: status.id_str }, ( err, data, response ) => {
						console.log( data );
					} );
				}
			} );
		} );
	}
}

module.exports = TwitterBot;