import { Sequelize } from "sequelize-typescript"
import { Postgres } from "../config/postgresql_config";

const config = new Postgres("env.yml")

const sequelize = new Sequelize({
	host: config.getPostgresConfig().host,
	database: config.getPostgresConfig().database,
	username: config.getPostgresConfig().username,
	password: config.getPostgresConfig().password,
	dialect: "posgresql",
	storage: ":memory:",
	modelPaths: [__dirname + "/models"]
})
