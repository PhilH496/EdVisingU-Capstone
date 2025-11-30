import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { LanguageProvider } from "@/lib/i18n";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // No chatbot on admin pages
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <LanguageProvider>
      <Component {...pageProps} />
      {/* Student chatbot on student pages */}
      {!isAdminPage && <ChatbotWidget />}
    </LanguageProvider>
  );
}
