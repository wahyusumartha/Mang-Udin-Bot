enum SlackEvent {
	AppMention = "app_mention",
	AppRateLimited = "app_rate_limited",
	AppUninstalled = "app_uninstalled",

	ChannelArchive = "channel_archive",
	ChannelCreated = "channel_created",
	ChannelDeleted = "channel_deleted",
	ChannelHistoryChanged = "channel_history_changed",
	ChannelLeft = "channel_left",
	ChannelRename = "channel_rename",
	ChannelUnarchive = "channel_unarchive",

	DnDUpdated = "dnd_updated",
	DnDUpdatedUser = "dnd_updated_user",

	EmailDomainChanged = "email_domain_changed",

	EmojiChanged = "emoji_changed",

	FileChange = "file_change",
	FileCommentAdded = "file_comment_added",
	FileCommentDeleted = "file_comment_deleted",
	FileCommentEdited = "file_comment_edited",
	FileCreated = "file_created",
	FileDeleted = "file_deleted",
	FilePublic = "file_public",
	FileShared = "file_shared",
	FileUnshared = "file_unshared",

	GridMigrationFinished = "grid_migration_finished",
	GridMigrationStarted = "grid_migration_started",

	GroupArchive = "group_archive",
	GroupClose = "group_close",
	GroupHistoryChanged = "group_history_changed",
	GroupLeft = "group_left",
	GroupOpen = "group_open",
	GroupRename = "group_rename",
	GroupUnarchive = "group_unarchive",

	IMClose = "im_close",
	IMCreated = "im_created",
	IMHistoryChanged = "im_history_changed",
	IMOpen = "im_open",

	LinkShared = "link_shared",

	MemberJoinedChannel = "member_joined_channel",
	MemberLeftChannel = "member_left_channel",

	Message = "message",
	MessageAppHome = "message.app_home",
	MessageChannels = "message.channels",
	MessageGroups = "message.groups",
	MessageIm = "message.im",
	MessageMpim = "message.mpim",

	PinAdded = "pin_added",
	PinRemoved = "pin_removed",

	ReactionAdded = "reaction_added",
	ReactionRemoved = "reaction_removed",

	ResourceAdded = "resource_added",
	ResourceRemoved = "resource_removed",

	ScopeDenied = "scope_denied",
	ScopeGranted = "scope_granted",

	StarAdded = "star_added",
	StarRemoved = "star_removed",

	SubteamCreated = "subteam_created",
	SubteamMembersChanged = "subteam_members_changed",
	SubteamSelfAdded = "subteam_self_added",
	SubteamSelfRemoved = "subteam_self_removed",
	SubteamUpdated = "subteam_updated",

	TeamDomainChange = "team_domain_change",
	TeamJoin = "team_join",
	TeamRename = "team_rename",

	TokensRevoked = "tokens_revoked",

	UrlVerification = "url_verification",

	UserChange = "user_change"
}
