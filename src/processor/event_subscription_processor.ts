import { AnswerDAO } from "../database/dao/answer_dao"
import { QuestionDAO } from "../database/dao/question_dao"

export enum Process {
	MesageChanged,
	SessionEnded,
	FirstAnswer,
	NextAnswer,
	None
}

export class EventSubcriptionProcessor
	implements EventProcessor<any, Promise<Process>> {
	private answerDAO: AnswerDAO
	private questionDAO: QuestionDAO

	constructor() {
		this.answerDAO = new AnswerDAO()
		this.questionDAO = new QuestionDAO()
	}

	async process(event: any): Promise<Process> {
		const hasSubtype = "subtype" in event
		if (hasSubtype) {
			const subtype = event.subtype as string
			return subtype == "message_changed" ? Process.MesageChanged : Process.None
		} else {
			if (await this.hasProcessedSlackMessageToday(event.client_msg_id)) {
				return Process.None
			} else if (await this.isTodaySessionEnded(event.user)) {
				return Process.SessionEnded
			} else if (await this.isFirstAnswer(event.user)) {
				return Process.FirstAnswer
			} else {
				return Process.NextAnswer
			}
		}
	}

	/**
	 * Check in database if slack user has done a stand up session for today
	 * @param slackUserId  a slack user id
	 * @return boolean it will return true if that particular slack user
	 *   has answered all questions for today otherwise return false
	 */
	private async isTodaySessionEnded(slackUserId: string): Promise<boolean> {
		const questions = await this.questionDAO.getQuestions()
		const maxQuestion = questions.length
		const todayAnswers = await this.answerDAO.getAnswersToday(slackUserId)
		const hasAnswerAllQuestions = todayAnswers.length == maxQuestion
		return hasAnswerAllQuestions
	}

	/**
	 * Check whether a message with specific has processed before
	 * @param slackMessageId a client message id from slack event response
	 * @return boolean it will return true if a message with that particular client
	 *  message id has been processed before otherwise it will return false
	 */
	private async hasProcessedSlackMessageToday(
		slackMessageId: string
	): Promise<boolean> {
		const answersForSlackMessage = await this.answerDAO.getAnswersBySlackMessageId(
			slackMessageId
		)
		const hasProcessedSlackMessage = answersForSlackMessage.length > 0
		return hasProcessedSlackMessage
	}

	/**
	 * Check if an event of message is answering the first question
	 * @param slackUserId a slack user id
	 * @return boolean it will return true if the slack event is answered first question
	 *  otherwise it will return false
	 */
	private async isFirstAnswer(slackUserId: string): Promise<boolean> {
		const latestAnswers = await this.answerDAO.getAnswersToday(slackUserId)
		return latestAnswers.length == 0
	}
}
