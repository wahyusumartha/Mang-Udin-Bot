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
			const latestAnswer = latestAnswers[0]
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

	private async processFirstAnswer(
		slackUserId: string,
		clientMessageId: string,
		slackEventMessage: string
	): Promise<boolean> {
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

		const message = await this.message(false, 1)
		const hasSentMessage = await this.messageSender.send(slackUserId, message)
		return hasSentMessage
	}

	private async processNextAnswer(
		latestAnswer: Answer,
		slackUserId: string,
		clientMessageId: string,
		slackEventMessage: string,
		isEditedText: boolean
	): Promise<boolean> {
		const questions = await this.questionDataAccessObject.getQuestions()
		const maxQuestion = questions.length
		const hasAnswerAllQuestions = latestAnswer.question.order == maxQuestion

		// save or update answer
		const answerModel: AnswerPersistentModel = {
			slackId: slackUserId,
			slackMessageId: clientMessageId,
			questionId: latestAnswer.question.id,
			answerText: slackEventMessage
		}

		if (isEditedText) {
			await this.answerDataAccessObject.updateAnswer(
				latestAnswer.id,
				answerModel
			)
			return false
		} else {
			await this.answerDataAccessObject.saveAnswer(answerModel)
		}

		const message: string = await this.message(
			hasAnswerAllQuestions,
			latestAnswer.question.order
		)
		// send message
		// either next question or thank you message
		const hasSentMessage = await this.messageSender.send(slackUserId, message)
		return hasSentMessage
	}

	private async message(
		hasAnswerAllQuestions: boolean,
		currentOrder: number
	): Promise<string> {
		if (hasAnswerAllQuestions) {
			return "Thank You and Have Fun"
		} else {
			const nextOrder = currentOrder + 1
			const nextQuestion = await this.questionDataAccessObject.getQuestionByOrder(
				nextOrder
			)
			return nextQuestion.questionText
		}
	}
}
