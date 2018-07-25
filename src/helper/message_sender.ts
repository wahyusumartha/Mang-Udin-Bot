import { Configurator } from "../config/slack_message_config"
import { SlackClient } from "../client/slack_client"

export class MessageSender {
	private slackConfigurator: Configurator
	private slackClient: SlackClient

	constructor(configurator?: Configurator) {
		if (configurator == undefined) {
			this.slackConfigurator = new Configurator("env.yml")
		} else {
			this.slackConfigurator = configurator
		}

		this.slackClient = new SlackClient(
			this.slackConfigurator.getSlackConfig().botToken
		)
	}

	async send(slackUserId: string, message: string): Promise<boolean> {
		const channelId = await this.slackClient.openConversation(slackUserId)

		// early exit when open conversation failed
		if (channelId == undefined) {
			return false
		}

		const slackMessage: SlackMessage = {
			message: message,
			channel: channelId,
			username: "",
			as_user: false
		}
		const response = await this.slackClient.sendMessage(slackMessage)
		return response.ok ? true : false
	}
}
