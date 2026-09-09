"use client";

import { useEffect, useState } from "react";

export default function OAuthCallbackPage() {
  const [message, setMessage] = useState("Finishing sign-in...");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");
    const success = Boolean(token && !error);

    window.opener?.postMessage(
      {
        type: "taskra-oauth",
        success,
        token: token || undefined,
        error: error || undefined,
      },
      window.location.origin,
    );

    if (success) {
      window.setTimeout(
        () => setMessage("Sign-in complete. This window will close shortly."),
        0,
      );
      window.setTimeout(() => window.close(), 250);
    } else {
      window.setTimeout(() => {
        setFailed(true);
        setMessage(
          error || "Login failed. You can close this window and try again.",
        );
      }, 0);
    }
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#14161A] px-6 text-center text-[#E4E6EB]">
      <div className="max-w-sm">
        <h1 className="text-lg font-semibold">
          {failed ? "Unable to sign in" : "Taskra sign-in"}
        </h1>
        <p className="mt-2 text-sm text-[#8B92A3]">{message}</p>
      </div>
    </main>
  );
}
