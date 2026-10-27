function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}

	let tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});
	
	//This line modifies the DOM, searching for the tag with the numberTweets ID and updating the text.
	//It works correctly, your task is to update the text of the other tags in the HTML file!
	document.getElementById('numberTweets').innerText = tweet_array.length;	
	if (tweet_array.length === 0) {
		console.log("No tweets available.");
		return;
	}
	let earliest = tweet_array[0].time;
	let latest = tweet_array[0].time;

	for (let tweet of tweet_array) {
		if (tweet.time < earliest) {
			earliest = tweet.time;
		}

		if (tweet.time > latest) {
			latest = tweet.time;
		}
	}

	let options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'};
	
	document.getElementById('firstDate').innerText = earliest.toLocaleDateString('en-US', options);
	document.getElementById('lastDate').innerText = latest.toLocaleDateString('en-US', options);


	let counts = {
		completed_event: 0,
		live_event: 0,
		achievement: 0,
		miscellaneous: 0
	};

	for (let tweet of tweet_array) {
		counts[tweet.source]++;
	}

	let total = tweet_array.length;
	let completedPct = (counts.completed_event / total * 100).toFixed(2);
	let livePct = (counts.live_event / total * 100).toFixed(2);
	let achievementPct = (counts.achievement / total * 100).toFixed(2);
	let miscellaneousPct = (counts.miscellaneous / total * 100).toFixed(2);

	document.querySelectorAll('.completedEvents').forEach(function(element) {
		element.innerText = counts.completed_event;
	});
	document.querySelector('.liveEvents').innerText = counts.live_event;
	document.querySelector('.achievements').innerText = counts.achievement;
	document.querySelector('.miscellaneous').innerText = counts.miscellaneous;

	document.querySelector('.completedEventsPct').innerText = completedPct + '%';
	document.querySelector('.liveEventsPct').innerText = livePct + '%';
	document.querySelector('.achievementsPct').innerText = achievementPct + '%';
	document.querySelector('.miscellaneousPct').innerText = miscellaneousPct + '%';

	let writtenCount = 0;

	for (let tweet of tweet_array) {
		if (tweet.source === "completed_event" && tweet.written) {
			writtenCount++;
		}
	}

	let writtenPct = counts.completed_event > 0
		? (writtenCount / counts.completed_event * 100).toFixed(2)
		: "0.00";

	document.querySelector(".written").innerText = writtenCount;
	document.querySelector(".writtenPct").innerText = writtenPct + "%";

	let activityCounts = {};

	for (let tweet of tweet_array) {
		if (tweet.source === "completed_event") {
			let activity = tweet.activityType;

			if (activityCounts[activity] === undefined) {
				activityCounts[activity] = 0;
			}

			activityCounts[activity]++;
		}
	}
	
	console.log(activityCounts);
	console.log(counts);
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});