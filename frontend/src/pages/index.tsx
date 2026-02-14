/**
 * Landing Page - EdvisingU BSWD Portal
 */

import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import { StudentFooter } from '@/components/bswd/StudentFooter';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export default function LandingPage() {
  const { t, isLoaded } = useTranslation();
  const [openCard, setOpenCard] = useState<number | null>(null);
  if (!isLoaded) return null;
  const toggleCard = (index: number) => {
    setOpenCard(openCard === index ? null : index);
  };

  const infoCards = [
    {
      title: t('landingPage.infoCards.0.title'),
      brief: t('landingPage.infoCards.0.brief'),
      description: t('landingPage.infoCards.0.description'),
      url: t('landingPage.infoCards.0.url')
    },
    {
      title: t('landingPage.infoCards.1.title'),
      brief: t('landingPage.infoCards.1.brief'),
      description: t('landingPage.infoCards.1.description'),
      url: t('landingPage.infoCards.1.url')
    },
    {
      title: t('landingPage.infoCards.2.title'),
      brief: t('landingPage.infoCards.2.brief'),
      description: t('landingPage.infoCards.2.description'),
      url: t('landingPage.infoCards.2.url')
    },
    {
      title: t('landingPage.infoCards.3.title'),
      brief: t('landingPage.infoCards.3.brief'),
      description: t('landingPage.infoCards.3.description'),
      url: t('landingPage.infoCards.3.url')
    }
  ];

  const underRepLinks = [
    {
      text: t('landingPage.underRep.links.0.text'),
      url: t('landingPage.underRep.links.0.url')
    },
    {
      text: t('landingPage.underRep.links.1.text'),
      url: t('landingPage.underRep.links.1.url')
    },
    {
      text: t('landingPage.underRep.links.2.text'),
      url: t('landingPage.underRep.links.2.url')
    },
    {
      text: t('landingPage.underRep.links.3.text'),
      url: t('landingPage.underRep.links.3.url')
    },
    {
      text: t('landingPage.underRep.links.4.text'),
      url: t('landingPage.underRep.links.4.url')
    }
  ];

  const questionsLinks = [
    {
      text: t('landingPage.questions.links.0.text'),
      url: t('landingPage.questions.links.0.url')
    },
    {
      text: t('landingPage.questions.links.1.text'),
      url: t('landingPage.questions.links.1.url')
    },
    {
      text: t('landingPage.questions.links.2.text'),
      url: t('landingPage.questions.links.2.url')
    },
    {
      text: t('landingPage.questions.links.3.text'),
      url: t('landingPage.questions.links.3.url')
    }
  ];

  return (
    <>
      <Head>
        <title>{t('landingPage.head.title')}</title>
        <meta name="description" content={t('landingPage.head.description')} />
      </Head>

      <div className="min-h-screen bg-white">
        <header className="bg-black border-b border-black">
          <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
            <Image
              src="/ontario-logo.png"
              alt={t('landingPage.header.ontarioAlt')}
              width={130}
              height={30}
              priority
              className="filter invert"
            />
            <LanguageSwitcher />
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Title Section */}
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                {t('landingPage.hero.title')}
              </h1>
              <p className="text-base text-gray-700 mb-4">
                {t('landingPage.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/login"
                  className="bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 font-medium text-sm inline-flex items-center justify-center"
                >
                  {t('landingPage.hero.login')}
                </Link>
                <Link
                  href="/signup"
                  className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-2 hover:bg-blue-50 font-medium text-sm inline-flex items-center justify-center"
                >
                  {t('landingPage.hero.register')}
                </Link>
              </div>
            </div>

            {/* BSWD Logo */}
            <div className="mt-6 md:mt-0 flex-shrink-0">
              <div className="border-4 border-black px-6 py-4 inline-block relative">
                <div className="text-3xl font-bold">{t('landingPage.hero.bswdLogoText')}</div>
              </div>
            </div>
          </div>

          <hr className="border-t-2 border-gray-300 mb-8" />

          {/* Two Column Layout for general section*/}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Left Column - Updates Box */}
            <div className="md:col-span-2 flex flex-col">
              <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      {t('landingPage.updates.title')}
                    </h2>
                    <ul className="space-y-3 text-sm">
                      <li>
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                          {t('landingPage.updates.item1.linkText')}
                        </Link>
                        {' '}
                        {t('landingPage.updates.item1.trailingText')}
                      </li>
                      <li>
                        <Link href="/login" className="text-blue-600 hover:underline font-medium">
                          {t('landingPage.updates.item2.linkText')}
                        </Link>
                        {' '}
                        {t('landingPage.updates.item2.trailingText')}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* AI-Powered Infographic Section - Now stretches to fill remaining space */}
              <div className="bg-gray-100 border border-gray-300 p-6 flex-1 flex flex-col justify-center">
                <h2 className="text-lg font-bold mb-5">
                  {t('landingPage.ai.title')}
                </h2>
                <p className="text-sm text-gray-700">
                  {t('landingPage.ai.description')}
                </p>
              </div>
            </div>

            {/* Right Column - Expandable Flashcards */}
            <div className="space-y-3 relative">
              {infoCards.map((card, index) => (
                <div key={index} className="relative">
                  {/* Flashcard */}
                  <button
                    onClick={() => toggleCard(index)}
                    className={`w-full text-left border-2 bg-white p-4 transition-all duration-200 relative z-10 ${
                      openCard === index
                        ? 'border-blue-600 shadow-md'
                        : 'border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-blue-600 mb-1">
                          {card.title}
                        </h3>
                        <p className="text-sm text-gray-700">{card.brief}</p>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-gray-600 flex-shrink-0 transition-transform duration-200`}
                      />
                    </div>
                  </button>

                  {/* Expanded Content - Slides in from the right */}
                  <div
                    className={`absolute left-full top-0 ml-4 w-80 z-20 transition-all duration-300 ease-in-out ${
                      openCard === index
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 translate-x-4 pointer-events-none'
                    }`}
                  >
                    <div className="border-2 border-blue-600 bg-blue-50 p-5">
                      <h4 className="font-bold text-gray-900 mb-3">{card.title}</h4>
                      <p className="text-sm text-gray-800 mb-4">
                        {card.description}
                      </p>
                      <Link
                        href={card.url}
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:underline"
                      >
                        {t('landingPage.infoCardsLearnMore')}
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-t-2 border-gray-300 mb-8" />

          {/* Video Demo Section for future use */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t('landingPage.video.title')}
            </h2>

            <div className="bg-gray-800 rounded aspect-video flex items-center justify-center mb-4">
              <div className="text-center text-white">
                <p className="text-lg font-medium">{t('landingPage.video.placeholder')}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              {t('landingPage.video.description')}
            </p>
          </section>

          {/* Column Bottom Section */}
          <div className="grid md:grid-cols-2 gap-12 mb-12">
            {/* Left Column includes infographic about under-represented learners and resources*/}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('landingPage.underRep.title')}
              </h2>
              <ul className="space-y-2">
                {underRepLinks.map((l, i) => (
                  <li key={i}>
                    <Link href={l.url} className="text-blue-600 hover:underline text-sm">
                      {l.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column includes questions about BSWD*/}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t('landingPage.questions.title')}
              </h2>

              {questionsLinks.map((l, i) => (
                <p key={i} className="text-sm text-gray-700 mb-4">
                  <Link href={l.url} className="text-blue-600 hover:underline">
                    {l.text}
                  </Link>
                </p>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <StudentFooter />
      </div>
    </>
  );
}
