export declare type QuestionPersistentModel = {
	questionText: string
	order: number
}

export declare type AnswerPersistentModel = {
	slackId: string
	slackMessageId: string
	answerText: string
	questionId: number
}
