import { Question } from "../models/Question"
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

	async getQuestions(): Promise<Question[]> {
		const questions = await Question.findAll()
		return questions
	}

	async getQuestionById(questionId: number): Promise<Question> {
		const question = await Question.findOne({ where: { id: questionId } })
		return question
	}

	async saveQuestion(
		questionModel: QuestionPersistentModel
	): Promise<Question> {
		const savedQuestion = await Question.create(questionModel)
		return savedQuestion
	}

	async updateQuestion(
		questionId: number,
		questionModel: QuestionPersistentModel
	): Promise<[number, Question[]]> {
		const updatedQuestion = await Question.update(questionModel, {
			where: { id: questionId }
		})
		return updatedQuestion
	}

	async deleteQuestion(questionid: number): Promise<number> {
		const isDeleted = await Question.destroy({ where: { id: questionid } })
		return isDeleted
	}
}
