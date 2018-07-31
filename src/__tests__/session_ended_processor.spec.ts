import nock from "nock"
import { SessionEndedProcessor } from "../processor/session_ended_processor"
describe("Session Ended Processor Spec", () => {
	beforeEach(() => {
		stubSlackClient()
	})

	it("should reply message to slack user id", async () => {
		const sessionEndedProcessor = new SessionEndedProcessor()
		const messageResponse: SlackMessageResponse = {
			type: "message",
			user: "12356",
			text: "Additional message",
			client_msg_id: "12345678901",
			ts: "12342141241"
		}

		const isAbleToSentMessage = await sessionEndedProcessor.process(
			messageResponse
		)
		expect(isAbleToSentMessage).toEqual(true)
	})

	it("should not reply message to slack user id when user id null", async () => {
		const sessionEndedProcessor = new SessionEndedProcessor()
		const messageResponse: SlackMessageResponse = {
			type: "message",
			user: undefined,
			text: "Additional message",
			client_msg_id: "12345678901",
			ts: "12342141241"
		}

		const isAbleToSentMessage = await sessionEndedProcessor.process(
			messageResponse
		)
		expect(isAbleToSentMessage).toEqual(false)
	})
})

const stubSlackClient = () => {
	nock("https://slack.com")
		.persist()
		.post("/api/conversations.open")
		.reply(200, {
			ok: true,
			channel: {
				id: "DO60JKT48"
			}
		})
		.post("/api/chat.postMessage")
		.reply(200, {
			ok: true
		})
}
