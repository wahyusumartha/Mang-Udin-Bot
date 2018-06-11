declare type EditedMessageResponse = {
	user: string
	ts: string
}

declare type SlackMessageResponse = {
	type: string
	user: string
	text: string
	client_msg_id: string
	ts: string
	edited?: EditedMessageResponse
}
