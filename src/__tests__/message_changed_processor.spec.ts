import { Sequelize } from "../../node_modules/@types/sequelize"
import { JSONReader, Environment } from "../helper/test/file_manager"
import { DatabaseConfigurator } from "../database/database_configurator"
import { Answer } from "../database/models/Answer"
import { Question } from "../database/models/Question"
import { QuestionDAO } from "../database/dao/question_dao"
import {
	QuestionPersistentModel,
	AnswerPersistentModel
} from "../model/persistent/persistent_type"
import { AnswerDAO } from "../database/dao/answer_dao"
import { MessageChangedProcessor } from "../processor/message_changed_processor"

describe("Message Changed Processor Spec", () => {
	let sequelize: Sequelize
	let questions: Question[]

	beforeEach(async () => {
		await sequelizeOpen()
	})

	afterEach(async () => {
		await sequelizeClose()
	})

	it("should update answer data with specific client message id", async () => {
		// mock data with first answer
		const answerModel: AnswerPersistentModel = {
			slackId: "12345",
			slackMessageId: "1234567",
			answerText: "Hello Hello Bandung",
			questionId: questions[0].id
		}

		const answerDAO = new AnswerDAO()
		await answerDAO.saveAnswer(answerModel)

		const editedSlackMessageResponse: SlackMessageResponse = {
			type: "message",
			user: "12345",
			client_msg_id: "1234567",
			text: "Ibukota pariangan",
			ts: "929292912992",
			edited: {
				user: "12345",
				ts: "9292929292929292"
			}
		}

		const processor = new MessageChangedProcessor()
		await processor.process(editedSlackMessageResponse)

		const answers = await answerDAO.getAnswersBySlackMessageId("1234567")
		const updatedAnswers = answers[0]

		expect(updatedAnswers.answerText).toEqual("Ibukota pariangan")
		expect(answers.length).toEqual(1)
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
