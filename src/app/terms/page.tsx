import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service – Recurring // OPS",
  description: "Terms of Service for the Recurring // OPS task management application.",
};

export default function TermsOfService() {
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
              RECURRING // OPS
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-[#E4E6EB] mb-2">
            Terms of Service
          </h1>
          <p className="text-xs text-[#8B92A3]">Last updated: September 8, 2026</p>
        </div>

        <div className="flex flex-col gap-8 text-sm leading-relaxed text-[#C8CDD8]">
          <section>
            <p>
              By using Recurring // OPS (&ldquo;the app&rdquo;), you agree to these Terms of
              Service. Please read them carefully.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              1. Use of the App
            </h2>
            <p>
              Recurring // OPS is a personal productivity tool for managing tasks
              and recurring routines. You agree to use it only for lawful
              purposes and in a manner consistent with these terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              2. Accounts
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your
              credentials. You are responsible for all activity that occurs under
              your account. Notify us immediately of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              3. Your Data
            </h2>
            <p>
              You own the task data you create. We store it to provide the
              service. See our{" "}
              <Link
                href="/privacy"
                className="text-[#5B7FFF] hover:underline"
              >
                Privacy Policy
              </Link>{" "}
              for details on how we handle your data.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              4. Disclaimers
            </h2>
            <p>
              The app is provided &ldquo;as is&rdquo; without warranties of any kind. We do
              not guarantee uninterrupted or error-free service. Use the app at
              your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              5. Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, we shall not be liable for
              any indirect, incidental, or consequential damages arising from
              your use of the app.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              6. Changes to Terms
            </h2>
            <p>
              We may update these Terms at any time. Continued use of the app
              after changes constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              7. Contact
            </h2>
            <p>
              Questions about these Terms? Open an issue on our{" "}
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
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#2A2E37] flex items-center justify-between text-xs text-[#5C6272]">
          <span>Recurring // OPS</span>
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
