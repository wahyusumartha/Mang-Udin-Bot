import { MessageSender } from "../helper/message_sender"
import nock from "nock"

describe("Message Sender Spec", () => {
	beforeEach(() => {
		nock.cleanAll()
	})

	afterEach(() => {
		nock.cleanAll()
	})

	test("it should send message", async () => {
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

		const messageSender = new MessageSender()
		const shouldSendMessage = await messageSender.send("212345", "hello")
		expect(shouldSendMessage).toEqual(true)
	})

	test("it should not be able to send message when open conversation failed", async () => {
		nock("https://slack.com")
			.persist()
			.post("/api/conversations.open")
			.reply(200, {
				ok: true
			})

		const messageSender = new MessageSender()
		const shouldSendMessage = await messageSender.send("212345", "hello")
		expect(shouldSendMessage).toEqual(false)
	})

	test("it should not be able to send message", async () => {
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
				ok: false
			})

		const messageSender = new MessageSender()
		const shouldSendMessage = await messageSender.send("212345", "hello")
		expect(shouldSendMessage).toEqual(false)
	})
})
