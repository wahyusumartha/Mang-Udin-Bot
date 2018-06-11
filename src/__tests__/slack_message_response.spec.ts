describe("SlackMessageResponse", () => {
	test("JSON Mapping to SlackMessageResponse", () => {
		const messageJSONString =
			'{"type":"message","user":"U02GR","text":"MangUdinYouare owsom","client_msg_id":"65f5c4d6-e0f7-4012-9a42-03a9717ee423","edited":{"user":"U02GR","ts":"1528581809.000000"},"ts":"1528579560.000071"}'
		const expectedMessageResponse: SlackMessageResponse = JSON.parse(
			messageJSONString
		)
		expect(expectedMessageResponse.type).toEqual("message")
		expect(expectedMessageResponse.user).toEqual("U02GR")
		expect(expectedMessageResponse.text).toEqual("MangUdinYouare owsom")
		expect(expectedMessageResponse.client_msg_id).toEqual(
			"65f5c4d6-e0f7-4012-9a42-03a9717ee423"
		)
		expect(expectedMessageResponse.edited).not.toBe(undefined)
		expect(expectedMessageResponse.edited.ts).toEqual("1528581809.000000")
		expect(expectedMessageResponse.edited.user).toEqual("U02GR")
		expect(expectedMessageResponse.ts).toEqual("1528579560.000071")
	})
})
