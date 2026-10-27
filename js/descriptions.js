let writtenTweets = [];	
function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	//TODO: Filter to just the written tweets
	let tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	writtenTweets = tweet_array.filter(function(tweet) {
		return tweet.source === "completed_event" && tweet.written;
	});

	console.log("Total written tweets:", writtenTweets.length);
	console.log("Sample written tweets:", writtenTweets.slice(0, 5));
}

function addEventHandlerForSearch() {
	//TODO: Search the written tweets as text is entered into the search box, and add them to the table
	let searchBox = document.getElementById("textFilter");
    let searchCount = document.getElementById("searchCount");
    let searchText = document.getElementById("searchText");
    let tweetTable = document.getElementById("tweetTable");

    searchBox.addEventListener("input", function() {
        let query = searchBox.value.trim();

        searchText.innerText = query;

        if (query === "") {
            searchCount.innerText = 0;
            tweetTable.innerHTML = "";
            return;
        }
		let matchingTweets = writtenTweets.filter(function(tweet) {
			return tweet.writtenText.toLowerCase().includes(query.toLowerCase());
		});

		console.table(matchingTweets.slice(0, 10).map(function(tweet) {
			return {
				source: tweet.source,
				activityType: tweet.activityType,
				writtenText: tweet.writtenText,
				originalText: tweet.text
			};
		}));

        searchCount.innerText = matchingTweets.length;
		tweetTable.innerHTML = matchingTweets.map(function(tweet, index) {
			return tweet.getHTMLTableRow(index + 1);
		}).join("");
        console.log("Search query:", query);
        console.log("Matching tweets:", matchingTweets.length);
    });
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	addEventHandlerForSearch();
	loadSavedRunkeeperTweets().then(parseTweets);
});