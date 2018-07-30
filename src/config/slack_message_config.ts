import * as jsyaml from "js-yaml"
import * as fs from "fs"

/**
 * An Object that will load needed configuration value
 */
export class Configurator {
	private fileName: string

	constructor(fileName: string) {
		this.fileName = fileName
	}
	/**
	 * Load YML Configuration that needed to communicate with slack api
	 * @returns The Interface that define for all configuration that related with slack
	 */
	getSlackConfig(): SlackConfig {
		const yamlDocument = this.loadConfiguration()
		return {
			authToken: yamlDocument.slack.auth_token,
			botToken: yamlDocument.slack.bot_token,
			channel: yamlDocument.slack.channel_destination,
			channelName: yamlDocument.slack.channel_name
		}
	}

	loadConfiguration(): any {
		try {
			const yamlFile = fs.readFileSync(this.fileName, "utf8")
			const yamlDocument = jsyaml.safeLoad(yamlFile)
			return yamlDocument
		} catch (error) {
			throw new Error(error)
		}
	}
}

export class MessageTemplate {
	botMangUdinMessage(userId: string): string {
		return `Hello <@${userId}>! It's time for our standup meeting. When you are ready please answer the following question:\nWhat did you accomplish yesterday?`
	}
}
