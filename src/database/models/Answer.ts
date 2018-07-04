import {
	Table,
	Column,
	Model,
	ForeignKey,
	BelongsTo,
	AllowNull,
	Default
} from "sequelize-typescript"
import { Question } from "./Question"

@Table({
	timestamps: true
})
export class Answer extends Model<Answer> {
	@AllowNull(false)
	@Column
	slackId: string

	@AllowNull(false)
	@Column
	slackMessageId: string

	@AllowNull(false)
	@Default("")
	@Column
	answerText: string

	@ForeignKey(() => Question)
	@Column
	questionId: number

	@BelongsTo(() => Question)
	question: Question
}
