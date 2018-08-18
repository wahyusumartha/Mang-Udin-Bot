import nock from "nock"
import { Sequelize } from "../../node_modules/@types/sequelize"
import { JSONReader, Environment } from "../helper/test/file_manager"
import { DatabaseConfigurator } from "../database/database_configurator"
import { Question } from "../database/models/Question"
import { QuestionDAO } from "../database/dao/question_dao"
import {
	QuestionPersistentModel,
	AnswerPersistentModel
} from "../model/persistent/persistent_type"
import { Answer } from "../database/models/Answer"
import { NextAnswerProcessor } from "../processor/next_answer_processor"
import { AnswerDAO } from "../database/dao/answer_dao"

describe("Next Answer Processor Spec", () => {
	let sequelize: Sequelize
	let questions: Question[]

	beforeEach(async () => {
		await sequelizeOpen()
	})

	afterEach(async () => {
		await sequelizeClose()
	})

	it("should saved received event", async () => {
		stubSlackClient()

		const answerDAO = new AnswerDAO()
		const answerModel: AnswerPersistentModel = {
			slackId: "12356",
			slackMessageId: "123567",
			answerText: "Yesterday i was working on something interesting",
			questionId: questions[0].id
		}
		await answerDAO.saveAnswer(answerModel)

		const processor = new NextAnswerProcessor()
		const messageResponse: SlackMessageResponse = {
			type: "message",
			user: "12356",
			text: "i will work on another thing that interesting",
			client_msg_id: "12345678901",
			ts: "12342141241"
		}
		await processor.process(messageResponse)

		const totalAnswers = await answerDAO.getAnswersToday("12356")
		expect(totalAnswers.length).toEqual(2)
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
		return questions
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
