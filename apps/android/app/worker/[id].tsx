import { View, ScrollView, StyleSheet, Pressable } from "react-native";
import { Text, Card, Button, Chip, Divider } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Star,
  MapPin,
  Calendar,
  Phone,
  MessageCircle,
  Briefcase,
  Award,
} from "lucide-react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  SlideInRight,
} from "react-native-reanimated";
import { useCallback, useEffect, useRef } from "react";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { useWorker } from "../../src/hooks";

const mutedText = "#6D5E4A";
const motionTiming = {
  fast: 180,
  standard: 240,
  stagger: 30,
};

// Animated components
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedCard = Animated.createAnimatedComponent(Card);

// Pulsing available badge
const AvailableBadge = ({ available }: { available: boolean }) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (available) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 460,
            easing: Easing.inOut(Easing.ease),
          }),
          withTiming(1, { duration: 460, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        false,
      );
    }
  }, [available]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedView style={animatedStyle}>
      <Chip
        mode="flat"
        style={available ? styles.availableChip : styles.unavailableChip}
        textStyle={available ? styles.availableText : styles.unavailableText}
        icon={available ? "check-circle" : "clock-outline"}
      >
        {available ? "Available Now" : "Currently Busy"}
      </Chip>
    </AnimatedView>
  );
};

// Stat card component
const StatCard = ({
  value,
  label,
  icon: Icon,
  color,
  delay,
}: {
  value: string | number;
  label: string;
  icon: any;
  color: string;
  delay: number;
}) => (
  <AnimatedCard
    style={styles.statCard}
    entering={FadeInUp.delay(delay).duration(motionTiming.fast).springify()}
    layout={Layout.springify().damping(18).stiffness(170)}
  >
    <Card.Content style={styles.statCardContent}>
      <Icon size={20} color={color} />
      <Text variant="headlineSmall" style={[styles.statCardValue, { color }]}>
        {value}
      </Text>
      <Text variant="labelSmall" style={styles.statCardLabel}>
        {label}
      </Text>
    </Card.Content>
  </AnimatedCard>
);

