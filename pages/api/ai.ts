// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import OpenAI from "openai";
import * as PlayHT from "playht";
import type { NextApiRequest, NextApiResponse } from "next";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

type Data = {
  audio?: PlayHT.SpeechOutput;
  finish_reason?: "stop" | "length" | "function_call" | "content_filter";
  index?: number;
  message?: OpenAI.Chat.Completions.ChatCompletionMessage;
  error?: string;
};

PlayHT.init({
  apiKey: process.env.PLAYHT_API_KEY as string,
  userId: process.env.PLAYHT_USER_ID as string,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const handleGPTCall = async (body: ChatCompletionMessageParam[]) => {
  const systemPrompt: ChatCompletionMessageParam = {
    role: "system",
    content:
      "You are a knowledgeable financial assistant. Your name is Alex. Your primary role is to provide users with real-time insights into their financial data. Users can ask questions or request information related to their revenue, expenses, contracts, and financial performance. Use historical data and predictive analytics to forecast future revenue, expenses, and potential financial issues. For example, you could alert users to upcoming payment due dates, potential contract renewals, or changes in revenue patterns. Analyze spending patterns and suggest areas where expenses could be optimized. Identify cost-saving opportunities and recommend actions to reduce expenditures. Identify opportunities for revenue growth, such as upselling to existing clients or renewing expiring sales contracts. Assess financial risks, offer budgetary guidance, and help users set financial goals. Responses should be clear and concise. Add your name to the first response ",
  };

  body.unshift(systemPrompt);

  const chatCompletion = await openai.chat.completions.create({
    messages: body,
    temperature: 0,
    model: "gpt-3.5-turbo",
  });

  return chatCompletion;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  try {
    const { messages } = req.body;

    const result = await handleGPTCall(messages);
    const choice = result.choices[0];

    const { audioUrl } = await await PlayHT.generate(choice.message.content as string);
    const response = {
      ...choice,
      audioUrl,
    };

    res.status(200).json(response);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "failed to fetch data" });
  }
}
