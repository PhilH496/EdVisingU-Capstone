import Head from "next/head";
import { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  rightSlot?: ReactNode;
  children: ReactNode;
};

export function AdminLayout({ title, description, rightSlot, children }: Props) {
  return (
    <>
      <Head>
        <title>{title || "BSWD Admin"}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div
        className="min-h-screen bg-gray-50"
        style={{ fontFamily: `"Raleway","Helvetica Neue",Helvetica,Arial,sans-serif` }}
      >
        {/* Ontario Black Header (matches app) */}
        <header className="bg-black">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center py-4">
              <img
                src="/ontario-logo.png"
                alt="Ontario"
                className="block h-8 w-auto filter invert contrast-100"
              />
            </div>
          </div>
        </header>

        {/* Masthead (match app: larger title, subtle subtitle, actions on the right) */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start justify-between gap-4 py-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-2 text-base md:text-lg text-gray-600">
                    {description}
                  </p>
                ) : null}
              </div>
              {rightSlot ? (
                <div className="shrink-0 flex items-center">{rightSlot}</div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Page Content (same container rhythm as app) */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </>
  );
}

export default AdminLayout;
