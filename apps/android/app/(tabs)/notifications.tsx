import { View, FlatList, StyleSheet, Pressable } from "react-native";
import { Text, Card } from "react-native-paper";
import { Bell, Check, Clock, User } from "lucide-react-native";
import { useEffect } from "react";
import Animated, {
  FadeInDown,
  Layout,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import type { NotificationType } from "@shram-sewa/shared";
import { isSupabaseConfigured } from "../../src/lib";
import {
  useAuthSession,
  useMarkNotificationReadMutation,
  useNotifications,
  getNotificationDisplayMessage,
  getRelativeTimeLabel,
} from "../../src/hooks";

const mutedText = "#6D5E4A";
const AnimatedCard = Animated.createAnimatedComponent(Card);

function UnreadDot() {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.25, { duration: 420 }),
        withTiming(1, { duration: 420 }),
      ),
      -1,
      false,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return <Animated.View style={[styles.unreadDot, animatedStyle]} />;
}

export default function NotificationsScreen() {
  const backendReady = isSupabaseConfigured();
  const sessionQuery = useAuthSession(backendReady);
  const notificationsQuery = useNotifications(backendReady);
  const markReadMutation = useMarkNotificationReadMutation();

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "hire_accepted":
        return <Check color="#16a34a" size={20} />;
      case "hire_request":
        return <User color="#8A6410" size={20} />;
      case "hire_completed":
        return <Check color="#A02535" size={20} />;
      default:
        return <Bell color={mutedText} size={20} />;
    }
  };

  const notifications = notificationsQuery.data ?? [];

  const renderNotification = ({
    item,
    index,
  }: {
    item: (typeof notifications)[number];
    index: number;
  }) => (
    <Pressable
      style={({ pressed }) => [pressed && styles.cardPressed]}
      android_ripple={{ color: "#F0EBE1", radius: 160 }}
      onPress={() => {
        if (!item.isRead) {
          markReadMutation.mutate(item.id);
        }
      }}
    >
      <AnimatedCard
        entering={FadeInDown.delay(index * 32)
          .duration(190)
          .springify()}
        layout={Layout.springify().damping(18).stiffness(170)}
        style={[styles.card, !item.isRead && styles.unreadCard]}
      >
        <Card.Content style={styles.content}>
          <View
            style={[styles.iconContainer, !item.isRead && styles.unreadIcon]}
          >
            {getIcon(item.type)}
          </View>
          <View style={styles.textContainer}>
            <Text variant="titleSmall" style={styles.title}>
              {item.title}
            </Text>
            <Text variant="bodySmall" style={styles.body}>
              {getNotificationDisplayMessage(item, "en")}
            </Text>
            <View style={styles.timeRow}>
              <Clock size={12} color={mutedText} />
              <Text variant="labelSmall" style={styles.time}>
                {getRelativeTimeLabel(item.createdAt)}
              </Text>
            </View>
          </View>
          {!item.isRead && <UnreadDot />}
        </Card.Content>
      </AnimatedCard>
    </Pressable>
  );

  const emptyMessage = !backendReady
    ? "Enable Supabase to view notifications"
    : !sessionQuery.data?.user?.id
      ? "Login to view notifications"
      : "No notifications";

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={48} color="#D4C5B0" />
            <Text variant="titleMedium" style={styles.emptyText}>
              {emptyMessage}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF7F0" },
  list: { padding: 16 },
  card: { marginBottom: 12, backgroundColor: "#FFFFFF" },
  cardPressed: { opacity: 0.94, transform: [{ scale: 0.996 }] },
  unreadCard: {
    backgroundColor: "#FFF8F0",
    borderLeftWidth: 3,
    borderLeftColor: "#A02535",
  },
  content: { flexDirection: "row", alignItems: "flex-start" },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0EBE1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  unreadIcon: { backgroundColor: "#FFE4E6" },
  textContainer: { flex: 1 },
  title: { fontWeight: "600", color: "#1C3557" },
  body: { color: mutedText, marginTop: 2 },
  timeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  time: { color: mutedText },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#A02535",
  },
  emptyContainer: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyText: { color: mutedText },
});
