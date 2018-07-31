import { QuestionDAO } from "../database/dao/question_dao"
import { MessageSender } from "../helper/message_sender"
import { AnswerPersistentModel } from "../model/persistent/persistent_type"
import { AnswerDAO } from "../database/dao/answer_dao"

export class FirstAnswerProcessor
	implements EventProcessor<SlackMessageResponse, Promise<boolean>> {
	async process(event: SlackMessageResponse): Promise<boolean> {
		const slackUserId = event.user
		if (slackUserId == undefined) {
			return false
		}

		const questionDAO = new QuestionDAO()
		const secondQuestion = await questionDAO.getQuestionByOrder(2)

		const messageSender = new MessageSender()
		const hasSentQuestion = await messageSender.send(
			slackUserId,
			secondQuestion.questionText
		)

		const firstQuestion = await questionDAO.getQuestionByOrder(1)
		const answerModel: AnswerPersistentModel = {
			slackId: slackUserId,
			slackMessageId: event.client_msg_id,
			answerText: event.text,
			questionId: firstQuestion.id
		}
		const answerDAO = new AnswerDAO()
		await answerDAO.saveAnswer(answerModel)

		return hasSentQuestion
	}
}
