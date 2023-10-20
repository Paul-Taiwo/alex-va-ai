// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import OpenAI from "openai";
import * as PlayHT from "playht";
import type { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { Readable } from "stream";
import merge2 from "merge2";

type Data = {
  audio?: PlayHT.SpeechOutput;
  finish_reason?: "stop" | "length" | "function_call" | "content_filter";
  index?: number;
  message?: OpenAI.Chat.Completions.ChatCompletionMessage;
  error?: string;
};

PlayHT.init({
  apiKey: process.env.PLAYHT_API_KEY as string,
  userId: process.env.PlayHT_USER_ID as string,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const streamGptText = async (
  body: ChatCompletionMessageParam[]
): Promise<NodeJS.ReadableStream> => {
  const systemPrompt: ChatCompletionMessageParam = {
    role: "system",
    content:
      "You are a knowledgeable financial assistant. Your name is Alex. Your primary role is to provide users with real-time insights into their financial data. Users can ask questions or request information related to their revenue, expenses, contracts, and financial performance. Use historical data and predictive analytics to forecast future revenue, expenses, and potential financial issues. For example, you could alert users to upcoming payment due dates, potential contract renewals, or changes in revenue patterns. Analyze spending patterns and suggest areas where expenses could be optimized. Identify cost-saving opportunities and recommend actions to reduce expenditures. Identify opportunities for revenue growth, such as upselling to existing clients or renewing expiring sales contracts. Assess financial risks, offer budgetary guidance, and help users set financial goals. Responses should be clear and concise. Add your name to the first response ",
  };

  body.unshift(systemPrompt);

  // Create a stream of GPT-3 responses
  const chatGptResponseStream = await openai.chat.completions.create({
    messages: body,
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
  });

  return new Readable({
    async read() {
      for await (const part of chatGptResponseStream) {
        // Add only the text to the stream
        this.push(part.choices[0]?.delta?.content || "");
      }
      this.push(null);
    },
  });
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  process.setMaxListeners(0);

  try {
    const { messages, muted } = req.body;

    const gptStream = await streamGptText(messages);

    if (muted) {
      gptStream.pipe(res);
    } else {
      const audioStream = await PlayHT.stream(gptStream);
      const stream = merge2(gptStream, audioStream);
      stream.pipe(res);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "failed to fetch data" });
  }
}
