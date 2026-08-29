import { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { SPLASH_MS } from "./src/copy.js";
import { SignupPlaceholder, SplashScreenView } from "./src/screens.js";
import { afterSplashScreen } from "./src/session.js";
import { colors } from "./src/theme.js";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [screen, setScreen] = useState("splash");

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    const timer = setTimeout(() => {
      setScreen(afterSplashScreen());
    }, SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar style="dark" backgroundColor={colors.paper} />
      {screen === "splash" ? <SplashScreenView /> : null}
      {screen === "signup" ? <SignupPlaceholder /> : null}
    </>
  );
}
