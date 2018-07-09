import { DatabaseConfigurator } from "./database_configurator"
import { JSONReader, Environment } from "../helper/test/file_manager"

const env = process.argv[2]

let environment: Environment

switch (env) {
	case "test": {
		environment = Environment.Test
		break
	}
	case "development": {
		environment = Environment.Development
		break
	}
	case "production": {
		environment = Environment.Production
		break
	}
}

const dbJSON = new JSONReader(environment).read("config.json")
const dbConfigurator = new DatabaseConfigurator(
	dbJSON.host,
	dbJSON.database,
	dbJSON.username,
	dbJSON.password,
	dbJSON.dialect
)
const sequelize = dbConfigurator.getSequelize()
sequelize
	.sync({ alter: true })
	.then(() => {
		process.exit()
	})
	.catch(() => {
		process.exit()
	})
