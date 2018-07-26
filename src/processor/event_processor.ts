interface EventProcessor<Input, Output> {
	process(event: Input): Output
}
