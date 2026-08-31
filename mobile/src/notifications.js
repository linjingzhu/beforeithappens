import { Platform } from "react-native";

/** iOS system permission dialog only. No custom Korean body. Don't Allow still continues. */
export async function requestLoveMeNotificationPermission() {
  if (Platform.OS !== "ios") return;
  try {
    const Notifications = await import("expo-notifications");
    await Notifications.requestPermissionsAsync?.();
  } catch {
    /* Don't Allow or missing native module still continues */
  }
}
