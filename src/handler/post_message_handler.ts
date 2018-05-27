import { Context, Callback } from "aws-lambda"
import { PostMessageHelper } from "../helper/post_message_helper";

const postMessage = (event: any, context: Context, callback: Callback) => {
  PostMessageHelper(event, context, callback)
}

export { postMessage }