const path = require( 'path' );

const TwitQueued = require( './my_modules/twit-queued' );
const Markov = require( './my_modules/markov' );
const TwitterBot = require( './my_modules/twitter-bot' );
const twitterCredentials = require( './data/twitter-credentials' );

const twit = new TwitQueued( twitterCredentials );
const markov = new Markov();
markov.trainFromFile( path.join( __dirname, 'data/markov.txt' ) );
const twitterBot = new TwitterBot( twit, markov );

twitterBot.beginStatusPosts();
twitterBot.beginTweetReactions();

console.log( 'application started' );