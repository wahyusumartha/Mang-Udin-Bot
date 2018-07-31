import { Context, Callback } from "aws-lambda"
import { SlackEventProcessor } from "../processor/slack_event_processor"
import { MessageSender } from "../helper/message_sender"
import { DatabaseConfigurator } from "../database/database_configurator"
import { JSONReader, Environment } from "../helper/test/file_manager"

/**
 * A Lambda Function that will send a message to each of user in a particular slack channel
 * @param event 		The aws-lambda event
 * @param context 	The aws-lambda context
 * @param callback 	The aws-lambda callback for given process
 */
const receiveMessage = async (
	event: any,
	context: Context,
	callback: Callback
) => {
	const eventBody = JSON.parse(event.body)
	const response = {
		statusCode: 200,
		headers: { "Content-Type": "text/plain" },
		body: eventBody.challenge
	}

	console.log(`Event: ${JSON.stringify(event)}`)
	console.log(`EventMessage: ${JSON.stringify(eventBody)}`)

	if ("subtype" in eventBody.event) {
		if (eventBody.event.subtype == "message_changed") {
			await handleSlackEvent(eventBody)
			callback(undefined, response)
		} else {
			callback(undefined, response)
		}
	} else {
		await handleSlackEvent(eventBody)
		callback(undefined, response)
	}
}

const handleSlackEvent = async (eventBody: any) => {
	const dbConfig = new JSONReader().read("config.json")
	const databaseConfigurator = new DatabaseConfigurator(
		dbConfig.host,
		dbConfig.database,
		dbConfig.username,
		dbConfig.password,
		dbConfig.dialect
	)
	const sequelize = databaseConfigurator.getSequelize()

	const slackEventProcessor = new SlackEventProcessor()
	await slackEventProcessor.process(eventBody.event)
	await sequelize.close()
}

export { receiveMessage }
