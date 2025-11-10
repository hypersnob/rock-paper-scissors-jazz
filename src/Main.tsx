import { RouterProvider } from "@tanstack/react-router";
import { JazzReactProvider } from "jazz-tools/react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import { JazzInspector } from "jazz-tools/inspector";
import { Toaster } from "sonner";
import { apiKey } from "@/apiKey";
import { router } from "@/router";
import { JazzAccount } from "@/schema";
import "@fontsource-variable/nunito-sans";

// This identifies the app in the passkey auth
export const APPLICATION_NAME = "hard-rock-paper-scissors";

// biome-ignore lint/style/noNonNullAssertion: Forbidden non-null assertion
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <JazzReactProvider
      sync={{
        peer: `wss://cloud.jazz.tools/?key=${apiKey}`,
      }}
      AccountSchema={JazzAccount}
    >
      <RouterProvider router={router} />
      {import.meta.env.DEV && <JazzInspector />}
      <Toaster />
    </JazzReactProvider>
  </StrictMode>,
);
