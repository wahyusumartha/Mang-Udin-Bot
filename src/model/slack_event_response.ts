declare type SlackEventResponse = {
	type: string
	message?: SlackMessageResponse
	subtype?: string
	hidden?: boolean
	channel: string
	previous_message?: SlackMessageResponse
	event_ts: string
	ts: string
	channel_type: string
}
