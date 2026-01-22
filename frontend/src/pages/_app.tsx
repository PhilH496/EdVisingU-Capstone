import "@/styles/globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { ChatbotWidget } from "@/components/chatbot/ChatbotWidget";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/contexts/AuthContext";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // No chatbot on admin pages or auth pages
  const isAdminPage = router.pathname.startsWith('/admin');
  const isAuthPage = ['/login', '/signup'].includes(router.pathname);

  return (
    <AuthProvider>
      <LanguageProvider>
        <Component {...pageProps} />
        {/* Student chatbot on student pages */}
        {!isAdminPage && !isAuthPage && <ChatbotWidget />}
      </LanguageProvider>
    </AuthProvider>
  );
}
