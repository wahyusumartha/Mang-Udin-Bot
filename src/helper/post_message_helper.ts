import { SlackClient } from "../client/slack_client"
import { Context, Callback } from "aws-lambda"
import { MessageTemplate, Configurator } from "../config/slack_message_config"

const PostMessageHelper = (event: any, context: Context, callback: Callback) => {
  const configurator = new Configurator()
  const token = configurator.getSlackConfig().token
  const channel = configurator.getSlackConfig().channel
  const channelName = configurator.getSlackConfig().channelName
  const client = new SlackClient(token)
  retrieveGroupInfo(context, channel, client, (members) => {
    members.forEach( (memberId) => {
      const message = new MessageTemplate().botMangUdinMessage(memberId, channel, channelName)
      sendReminder(client, memberId, message, context, callback)
    })
  })
}

function sendReminder(client: SlackClient,
  userId: string,
  message: string,
  context: Context,
  callback: Callback) {
  const slackMessage = {
    message: message,
    channel: userId,
    username: "Mang Udin",
    as_user: true
  }

  client.sendMessage(slackMessage, (isError, response) => {
    if (isError) {
      callback(Error(response.toString()), undefined)
    } else {
      callback(undefined, response)
    }
  })
}

function retrieveGroupInfo(context: Context, channelId: string, client: SlackClient, completionHandler: (members: string[]) => void) {
  client.getGroupInfo(channelId, (isError, response) => {
      if (isError) {
        completionHandler([])
      } else {
        const members: string[] = (response as any).group.members
        completionHandler(members)
      }
    })
}

export { PostMessageHelper }