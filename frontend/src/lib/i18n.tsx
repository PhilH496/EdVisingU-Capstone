import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type Language = "en" | "fr";

interface Messages {
  [key: string]: string | Messages;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [messages, setMessages] = useState<Messages>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load messages for the current language
  const loadMessages = async (lang: Language) => {
    try {
      setIsLoaded(false);
      const response = await import(`../../messages/${lang}.json`);
      setMessages(response.default);
      setIsLoaded(true);
    } catch (error) {
      console.error(`Failed to load messages for ${lang}:`, error);
      setMessages({});
      setIsLoaded(true);
    }
  };

  // Initialize language from localStorage or default to 'en'
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("language") as Language;
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "fr")) {
        setLanguageState(savedLanguage);
        loadMessages(savedLanguage);
      } else {
        loadMessages("en");
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
    }
    loadMessages(lang);
  };

  // Translation function with nested key support
  const t = (key: string): string => {
    const keys = key.split(".");
    let value: Messages = messages;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k] as Messages;
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof value === "string" ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
