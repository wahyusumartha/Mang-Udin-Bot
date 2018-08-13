import { Context, Callback } from "aws-lambda"
import { SlackEventProcessor } from "../processor/slack_event_processor"
import { MessageSender } from "../helper/message_sender"
import { DatabaseConfigurator } from "../database/database_configurator"
import { JSONReader, Environment } from "../helper/test/file_manager"
import {
	EventSubcriptionProcessor,
	Process
} from "../processor/event_subscription_processor"
import { MessageChangedProcessor } from "../processor/message_changed_processor"
import { FirstAnswerProcessor } from "../processor/first_answer_processor"
import { NextAnswerProcessor } from "../processor/next_answer_processor"
import { SessionEndedProcessor } from "../processor/session_ended_processor"

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

	await handleSlackEvent(eventBody)
	callback(undefined, response)
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

	const eventSubscriptionProcessor = new EventSubcriptionProcessor()
	const processType = await eventSubscriptionProcessor.process(eventBody)

	switch (processType) {
		case Process.None:
			const noneProcessor = new NoneProcessor()
			noneProcessor.process(eventBody)
			break
		case Process.MesageChanged:
			const messageChangedProcessor = new MessageChangedProcessor()
			await messageChangedProcessor.process(eventBody)
			break
		case Process.FirstAnswer:
			const firstAnswerProcessor = new FirstAnswerProcessor()
			await firstAnswerProcessor.process(eventBody)
			break
		case Process.NextAnswer:
			const nextAnswerProcessor = new NextAnswerProcessor()
			await nextAnswerProcessor.process(eventBody)
			break
		case Process.SessionEnded:
			const sessionEndedProcessor = new SessionEndedProcessor()
			await sessionEndedProcessor.process(eventBody)
			break
	}

	await sequelize.close()
}

export { receiveMessage }
