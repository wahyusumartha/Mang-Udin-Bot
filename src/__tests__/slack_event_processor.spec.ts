test("it should return true", () => {
	expect(1 + 1).toEqual(2)
})
import { JSONReader, Environment } from "../helper/test/file_manager"
import { DatabaseConfigurator } from "../database/database_configurator"
import { Sequelize } from "../../node_modules/sequelize-typescript"
import { QuestionDAO } from "../database/dao/question_dao"
import {
	QuestionPersistentModel,
	AnswerPersistentModel
} from "../model/persistent/persistent_type"
import { Question } from "../database/models/Question"
import { Answer } from "../database/models/Answer"
import { AnswerDAO } from "../database/dao/answer_dao"
import { SlackEventProcessor } from "../processor/slack_event_processor"
import { MessageSender } from "../helper/message_sender"
import nock from "nock"

describe("Slack Event Processor", () => {
	const dbConfig = new JSONReader(Environment.Test).read("config.json")
	const databaseConfigurator: DatabaseConfigurator = new DatabaseConfigurator(
		dbConfig.host,
		dbConfig.database,
		dbConfig.username,
		dbConfig.password,
		dbConfig.dialect
	)

	let questions: Question[]
	let sequelize: Sequelize
	let slackEventProcessor: SlackEventProcessor
	let slackResponse: SlackMessageResponse

	beforeEach(async () => {
		await sequelizeOpen()
	})

	afterEach(async () => {
		await sequelizeClose()
	})

	describe("when process first answer", () => {
		beforeEach(() => {
			stubSlackClient()

			const messageSender = new MessageSender()
			slackEventProcessor = new SlackEventProcessor(messageSender)
			slackResponse = {
				type: "message",
				user: "D024BE91L",
				text: "Worked on some CI Integration",
				client_msg_id: "1234567890",
				ts: "1358546515.000007"
			}
		})

		test("it should send second question", async () => {
			const hasSentMessage = await slackEventProcessor.process(slackResponse)
			expect(hasSentMessage).toEqual(true)
		})

		test("it should have only one answer", async () => {
			await slackEventProcessor.process(slackResponse)
			const answerDAO = new AnswerDAO()
			const todayAnswers = await answerDAO.getAnswersToday("D024BE91L")
			expect(todayAnswers.length).toEqual(1)
		})
	})

	describe("when process last answer", () => {
		beforeEach(async () => {
			stubSlackClient()

			const messageSender = new MessageSender()
			slackEventProcessor = new SlackEventProcessor(messageSender)
			slackResponse = {
				type: "message",
				user: "D024BE91L",
				text: "Need money to pay AWS BILL",
				client_msg_id: "1234567892",
				ts: "1358546515.000007"
			}

			const answerDAO = new AnswerDAO()
			const firstAnswer: AnswerPersistentModel = {
				slackId: "D024BE91L",
				slackMessageId: "1234567890",
				answerText: "Worked on some CI Integration",
				questionId: questions[0].id
			}
			await answerDAO.saveAnswer(firstAnswer)

			const secondAnswer: AnswerPersistentModel = {
				slackId: "D024BE91L",
				slackMessageId: "1234567891",
				answerText: "Deploying Mang Udin to Production",
				questionId: questions[1].id
			}
			await answerDAO.saveAnswer(secondAnswer)
		})

		test("it should send thank you message", async () => {
			const hasSentMessage = await slackEventProcessor.process(slackResponse)
			expect(hasSentMessage).toEqual(true)
		})

		test("it should have answered all questions", async () => {
			const hasSentMessage = await slackEventProcessor.process(slackResponse)

			const answerDAO = new AnswerDAO()
			const todayAnswers = await answerDAO.getAnswersToday("D024BE91L")
			expect(todayAnswers.length).toEqual(questions.length)

			const lastAnswer = await answerDAO.getLastAnswerToday("D024BE91L")
			expect(lastAnswer.question.order).toEqual(3)
		})
	})

	describe("when need to send next question", () => {
		beforeEach(async () => {
			stubSlackClient()

			const messageSender = new MessageSender()
			slackEventProcessor = new SlackEventProcessor(messageSender)
			slackResponse = {
				type: "message",
				user: "D024BE91L",
				text: "Deploy Mang Udin to Production",
				client_msg_id: "1234567891",
				ts: "1358546515.000007"
			}

			const answerDAO = new AnswerDAO()
			const firstAnswer: AnswerPersistentModel = {
				slackId: "D024BE91L",
				slackMessageId: "1234567890",
				answerText: "Worked on some CI Integration",
				questionId: questions[0].id
			}
			await answerDAO.saveAnswer(firstAnswer)
		})

		test("it should send the next question", async () => {
			const hasSentMessage = await slackEventProcessor.process(slackResponse)
			expect(hasSentMessage).toEqual(true)
		})

		test("it should has two answers", async () => {
			await slackEventProcessor.process(slackResponse)

			const answerDAO = new AnswerDAO()
			const todayAnswers = await answerDAO.getAnswersToday("D024BE91L")
			expect(todayAnswers.length).toEqual(2)

			const lastAnswer = await answerDAO.getLastAnswerToday("D024BE91L")
			expect(lastAnswer.question.order).toEqual(2)
		})
	})

	describe("when process edited message", () => {
		beforeEach(async () => {
			stubSlackClient()

			const messageSender = new MessageSender()
			slackEventProcessor = new SlackEventProcessor(messageSender)
			slackResponse = {
				type: "message",
				user: "D024BE91L",
				text: "Deploy Mang Udin to Production",
				client_msg_id: "1234567891",
				ts: "1358546515.000007",
				edited: {
					user: "D024BE91L",
					ts: "1358549517.000007"
				}
			}

			const answerDAO = new AnswerDAO()
			const firstAnswer: AnswerPersistentModel = {
				slackId: "D024BE91L",
				slackMessageId: "1234567890",
				answerText: "Worked on some CI Integration",
				questionId: questions[0].id
			}
			await answerDAO.saveAnswer(firstAnswer)
		})

		test("it should update current message", async () => {
			const hasSentMessage = await slackEventProcessor.process(slackResponse)
			expect(hasSentMessage).toEqual(false)
		})

		test("it should only has one answer", async () => {
			await slackEventProcessor.process(slackResponse)
			const answerDAO = new AnswerDAO()
			const todayAnswers = await answerDAO.getAnswersToday("D024BE91L")
			expect(todayAnswers.length).toEqual(1)
		})
	})

	// helper method
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
})
