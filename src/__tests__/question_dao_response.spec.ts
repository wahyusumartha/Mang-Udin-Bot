import { DatabaseConfigurator } from "../database/database_configurator"
import { Question } from "../database/models/Question"
import { QuestionDAO } from "../database/dao/question_dao"
import { QuestionPersistentModel } from "../model/persistent/persistent_type"
import { JSONReader, Environment } from "../helper/test/file_manager"

describe("Question DAO", () => {
	const dbConfig = new JSONReader(Environment.Test).read("config.json")
	const databaseConfigurator: DatabaseConfigurator = new DatabaseConfigurator(
		dbConfig.host,
		dbConfig.database,
		dbConfig.username,
		dbConfig.password,
		dbConfig.dialect
	)

	let savedQuestion: Question

	beforeEach(async () => {
		savedQuestion = await prepareData()
	})

	afterEach(async () => {
		const sequelize = databaseConfigurator.getSequelize()
		await sequelize.truncate({ cascade: true })
		sequelize.close()
	})

	test("Get Question By ID", async () => {
		const questionDAO = new QuestionDAO(databaseConfigurator)
		const question = await questionDAO.getQuestionById(savedQuestion.id)
		expect(question).not.toBeNull()
		expect(question.questionText).toEqual("Question Text")
		expect(question.order).toEqual(1)
	})

	test("Save and Retrieve Question Data", async () => {
		const questionDAO = new QuestionDAO(databaseConfigurator)
		const allQuestionData = await questionDAO.getQuestions()
		expect(allQuestionData.length).toEqual(1)
	})

	test("Update Question Data", async () => {
		const questionDAO = new QuestionDAO(databaseConfigurator)
		const newQuestionData: QuestionPersistentModel = {
			questionText: "New Question Text",
			order: 2
		}
		const isUpdated = await questionDAO.updateQuestion(
			savedQuestion.id,
			newQuestionData
		)
		expect(isUpdated[0]).toEqual(1)
	})

	test("Delete Question Data", async () => {
		const questionDAO = new QuestionDAO(databaseConfigurator)
		const isDeleted = await questionDAO.deleteQuestion(savedQuestion.id)
		expect(isDeleted).toEqual(1)
	})

	// Helper Method
	const prepareData = async (): Promise<Question> => {
		const questionDAO = new QuestionDAO(databaseConfigurator)
		const questionPersistentModel: QuestionPersistentModel = {
			questionText: "Question Text",
			order: 1
		}
		const savedQuestion = await questionDAO.saveQuestion(
			questionPersistentModel
		)
		return savedQuestion
	}
})
