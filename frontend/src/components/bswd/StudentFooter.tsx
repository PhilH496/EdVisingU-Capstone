/**
 * StudentFooter Component
 *
 * Displays the global footer for student-facing pages.
 *
 * Features:
 * - Black background with white text
 * - EdVisingU policy links
 * - Contact information
 * - Copyright notice
 */

import Link from "next/link";
import { Mail, Map } from "lucide-react";

export function StudentFooter() {
  return (
    <footer className="bg-black text-white mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h2 className="text-3xl font-semibold mb-6">EdVisingU</h2>
          </div>

          {/* Company Policies */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Company</h3>
            <ul className="space-y-3 text-base text-gray-200">
              <li>
                <Link
                  href="https://edvisingu.com/TermsandConditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link
                  href="https://edvisingu.com/PrivacyPolicy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="https://edvisingu.com/PrivacyPolicy-BKVWp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Cookie Policies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Get in touch</h3>
            <div className="space-y-4 text-gray-200">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5" />
                <span>support@edvisingu.com</span>
              </div>

              <div className="flex items-center gap-3">
                <Map className="h-5 w-5" />
                <span>Toronto, Canada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Divider */}
        <div className="border-t border-gray-700 mt-10 pt-6">
          <p className="text-sm text-gray-400">
            © 2026 EdVisingU, All rights reserved. 
          </p>
        </div>
      </div>
    </footer>
  );
}
