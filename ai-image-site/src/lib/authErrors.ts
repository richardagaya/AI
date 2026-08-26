/** Firebase Auth error.code → copy the user can act on. */
export function authErrorCode(e: unknown): string | null {
  if (typeof e === "object" && e !== null && "code" in e) {
    const code = (e as { code: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

export function readableAuthError(e: unknown, fallback: string) {
  switch (authErrorCode(e)) {
    case "auth/email-already-in-use":
      return "That email already has an account. Sign in, or use Continue with Google if you signed up that way.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/missing-email":
      return "Enter an email address.";
    case "auth/missing-password":
      return "Enter a password.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email or password is incorrect. If you created this account with Google, use Continue with Google.";
    case "auth/user-disabled":
      return "This account has been disabled.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/operation-not-allowed":
      return "Email and password sign-up is turned off for this project.";
    case "auth/account-exists-with-different-credential":
      return "This email is already used with Google. Continue with Google instead.";
    case "auth/expired-action-code":
    case "auth/invalid-action-code":
      return "This reset link is invalid or has expired. Request a new one.";
    case "auth/missing-continue-uri":
    case "auth/invalid-continue-uri":
    case "auth/unauthorized-continue-uri":
      return "Password reset is misconfigured for this domain. Try again in a few minutes.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
    default:
      break;
  }
  const msg = e instanceof Error ? e.message : fallback;
  const cleaned = msg.replace("Firebase: ", "").replace(/ \(auth\/.*\)\.?$/, "");
  return cleaned && cleaned !== "Error" ? cleaned : fallback;
}
