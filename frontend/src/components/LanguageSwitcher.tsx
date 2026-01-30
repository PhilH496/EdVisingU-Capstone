import { useTranslation } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="absolute top-4 right-4">
      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'fr')}
        className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-brand-red bg-white text-sm"
        aria-label="Select language"
      >
        <option value="en">English</option>
        <option value="fr">Français</option>
      </select>
    </div>
  );
}
