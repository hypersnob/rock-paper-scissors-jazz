"use client";

import { useAccount, usePasskeyAuth } from "jazz-tools/react";
import { Button } from "@/components/ui/button";
import LogInIcon from "@/icons/LogIn.svg?react";
import LogOutIcon from "@/icons/LogOut.svg?react";
import { APPLICATION_NAME } from "@/Main";

export function AuthButton() {
  const { logOut } = useAccount();

  const auth = usePasskeyAuth({
    appName: APPLICATION_NAME,
  });

  function handleLogOut() {
    logOut();
    window.history.pushState({}, "", "/");
  }

  if (auth.state === "signedIn") {
    return (
      <Button
        type="button"
        variant="ghost"
        title="Sign out"
        onClick={handleLogOut}
      >
        <LogOutIcon className="size-6" />
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        title="Sign up"
        variant="secondary"
        onClick={() => auth.signUp("")}
      >
        Sign up
      </Button>
      <Button
        title="Sign in"
        variant="secondary"
        onClick={() => auth.logIn()}
        type="button"
      >
        <LogInIcon className="size-6" />
      </Button>
    </div>
  );
}
