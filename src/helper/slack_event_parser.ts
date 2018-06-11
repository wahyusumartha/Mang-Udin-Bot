const SlackEventParser = (response: SlackEventResponse) => {
	switch (response.type) {
		case SlackEvent.Message: {
			/* TODO: Necessary Action to handle Message */
			if (response.subtype == undefined) {
				/* TODO: process message that has no subtype */
			} else {
				/* TODO: process message that has subtype */
			}
			break
		}
		default: {
			break
		}
	}
}
