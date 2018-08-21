import { AnswerDAO } from "../database/dao/answer_dao"
import { QuestionDAO } from "../database/dao/question_dao"
import { AnswerPersistentModel } from "../model/persistent/persistent_type"
import { MessageSender } from "../helper/message_sender"
import { SummaryReport } from "../helper/summary_report"

export class NextAnswerProcessor
	implements EventProcessor<SlackMessageResponse, Promise<boolean>> {
	async process(event: SlackMessageResponse): Promise<boolean> {
		const slackUserId = event.user

		const answerDAO = new AnswerDAO()
		const todayLastAnswer = await answerDAO.getLastAnswerToday(slackUserId)

		const currentOrder = todayLastAnswer.question.order
		const nextQuestionOrder = currentOrder + 1

		const questionDAO = new QuestionDAO()
		const nextQuestion = await questionDAO.getQuestionByOrder(nextQuestionOrder)

		const savedAnswerModel: AnswerPersistentModel = {
			slackId: slackUserId,
			slackMessageId: event.client_msg_id,
			questionId: nextQuestion.id,
			answerText: event.text
		}
		await answerDAO.saveAnswer(savedAnswerModel)

		const hasAnswerAllQuestions = await this.hasAnsweredAllQuestions(
			questionDAO,
			answerDAO,
			slackUserId
		)

		let message: string
		if (hasAnswerAllQuestions) {
			const summaryReport = new SummaryReport()
			await summaryReport.sendToChannel(slackUserId, "mang-udin")
			message = "Thank You and Have Fun :clap::palm_tree:"
		} else {
			const nextSentQuestionOrder = nextQuestionOrder + 1
			const nextQuestion = await questionDAO.getQuestionByOrder(
				nextSentQuestionOrder
			)
			message = nextQuestion.questionText
		}

		const messageSender = new MessageSender()
		const hasSentMessage = await messageSender.send(slackUserId, message)
		return hasSentMessage
	}

	private async hasAnsweredAllQuestions(
		questionDAO: QuestionDAO,
		answerDAO: AnswerDAO,
		slackUserId: string
	): Promise<boolean> {
		const questions = await questionDAO.getQuestions()
		const maxQuestion = questions.length
		const todayAnswers = await answerDAO.getAnswersToday(slackUserId)
		const hasAnswerAllQuestions = todayAnswers.length == maxQuestion
		return hasAnswerAllQuestions
	}
}
