describe("SlackEventResponse", () => {
	test("JSON Mapping to SlackEventResponse", () => {
		const eventJSONString =
			'{"type":"message","message":{"type":"message","user":"U02GR","text":"MangUdinYouare awesome","client_msg_id":"65f5c4d6-e0f7-4012-9a42-13a9717e743d","edited":{"user":"U02GR","ts":"1528581809.000000"},"ts":"1528579560.000071"},"subtype":"message_changed","hidden":true,"channel":"DAW851SK3","previous_message":{"type":"message","user":"U02GR","text":"MangUdinYouare awesome","client_msg_id":"65f5c4d6-e0f7-4012-9a42-13a9717e743d","ts":"1528579560.000071"},"event_ts":"1528581809.000046","ts":"1528581809.000046","channel_type":"im"}'
		const expectedEventResponse: SlackEventResponse = JSON.parse(
			eventJSONString
		)

		expect(expectedEventResponse.type).toEqual("message")
		expect(expectedEventResponse.message).not.toBe(undefined)
		expect(expectedEventResponse.message.type).toEqual("message")
		expect(expectedEventResponse.message.user).toEqual("U02GR")
		expect(expectedEventResponse.message.text).toEqual("MangUdinYouare awesome")
		expect(expectedEventResponse.message.client_msg_id).toEqual(
			"65f5c4d6-e0f7-4012-9a42-13a9717e743d"
		)
		expect(expectedEventResponse.message.edited).not.toBe(undefined)
		expect(expectedEventResponse.message.edited.user).toEqual("U02GR")
		expect(expectedEventResponse.message.edited.ts).toEqual("1528581809.000000")
		expect(expectedEventResponse.message.ts).toEqual("1528579560.000071")
		expect(expectedEventResponse.subtype).toEqual("message_changed")
		expect(expectedEventResponse.hidden).toEqual(true)
		expect(expectedEventResponse.channel).toEqual("DAW851SK3")
		expect(expectedEventResponse.previous_message).not.toBe(undefined)
		expect(expectedEventResponse.previous_message.type).toEqual("message")
		expect(expectedEventResponse.previous_message.user).toEqual("U02GR")
		expect(expectedEventResponse.previous_message.text).toEqual(
			"MangUdinYouare awesome"
		)
		expect(expectedEventResponse.previous_message.client_msg_id).toEqual(
			"65f5c4d6-e0f7-4012-9a42-13a9717e743d"
		)
		expect(expectedEventResponse.previous_message.ts).toEqual(
			"1528579560.000071"
		)
		expect(expectedEventResponse.event_ts).toEqual("1528581809.000046")
		expect(expectedEventResponse.ts).toEqual("1528581809.000046")
		expect(expectedEventResponse.channel_type).toEqual("im")
	})
})
