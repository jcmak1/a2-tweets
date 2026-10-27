function parseTweets(runkeeper_tweets) {
	//Do not proceed if no tweets loaded
	if(runkeeper_tweets === undefined) {
		window.alert('No tweets returned');
		return;
	}
	
	let tweet_array = runkeeper_tweets.map(function(tweet) {
		return new Tweet(tweet.text, tweet.created_at);
	});

	let activityCounts = {};

	for (let tweet of tweet_array) {
		if (tweet.source === "completed_event") {
			let activity = tweet.activityType;

			if (activity !== "unknown" && activity !== "") {
				if (activityCounts[activity] === undefined) {
					activityCounts[activity] = 0;
				}

				activityCounts[activity]++;
			}
		}
	}

	console.log("Activity counts:", activityCounts);
	let activityData = [];

	for (let activity in activityCounts) {
		activityData.push({
			activityType: activity,
			count: activityCounts[activity]
		});
	}

	console.log("Graph data:", activityData);

	let sortedActivities = activityData.slice().sort(function(a, b) {
		return b.count - a.count;
	});

	let topThree = sortedActivities.slice(0, 3);

	console.log("Top three activities:", topThree);
	let totalActivityTypes = Object.keys(activityCounts).length;
	document.getElementById("numberActivities").innerText = totalActivityTypes;
	document.getElementById("firstMost").innerText = topThree[0].activityType;
	document.getElementById("secondMost").innerText = topThree[1].activityType;
	document.getElementById("thirdMost").innerText = topThree[2].activityType;
	console.log("Number of activity types:", totalActivityTypes);
	console.log("Most popular activities:", topThree.map(item => item.activityType));

	// PART 2: Prepare distance data for the top three activities

	let topThreeNames = topThree.map(function(activity) {
		return activity.activityType;
	});

	let distanceData = [];

	for (let tweet of tweet_array) {
		if (tweet.source === "completed_event" &&
			topThreeNames.includes(tweet.activityType) &&
			tweet.distance > 0) {

			distanceData.push({
				activityType: tweet.activityType,
				distance: tweet.distance,
				day: tweet.time.toLocaleDateString('en-US', {
					weekday: 'long',
					timeZone: 'UTC'
				})
			});
		}
	}

	console.log("Distance data:", distanceData);
	console.log("Number of distance records:", distanceData.length);
	//TODO: create a new array or manipulate tweet_array to create a graph of the number of tweets containing each type of activity.

	let activity_vis_spec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",
		"description": "A graph of the number of Tweets containing each type of activity.",

		"data": {
			"values": activityData
		},

		"mark": "bar",

		"encoding": {
			"x": {
				"field": "activityType",
				"type": "nominal",
				"title": "Activity Type",
				"sort": "-y"
			},

			"y": {
				"field": "count",
				"type": "quantitative",
				"title": "Number of Tweets"
			}
		}
	};
	vegaEmbed('#activityVis', activity_vis_spec, {actions:false});

	//TODO: create the visualizations which group the three most-tweeted activities by the day of the week.
	//Use those visualizations to answer the questions about which activities tended to be longest and when.
	let distanceVisSpec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",

		"description": "Distances by activity type and day of week",

		"data": {
			"values": distanceData
		},

		"mark": {
			"type": "point",
			"opacity": 0.3
		},

		"encoding": {
			"x": {
				"field": "day",
				"type": "ordinal",
				"title": "Day of the Week",
				"sort": [
					"Monday", "Tuesday", "Wednesday",
					"Thursday", "Friday", "Saturday", "Sunday"
				]
			},

			"y": {
				"field": "distance",
				"type": "quantitative",
				"title": "Distance (Miles)"
			},

			"color": {
				"field": "activityType",
				"type": "nominal",
				"title": "Activity Type"
			}
		}
	};

	vegaEmbed('#distanceVis', distanceVisSpec, {actions: false});
	
	let distanceMeanSpec = {
		"$schema": "https://vega.github.io/schema/vega-lite/v5.json",

		"description": "Average distance by activity and day of week",

		"data": {
			"values": distanceData
		},

		"mark": "bar",

		"encoding": {
			"x": {
				"field": "day",
				"type": "ordinal",
				"title": "Day of the Week",
				"sort": [
					"Monday", "Tuesday", "Wednesday",
					"Thursday", "Friday", "Saturday", "Sunday"
				]
			},

			"y": {
				"field": "distance",
				"type": "quantitative",
				"aggregate": "mean",
				"title": "Average Distance (Miles)"
			},

			"color": {
				"field": "activityType",
				"type": "nominal",
				"title": "Activity Type"
			},

			"xOffset": {
				"field": "activityType"
			}
		}
	};

	vegaEmbed('#distanceVisAggregated', distanceMeanSpec, {actions: false});

	document.getElementById("distanceVisAggregated").style.display = "none";

	let aggregateButton = document.getElementById("aggregate");
	let distanceVis = document.getElementById("distanceVis");
	let distanceVisAggregated = document.getElementById("distanceVisAggregated");

	aggregateButton.addEventListener("click", function() {

		if (distanceVisAggregated.style.display === "none") {

			distanceVis.style.display = "none";
			distanceVisAggregated.style.display = "block";

			aggregateButton.innerText = "Show individual distances";

		} else {

			distanceVis.style.display = "block";
			distanceVisAggregated.style.display = "none";

			aggregateButton.innerText = "Show means";
		}
	});

	let activityDistances = {};

	for (let activity of topThreeNames) {
		activityDistances[activity] = {
			total: 0,
			count: 0
		};
	}

	for (let record of distanceData) {
		activityDistances[record.activityType].total += record.distance;
		activityDistances[record.activityType].count++;
	}

	let activityAverages = [];
	for (let activity of topThreeNames) {
		let data = activityDistances[activity];
		activityAverages.push({
			activityType: activity,
			average: data.count > 0 ? data.total / data.count : 0
		});
	}

	activityAverages.sort(function(a, b) {
		return b.average - a.average;
	});

	console.log("Average distances:", activityAverages);

	if (activityAverages.length > 0) {
		let longestActivity = activityAverages[0].activityType;
		let shortestActivity = activityAverages[activityAverages.length - 1].activityType;
		document.getElementById("longestActivityType").innerText = longestActivity;
		document.getElementById("shortestActivityType").innerText = shortestActivity;
	}

	let weekdayTotal = 0;
	let weekdayCount = 0;

	let weekendTotal = 0;
	let weekendCount = 0;

	for (let record of distanceData) {

		if (record.day === "Saturday" || record.day === "Sunday") {
			weekendTotal += record.distance;
			weekendCount++;
		} else {
			weekdayTotal += record.distance;
			weekdayCount++;
		}
	}

	let weekdayAverage = weekdayCount > 0
		? weekdayTotal / weekdayCount
		: 0;

	let weekendAverage = weekendCount > 0
		? weekendTotal / weekendCount
		: 0;

	console.log("Weekday average:", weekdayAverage);
	console.log("Weekend average:", weekendAverage);

	let longerPeriod = "weekdays";

	if (weekendAverage > weekdayAverage) {
		longerPeriod = "weekends";
	}

	document.getElementById("weekdayOrWeekendLonger").innerText = longerPeriod;
}

//Wait for the DOM to load
document.addEventListener('DOMContentLoaded', function (event) {
	loadSavedRunkeeperTweets().then(parseTweets);
});