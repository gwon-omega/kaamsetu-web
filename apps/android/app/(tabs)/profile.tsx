import { useEffect, useState, type ReactNode } from "react";
import { View, ScrollView, StyleSheet, Pressable, Switch } from "react-native";
import { Text, Card, Button, Avatar, Chip, Divider } from "react-native-paper";
import { Link, useRouter } from "expo-router";
import {
  LogOut,
  Briefcase,
  Bell,
  ChevronRight,
  User,
  Shield,
  HelpCircle,
  MapPin,
  Star,
  Edit3,
} from "lucide-react-native";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeIn,
} from "react-native-reanimated";
import type { HireRecord } from "@shram-sewa/shared";
import { isSupabaseConfigured } from "../../src/lib";
import {
  useAuthSession,
  useCurrentUserProfile,
  useMyHires,
  useMyWorkerProfile,
  useNotifications,
  useSignOutMutation,
  useWorkerAvailabilityMutation,
} from "../../src/hooks";

const mutedText = "#6D5E4A";
const motionTiming = {
  fast: 180,
  standard: 240,
  stagger: 30,
};

const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface MenuItemProps {
  icon: ReactNode;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: ReactNode;
  showArrow?: boolean;
  delay?: number;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  sublabel,
  onPress,
  rightElement,
  showArrow = true,
  delay = 0,
}) => (
  <AnimatedPressable
    style={({ pressed }) => [
      styles.menuItem,
      pressed && styles.menuItemPressed,
    ]}
    onPress={onPress}
    android_ripple={{ color: "#E8DDD0", radius: 120 }}
    entering={FadeInRight.delay(delay).duration(motionTiming.fast)}
  >
    <View style={styles.menuIcon}>{icon}</View>
    <View style={styles.menuContent}>
      <Text variant="bodyLarge" style={styles.menuLabel}>
        {label}
      </Text>
      {sublabel ? (
        <Text variant="bodySmall" style={styles.menuSublabel}>
          {sublabel}
        </Text>
      ) : null}
    </View>
    {rightElement ||
      (showArrow ? <ChevronRight color={mutedText} size={20} /> : null)}
  </AnimatedPressable>
);