export default function WorkerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const workerQuery = useWorker(id, true);
  const worker = workerQuery.data;

  const handleHire = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleCloseSheet = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const handleConfirmHire = useCallback(() => {
    if (worker) {
      router.push(`/hire/${worker.id}`);
    }
    handleCloseSheet();
  }, [handleCloseSheet, router, worker]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  if (!id) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateTitle}>Worker not found</Text>
      </View>
    );
  }

  if (workerQuery.isError) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateTitle}>Unable to load worker details</Text>
        <Button mode="contained" onPress={() => workerQuery.refetch()}>
          Retry
        </Button>
      </View>
    );
  }

  if (workerQuery.isLoading) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateTitle}>Loading worker details...</Text>
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={styles.stateContainer}>
        <Text style={styles.stateTitle}>Worker profile is unavailable</Text>
      </View>
    );
  }

  const skills = [
    worker.jobCategory.nameEn || "Skilled labor",
    worker.experienceYrs > 0
      ? `${worker.experienceYrs}+ years experience`
      : "Local service provider",
    worker.isAvailable ? "Available now" : "Currently busy",
  ];

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        {/* Profile Header Card */}
        <AnimatedCard
          style={styles.profileCard}
          entering={FadeInDown.duration(360).springify()}
          layout={Layout.springify().damping(18).stiffness(170)}
        >
          <Card.Content style={styles.profileContent}>
            {/* Avatar */}
            <AnimatedView
              style={styles.avatarContainer}
              entering={FadeIn.delay(90).duration(motionTiming.fast)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarIcon}>
                  {worker.jobCategory.icon || "👤"}
                </Text>
              </View>
              <AvailableBadge available={worker.isAvailable} />
            </AnimatedView>

            {/* Name and Job */}
            <AnimatedView
              entering={FadeInUp.delay(130).duration(motionTiming.fast)}
            >
              <View style={styles.nameRow}>
                <Text variant="headlineSmall" style={styles.workerName}>
                  {worker.fullName}
                </Text>
              </View>
              <Text variant="bodyLarge" style={styles.nepaliName}>
                {worker.fullNameNp || worker.fullName}
              </Text>
              <Text variant="titleMedium" style={styles.jobText}>
                {worker.jobCategory.nameEn || worker.jobCategoryNameEn}
              </Text>
            </AnimatedView>

            {/* Quick stats row */}
            <AnimatedView
              style={styles.quickStats}
              entering={FadeInUp.delay(170).duration(motionTiming.fast)}
            >
              <View style={styles.quickStatItem}>
                <Star color="#8A6410" size={18} fill="#8A6410" />
                <Text style={styles.quickStatValue}>
                  {worker.avgRating > 0 ? worker.avgRating.toFixed(1) : "0.0"}
                </Text>
                <Text style={styles.quickStatLabel}>
                  ({worker.totalReviews})
                </Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.quickStatItem}>
                <Calendar color="#1C3557" size={18} />
                <Text style={styles.quickStatValue}>
                  {worker.experienceYrs}
                </Text>
                <Text style={styles.quickStatLabel}>years</Text>
              </View>
              <View style={styles.dividerVertical} />
              <View style={styles.quickStatItem}>
                <Briefcase color="#2D6A4F" size={18} />
                <Text style={styles.quickStatValue}>{worker.totalHires}</Text>
                <Text style={styles.quickStatLabel}>hires</Text>
              </View>
            </AnimatedView>

            {/* Price */}
            <AnimatedView
              style={styles.priceContainer}
              entering={FadeInUp.delay(210).duration(motionTiming.fast)}
            >
              <Text variant="displaySmall" style={styles.priceText}>
                रु {(worker.dailyRateNpr ?? 0).toLocaleString()}
              </Text>
              <Text style={styles.priceUnit}>/day</Text>
            </AnimatedView>

            {/* Action buttons */}
            <AnimatedView
              style={styles.actionButtons}
              entering={FadeInUp.delay(250).duration(motionTiming.fast)}
            >
              <Button
                mode="contained"
                style={styles.hireButton}
                contentStyle={styles.hireButtonContent}
                labelStyle={styles.hireButtonLabel}
                disabled={!worker.isAvailable}
                onPress={handleHire}
              >
                Hire Now
              </Button>
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
                android_ripple={{ color: "#E8DDD0", radius: 28 }}
              >
                <Phone color="#1C3557" size={22} />
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.iconButton,
                  pressed && styles.iconButtonPressed,
                ]}
                android_ripple={{ color: "#E8DDD0", radius: 28 }}
              >
                <MessageCircle color="#1C3557" size={22} />
              </Pressable>
            </AnimatedView>
          </Card.Content>
        </AnimatedCard>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            value={worker.totalHires}
            label="Total Hires"
            icon={Briefcase}
            color="#A02535"
            delay={290}
          />
          <StatCard
            value={worker.avgRating > 0 ? worker.avgRating.toFixed(1) : "0.0"}
            label="Rating"
            icon={Star}
            color="#8A6410"
            delay={330}
          />
          <StatCard
            value={worker.totalReviews}
            label="Reviews"
            icon={Award}
            color="#2D6A4F"
            delay={370}
          />
        </View>

        {/* About */}
        <AnimatedCard
          style={styles.sectionCard}
          entering={FadeInDown.delay(410).duration(motionTiming.fast)}
          layout={Layout.springify().damping(18).stiffness(170)}
        >
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              About
            </Text>
            <Text variant="bodyMedium" style={styles.aboutText}>
              {worker.about || "Experienced local worker available for hire."}
            </Text>
          </Card.Content>
        </AnimatedCard>

        {/* Skills */}
        <AnimatedCard
          style={styles.sectionCard}
          entering={FadeInDown.delay(450).duration(motionTiming.fast)}
          layout={Layout.springify().damping(18).stiffness(170)}
        >
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Skills
            </Text>
            <View style={styles.skillsContainer}>
              {skills.map((skill, index) => (
                <AnimatedView
                  key={skill}
                  entering={SlideInRight.delay(480 + index * 30).duration(
                    motionTiming.fast,
                  )}
                >
                  <Chip mode="outlined" style={styles.skillChip}>
                    {skill}
                  </Chip>
                </AnimatedView>
              ))}
            </View>
          </Card.Content>
        </AnimatedCard>

        {/* Location */}
        <AnimatedCard
          style={styles.sectionCard}
          entering={FadeInDown.delay(520).duration(motionTiming.fast)}
          layout={Layout.springify().damping(18).stiffness(170)}
        >
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Location
            </Text>
            <View style={styles.locationInfo}>
              <View style={styles.locationIconContainer}>
                <MapPin color="#A02535" size={24} />
              </View>
              <View style={styles.locationTextContainer}>
                <Text variant="bodyLarge" style={styles.locationPrimary}>
                  {worker.localUnitNameEn}, Ward {worker.wardNo}
                </Text>
                <Text variant="bodyMedium" style={styles.locationSecondary}>
                  {worker.districtNameEn || worker.district.nameEn},{" "}
                  {worker.province.nameEn}
                </Text>
              </View>
            </View>
          </Card.Content>
        </AnimatedCard>
      </ScrollView>

      {/* Hire Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={["45%"]}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <BottomSheetView style={styles.bottomSheetContent}>
          <Text variant="headlineSmall" style={styles.sheetTitle}>
            Confirm Hire
          </Text>
          <Divider style={styles.sheetDivider} />

          <View style={styles.sheetWorkerInfo}>
            <View style={styles.sheetAvatar}>
              <Text style={styles.sheetAvatarIcon}>
                {worker.jobCategory.icon || "👤"}
              </Text>
            </View>
            <View style={styles.sheetWorkerText}>
              <Text variant="titleMedium" style={styles.sheetWorkerName}>
                {worker.fullName}
              </Text>
              <Text variant="bodyMedium" style={styles.sheetJobText}>
                {worker.jobCategory.nameEn || worker.jobCategoryNameEn}
              </Text>
            </View>
          </View>

          <View style={styles.sheetPriceRow}>
            <Text variant="bodyLarge" style={styles.sheetPriceLabel}>
              Daily Rate
            </Text>
            <Text variant="headlineMedium" style={styles.sheetPriceValue}>
              रु {(worker.dailyRateNpr ?? 0).toLocaleString()}
            </Text>
          </View>

          <Text variant="bodySmall" style={styles.sheetNote}>
            By confirming, you agree to our terms of service. The worker will be
            notified of your hire request.
          </Text>

          <View style={styles.sheetActions}>
            <Button
              mode="outlined"
              onPress={handleCloseSheet}
              style={styles.sheetCancelButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirmHire}
              style={styles.sheetConfirmButton}
            >
              Confirm Hire
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF7F0" },
  content: { padding: 16, paddingBottom: 40 },
  stateContainer: {
    flex: 1,
    backgroundColor: "#FAF7F0",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 12,
  },
  stateTitle: {
    color: "#1C3557",
    fontWeight: "700",
    textAlign: "center",
  },

  // Profile Card
  profileCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 16,
    borderRadius: 20,
    elevation: 3,
  },
  profileContent: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  avatarContainer: { alignItems: "center", marginBottom: 16 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F0EBE1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarIcon: { fontSize: 52 },
  availableChip: { backgroundColor: "#dcfce7" },
  availableText: { color: "#166534", fontSize: 12, fontWeight: "600" },
  unavailableChip: { backgroundColor: "#FEF2F2" },
  unavailableText: { color: "#dc2626", fontSize: 12, fontWeight: "600" },

  // Name section
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  workerName: { fontWeight: "700", color: "#1C3557", textAlign: "center" },
  verifiedBadge: {
    backgroundColor: "#16a34a",
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  nepaliName: { color: mutedText, textAlign: "center", marginBottom: 4 },
  jobText: {
    color: "#A02535",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },

  // Quick stats
  quickStats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5EFE3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  quickStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
  },
  quickStatValue: { fontWeight: "700", color: "#1C3557", fontSize: 16 },
  quickStatLabel: { color: mutedText, fontSize: 12 },
  dividerVertical: { width: 1, height: 20, backgroundColor: "#D4C5B0" },

  // Price
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 20,
  },
  priceText: { fontWeight: "700", color: "#A02535" },
  priceUnit: { color: mutedText, marginLeft: 4, fontSize: 16 },

  // Actions
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  hireButton: { flex: 1, backgroundColor: "#A02535", borderRadius: 14 },
  hireButtonContent: { paddingVertical: 8 },
  hireButtonLabel: { fontWeight: "700", fontSize: 16 },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#F5EFE3",
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.96 }],
  },

  // Stats Grid
  statsGrid: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 16 },
  statCardContent: { alignItems: "center", paddingVertical: 16 },
  statCardValue: { fontWeight: "700", marginVertical: 4 },
  statCardLabel: { color: mutedText },

  // Section cards
  sectionCard: {
    backgroundColor: "#FFFFFF",
    marginBottom: 12,
    borderRadius: 16,
  },
  sectionTitle: { fontWeight: "600", color: "#1C3557", marginBottom: 12 },
  aboutText: { color: "#5A5A5A", lineHeight: 24 },

  // Skills
  skillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  skillChip: { backgroundColor: "#FFF8E6", borderColor: "#C9971C" },

  // Location
  locationInfo: { flexDirection: "row", alignItems: "center", gap: 14 },
  locationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF1F2",
    alignItems: "center",
    justifyContent: "center",
  },
  locationTextContainer: { flex: 1 },
  locationPrimary: { color: "#1C3557", fontWeight: "600" },
  locationSecondary: { color: mutedText, marginTop: 2 },

  // Bottom Sheet
  bottomSheetBackground: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetIndicator: { backgroundColor: "#D4C5B0", width: 40 },
  bottomSheetContent: { flex: 1, padding: 24 },
  sheetTitle: { fontWeight: "700", color: "#1C3557", textAlign: "center" },
  sheetDivider: { marginVertical: 16 },
  sheetWorkerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sheetAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0EBE1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  sheetAvatarIcon: { fontSize: 28 },
  sheetWorkerText: { flex: 1 },
  sheetWorkerName: { fontWeight: "600", color: "#1C3557" },
  sheetJobText: { color: mutedText },
  sheetPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5EFE3",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sheetPriceLabel: { color: mutedText },
  sheetPriceValue: { fontWeight: "700", color: "#A02535" },
  sheetNote: { color: mutedText, textAlign: "center", marginBottom: 20 },
  sheetActions: { flexDirection: "row", gap: 12 },
  sheetCancelButton: { flex: 1, borderColor: "#D4C5B0", borderRadius: 12 },
  sheetConfirmButton: { flex: 2, backgroundColor: "#A02535", borderRadius: 12 },
});
