import { Sequelize } from "sequelize-typescript"
import { Answer } from "../database/models/Answer"
import { Question } from "../database/models/Question"

export class DatabaseConfigurator {
	private host: string
	private database: string
	private username: string
	private password: string
	private dialect: string

	constructor(
		host: string,
		database: string,
		username: string,
		password: string,
		dialect: string
	) {
		this.host = host
		this.database = database
		this.username = username
		this.password = password
		this.dialect = dialect
	}

	getSequelize(): Sequelize {
		const sequelize = new Sequelize({
			host: this.host,
			database: this.database,
			username: this.username,
			password: this.password,
			dialect: this.dialect
		})
		sequelize.addModels([Answer, Question])
		return sequelize
	}
}
