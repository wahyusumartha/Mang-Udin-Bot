interface SlackConfig {
	botToken: string
	authToken: string
	channel: string
	channelName: string
}

interface PostgresConfig {
	host: string
	port: number
	database: string
	username: string
	password: string
	dialect: string
	maxPool: number
}
