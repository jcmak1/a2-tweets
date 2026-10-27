class Tweet {
	private text:string;
	time:Date;

	constructor(tweet_text:string, tweet_time:string) {
        this.text = tweet_text;
		this.time = new Date(tweet_time);//, "ddd MMM D HH:mm:ss Z YYYY"
	}

	//returns either 'live_event', 'achievement', 'completed_event', or 'miscellaneous'
    get source():string {
        //TODO: identify whether the source is a live event, an achievement, a completed event, or miscellaneous.
        let text = this.text.toLowerCase();
        if (text.startsWith("watch my") && text.includes("right now")) {
            return "live_event";
        }
        else if (text.startsWith("achieved") ||
                text.startsWith("i just set a goal") ||
                text.includes("goal achieved")) {
            return "achievement";
        }
        else if (text.startsWith("just completed") ||
                text.startsWith("just posted")) {
            return "completed_event";
        }
        else {
            return "miscellaneous";
        }
    }
    //returns a boolean, whether the text includes any content written by the person tweeting.
    get written():boolean {
        //TODO: identify whether the tweet is written
        return this.writtenText.length > 0;
    }

    get writtenText():string {
        //TODO: parse the written text from the tweet
        let text = this.text;
        text = text.replace(/https?:\/\/\S+/g, "");
        text = text.replace(/#runkeeper/gi, "");
        if (this.source == "completed_event") {
            let dash = text.indexOf(" - ");
            if (dash !== -1) {
                text = text.substring(dash + 3);
            } else {
                return "";
            }
        }
        text = text.trim();
        if (text.toLowerCase() == "tomtom mysports watch" || text.toLowerCase() == "with @runkeeper. check it out!") {
            return "";
        }
        return text;
    }

    get activityType(): string {
        if (this.source !== "completed_event") {
            return "unknown";
        }
        let description = this.text.toLowerCase().split(" - ")[0];
        let activities = [
            "mtn bike",
            "elliptical workout",
            "spinning workout",
            "run",
            "walk",
            "bike",
            "swim",
            "hike",
            "meditation",
            "yoga",
            "row"
        ];

        for (let activity of activities) {
            let pattern = new RegExp("\\b" + activity + "\\b    ", "i");

            if (pattern.test(description)) {
                return activity;
            }
        }

        return "unknown";
    }

    get distance():number {
        //TODO: prase the distance from the text of the tweet
        if (this.source !== "completed_event") {
            return 0;
        }
        let match = this.text.match(/(\d+(?:\.\d+)?)\s*(km|mi)\b/i);
        if (match == null) {
            return 0;
        }

        let distance = parseFloat(match[1]);
        let unit = match[2].toLowerCase();
        if (unit == "km") {
            distance = distance / 1.609;
        }
        return distance;
    }

    getHTMLTableRow(rowNumber: number): string {
        function escapeHTML(value: string): string {
            return value
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        }

        let match = this.text.match(/https?:\/\/[^\s]+/);
        let link = match ? match[0] : "";
        let activity = escapeHTML(this.activityType);
        let writtenText = escapeHTML(this.writtenText);
        let linkHTML = "";

        if (link !== "") {
            let safeLink = escapeHTML(link);

            linkHTML = `<a href="${safeLink}" target="_blank" rel="noopener noreferrer">View activity</a>`;
        }

        return `
            <tr>
                <td>${rowNumber}</td>
                <td>${activity}</td>
                <td>${writtenText} ${linkHTML}</td>
            </tr>
        `;
    }
}