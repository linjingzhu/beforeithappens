import { ImageBackground, Platform, StyleSheet, View } from "react-native";
import { colors } from "./theme.js";

const bgSource = Platform.OS === "web" ? null : require("../assets/bg-gradient.png");
const btnSource = Platform.OS === "web" ? null : require("../assets/btn-gradient.png");

export function ScreenGradient({ style, children, testID }) {
  if (Platform.OS === "web") {
    return (
      <View testID={testID} style={[styles.screen, { experimental_backgroundImage: "linear-gradient(180deg, #F6C8D8 0%, #B7D9F0 100%)", backgroundImage: "linear-gradient(180deg, #F6C8D8 0%, #B7D9F0 100%)" }, style]}>
        {children}
      </View>
    );
  }
  return (
    <ImageBackground testID={testID} source={bgSource} resizeMode="stretch" style={[styles.screen, style]}>
      {children}
    </ImageBackground>
  );
}

export function GradientButtonWrap({ style, children }) {
  if (Platform.OS === "web") {
    return (
      <View style={[styles.btn, { experimental_backgroundImage: "linear-gradient(90deg, #F6C8D8 0%, #B7D9F0 100%)", backgroundImage: "linear-gradient(90deg, #F6C8D8 0%, #B7D9F0 100%)" }, style]}>
        {children}
      </View>
    );
  }
  return (
    <ImageBackground source={btnSource} resizeMode="stretch" style={[styles.btn, style]} imageStyle={styles.btnImage}>
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.babyPink
  },
  btn: {
    minHeight: 52,
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.babyPink
  },
  btnImage: {
    borderRadius: 16
  }
});