function formatHireDate(hire: HireRecord): string {
  return hire.hiredAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ProfileScreen() {
  const router = useRouter();
  const backendReady = isSupabaseConfigured();

  const sessionQuery = useAuthSession(backendReady);
  const userId = sessionQuery.data?.user?.id;

  const userProfileQuery = useCurrentUserProfile(userId, backendReady);
  const hiresQuery = useMyHires(backendReady);
  const workerProfileQuery = useMyWorkerProfile(backendReady);
  const notificationsQuery = useNotifications(backendReady);
  const signOutMutation = useSignOutMutation();
  const workerAvailabilityMutation = useWorkerAvailabilityMutation();

  const userProfile = userProfileQuery.data;
  const workerProfile = workerProfileQuery.data;
  const hires = hiresQuery.data ?? [];
  const notifications = notificationsQuery.data ?? [];

  const defaultWorkerMode = userProfile?.role === "worker" || !!workerProfile;
  const [isWorkerMode, setIsWorkerMode] = useState(defaultWorkerMode);

  useEffect(() => {
    setIsWorkerMode(defaultWorkerMode);
  }, [defaultWorkerMode]);

  const isAuthenticated = Boolean(userId);
  const fullName =
    userProfile?.full_name ||
    (sessionQuery.data?.user?.user_metadata?.full_name as string | undefined) ||
    "Shram Sewa User";
  const fullNameNp =
    userProfile?.full_name_np ||
    (sessionQuery.data?.user?.user_metadata?.full_name_np as
      | string
      | undefined) ||
    "";
  const phone =
    userProfile?.phone || sessionQuery.data?.user?.phone || "Not set";
  const location = workerProfile
    ? `${workerProfile.localUnitNameEn}, ${workerProfile.districtNameEn}`
    : "Nepal";
  const memberSince = userProfile?.created_at
    ? new Date(userProfile.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently";

  const totalHires = hires.length;
  const completedHires = hires.filter(
    (hire) => hire.status === "completed",
  ).length;
  const totalSpent = hires.reduce(
    (sum, hire) => sum + (hire.agreedRateNpr ?? 0) * hire.workDurationDays,
    0,
  );
  const ratedHires = hires.filter(
    (hire): hire is HireRecord & { rating: number } =>
      typeof hire.rating === "number",
  );
  const avgRating = workerProfile
    ? workerProfile.avgRating
    : ratedHires.length
      ? ratedHires.reduce((sum, hire) => sum + hire.rating, 0) /
        ratedHires.length
      : 0;
  const activeHires = hires.filter(
    (hire) => hire.status === "pending" || hire.status === "accepted",
  ).length;
  const unreadNotifications = notifications.filter(
    (notification) => !notification.isRead,
  ).length;
  const recentHires = hires.slice(0, 3);

  const handleWorkerModeToggle = (nextValue: boolean) => {
    setIsWorkerMode(nextValue);

    if (workerProfile && nextValue !== workerProfile.isAvailable) {
      workerAvailabilityMutation.mutate({
        profileId: workerProfile.id,
        isAvailable: nextValue,
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <AnimatedView
        style={styles.unauthContainer}
        entering={FadeIn.duration(motionTiming.standard)}
      >
        <View style={styles.unauthIconContainer}>
          <User color="#A02535" size={48} />
        </View>
        <Text variant="headlineSmall" style={styles.unauthTitle}>
          Login Required
        </Text>
        <Text variant="bodyMedium" style={styles.unauthText}>
          {backendReady
            ? "Sign in to access your profile, view hire history, and manage your account"
            : "Supabase is not configured. Enable Supabase environment variables to use account features."}
        </Text>
        <Link href="/login" asChild>
          <Button
            mode="contained"
            style={styles.loginButton}
            contentStyle={styles.loginButtonContent}
            disabled={!backendReady}
          >
            Login with Phone
          </Button>
        </Link>
        <Link href="/login?register=true" asChild>
          <Button
            mode="outlined"
            style={styles.registerButton}
            disabled={!backendReady}
          >
            Register as Worker
          </Button>
        </Link>
      </AnimatedView>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <AnimatedCard
        style={styles.profileCard}
        entering={FadeInDown.duration(motionTiming.standard).springify()}
      >
        <Card.Content style={styles.profileContent}>
          <View style={styles.avatarSection}>
            <Avatar.Text
              size={80}
              label={fullName
                .split(" ")
                .map((namePart) => namePart[0])
                .join("")}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <Pressable style={styles.editAvatarButton}>
              <Edit3 color="#FFFFFF" size={14} />
            </Pressable>
          </View>

          <AnimatedView
            entering={FadeInDown.delay(120).duration(motionTiming.fast)}
          >
            <Text variant="headlineSmall" style={styles.userName}>
              {fullName}
            </Text>
            <Text variant="bodyMedium" style={styles.userNameNp}>
              {fullNameNp || fullName}
            </Text>
            <Text variant="bodyMedium" style={styles.userPhone}>
              {phone}
            </Text>

            <View style={styles.locationRow}>
              <MapPin color={mutedText} size={14} />
              <Text variant="bodySmall" style={styles.locationText}>
                {location}
              </Text>
            </View>

            <View style={styles.badgeRow}>
              <Chip
                mode="flat"
                style={styles.roleChip}
                textStyle={styles.roleChipText}
              >
                {workerProfile ? "👷 Worker" : "🏠 Hirer"}
              </Chip>
              <Chip mode="outlined" compact style={styles.memberChip}>
                Member since {memberSince}
              </Chip>
            </View>
          </AnimatedView>
        </Card.Content>
      </AnimatedCard>

      <AnimatedCard
        style={styles.toggleCard}
        entering={FadeInDown.delay(170).duration(motionTiming.fast)}
      >
        <Card.Content style={styles.toggleContent}>
          <View style={styles.toggleInfo}>
            <Text variant="titleMedium" style={styles.toggleTitle}>
              {workerProfile ? "Worker Availability" : "Worker Mode"}
            </Text>
            <Text variant="bodySmall" style={styles.toggleDesc}>
              {workerProfile
                ? isWorkerMode
                  ? "You are visible for new hires"
                  : "You are currently marked as busy"
                : isWorkerMode
                  ? "Register a worker profile to receive hires"
                  : "Find and hire workers"}
            </Text>
          </View>
          <Switch
            value={isWorkerMode}
            onValueChange={handleWorkerModeToggle}
            trackColor={{ false: "#E8DDD0", true: "#FFE4E6" }}
            thumbColor={isWorkerMode ? "#A02535" : mutedText}
          />
        </Card.Content>
      </AnimatedCard>

      <AnimatedView
        style={styles.statsRow}
        entering={FadeInDown.delay(220).duration(motionTiming.fast)}
      >
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text variant="headlineMedium" style={styles.statValue}>
              {totalHires}
            </Text>
            <Text variant="labelSmall" style={styles.statLabel}>
              Total Hires
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <Text
              variant="headlineMedium"
              style={[styles.statValue, { color: "#2D6A4F" }]}
            >
              {completedHires}
            </Text>
            <Text variant="labelSmall" style={styles.statLabel}>
              Completed
            </Text>
          </Card.Content>
        </Card>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <View style={styles.ratingValue}>
              <Star color="#8A6410" size={16} fill="#8A6410" />
              <Text
                variant="headlineMedium"
                style={[styles.statValue, { color: "#8A6410" }]}
              >
                {avgRating > 0 ? avgRating.toFixed(1) : "0.0"}
              </Text>
            </View>
            <Text variant="labelSmall" style={styles.statLabel}>
              Avg Rating
            </Text>
          </Card.Content>
        </Card>
      </AnimatedView>

      <AnimatedView
        style={styles.actionsRow}
        entering={FadeInDown.delay(270).duration(motionTiming.fast)}
      >
        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            pressed && styles.actionCardPressed,
          ]}
          android_ripple={{ color: "#F0EBE1" }}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#EBF5FF" }]}>
            <Briefcase color="#3b82f6" size={24} />
          </View>
          <Text variant="labelLarge" style={styles.actionLabel}>
            Hires
          </Text>
          <Text variant="bodySmall" style={styles.actionSub}>
            {activeHires} active • रु {totalSpent.toLocaleString()} spent
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.actionCard,
            pressed && styles.actionCardPressed,
          ]}
          android_ripple={{ color: "#F0EBE1" }}
          onPress={() => router.push("/(tabs)/notifications")}
        >
          <View style={[styles.actionIcon, { backgroundColor: "#FFF8E6" }]}>
            <Bell color="#f59e0b" size={24} />
          </View>
          <Text variant="labelLarge" style={styles.actionLabel}>
            Alerts
          </Text>
          <Text variant="bodySmall" style={styles.actionSub}>
            {unreadNotifications} new
          </Text>
        </Pressable>
      </AnimatedView>

      <AnimatedView
        entering={FadeInDown.delay(320).duration(motionTiming.fast)}
      >
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent Activity
        </Text>
      </AnimatedView>

      {recentHires.length === 0 ? (
        <Card style={styles.historyCard}>
          <Card.Content>
            <Text style={styles.historyJob}>No hire activity yet.</Text>
          </Card.Content>
        </Card>
      ) : (
        recentHires.map((hire, index) => (
          <AnimatedCard
            key={hire.id}
            style={styles.historyCard}
            entering={FadeInRight.delay(
              360 + index * motionTiming.stagger,
            ).duration(motionTiming.fast)}
          >
            <Pressable
              style={({ pressed }) => [pressed && styles.historyItemPressed]}
              android_ripple={{ color: "#F0EBE1", radius: 140 }}
            >
              <Card.Content style={styles.historyContent}>
                <View
                  style={[
                    styles.statusDot,
                    hire.status === "completed"
                      ? styles.completedDot
                      : styles.pendingDot,
                  ]}
                />
                <View style={styles.historyInfo}>
                  <Text variant="titleSmall" style={styles.historyName}>
                    Hire #{hire.id.slice(0, 8)}
                  </Text>
                  <View style={styles.historyMeta}>
                    <Text variant="bodySmall" style={styles.historyJob}>
                      {hire.workDescription || "General labor request"}
                    </Text>
                    <Text variant="bodySmall" style={styles.historyDate}>
                      • {formatHireDate(hire)}
                    </Text>
                  </View>
                </View>
                <View style={styles.historyRight}>
                  <Text variant="labelLarge" style={styles.amountText}>
                    रु{" "}
                    {(
                      (hire.agreedRateNpr ?? 0) * hire.workDurationDays
                    ).toLocaleString()}
                  </Text>
                  <Chip
                    mode="flat"
                    compact
                    style={
                      hire.status === "completed"
                        ? styles.completedChip
                        : hire.status === "cancelled"
                          ? styles.cancelledChip
                          : styles.pendingChip
                    }
                    textStyle={styles.statusChipText}
                  >
                    {hire.status}
                  </Chip>
                </View>
              </Card.Content>
            </Pressable>
          </AnimatedCard>
        ))
      )}

      <Link href="/history" asChild>
        <Button mode="text" style={styles.viewAllButton}>
          View All History
        </Button>
      </Link>

      <AnimatedView
        entering={FadeInDown.delay(520).duration(motionTiming.fast)}
      >
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Settings
        </Text>
      </AnimatedView>

      <Card style={styles.menuCard}>
        <MenuItem
          icon={<User color="#1C3557" size={20} />}
          label="Edit Profile"
          sublabel="Update your personal information"
          delay={560}
        />
        <Divider style={styles.menuDivider} />
        <MenuItem
          icon={<Bell color="#f59e0b" size={20} />}
          label="Notifications"
          sublabel="Manage notification preferences"
          delay={600}
          onPress={() => router.push("/(tabs)/notifications")}
        />
        <Divider style={styles.menuDivider} />
        <MenuItem
          icon={<Shield color="#2D6A4F" size={20} />}
          label="Privacy & Security"
          delay={640}
        />
        <Divider style={styles.menuDivider} />
        <MenuItem
          icon={<HelpCircle color={mutedText} size={20} />}
          label="Help & Support"
          delay={680}
        />
      </Card>

      <AnimatedView
        entering={FadeInDown.delay(500).duration(motionTiming.fast)}
      >
        <Button
          mode="outlined"
          icon={({ size }) => <LogOut color="#dc2626" size={size - 4} />}
          textColor="#dc2626"
          style={styles.logoutButton}
          contentStyle={styles.logoutButtonContent}
          loading={signOutMutation.isPending}
          disabled={signOutMutation.isPending}
          onPress={async () => {
            try {
              await signOutMutation.mutateAsync();
              router.replace("/");
            } catch (error) {
              console.warn("Logout failed:", error);
            }
          }}
        >
          Logout
        </Button>
      </AnimatedView>

      <Text variant="bodySmall" style={styles.versionText}>
        श्रम सेवा v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF7F0" },
  content: { padding: 16, paddingBottom: 40 },
  unauthContainer: {
    flex: 1,
    backgroundColor: "#FAF7F0",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  unauthIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFF1F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  unauthTitle: { color: "#1C3557", marginBottom: 8, fontWeight: "600" },
  unauthText: {
    color: mutedText,
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
  },
  loginButton: {
    backgroundColor: "#A02535",
    borderRadius: 14,
    width: "100%",
    marginBottom: 12,
  },
  loginButtonContent: { paddingVertical: 8 },
  registerButton: { borderColor: "#1C3557", borderRadius: 14, width: "100%" },
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    borderRadius: 20,
    elevation: 2,
  },
  profileContent: { alignItems: "center", paddingVertical: 28 },
  avatarSection: { position: "relative", marginBottom: 16 },
  avatar: { backgroundColor: "#A02535" },
  avatarLabel: { fontWeight: "700", fontSize: 28 },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1C3557",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  userName: { color: "#1C3557", fontWeight: "700", textAlign: "center" },
  userNameNp: { color: mutedText, textAlign: "center", marginTop: 4 },
  userPhone: { color: mutedText, textAlign: "center", marginTop: 4 },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  locationText: { color: mutedText },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  roleChip: { backgroundColor: "#FFE4E6" },
  roleChipText: { color: "#A02535", fontWeight: "600" },
  memberChip: { borderColor: "#D4C5B0" },
  toggleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
  },
  toggleContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleInfo: { flex: 1, marginRight: 12 },
  toggleTitle: { color: "#1C3557", fontWeight: "600" },
  toggleDesc: { color: mutedText, marginTop: 4 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "#FFFFFF" },
  statContent: { alignItems: "center" },
  statValue: { color: "#A02535", fontWeight: "700" },
  statLabel: { color: mutedText, textAlign: "center" },
  ratingValue: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionsRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  actionCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    elevation: 1,
  },
  actionCardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  actionLabel: { color: "#1C3557", fontWeight: "600" },
  actionSub: { color: mutedText, marginTop: 4, textAlign: "center" },
  sectionTitle: {
    color: "#1C3557",
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 8,
  },
  historyContent: { flexDirection: "row", alignItems: "center" },
  historyItemPressed: { opacity: 0.94, transform: [{ scale: 0.995 }] },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  completedDot: { backgroundColor: "#16a34a" },
  pendingDot: { backgroundColor: "#f59e0b" },
  historyInfo: { flex: 1 },
  historyName: { color: "#1C3557", fontWeight: "600" },
  historyMeta: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  historyJob: { color: mutedText },
  historyDate: { color: mutedText, marginLeft: 6 },
  historyRight: { alignItems: "flex-end" },
  amountText: { color: "#1C3557", fontWeight: "600" },
  completedChip: { backgroundColor: "#dcfce7", marginTop: 4 },
  pendingChip: { backgroundColor: "#FEF3C7", marginTop: 4 },
  cancelledChip: { backgroundColor: "#FEE2E2", marginTop: 4 },
  statusChipText: { fontSize: 10, textTransform: "capitalize" },
  viewAllButton: { marginBottom: 8 },
  menuCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    marginBottom: 20,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  menuItemPressed: { opacity: 0.92, transform: [{ scale: 0.995 }] },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F5EFE3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuContent: { flex: 1 },
  menuLabel: { color: "#1C3557", fontWeight: "500" },
  menuSublabel: { color: mutedText, marginTop: 2 },
  menuDivider: { backgroundColor: "#F0EBE1" },
  logoutButton: { borderColor: "#dc2626", borderRadius: 12, marginBottom: 16 },
  logoutButtonContent: { paddingVertical: 6 },
  versionText: { color: mutedText, textAlign: "center" },
});
