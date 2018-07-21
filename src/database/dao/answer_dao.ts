import { Answer } from "../models/Answer"
import { Question } from "../models/Question"
import moment from "moment"
import { AnswerPersistentModel } from "../../model/persistent/persistent_type"

interface AnswerHandler {
	getAnswers(): Promise<Answer[]>
	getAnswerById(answerId: number): Promise<Answer>
	saveAnswer(answerModel: AnswerPersistentModel): Promise<Answer>
	getLastAnswerToday(slackId: string): Promise<Answer>
	getAnswersToday(slackId: string): Promise<Answer[]>
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

	async getLastAnswerToday(slackId: string): Promise<Answer> {
		const start = moment()
			.utc()
			.startOf("day")
		const end = moment()
			.utc()
			.endOf("day")

		const answer = await Answer.findOne({
			where: {
				slackId: slackId,
				createdAt: {
					$between: [start.toDate(), end.toDate()]
				}
			},
			limit: 1,
			order: [["createdAt", "asc"]],
			include: [
				{
					model: Question,
					as: "question"
				}
			]
		})
		return answer
	}

	async getAnswersToday(slackId: string): Promise<Answer[]> {
		const start = moment()
			.utc()
			.startOf("day")
		const end = moment()
			.utc()
			.endOf("day")

		const answer = await Answer.findAll({
			where: {
				slackId: slackId,
				createdAt: {
					$between: [start.toDate(), end.toDate()]
				}
			},
			include: [
				{
					model: Question,
					as: "question"
				}
			]
		})
		return answer
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
