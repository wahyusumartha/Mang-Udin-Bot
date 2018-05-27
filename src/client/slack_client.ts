import { WebClient, WebAPICallResult, WebAPICallError } from "@slack/client"

export class SlackClient {
	private token: string

	constructor(token: string) {
		this.token = token
	}

	async sendMessage(slackMessage: SlackMessage): Promise<WebAPICallResult> {
		const response = await this.webClient().chat.postMessage({
			text: slackMessage.message,
			channel: slackMessage.channel
		})
		return response
	}

	async getGroupInfo(channelId: string): Promise<WebAPICallResult> {
		const response = await this.webClient().groups.info({
			channel: channelId
		})
		return response
	}

	private webClient(): WebClient {
		return new WebClient(this.token)
	}
}
