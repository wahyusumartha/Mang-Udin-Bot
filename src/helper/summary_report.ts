import { AnswerDAO } from "../database/dao/answer_dao"
import moment from "moment"
import { MessageSender } from "./message_sender";

interface ReportHandler {
	retrieveTodaySummary(slackUserId: string): Promise<string>
	sendToChannel(slackUserId: string, channelId: string): Promise<boolean>
}

export class SummaryReport implements ReportHandler {

	// Retrieve Today Summary
	async retrieveTodaySummary(slackUserId: string): Promise<string> {
		const answerDAO = new AnswerDAO()
		const answers = await answerDAO.getAnswersToday(slackUserId)
		const now = moment().format("LLLL")
		let message = `Answers from <@${slackUserId}> at ${now}\n\n`
		answers.forEach((answer, index) => {
			index += 1
			message += `${index}. ${answer.question.questionText}\n${
				answer.answerText
			}\n\n`
		})
		return message
	}

	// Send to Channel
	async sendToChannel(
		slackUserId: string,
		channelId: string
	): Promise<boolean> {
		const reportMessage = await this.retrieveTodaySummary(slackUserId)

		const messageSender = new MessageSender()
		const hasSentQuestion = await messageSender.send(
			channelId,
			reportMessage
		)
		return hasSentQuestion
	}
}
