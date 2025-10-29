"use client";

import { useAccount, usePasskeyAuth } from "jazz-tools/react";
import { Button } from "@/components/ui/button";
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
      <Button type="button" variant="secondary" onClick={handleLogOut}>
        Log out
      </Button>
    );
  }

  return (
    <div className="flex gap-2">
      <Button type="button" variant="secondary" onClick={() => auth.signUp("")}>
        Sign up
      </Button>
      <Button variant="secondary" onClick={() => auth.logIn()} type="button">
        Log in
      </Button>
    </div>
  );
}
