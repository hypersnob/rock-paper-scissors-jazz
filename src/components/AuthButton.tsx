"use client";

import { useNavigate } from "@tanstack/react-router";
import { useAccount, usePasskeyAuth } from "jazz-tools/react";
import { LogInIcon, LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { APPLICATION_NAME } from "@/Main";

function getHasSignedUpKey() {
  return `jazz-${APPLICATION_NAME}-has-signed-up`;
}

export function AuthButton({
  playerName = "Anonymous Player",
}: {
  playerName?: string;
}) {
  const { logOut } = useAccount();
  const navigate = useNavigate();

  const auth = usePasskeyAuth({
    appName: APPLICATION_NAME,
  });

  function handleLogOut() {
    // Don't clear the localStorage flag - the passkey still exists on the device
    // so the user can still log back in. The flag indicates they've signed up
    // on this device before, which remains true even after logout.
    logOut();
    navigate({ to: "/" });
  }

  async function handleSignUp() {
    await auth.signUp(playerName);
    // Mark that user has signed up on this device
    if (typeof window !== "undefined") {
      localStorage.setItem(getHasSignedUpKey(), "true");
    }
  }

  async function handleLogIn() {
    await auth.logIn();
    // Mark that user has logged in on this device (they've signed up before)
    if (typeof window !== "undefined") {
      localStorage.setItem(getHasSignedUpKey(), "true");
    }
  }

  // Signed in: show only logout
  if (auth.state === "signedIn") {
    return (
      <Button
        type="button"
        variant="ghost"
        title="Sign out"
        onClick={handleLogOut}
      >
        <LogOutIcon strokeWidth={3} size={28} />
      </Button>
    );
  }

  // Anonymous: check if user has signed up on this device before
  if (auth.state === "anonymous") {
    const hasSignedUp =
      typeof window !== "undefined" &&
      localStorage.getItem(getHasSignedUpKey()) === "true";

    if (hasSignedUp) {
      // User has signed up before on this device, show log in
      return (
        <Button
          title="Log in"
          variant="ghost"
          onClick={handleLogIn}
          type="button"
        >
          <LogInIcon strokeWidth={3} size={28} />
        </Button>
      );
    }

    // User hasn't signed up yet, show sign up
    return (
      <Button
        title="Sign up"
        variant="ghost"
        onClick={handleSignUp}
        type="button"
      >
        <LogInIcon strokeWidth={3} size={28} />
      </Button>
    );
  }

  // Fallback: should not reach here with only two states
  return null;
}
