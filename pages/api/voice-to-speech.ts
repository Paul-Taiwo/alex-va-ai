import type { NextApiRequest, NextApiResponse } from "next";
import * as PlayHT from "playht";

PlayHT.init({
  apiKey: process.env.PLAYHT_API_KEY as string,
  userId: process.env.PlayHT_USER_ID as string,
});

type Data = {
  audio?: PlayHT.SpeechOutput;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  process.setMaxListeners(0);

  try {
    const { text } = req.body;

    const audioStream = await PlayHT.stream(text);

    audioStream.pipe(res);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "failed to fetch data" });
  }
}
