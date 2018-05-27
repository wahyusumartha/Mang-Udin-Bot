import * as jsyaml from "js-yaml"
import * as fs from "fs"

/**
 * An Object that will load needed configuration value
 */
export class Configurator {
	/**
	 * Load YML Configuration that needed to communicate with slack api
	 * @returns The Interface that define for all configuration that related with slack
	 */
	getSlackConfig(): SlackConfig {
		const yamlDocument = this.loadConfiguration()
		return {
			token: yamlDocument.slack.token,
			channel: yamlDocument.slack.channel_destination,
			channelName: yamlDocument.slack.channel_name
		}
	}

	private loadConfiguration(): any {
		try {
			const yamlFile = fs.readFileSync("env.yml", "utf8")
			const yamlDocument = jsyaml.safeLoad(yamlFile)
			return yamlDocument
		} catch (error) {
			throw new Error(error)
		}
	}
}

export class MessageTemplate {
	botMangUdinMessage(
		userId: string,
		channelId: string,
		channelName: string
	): string {
		return (
			"Hey <@" +
			userId +
			"> nama gw Mang Udin, Gua sih cuman Ngebantuin si boss,\n" +
			"Tiap Jam 10 Pagi di channel `<#" +
			channelId +
			"|" +
			channelName +
			">`\n\n" +
			"1. Ngingetin lu buat nge post apa aja yang udah luw kerjain kemaren\n" +
			"2. Ngingetin apa yang mau lu kerjain hari ini\n\n" +
			"Jadi biar gw nggak dimarahin si boss, cepetan bikin update ya :bearded_person: :metal:"
		)
	}
}
