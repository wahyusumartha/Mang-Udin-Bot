import { Context, Callback } from "aws-lambda"

/**
 * A Lambda Function that will send a message to each of user in a particular slack channel
 * @param event 		The aws-lambda event
 * @param context 	The aws-lambda context
 * @param callback 	The aws-lambda callback for given process
 */
const receiveMessage = (event: any, context: Context, callback: Callback) => {
	console.log(`Event sent from Slack ${JSON.stringify(event)}`)
	const eventBody = JSON.parse(event.body)
	console.log({json_parser: eventBody})
	const response = {
		statusCode: 200,
		headers: {"Content-Type": "text/plain"},
		body: eventBody.challenge
	}
	callback(undefined, response)
}

export { receiveMessage }
