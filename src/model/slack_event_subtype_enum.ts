enum SlackEventSubType {
	BotMessage = "bot_message",
	ChannelArchive = "channel_archive",
	ChannelJoin = "channel_join",
	ChannelLeave = "channel_leave",
	ChannelName = "channel_name",
	ChannelPurpose = "channel_purpose",
	ChannelTopic = "channel_topic",
	ChannelUnarchive = "channel_unarchive",

	FileComment = "file_comment",
	FileMention = "file_mention",
	FileShare = "file_share",

	GroupArchive = "group_archive",
	GroupJoin = "group_join",
	GroupLeave = "group_leave",
	GroupName = "group_name",
	GroupPurpose = "group_purpose",
	GroupTopic = "group_topic",
	GroupUnarchive = "group_unarchive",

	MeMessage = "me_message",
	MessageChanged = "message_changed",
	MessageDeleted = "message_deleted",
	MessageReplied = "message_replied",

	PinnedItem = "pinned_item",
	UnpinnedItem = "unpinned_item",

	ReplyBroadcast = "reply_broadcast",
	ThreadBroadcast = "tread_broadcast"
}
