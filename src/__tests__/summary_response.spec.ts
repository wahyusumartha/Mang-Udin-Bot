import nock from "nock"
import { Sequelize } from "sequelize"
import { JSONReader, Environment } from "../helper/test/file_manager"
import { DatabaseConfigurator } from "../database/database_configurator"
import {
	OpenDatabaseConnection,
	CloseDatabaseConnection
} from "../helper/sequelize_connection_helper"
import { SummaryReport } from "../helper/summary_report"
import {
	AnswerPersistentModel,
	QuestionPersistentModel
} from "../model/persistent/persistent_type"
import { AnswerDAO } from "../database/dao/answer_dao"
import { QuestionDAO } from "../database/dao/question_dao"
import { MessageSender } from "../helper/message_sender"

describe("Stand Up Summary", () => {
	const dbConfig = new JSONReader(Environment.Test).read("config.json")
	const databaseConfigurator: DatabaseConfigurator = new DatabaseConfigurator(
		dbConfig.host,
		dbConfig.database,
		dbConfig.username,
		dbConfig.password,
		dbConfig.dialect
	)

	let sequelize: Sequelize

	beforeEach(async () => {
		sequelize = await OpenDatabaseConnection(databaseConfigurator)
	})

	afterEach(async () => {
		await CloseDatabaseConnection(sequelize)
	})

	it("Should Return Report Summary By Slack ID", async () => {
		const slackUserId = "12356"

		const questionDAO = new QuestionDAO()
		const firstQuestion: QuestionPersistentModel = {
			questionText: "What did you accomplish yesterday?",
			order: 1
		}
		await questionDAO.saveQuestion(firstQuestion)
		const resultFirstQuestion = await questionDAO.getQuestionByOrder(1)

		const answerDAO = new AnswerDAO()
		const firstAnswer: AnswerPersistentModel = {
			slackId: slackUserId,
			slackMessageId: "123567",
			answerText: "Yesterday i was working on something interesting",
			questionId: resultFirstQuestion.id
		}
		await answerDAO.saveAnswer(firstAnswer)

		const secondQuestion: QuestionPersistentModel = {
			questionText: "What will you do today?",
			order: 2
		}
		await questionDAO.saveQuestion(secondQuestion)
		const resultSecondQuestion = await questionDAO.getQuestionByOrder(2)
		const secondAnswer: AnswerPersistentModel = {
			slackId: slackUserId,
			slackMessageId: "123568",
			answerText: "Finishing mang udin",
			questionId: resultSecondQuestion.id
		}
		await answerDAO.saveAnswer(secondAnswer)

		const thirdQuestion: QuestionPersistentModel = {
			questionText: "What obstacles are impeding your progress?",
			order: 3
		}
		await questionDAO.saveQuestion(thirdQuestion)
		const resultThirdQuestion = await questionDAO.getQuestionByOrder(3)
		const thirdAnswer: AnswerPersistentModel = {
			slackId: slackUserId,
			slackMessageId: "123569",
			answerText: "Nope",
			questionId: resultThirdQuestion.id
		}
		await answerDAO.saveAnswer(thirdAnswer)

		const answers = await answerDAO.getAnswersToday(slackUserId)
		expect(answers.length).toEqual(3)

		const summaryReport = new SummaryReport()
		const summaryMessage = await summaryReport.retrieveTodaySummary(slackUserId)
		expect(summaryMessage).not.toBe("")
	})

	it("Should Send Summary Report to Channel", async () => {
		stubSlackClient()

		const slackUserId = "12356"

		const questionDAO = new QuestionDAO()
		const firstQuestion: QuestionPersistentModel = {
			questionText: "What did you accomplish yesterday?",
			order: 1
		}
		await questionDAO.saveQuestion(firstQuestion)
		const resultFirstQuestion = await questionDAO.getQuestionByOrder(1)

		const answerDAO = new AnswerDAO()
		const firstAnswer: AnswerPersistentModel = {
			slackId: slackUserId,
			slackMessageId: "123567",
			answerText: "Yesterday i was working on something interesting",
			questionId: resultFirstQuestion.id
		}
		await answerDAO.saveAnswer(firstAnswer)

		const secondQuestion: QuestionPersistentModel = {
			questionText: "What will you do today?",
			order: 2
		}
		await questionDAO.saveQuestion(secondQuestion)
		const resultSecondQuestion = await questionDAO.getQuestionByOrder(2)
		const secondAnswer: AnswerPersistentModel = {
			slackId: slackUserId,
			slackMessageId: "123568",
			answerText: "Finishing mang udin",
			questionId: resultSecondQuestion.id
		}
		await answerDAO.saveAnswer(secondAnswer)

		const thirdQuestion: QuestionPersistentModel = {
			questionText: "What obstacles are impeding your progress?",
			order: 3
		}
		await questionDAO.saveQuestion(thirdQuestion)
		const resultThirdQuestion = await questionDAO.getQuestionByOrder(3)
		const thirdAnswer: AnswerPersistentModel = {
			slackId: slackUserId,
			slackMessageId: "123569",
			answerText: "Nope",
			questionId: resultThirdQuestion.id
		}
		await answerDAO.saveAnswer(thirdAnswer)

		const answers = await answerDAO.getAnswersToday(slackUserId)
		expect(answers.length).toEqual(3)

		const summaryReport = new SummaryReport()
		const hasSentToChannel = await summaryReport.sendToChannel(
			slackUserId,
			"mang-udin"
		)
		expect(hasSentToChannel).toBe(true)
	})
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
