import { SlackClient } from "../client/slack_client"
import { Context, Callback } from "aws-lambda"
import { MessageTemplate, Configurator } from "../config/slack_message_config"

/**
 * A Helper Method that will send a message to each member in a given channel id
 * @param event			The aws-lambda event
 * @param context		The aws-lambda context
 * @param callback	The aws-lambda callback from the result of the process
 */
const PostMessageHelper = async (callback: Callback) => {
	const configurator = new Configurator("env.yml")
	const botToken = configurator.getSlackConfig().botToken
	const botClient = new SlackClient(botToken)
	const members = ["U02GR2NER", "U02GSD5AU"]
	members.forEach(async memberId => {
		const message = new MessageTemplate().botMangUdinMessage(memberId)
		const channelId = await botClient.openConversation(memberId)
		sendReminder(botClient, channelId, message, callback)
	})
}

/**
 * A Helper Method to send a message in slack to a channel/user
 * @param client		The Slack webClient Object that will be used to send a message
 * @param userId		The user identifier that will become a recipient
 * @param message		The text that will be sent
 * @param context		The aws-lambda context object
 * @param callback	The Callback that will send an information from the result of the process
 */
async function sendReminder(
	client: SlackClient,
	channelId: string,
	message: string,
	callback: Callback
) {
	const slackMessage = {
		message: message,
		channel: channelId,
		username: "Mang Udin",
		as_user: false
	}

	const response = await client.sendMessage(slackMessage)
	if (response.ok) {
		callback(undefined, response)
	} else {
		callback(Error(response.toString()), undefined)
	}
}

export { PostMessageHelper }
