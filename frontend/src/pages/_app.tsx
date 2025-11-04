import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />
      <ChatbotWidget />
    </>
  );
}
