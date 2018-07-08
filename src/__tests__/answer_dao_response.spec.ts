import { AnswerDAO } from "../database/dao/answer_dao"
import { DatabaseConfigurator } from "../database/database_configurator"
import { Answer } from "../database/models/Answer"
import { QuestionDAO } from "../database/dao/question_dao"
import {
	QuestionPersistentModel,
	AnswerPersistentModel
} from "../model/persistent/persistent_type"
import { JSONReader, Environment } from "../helper/test/file_manager"

describe("Answer DAO", () => {
	const dbConfig = new JSONReader(Environment.Test).read("config.json")
	const databaseConfigurator: DatabaseConfigurator = new DatabaseConfigurator(
		dbConfig.host,
		dbConfig.database,
		dbConfig.username,
		dbConfig.password,
		dbConfig.dialect
	)

	let savedAnswer: Answer

	beforeEach(async () => {
		savedAnswer = await prepareData()
	})

	afterEach(async () => {
		const sequelize = databaseConfigurator.getSequelize()
		await sequelize.truncate({ cascade: true })
		sequelize.close()
	})

	test("Get Answer By ID", async () => {
		const answerDAO = new AnswerDAO(databaseConfigurator)
		const answer = await answerDAO.getAnswerById(savedAnswer.id)
		expect(answer).not.toBeNull()
		expect(answer.slackId).toEqual("1")
		expect(answer.slackMessageId).toEqual("1")
		expect(answer.answerText).toEqual("Answer Text")
		expect(answer.questionId).toEqual(savedAnswer.questionId)
		expect(answer.id).toEqual(savedAnswer.id)
	})

	test("Save and Retrieve Answer Data", async () => {
		const answerDAO = new AnswerDAO(databaseConfigurator)
		const allAnswerData = await answerDAO.getAnswers()
		expect(allAnswerData.length).toEqual(1)
	})

	test("Update Answer Data", async () => {
		const answerDAO = new AnswerDAO(databaseConfigurator)
		const newAnswerData: AnswerPersistentModel = {
			slackId: "2",
			slackMessageId: "2",
			answerText: "New Answer Text",
			questionId: savedAnswer.questionId
		}
		const isUpdated = await answerDAO.updateAnswer(
			savedAnswer.id,
			newAnswerData
		)
		expect(isUpdated[0]).toEqual(1)
	})

	test("Delete Answer Data", async () => {
		const answerDAO = new AnswerDAO(databaseConfigurator)
		const isDeleted = await answerDAO.deleteAnswer(savedAnswer.id)
		expect(isDeleted).toEqual(1)
	})

	// Helper Method
	const prepareData = async (): Promise<Answer> => {
		const questionDAO = new QuestionDAO(databaseConfigurator)
		const questionPersistentModel: QuestionPersistentModel = {
			questionText: "Question Text",
			order: 1
		}
		const savedQuestion = await questionDAO.saveQuestion(
			questionPersistentModel
		)

		// save answer based on question
		const answerDAO = new AnswerDAO(databaseConfigurator)
		const answerPersistentModel: AnswerPersistentModel = {
			slackId: "1",
			slackMessageId: "1",
			answerText: "Answer Text",
			questionId: savedQuestion.id
		}
		const savedAnswer = await answerDAO.saveAnswer(answerPersistentModel)

		return savedAnswer
	}
})
