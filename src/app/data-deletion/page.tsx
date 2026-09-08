import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Data Deletion – Recurring // OPS",
  description:
    "Instructions to delete your Recurring // OPS account and all associated data.",
};

export default function DataDeletion() {
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
            Data Deletion Instructions
          </h1>
          <p className="text-xs text-[#8B92A3]">
            Last updated: September 8, 2026
          </p>
        </div>

        <div className="flex flex-col gap-8 text-sm leading-relaxed text-[#C8CDD8]">
          <section>
            <p>
              If you signed in to Recurring // OPS using Facebook and would like
              to delete all data we hold about you, follow the steps below.
            </p>
          </section>

          {/* Option 1 – In-app */}
          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              Option 1 — Remove Data In-App
            </h2>
            <ol className="list-decimal list-inside flex flex-col gap-2">
              <li>
                Open{" "}
                <Link href="/" className="text-[#5B7FFF] hover:underline">
                  Recurring // OPS
                </Link>{" "}
                and sign in.
              </li>
              <li>
                Click the{" "}
                <strong className="text-[#E4E6EB]">Remove All Data</strong>{" "}
                button in the top toolbar to delete all your tasks.
              </li>
              <li>
                Click the <strong className="text-[#E4E6EB]">Log Out</strong>{" "}
                icon next to your username.
              </li>
            </ol>
            <p className="mt-3 text-[#8B92A3] text-xs">
              This removes your tasks. To delete your full account record
              (including your name, email, and provider ID), use Option 2 below.
            </p>
          </section>

          {/* Option 2 – GitHub */}
          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              Option 2 — Request Full Account Deletion
            </h2>
            <p>
              To permanently delete your account and all associated data (name,
              email, Facebook ID, session tokens, and task history), open an
              issue on our GitHub repository and include the phrase{" "}
              <code className="bg-[#1C1F26] px-1 py-0.5 rounded text-[#5B7FFF] text-xs">
                delete my account
              </code>{" "}
              along with the email address linked to your Facebook account.
            </p>
            <a
              href="https://github.com/jayant-baid/taskra-todo-app/issues/new?title=Delete+my+account&body=Please+delete+all+data+associated+with+my+account.+Email%3A+"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#1C1F26] border border-[#2A2E37] hover:border-[#5B7FFF] rounded-[3px] text-[#5B7FFF] text-xs font-medium transition-colors"
            >
              Open Deletion Request on GitHub →
            </a>
            <p className="mt-3 text-[#8B92A3] text-xs">
              We will process your deletion request within 30 days and confirm
              via a reply on the issue.
            </p>
          </section>

          {/* What gets deleted */}
          <section>
            <h2 className="text-base font-semibold text-[#E4E6EB] mb-3">
              What Data Is Deleted
            </h2>
            <ul className="list-disc list-inside flex flex-col gap-2">
              <li>Your name and email address</li>
              <li>Your Facebook provider ID</li>
              <li>All tasks and recurring schedules</li>
              <li>All completion history and occurrence records</li>
              <li>All active session tokens</li>
            </ul>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-[#2A2E37] flex items-center justify-between text-xs text-[#5C6272]">
          <span>Recurring // OPS</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-[#5B7FFF] hover:underline">
              Privacy Policy
            </Link>
            <Link href="/" className="text-[#5B7FFF] hover:underline">
              ← Back to App
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
