import { SlackClient } from "../client/slack_client"
import { Context, Callback } from "aws-lambda"
import { MessageTemplate, Configurator } from "../config/slack_message_config"

const PostMessageHelper = async (
	event: any,
	context: Context,
	callback: Callback
) => {
	const configurator = new Configurator()
	const token = configurator.getSlackConfig().token
	const channel = configurator.getSlackConfig().channel
	const channelName = configurator.getSlackConfig().channelName
	const client = new SlackClient(token)
	const members = await retrieveGroupInfo(context, channel, client)
	members.forEach(memberId => {
		const message = new MessageTemplate().botMangUdinMessage(
			memberId,
			channel,
			channelName
		)
		sendReminder(client, memberId, message, context, callback)
	})
}

async function sendReminder(
	client: SlackClient,
	userId: string,
	message: string,
	context: Context,
	callback: Callback
) {
	const slackMessage = {
		message: message,
		channel: userId,
		username: "Mang Udin",
		as_user: true
	}

	const response = await client.sendMessage(slackMessage)
	if (response.ok) {
		callback(undefined, response)
	} else {
		callback(Error(response.toString()), undefined)
	}
}

async function retrieveGroupInfo(
	context: Context,
	channelId: string,
	client: SlackClient
): Promise<string[]> {
	const groupInformations = await client.getGroupInfo(channelId)
	const members = (groupInformations as any).group.members
	return members
}

export { PostMessageHelper }
