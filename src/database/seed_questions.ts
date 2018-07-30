import { DatabaseConfigurator } from "./database_configurator"
import { JSONReader, Environment } from "../helper/test/file_manager"
import { QuestionDAO } from "./dao/question_dao"
import { QuestionPersistentModel } from "../model/persistent/persistent_type"

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
	.sync()
	.then(async () => {
		const questionDAO = new QuestionDAO()

		const firstQuestion: QuestionPersistentModel = {
			questionText: "What did you accomplish yesterday?",
			order: 1
		}

		const secondQuestion: QuestionPersistentModel = {
			questionText: "What will you do today?",
			order: 2
		}

		const thirdQuestion: QuestionPersistentModel = {
			questionText: "What obstacles are impeding your progress?",
			order: 3
		}

		await questionDAO.saveQuestion(firstQuestion)
		await questionDAO.saveQuestion(secondQuestion)
		await questionDAO.saveQuestion(thirdQuestion)

		await sequelize.close()
		process.exit()
	})
	.catch(async () => {
		await sequelize.close()
		process.exit()
	})
