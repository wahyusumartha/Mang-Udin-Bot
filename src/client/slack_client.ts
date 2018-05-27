import { WebClient, WebAPICallResult, WebAPICallError } from "@slack/client"

declare type SlackCompletionHandler = (isError: boolean, response: WebAPICallResult) => void

export class SlackClient {
  private token: string

  constructor(token: string) { this.token = token }

  sendMessage(slackMessage: SlackMessage, completionHandler: SlackCompletionHandler) {
    this.webClient().chat.postMessage({
      text: slackMessage.message,
      channel: slackMessage.channel
    }).then((response) => {
      completionHandler(false, response)
    }).catch((error) => {
      completionHandler(true, error)
    })
  }

  getGroupInfo(channelId: string, completionHandler: SlackCompletionHandler) {
    this.webClient().groups.info({
      channel: channelId
    }).then((response) => {
      completionHandler(false, response)
    }).catch((error) => {
      completionHandler(true, error)
    })
  }

  private webClient(): WebClient {
    return new WebClient(this.token)
  }
}