import { AnswerPersistentModel } from "../model/persistent/persistent_type"
import { AnswerDAO } from "../database/dao/answer_dao"

export class MessageChangedProcessor
	implements EventProcessor<SlackMessageResponse, void> {
	async process(event: SlackMessageResponse): Promise<void> {
		if (event.edited == undefined) {
			return
		}

		const answerDAO = new AnswerDAO()
		const currentAnswer = await answerDAO.getAnswersBySlackMessageId(
			event.client_msg_id
		)

		if (currentAnswer.length <= 0) {
			return
		}

		const currentAnswerId = currentAnswer[0].id
		const currentQuestionId = currentAnswer[0].question.id
		const updatedAnswerModel: AnswerPersistentModel = {
			slackId: event.user,
			slackMessageId: event.client_msg_id,
			answerText: event.text,
			questionId: currentQuestionId
		}

		await answerDAO.updateAnswer(currentAnswerId, updatedAnswerModel)
	}
}
