import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { LanguageProvider } from "@/lib/i18n";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <Component {...pageProps} />
      <ChatbotWidget />
    </LanguageProvider>
  );
}
