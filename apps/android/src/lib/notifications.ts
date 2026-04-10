import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type ExpoConfigExtra = {
  eas?: {
    projectId?: string;
  };
};

function resolveExpoProjectId(): string | undefined {
  const fromEasConfig = Constants.easConfig?.projectId;
  if (fromEasConfig) {
    return fromEasConfig;
  }

  const extra = (Constants.expoConfig?.extra ?? {}) as ExpoConfigExtra;
  return extra.eas?.projectId;
}

export async function configureAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("hire_urgent", {
    name: "Urgent Hire Requests",
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#A02535",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
    sound: "default",
  });
}

export async function registerForPushNotificationsAsync(): Promise<
  string | null
> {
  const existingPermissions = await Notifications.getPermissionsAsync();
  let permissionStatus = existingPermissions.status;

  if (permissionStatus !== "granted") {
    const requestedPermissions = await Notifications.requestPermissionsAsync();
    permissionStatus = requestedPermissions.status;
  }

  if (permissionStatus !== "granted") {
    return null;
  }

  const projectId = resolveExpoProjectId();
  const expoPushToken = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  return expoPushToken.data;
}
