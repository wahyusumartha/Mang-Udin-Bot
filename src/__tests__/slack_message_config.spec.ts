import { Configurator } from "../config/slack_message_config"

describe("Slack Message Configuration", () => {
	let configurator: Configurator = undefined

	describe("when there is file configuration", () => {
		beforeEach(() => {
			configurator = new Configurator("env.example.yml")
		})

		it("should return correct bot token", () => {
			expect(configurator.getSlackConfig().botToken).toEqual(
				"<YOUR_BOT_ACCESS_TOKEN>"
			)
		})

		it("should return correct auth token", () => {
			expect(configurator.getSlackConfig().oauthToken).toEqual(
				"<YOUR_OAUTH_ACCESS_TOKEN>"
			)
		})

		it("should return correct channel name", () => {
			expect(configurator.getSlackConfig().channelName).toEqual(
				"<YOUR_CHANNEL_NAME>"
			)
		})

		it("should return correct channel destination", () => {
			expect(configurator.getSlackConfig().channel).toEqual(
				"<YOUR_CHANNEL_DESTINATION_ID>"
			)
		})
	})

	describe("when there is no file configuration", () => {
		beforeEach(() => {
			configurator = new Configurator("env.whatever.yml")
		})

		it("should throw an exception", () => {
			expect(() => configurator.getSlackConfig()).toThrowError(
				"Error: ENOENT: no such file or directory, open 'env.whatever.yml'"
			)
		})
	})
})
