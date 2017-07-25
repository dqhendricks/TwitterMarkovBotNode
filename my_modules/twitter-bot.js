
/*
	this class will control twitter interactions
*/

class TwitterBot {
	
	constructor( twit, markov ) {
		this.twit = twit;
		this.markov = markov;
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
			}, 1000 * 60 * 60 * 24 );
		}, this.millisecondsTillStartTime() );
	}
	
	millisecondsTillStartTime() {
		var startTime = new Date();
		startTime.setTime( Date.parse( startTime.toISOString().replace( /T.+/, 'T00:00:00.000Z' ) ) ); // get current day, midnight UTC
		startTime.setTime( startTime.getTime() + ( 1 * 24 * 60 * 60 * 1000 ) ); // get tonight's, midnight UTC
		startTime = startTime.getTime() - new Date().getTime()
		console.log( startTime / ( 1000 * 60 * 60 ) );
		return startTime;
	}
	
	processTweetReactions() {
		const date = new Date();
		const formattedToday = date.toISOString().slice( 0, 10 );
		date.setTime( date.getTime() - ( 1 * 24 * 60 * 60 * 1000 ) );
		const formattedYesterday = date.toISOString().slice( 0, 10 );
		this.twit.get( 'search/tweets', { q: `odin OR loki OR ragnarok OR "norse mythology" OR norsemythology since:${ formattedYesterday } until:${ formattedToday } -filter:retweets`, result_type: 'mixed', lang: 'en', count: 100 }, ( err, data, response ) => {
			data.statuses.forEach( status => {
				// favorite
				if ( status.favorite_count > 1 ) {
					this.twit.post( 'favorites/create', { id: status.id }, ( err, data, response ) => {
						console.log( data );
					} );
				}
				// reply
				const allowedLength = 140 - 2 - status.user.screen_name.length;
				this.twit.post( 'statuses/update', {
					status: `@${ status.user.screen_name } ${ this.markov.generateSentence( allowedLength ) }`,
					in_reply_to_status_id: status.id
				}, ( err, data, response ) => {
					console.log( data );
				} );
				// retweets
				if ( status.favorite_count > 50 && 'media' in status && status.media[0].type == 'photo' && ( status.text.toLowerCase().includes( 'norse mythology' ) || status.text.toLowerCase().includes( 'norsemythology' ) ) ) {
					this.twit.post( `statuses/retweet/${ status.id }`, { id: status.id }, ( err, data, response ) => {
						console.log( data );
					} );
				}
			} );
		} );
	}
}

module.exports = TwitterBot;