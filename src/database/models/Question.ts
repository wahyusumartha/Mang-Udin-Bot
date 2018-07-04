import { Table, Column, Model, HasMany } from "sequelize-typescript"
import { Answer } from "./Answer"

@Table({
	timestamps: true
})
export class Question extends Model<Question> {
	@Column questionText: string
	@Column order: number

	@HasMany(() => Answer)
	answers: Answer[]
}
