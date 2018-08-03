import { Answer } from "../database/models/Answer"
import { Question } from "../database/models/Question"
import { QuestionDAO } from "../database/dao/question_dao"
import {
	QuestionPersistentModel,
	AnswerPersistentModel
} from "../model/persistent/persistent_type"
import { AnswerDAO } from "../database/dao/answer_dao"
import { Sequelize } from "../../node_modules/@types/sequelize"
import { DatabaseConfigurator } from "../database/database_configurator"

// Open Connection Helper
const OpenDatabaseConnection = async (
	databaseConfigurator: DatabaseConfigurator
): Promise<Sequelize> => {
	const sequelize = databaseConfigurator.getSequelize()
	await Answer.destroy({ truncate: true, force: true, cascade: true })
	await Question.destroy({ truncate: true, force: true, cascade: true })
	return sequelize
}

// Close Connection Helper
const CloseDatabaseConnection = async (sequelize: Sequelize) => {
	await Answer.destroy({ truncate: true, force: true, cascade: true })
	await Question.destroy({ truncate: true, force: true, cascade: true })
	await sequelize.close()
}

// Prepare Answer Data Helper
const PrepareAnswerData = async (): Promise<Answer> => {
	const questionDAO = new QuestionDAO()
	const questionPersistentModel: QuestionPersistentModel = {
		questionText: "Question Text",
		order: 1
	}
	const savedQuestion = await questionDAO.saveQuestion(questionPersistentModel)

	// save answer based on question
	const answerDAO = new AnswerDAO()
	const answerPersistentModel: AnswerPersistentModel = {
		slackId: "1",
		slackMessageId: "1",
		answerText: "Answer Text",
		questionId: savedQuestion.id
	}
	const savedAnswer = await answerDAO.saveAnswer(answerPersistentModel)

	return savedAnswer
}

// Prepare Question Data Helper
const PrepareQuestionData = async (): Promise<Question> => {
	const questionDAO = new QuestionDAO()
	const questionPersistentModel: QuestionPersistentModel = {
		questionText: "Question Text",
		order: 1
	}
	const savedQuestion = await questionDAO.saveQuestion(questionPersistentModel)
	return savedQuestion
}

export {
	OpenDatabaseConnection,
	CloseDatabaseConnection,
	PrepareAnswerData,
	PrepareQuestionData
}
