import { Answer } from "../models/Answer"
import { Question } from "../models/Question"
import { DatabaseConfigurator } from "../database_configurator"
import { AnswerPersistentModel } from "../../model/persistent/persistent_type"

interface AnswerHandler {
	getAnswers(): Promise<Answer[]>
	getAnswerById(answerId: number): Promise<Answer>
	saveAnswer(answerModel: AnswerPersistentModel): Promise<Answer>
	updateAnswer(
		answerId: number,
		answerModel: AnswerPersistentModel
	): Promise<[number, Answer[]]>
	deleteAnswer(answerId: number): Promise<number>
}

export class AnswerDAO implements AnswerHandler {
	async getAnswers(): Promise<Answer[]> {
		const answers = await Answer.findAll({ include: [Question] })
		return answers
	}

	async getAnswerById(answerId: number): Promise<Answer> {
		const answer = await Answer.findById(answerId)
		return answer
	}

	async saveAnswer(answerModel: AnswerPersistentModel): Promise<Answer> {
		const answer = Answer.build({
			slackId: answerModel.slackId,
			slackMessageId: answerModel.slackMessageId,
			answerText: answerModel.answerText,
			questionId: answerModel.questionId
		})
		const savedAnswer = await answer.save()
		return savedAnswer
	}

	async updateAnswer(
		answerId: number,
		answerModel: AnswerPersistentModel
	): Promise<[number, Answer[]]> {
		const updatedAnswer = await Answer.update(answerModel, {
			where: { id: answerId }
		})
		return updatedAnswer
	}

	async deleteAnswer(answerId: number): Promise<number> {
		const isDeleted = await Answer.destroy({ where: { id: answerId } })
		return isDeleted
	}
}
