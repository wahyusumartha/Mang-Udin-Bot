import {
	WebClient,
	RTMClient,
	WebAPICallResult,
	WebAPICallError
} from "@slack/client"

/**
 * An Object that will communicate to slack api
 */
export class SlackClient {
	private token: string

	/**
	 * A constructor for an object that has function to
	 * communicate with slack api
	 * @param token an access token from slack server
	 */
	constructor(token: string) {
		this.token = token
	}

	/**
	 * Send a slack message to user or channel
	 * @param slackMessage an interface of needed parameter to send a message to slack
	 */
	async sendMessage(slackMessage: SlackMessage): Promise<WebAPICallResult> {
		const response = await this.webClient().chat.postMessage({
			text: slackMessage.message,
			channel: slackMessage.channel,
			as_user: slackMessage.as_user
		})
		return response
	}

	/**
	 * Get detail information of private channel
	 * @param channelId The channelId of the private channel that will be retrieved
	 */
	async getGroupInfo(channelId: string): Promise<WebAPICallResult> {
		const response = await this.webClient().groups.info({
			channel: channelId
		})
		return response
	}

	/**
	 * Getter method of Webclient from given token
	 * @returns	an object of slack webclient with given token
	 */
	private webClient(): WebClient {
		return new WebClient(this.token)
	}

	async openConversation(users: string): Promise<string> {
		const response = await this.webClient().conversations.open({
			users: users
		})
		return (response as any).channel.id
	}
}
