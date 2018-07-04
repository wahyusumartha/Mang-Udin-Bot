import { Question } from "../models/Question"
import { Answer } from "../models/Answer"
import { DatabaseConfigurator } from "../database_configurator"
import { QuestionPersistentModel } from "../../model/persistent/persistent_type"

interface QuestionHandler {
	getQuestions(): Promise<Question[]>
	getQuestionById(questionId: number): Promise<Question[]>
}

export class QuestionDAO implements QuestionHandler {
	private databaseConfigurator: DatabaseConfigurator

	constructor(databaseConfigurator: DatabaseConfigurator) {
		this.databaseConfigurator = databaseConfigurator
	}

	async getQuestions(): Promise<Question[]> {
		const questions = await Question.findAll({ include: [Answer] })
		return questions
	}

	async getQuestionById(questionId: number): Promise<Question[]> {
		const questions = await Question.findAll({ include: [Answer] })
		return questions
	}

	async saveQuestion(questionModel: QuestionPersistentModel): Promise<Question> {
		const sequelize = this.databaseConfigurator.getSequelize()
		const question = Question.build({
			questionText: questionModel.questionText,
			order: questionModel.order
		})
		const savedQuestion = await question.save()
		sequelize.close()
		return savedQuestion
	}
}
