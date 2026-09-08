import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy – Taskra",
  description: "Privacy Policy for the Taskra task management application.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#14161A] text-[#E4E6EB] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-2.5 h-2.5 bg-[#5B7FFF] rounded-[1px]" />
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-[#E4E6EB] hover:text-[#5B7FFF] transition-colors"
            >
              Taskra
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#E4E6EB] mb-2">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#8B92A3]">Last updated: September 8, 2026</p>
        </div>

        <div className="flex flex-col gap-8 text-sm leading-relaxed text-[#C8CDD8]">
          {/* Intro */}
          <section>
            <p>
              Taskra (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;the app&rdquo;) is a personal task
              management application. This Privacy Policy explains what information
              we collect, how we use it, and your rights regarding your data.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              1. Information We Collect
            </h2>
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="font-semibold text-[#E4E6EB] mb-1">
                  Account Information
                </h3>
                <p>
                  When you create an account, we collect your chosen username and
                  a securely hashed password. If you sign in with Google or
                  Facebook, we receive your name, email address, and profile
                  picture URL from that provider.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#E4E6EB] mb-1">
                  Task Data
                </h3>
                <p>
                  We store the tasks, recurring schedules, and completion records
                  that you create within the app. This data is associated with
                  your account to enable cross-device sync.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[#E4E6EB] mb-1">
                  Session Tokens
                </h3>
                <p>
                  We issue a session token stored as a secure HTTP-only cookie to
                  keep you signed in. Sessions expire after 30 days.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Information */}
          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside flex flex-col gap-2 text-[#C8CDD8]">
              <li>To authenticate you and maintain your session.</li>
              <li>To store and sync your tasks across your devices.</li>
              <li>To display your name or username in the app interface.</li>
              <li>
                We do <strong className="text-[#E4E6EB]">not</strong> sell, rent,
                or share your personal data with third parties for marketing
                purposes.
              </li>
            </ul>
          </section>

          {/* Third-Party Sign-In */}
          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              3. Third-Party Sign-In (Google & Facebook)
            </h2>
            <p>
              When you choose to sign in with Google or Facebook, you are
              redirected to that provider&apos;s authorization screen. We only request
              the minimum necessary scopes:
            </p>
            <ul className="list-disc list-inside mt-3 flex flex-col gap-1">
              <li>
                <strong className="text-[#E4E6EB]">Google:</strong> openid, email,
                profile
              </li>
              <li>
                <strong className="text-[#E4E6EB]">Facebook:</strong> email,
                public_profile
              </li>
            </ul>
            <p className="mt-3">
              We store your provider ID, email, name, and avatar URL to link
              your social account to your Taskra account. We do not
              post on your behalf or access your contacts or friends lists.
            </p>
          </section>

          {/* Data Storage */}
          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              4. Data Storage & Security
            </h2>
            <p>
              Your data is stored in a SQLite database on the server. Passwords
              are never stored in plain text — they are hashed using a secure
              salt. OAuth accounts are assigned a random credential token
              internally.
            </p>
            <p className="mt-3">
              We take reasonable technical measures to protect your data, but
              no method of transmission or storage is 100% secure.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              5. Data Retention & Deletion
            </h2>
            <p>
              Your account data is retained for as long as your account is
              active. You may request deletion of your account and all associated
              data at any time by contacting us (see Section 8). We will process
              deletion requests within 30 days.
            </p>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              6. Cookies
            </h2>
            <p>
              We use a single first-party HTTP-only cookie named{" "}
              <code className="bg-[#1C1F26] px-1 py-0.5 rounded text-[#5B7FFF] text-xs">
                session_token
              </code>{" "}
              solely for authentication. We do not use advertising cookies or
              third-party tracking cookies.
            </p>
          </section>

          {/* Children */}
          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              7. Children&apos;s Privacy
            </h2>
            <p>
              Taskra is not directed at children under the age of 13.
              We do not knowingly collect personal information from children
              under 13. If you believe we have inadvertently collected such
              information, please contact us for immediate deletion.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              8. Contact
            </h2>
            <p>
              If you have questions about this Privacy Policy or want to request
              data deletion, please open an issue on our{" "}
              <a
                href="https://github.com/jayant-baid/taskra-todo-app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#5B7FFF] hover:underline"
              >
                GitHub repository
              </a>
              .
            </p>
          </section>

          {/* Changes */}
          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. The &ldquo;Last
              updated&rdquo; date at the top of this page reflects the most recent
              revision. Continued use of the app after changes constitutes
              acceptance of the updated policy.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#2A2E37] flex items-center justify-between text-xs text-[#5C6272]">
          <span>Taskra</span>
          <Link
            href="/"
            className="text-[#5B7FFF] hover:underline"
          >
            ← Back to App
          </Link>
        </div>
      </div>
    </div>
  );
}
