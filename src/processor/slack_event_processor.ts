import { AnswerDAO } from "../database/dao/answer_dao"
import { MessageSender } from "../helper/message_sender"
import { QuestionDAO } from "../database/dao/question_dao"
import { AnswerPersistentModel } from "../model/persistent/persistent_type"
import { Answer } from "../database/models/Answer"

export class SlackEventProcessor
	implements EventProcessor<SlackMessageResponse, Promise<boolean>> {
	private answerDataAccessObject: AnswerDAO
	private questionDataAccessObject: QuestionDAO
	private messageSender: MessageSender

	constructor(messageSender?: MessageSender) {
		messageSender == undefined
			? (this.messageSender = new MessageSender())
			: (this.messageSender = messageSender)
		this.answerDataAccessObject = new AnswerDAO()
		this.questionDataAccessObject = new QuestionDAO()
	}

	async process(event: SlackMessageResponse): Promise<boolean> {
		const hasProcessedSlackMessage = await this.hasProcessedSlackMessage(
			event.client_msg_id
		)
		const hasAnsweredAllQuestions = await this.hasAnsweredAllQuestions(
			event.user
		)

		if (hasProcessedSlackMessage || hasAnsweredAllQuestions) {
			return false
		} else {
			const slackUserId = event.user
			const latestAnswers = await this.answerDataAccessObject.getAnswersToday(
				slackUserId
			)

			const isFirstAnswer = latestAnswers.length == 0
			if (isFirstAnswer) {
				const hasSentMessage = await this.processFirstAnswer(
					slackUserId,
					event.client_msg_id,
					event.text
				)
				return hasSentMessage
			} else {
				const latestAnswer = await this.answerDataAccessObject.getLastAnswerToday(
					slackUserId
				)
				const isEditedText = event.edited != undefined
				const hasSentMessage = await this.processNextAnswer(
					latestAnswer,
					slackUserId,
					event.client_msg_id,
					event.text,
					isEditedText
				)
				return hasSentMessage
			}
		}
	}

	private async hasProcessedSlackMessage(
		slackMessageId: string
	): Promise<boolean> {
		const answersForSlackMessage = await this.answerDataAccessObject.getAnswersBySlackMessageId(
			slackMessageId
		)
		const hasProcessedSlackMessage = answersForSlackMessage.length > 0
		return hasProcessedSlackMessage
	}

	private async hasAnsweredAllQuestions(slackUserId: string): Promise<boolean> {
		const questions = await this.questionDataAccessObject.getQuestions()
		const maxQuestion = questions.length
		const todayAnswers = await this.answerDataAccessObject.getAnswersToday(
			slackUserId
		)
		const hasAnswerAllQuestions = todayAnswers.length == maxQuestion
		return hasAnswerAllQuestions
	}

	private async processFirstAnswer(
		slackUserId: string,
		clientMessageId: string,
		slackEventMessage: string
	): Promise<boolean> {
		// send message first to avoid delay
		const nextQuestion = await this.questionDataAccessObject.getQuestionByOrder(
			2
		)
		const message = nextQuestion.questionText
		const hasSentMessage = await this.messageSender.send(slackUserId, message)

		const firstQuestion = await this.questionDataAccessObject.getQuestionByOrder(
			1
		)
		const answerModel: AnswerPersistentModel = {
			slackId: slackUserId,
			slackMessageId: clientMessageId,
			questionId: firstQuestion.id,
			answerText: slackEventMessage
		}
		await this.answerDataAccessObject.saveAnswer(answerModel)

		return hasSentMessage
	}

	private async processNextAnswer(
		latestAnswer: Answer,
		slackUserId: string,
		clientMessageId: string,
		slackEventMessage: string,
		isEditedText: boolean
	): Promise<boolean> {
		// save or update answer

		if (isEditedText) {
			const answerModel: AnswerPersistentModel = {
				slackId: slackUserId,
				slackMessageId: clientMessageId,
				questionId: latestAnswer.question.id,
				answerText: slackEventMessage
			}

			await this.answerDataAccessObject.updateAnswer(
				latestAnswer.id,
				answerModel
			)
			return false
		} else {
			const currentOrder = latestAnswer.question.order
			const nextSaveQuestionOrder = currentOrder + 1
			const nextSaveQuestion = await this.questionDataAccessObject.getQuestionByOrder(
				nextSaveQuestionOrder
			)
			const answerModel: AnswerPersistentModel = {
				slackId: slackUserId,
				slackMessageId: clientMessageId,
				questionId: nextSaveQuestion.id,
				answerText: slackEventMessage
			}

			await this.answerDataAccessObject.saveAnswer(answerModel)

			const hasAnswerAllQuestions = await this.hasAnsweredAllQuestions(
				slackUserId
			)

			let message: string
			if (hasAnswerAllQuestions) {
				message = "Thank You and Have Fun :clap::palm_tree:"
			} else {
				const nextQuestionOrder = nextSaveQuestionOrder + 1
				const nextQuestion = await this.questionDataAccessObject.getQuestionByOrder(
					nextQuestionOrder
				)
				message = nextQuestion.questionText
			}

			// send message
			// either next question or thank you message
			const hasSentMessage = await this.messageSender.send(slackUserId, message)
			return hasSentMessage
		}
	}
}
