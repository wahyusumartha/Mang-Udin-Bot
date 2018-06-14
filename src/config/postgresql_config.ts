import * as jsyaml from "js-yaml"
import * as fs from "fs"

/**
 * An Object that will load needed configuration value
 */
export class Postgres {
	private fileName: string

	constructor(fileName: string) {
		this.fileName = fileName
	}
	/**
	 * Load YML Configuration that needed to communicate with slack api
	 * @returns The Interface that define for all configuration that related with slack
	 */
	getPostgresConfig(): PostgresConfig {
		const yamlDocument = this.loadConfiguration()
		return {
			host: yamlDocument.postgresql.host,
			port: yamlDocument.postgresql.port,
			database: yamlDocument.postgresql.database,
			username: yamlDocument.postgresql.username,
			password: yamlDocument.postgresql.password,
			maxPool: yamlDocument.postgresql.max_pool
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
