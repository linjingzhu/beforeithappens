export function isLoggedIn() {
  return false;
}

export function afterSplashScreen(loggedIn = isLoggedIn()) {
  return loggedIn ? "session" : "signup";
}
