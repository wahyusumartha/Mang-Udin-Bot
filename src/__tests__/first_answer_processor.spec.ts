import nock from "nock"
import { FirstAnswerProcessor } from "../processor/first_answer_processor"
import { Sequelize } from "../../node_modules/@types/sequelize"
import { Question } from "../database/models/Question"
import { QuestionDAO } from "../database/dao/question_dao"
import { QuestionPersistentModel } from "../model/persistent/persistent_type"
import { JSONReader, Environment } from "../helper/test/file_manager"
import { DatabaseConfigurator } from "../database/database_configurator"
import { Answer } from "../database/models/Answer"
import { AnswerDAO } from "../database/dao/answer_dao"

describe("First Answer Processor Spec", () => {
	let sequelize: Sequelize
	let questions: Question[]

	beforeEach(async () => {
		await sequelizeOpen()
	})

	afterEach(async () => {
		await sequelizeClose()
	})

	it("should not process slack message response when slack user id null", async () => {
		const messageResponse: SlackMessageResponse = {
			type: "message",
			user: undefined,
			text: "Additional text",
			client_msg_id: "1234512",
			ts: "12341412"
		}

		const firstAnswerProcessor = new FirstAnswerProcessor()
		const hasProcessedFirstAnswer = await firstAnswerProcessor.process(
			messageResponse
		)
		expect(hasProcessedFirstAnswer).toEqual(false)
	})

	it("should process slack message response", async () => {
		stubSlackClient()

		const messageResponse: SlackMessageResponse = {
			type: "message",
			user: "12342",
			text: "Additional text",
			client_msg_id: "1234512",
			ts: "12341412"
		}

		const firstAnswerProcessor = new FirstAnswerProcessor()
		const hasProcessedFirstAnswer = await firstAnswerProcessor.process(
			messageResponse
		)
		expect(hasProcessedFirstAnswer).toEqual(true)

		const answerDAO = new AnswerDAO()
		const todayAnswers = await answerDAO.getAnswersToday("12342")
		expect(todayAnswers.length).toEqual(1)
	})

	const seedQuestions = async (): Promise<Question[]> => {
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

		const questions = await questionDAO.getQuestions()
		return questions
	}

	const sequelizeOpen = async () => {
		const dbConfig = new JSONReader(Environment.Test).read("config.json")
		const databaseConfigurator = new DatabaseConfigurator(
			dbConfig.host,
			dbConfig.database,
			dbConfig.username,
			dbConfig.password,
			dbConfig.dialect
		)

		sequelize = databaseConfigurator.getSequelize()
		await Answer.destroy({ truncate: true, force: true, cascade: true })
		await Question.destroy({ truncate: true, force: true, cascade: true })
		questions = await seedQuestions()
	}

	const sequelizeClose = async () => {
		await Answer.destroy({ truncate: true, force: true, cascade: true })
		await Question.destroy({ truncate: true, force: true, cascade: true })
		await sequelize.close()
	}
})

const stubSlackClient = () => {
	nock("https://slack.com")
		.persist()
		.post("/api/conversations.open")
		.reply(200, {
			ok: true,
			channel: {
				id: "DO60JKT48"
			}
		})
		.post("/api/chat.postMessage")
		.reply(200, {
			ok: true
		})
}
