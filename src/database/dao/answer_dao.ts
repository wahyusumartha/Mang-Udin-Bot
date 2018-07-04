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
	private databaseConfigurator: DatabaseConfigurator

	constructor(databaseConfigurator?: DatabaseConfigurator) {
		this.databaseConfigurator = databaseConfigurator
	}

	async getAnswers(): Promise<Answer[]> {
		const sequelize = this.databaseConfigurator.getSequelize()
		const answers = await Answer.findAll({ include: [Question] })
		sequelize.close()
		return answers
	}

	async getAnswerById(answerId: number): Promise<Answer> {
		const sequelize = this.databaseConfigurator.getSequelize()
		const answer = await Answer.findOne({ where: { id: answerId } })
		sequelize.close()
		return answer
	}

	async saveAnswer(answerModel: AnswerPersistentModel): Promise<Answer> {
		const sequelize = this.databaseConfigurator.getSequelize()
		const answer = Answer.build({
			slackId: answerModel.slackId,
			slackMessageId: answerModel.slackMessageId,
			answerText: answerModel.answerText,
			questionId: answerModel.questionId
		})
		const savedAnswer = await answer.save()
		sequelize.close()
		return savedAnswer
	}

	async updateAnswer(
		answerId: number,
		answerModel: AnswerPersistentModel
	): Promise<[number, Answer[]]> {
		const sequelize = this.databaseConfigurator.getSequelize()
		const updatedAnswer = await Answer.update(answerModel, {
			where: { id: answerId }
		})
		sequelize.close()
		return updatedAnswer
	}

	async deleteAnswer(answerId: number): Promise<number> {
		const sequelize = this.databaseConfigurator.getSequelize()
		const isDeleted = await Answer.destroy({ where: { id: answerId } })
		sequelize.close()
		return isDeleted
	}
}
