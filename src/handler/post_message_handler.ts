import { Context, Callback } from "aws-lambda"
import { PostMessageHelper } from "../helper/post_message_helper"

/**
 * A Lambda Function that will send a message to each of user in a particular slack channel
 * @param event 		The aws-lambda event
 * @param context 	The aws-lambda context
 * @param callback 	The aws-lambda callback for given process
 */
const postMessage = (event: any, context: Context, callback: Callback) => {
	PostMessageHelper(callback)
}

export { postMessage }
