import { AnswerDAO } from "../database/dao/answer_dao"
import { DatabaseConfigurator } from "../database/database_configurator"
import { Answer } from "../database/models/Answer"
import { Question } from "../database/models/Question"
import { QuestionDAO } from "../database/dao/question_dao"
import moment from "moment"
import {
	QuestionPersistentModel,
	AnswerPersistentModel
} from "../model/persistent/persistent_type"
import { JSONReader, Environment } from "../helper/test/file_manager"
import { Sequelize } from "sequelize"

describe("Answer DAO", () => {
	const dbConfig = new JSONReader(Environment.Test).read("config.json")
	const databaseConfigurator: DatabaseConfigurator = new DatabaseConfigurator(
		dbConfig.host,
		dbConfig.database,
		dbConfig.username,
		dbConfig.password,
		dbConfig.dialect
	)

	let sequelize: Sequelize
	let savedAnswer: Answer

	beforeEach(async () => {
		await sequelizeOpen()
	})

	afterEach(async () => {
		await sequelizeClose()
	})

	test("Get Answer By ID", async () => {
		const answerDAO = new AnswerDAO()
		const answer = await answerDAO.getAnswerById(savedAnswer.id)
		expect(answer).not.toBeNull()
		expect(answer.slackId).toEqual("1")
		expect(answer.slackMessageId).toEqual("1")
		expect(answer.answerText).toEqual("Answer Text")
		expect(answer.questionId).toEqual(savedAnswer.questionId)
		expect(answer.id).toEqual(savedAnswer.id)
	})

	test("Save and Retrieve Answer Data", async () => {
		const answerDAO = new AnswerDAO()
		const answerPersistentModel: AnswerPersistentModel = {
			slackId: "1",
			slackMessageId: "1",
			answerText: "Answer Text",
			questionId: savedAnswer.questionId
		}
		const answerData = await answerDAO.saveAnswer(answerPersistentModel)
		if (answerData) {
			const allAnswerData = await answerDAO.getAnswers()
			expect(allAnswerData.length).toEqual(2)
		}
	})

	test("Get Last Answer Today By SlackID", async () => {
		const answerDAO = new AnswerDAO()
		const answer = await answerDAO.getLastAnswerToday("1")
		expect(answer.id).toEqual(savedAnswer.id)
		expect(answer.questionId).toEqual(savedAnswer.questionId)
		expect(answer.slackId).toEqual("1")
		expect(answer.slackMessageId).toEqual("1")
		expect(answer.answerText).toEqual("Answer Text")
		expect(answer.question).not.toBeNull()
		expect(moment(answer.updatedAt).format("YYYY-MM-DD")).toEqual(
			moment().format("YYYY-MM-DD")
		)
	})

	test("Get Answers Today By SlackID", async () => {
		const answerDAO = new AnswerDAO()
		const answers = await answerDAO.getAnswersToday("1")
		const singleAnswer = answers[0]
		expect(answers.length).toEqual(1)
		expect(singleAnswer).not.toBeNull()
		expect(moment(singleAnswer.updatedAt).format("YYYY-MM-DD")).toEqual(
			moment().format("YYYY-MM-DD")
		)
	})

	test("Get Answers Today By SlackMessageID", async () => {
		const answerDAO = new AnswerDAO()
		const answers = await answerDAO.getAnswersBySlackMessageId("1")
		const singleAnswer = answers[0]
		expect(answers.length).toEqual(1)
		expect(singleAnswer).not.toBeNull()
		expect(moment(singleAnswer.updatedAt).format("YYYY-MM-DD")).toEqual(
			moment().format("YYYY-MM-DD")
		)
	})

	test("Update Answer Data", async () => {
		const answerDAO = new AnswerDAO()
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
		const answerDAO = new AnswerDAO()
		const isDeleted = await answerDAO.deleteAnswer(savedAnswer.id)
		expect(isDeleted).toEqual(1)
	})

	// Helper Method
	const prepareData = async (): Promise<Answer> => {
		const questionDAO = new QuestionDAO()
		const questionPersistentModel: QuestionPersistentModel = {
			questionText: "Question Text",
			order: 1
		}
		const savedQuestion = await questionDAO.saveQuestion(
			questionPersistentModel
		)

		// save answer based on question
		const answerDAO = new AnswerDAO()
		const answerPersistentModel: AnswerPersistentModel = {
			slackId: "1",
			slackMessageId: "1",
			answerText: "Answer Text",
			questionId: savedQuestion.id
		}
		const savedAnswer = await answerDAO.saveAnswer(answerPersistentModel)

		return savedAnswer
	}

	const sequelizeOpen = async () => {
		sequelize = databaseConfigurator.getSequelize()
		await Answer.destroy({ truncate: true, force: true, cascade: true })
		await Question.destroy({ truncate: true, force: true, cascade: true })
		savedAnswer = await prepareData()
	}

	const sequelizeClose = async () => {
		await Answer.destroy({ truncate: true, force: true, cascade: true })
		await Question.destroy({ truncate: true, force: true, cascade: true })
		await sequelize.close()
	}
})
