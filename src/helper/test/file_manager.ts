import fs from "fs"
interface FileManager<T> {
	read(filePath: string): T
}

declare type DBConfig = {
	username: string
	password: string
	database: string
	host: string
	dialect: string
}

export enum Environment {
	Test = 0,
	Development,
	Production
}

export class JSONReader implements FileManager<DBConfig> {
	private environment: Environment

	constructor(environment?: Environment) {
		if (environment == undefined) {
			switch (process.env.ENV_STAGE) {
				case "dev": {
					environment = Environment.Development
					break
				}
				case "production": {
					environment = Environment.Production
					break
				}
				default: {
					environment = Environment.Test
					break
				}
			}
		} else {
			this.environment = environment
		}
	}

	read(filePath: string): DBConfig {
		const jsonResponse = JSON.parse(fs.readFileSync(filePath, "utf8"))
		let dbConfig: any
		switch (this.environment) {
			case Environment.Test: {
				dbConfig = jsonResponse.test
				break
			}
			case Environment.Development: {
				dbConfig = jsonResponse.development
				break
			}
			case Environment.Production: {
				dbConfig = jsonResponse.production
				break
			}
		}

		const config: DBConfig = {
			username: dbConfig.username,
			password: dbConfig.password,
			database: dbConfig.database,
			host: dbConfig.host,
			dialect: dbConfig.dialect
		}
		return config
	}
}
