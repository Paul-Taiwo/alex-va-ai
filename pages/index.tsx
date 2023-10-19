import axios from "axios";
import { useLottie } from "lottie-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bot, PenLine, SendHorizontal, User } from "lucide-react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import * as PlayHT from "playht";

import {
  Container,
  SendButton,
  ChatContainer,
  ChatMessages,
  Message,
  Input,
  InputContainer,
} from "@/styles/sharedstyles";
import lottieFile from "@/assets/lottie/alex-ai.json";

const style = {
  height: 300,
};

const options = {
  animationData: lottieFile,
  loop: true,
  autoplay: true,
};

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  const { View, setSpeed } = useLottie(options, style);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioSrc, setAudioSrc] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  const speak = (audioUrl: string) => {
    if (!audioRef.current) return;

    const onError = () => {
      setIsLoading(false);
      console.error("Error loading audio");
    };

    try {
      const audioElement = audioRef.current;
      const playAudio = () => {
        audioElement.currentTime = 0;

        audioElement.play();
        setIsLoading(false);
      };

      // Remove any existing event listeners
      audioElement.removeEventListener("loadeddata", playAudio);
      audioElement.removeEventListener("error", onError);

      audioElement.pause();
      audioElement.currentTime = 0;
      audioElement.preload = "auto";

      setAudioSrc(audioUrl);

      audioElement.load();

      audioElement.addEventListener("loadeddata", playAudio);
      audioElement.addEventListener("error", onError);
    } catch (error) {
      onError();
    }
  };

  const gptCall = useCallback(
    async (newMessages: { role: string; content: string }[]) => {
      try {
        const response = await fetch("/api/ai-stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages }),
        });

        const responseClone = response.clone();
        const text = await response.text();

        const audioDataStartIndex = text.indexOf("ID3");
        const textContent = text.slice(0, audioDataStartIndex);

        setMessages((prev) => [...prev, { role: "assistant", content: textContent }]);

        // Use the Text-to-Speech API to play audio
        const audioBlob = await responseClone.clone().blob();
        const audioBlobSlice = audioBlob.slice(audioDataStartIndex);
        const audioUrl = URL.createObjectURL(audioBlobSlice);

        speak(audioUrl);
      } catch (error) {
        console.error("Error handling the message:", error);
        // Handle the error appropriately, e.g., display an error message
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const handleSendMessage = async (newMessage: string) => {
    if (newMessage.trim() === "") return;

    setIsLoading(true);

    const newMessages = [...messages, { content: newMessage, role: "user" }];
    setMessages(newMessages);

    await gptCall(newMessages);
  };

  const handleListen = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      handleSendMessage(prompt);
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  useEffect(() => {
    const speed = isLoading ? 9 : listening ? 4 : 0.5;
    setSpeed(speed);
  }, [setSpeed, listening, isLoading]);

  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    gptCall([{ role: "user", content: "hello there" }]);
  }, [gptCall]);

  useEffect(() => setPrompt(transcript), [transcript]);

  return (
    <Container>
      {View}

      <InputContainer className='my-3'>
        <PenLine className='pen-icon' />

        <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} />

        <SendButton
          type='button'
          disabled={isLoading}
          onClick={() => handleSendMessage(prompt)}>
          <SendHorizontal className='send-icon' />
        </SendButton>
      </InputContainer>

      <div>
        <SendButton type='button' disabled={isLoading} onClick={handleListen}>
          {isLoading ? "Thinking..." : listening ? "Stop Listening" : "Start Listening"}
        </SendButton>
      </div>

      <ChatContainer>
        {messages.length > 0 && (
          <ChatMessages>
            {messages.map((message, index) => {
              // Replace '\n\n' with '<br>' elements to create line breaks
              const formattedContent = message.content.replace(/\n/g, "<br>");

              // Replace triple backticks with <pre> and <code> elements
              const codeFormattedContent = formattedContent.replace(
                /```([\s\S]+?)```/g,
                (match, code) => {
                  return `<pre><code>${code}</code></pre>`;
                }
              );
              return (
                <Message role={message.role} key={index}>
                  {message?.role === "assistant" ? <Bot /> : <User />}:
                  <p
                    className='m-0'
                    dangerouslySetInnerHTML={{ __html: codeFormattedContent }}></p>
                </Message>
              );
            })}
            <div ref={scrollAnchorRef} />
          </ChatMessages>
        )}
      </ChatContainer>
      <audio className='d-none' ref={audioRef} src={audioSrc} controls={false} />
    </Container>
  );
}
