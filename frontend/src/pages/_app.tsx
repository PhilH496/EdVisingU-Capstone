import "@/styles/globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // No chatbot on admin pages
  const isAdminPage = router.pathname.startsWith('/admin');

  return (
    <>
      <Component {...pageProps} />
      {/* Student chatbot on student pages */}
      {!isAdminPage && <ChatbotWidget />}
    </>
  );
}
