import { MessageSender } from "../helper/message_sender"

export class SessionEndedProcessor
	implements EventProcessor<SlackMessageResponse, Promise<boolean>> {
	async process(event: SlackMessageResponse): Promise<boolean> {
		const hasSlackUser = "user" in event
		if (!hasSlackUser) {
			return false
		}

		const slackUserId = event.user
		if (slackUserId == undefined) {
			return false
		}

		return true
	// 	const messageSender = new MessageSender()
	// 	const hasSentMessage = await messageSender.send(
	// 		slackUserId,
	// 		":sweat_smile:"
	// 	)
	// 	return hasSentMessage
	// }
	}
}
