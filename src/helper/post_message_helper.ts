import { SlackClient } from "../client/slack_client"
import { Context, Callback } from "aws-lambda"
import { MessageTemplate, Configurator } from "../config/slack_message_config"

/**
 * A Helper Method that will send a message to each member in a given channel id
 * @param event			The aws-lambda event
 * @param context		The aws-lambda context
 * @param callback	The aws-lambda callback from the result of the process
 */
const PostMessageHelper = async (
	event: any,
	context: Context,
	callback: Callback
) => {
	const configurator = new Configurator("env.yml")
	const authToken = configurator.getSlackConfig().authToken
	const channel = configurator.getSlackConfig().channel
	const channelName = configurator.getSlackConfig().channelName
	const client = new SlackClient(authToken)
	const members = await retrieveMembers(context, channel, client)
	members.forEach(async (memberId) => {
		const message = new MessageTemplate().botMangUdinMessage(
			memberId,
			channel,
			channelName
		)
		const channelId = await client.openConversation(memberId)
		sendReminder(client, channelId, message, context, callback)
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
	context: Context,
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

/**
 * A Helper method to retrieve array of memberId from a particular channel
 * @param context			An aws-lambda context object
 * @param channelId		The channel ID that will be retrieved to get an array of member ID
 * @param client			The slack WebClient Object that will be used to retrieve private channel information
 */
async function retrieveMembers(
	context: Context,
	channelId: string,
	client: SlackClient
): Promise<string[]> {
	const groupInformations = await client.getGroupInfo(channelId)
	const members = (groupInformations as any).group.members
	return members
}

export { PostMessageHelper }
