import { Question } from "../models/Question"
import { Answer } from "../models/Answer"
import { DatabaseConfigurator } from "../database_configurator"
import { QuestionPersistentModel } from "../../model/persistent/persistent_type"

interface QuestionHandler {
	getQuestions(): Promise<Question[]>
	getQuestionById(questionId: number): Promise<Question>
	saveQuestion(questionModel: QuestionPersistentModel): Promise<Question>
	updateQuestion(
		questionId: number,
		questionModel: QuestionPersistentModel
	): Promise<[number, Question[]]>
	deleteQuestion(questionId: number): Promise<number>
}

export class QuestionDAO implements QuestionHandler {
	private databaseConfigurator: DatabaseConfigurator

	constructor(databaseConfigurator: DatabaseConfigurator) {
		this.databaseConfigurator = databaseConfigurator
	}

	async getQuestions(): Promise<Question[]> {
		const sequelize = this.databaseConfigurator.getSequelize()
		const questions = await Question.findAll({ include: [Answer] })
		sequelize.close()
		return questions
	}

	async getQuestionById(questionId: number): Promise<Question> {
		const sequelize = this.databaseConfigurator.getSequelize()
		const question = await Question.findOne({ where: { id: questionId } })
		sequelize.close()
		return question
	}

	async saveQuestion(
		questionModel: QuestionPersistentModel
	): Promise<Question> {
		const sequelize = this.databaseConfigurator.getSequelize()
		const question = Question.build({
			questionText: questionModel.questionText,
			order: questionModel.order
		})
		const savedQuestion = await question.save()
		sequelize.close()
		return savedQuestion
	}

	async updateQuestion(
		questionId: number,
		questionModel: QuestionPersistentModel
	): Promise<[number, Question[]]> {
		const sequelize = this.databaseConfigurator.getSequelize()
		const updatedQuestion = await Question.update(questionModel, {
			where: { id: questionId }
		})
		sequelize.close()
		return updatedQuestion
	}

	async deleteQuestion(questionid: number): Promise<number> {
		const sequelize = this.databaseConfigurator.getSequelize()
		const isDeleted = await Question.destroy({ where: { id: questionid } })
		sequelize.close()
		return isDeleted
	}
}
