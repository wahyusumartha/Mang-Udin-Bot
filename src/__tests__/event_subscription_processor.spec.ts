import {
	EventSubcriptionProcessor,
	Process
} from "../processor/event_subscription_processor"
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

describe("Event Subscription Processor Spec", () => {
	let sequelize: Sequelize
	let questions: Question[]

	describe("when has subtype", () => {
		describe("when subtype is message_changed", () => {
			it("should return Process.MessageChanged", async () => {
				const eventResponse = {
					subtype: "message_changed"
				}
				const eventSubscriptionProcessor = new EventSubcriptionProcessor()
				const processor = await eventSubscriptionProcessor.process(
					eventResponse
				)
				expect(processor).toEqual(Process.MesageChanged)
			})
		})

		describe("when subtype is not message_changed", () => {
			it("should return Process.None", async () => {
				const eventResponse = {
					subtype: "message_deleted"
				}
				const eventSubscriptionProcessor = new EventSubcriptionProcessor()
				const processor = await eventSubscriptionProcessor.process(
					eventResponse
				)
				expect(processor).toEqual(Process.None)
			})
		})
	})

	describe("when does not have subtype", () => {
		beforeEach(async () => {
			await sequelizeOpen()
		})

		afterEach(async () => {
			await sequelizeClose()
		})

		describe("when message has been processed", () => {
			it("should return Process.None", async () => {
				const answerDAO = new AnswerDAO()
				const answerModel: AnswerPersistentModel = {
					slackId: "123456",
					slackMessageId: "123456890",
					answerText: "Boiled an egg",
					questionId: questions[0].id
				}
				await answerDAO.saveAnswer(answerModel)

				const eventResponse = {
					client_msg_id: "123456890"
				}

				const eventSubscriptionProcessor = new EventSubcriptionProcessor()
				const processor = await eventSubscriptionProcessor.process(
					eventResponse
				)
				expect(processor).toEqual(Process.None)
			})
		})

		describe("when today session is ended", () => {
			it("should return Process.None", async () => {
				const answerDAO = new AnswerDAO()
				const firstAnswerModel: AnswerPersistentModel = {
					slackId: "123456",
					slackMessageId: "123456890",
					answerText: "Boiled an egg",
					questionId: questions[0].id
				}

				const secondAnswerModel: AnswerPersistentModel = {
					slackId: "123456",
					slackMessageId: "123456891",
					answerText: "I will do shopping in local market",
					questionId: questions[1].id
				}

				const thirdAnswerModel: AnswerPersistentModel = {
					slackId: "123456",
					slackMessageId: "123456892",
					answerText: "Nothing",
					questionId: questions[2].id
				}
				await answerDAO.saveAnswer(firstAnswerModel)
				await answerDAO.saveAnswer(secondAnswerModel)
				await answerDAO.saveAnswer(thirdAnswerModel)

				const eventResponse = {
					client_msg_id: "123456893",
					user: "123456"
				}

				const eventSubscriptionProcessor = new EventSubcriptionProcessor()
				const processor = await eventSubscriptionProcessor.process(
					eventResponse
				)
				expect(processor).toEqual(Process.SessionEnded)
			})
		})

		describe("when just answer first question", () => {
			it("should return Process.FirstAnswer", async () => {
				const eventResponse = {
					client_msg_id: "123456890",
					user: "123456"
				}

				const eventSubscriptionProcessor = new EventSubcriptionProcessor()
				const processor = await eventSubscriptionProcessor.process(
					eventResponse
				)
				expect(processor).toEqual(Process.FirstAnswer)
			})
		})

		describe("when processed next answer", () => {
			it("should return Process.NextAnswer", async () => {
				const answerDAO = new AnswerDAO()
				const answerModel: AnswerPersistentModel = {
					slackId: "123456",
					slackMessageId: "123456890",
					answerText: "Boiled an egg",
					questionId: questions[0].id
				}
				await answerDAO.saveAnswer(answerModel)

				const eventResponse = {
					client_msg_id: "123456891",
					user: "123456"
				}

				const eventSubscriptionProcessor = new EventSubcriptionProcessor()
				const processor = await eventSubscriptionProcessor.process(
					eventResponse
				)
				expect(processor).toEqual(Process.NextAnswer)
			})
		})
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
