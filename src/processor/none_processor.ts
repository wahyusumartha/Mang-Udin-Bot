class NoneProcessor implements EventProcessor<SlackMessageResponse, void> {
	process(event: SlackMessageResponse): void {
		console.log(`Nothing to process for ${JSON.stringify(event)}`)
	}
}
