import React, { useEffect } from "react";
import { View, StyleSheet, Pressable, Linking } from "react-native";
import { Card, Text, Button, Avatar, Badge } from "react-native-paper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import { MapPin, Star, Clock, CheckCircle, Phone } from "lucide-react-native";

// Design tokens from AGENTS.md
const colors = {
  crimson: {
    500: "#A02535",
    700: "#7C1D2B",
  },
  gold: {
    500: "#C9971C",
  },
  mountain: {
    500: "#1C3557",
    900: "#0A1520",
  },
  terrain: {
    50: "#FAF7F0",
    500: "#8A7A65",
  },
  success: "#2D6A4F",
  white: "#FFFFFF",
};

// Worker profile interface
export interface WorkerProfile {
  id: string;
  fullName: string;
  fullNameNp?: string;
  jobCategoryNameEn: string;
  jobCategoryNameNp?: string;
  localUnitNameEn: string;
  localUnitNameNp?: string;
  districtNameEn: string;
  districtNameNp?: string;
  avgRating: number;
  totalReviews: number;
  experienceYrs: number;
  totalHires: number;
  dailyRateNpr?: number;
  isAvailable: boolean;
  about?: string;
}

// Component props
export interface WorkerCardProps {
  worker: WorkerProfile;
  onHire?: (workerId: string) => void;
  onCall?: (workerId: string) => void;
  locale?: "en" | "ne";
}

// Localization strings
const strings = {
  en: {
    hire: "Hire",
    available: "Available",
    unavailable: "Unavailable",
    experience: "yrs exp",
    reviews: "reviews",
    hires: "hires",
    perDay: "/day",
    ratePrefix: "Rs.",
  },
  ne: {
    hire: "भर्ना गर्नुहोस्",
    available: "उपलब्ध",
    unavailable: "अनुपलब्ध",
    experience: "वर्ष अनुभव",
    reviews: "समीक्षाहरू",
    hires: "भर्नाहरू",
    perDay: "/दिन",
    ratePrefix: "रु.",
  },
};

// Animated Card wrapper
const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedView = Animated.createAnimatedComponent(View);

// Pulsing badge component for availability
const PulsingBadge: React.FC<{ isAvailable: boolean; label: string }> = ({
  isAvailable,
  label,
}) => {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isAvailable) {
      // Pulse animation for available workers
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        ),
        -1, // Infinite repeat
        false,
      );
    } else {
      scale.value = 1;
    }
  }, [isAvailable, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedView style={[styles.badgeContainer, animatedStyle]}>
      <Badge
        size={24}
        style={[
          styles.badge,
          {
            backgroundColor: isAvailable ? colors.success : colors.terrain[500],
          },
        ]}
      >
        {label}
      </Badge>
    </AnimatedView>
  );
};

// Main WorkerCard component
export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  onHire,
  onCall,
  locale = "en",
}) => {
  const t = strings[locale];

  // Animation values
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);

  // Entrance animation
  useEffect(() => {
    cardOpacity.value = withDelay(
      100,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
    );
  }, [cardOpacity]);

  // Press animation handlers
  const handlePressIn = () => {
    cardScale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 400,
    });
  };

  const handlePressOut = () => {
    cardScale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
  };

  // Animated card style
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  // Get localized text
  const getName = () =>
    locale === "ne" && worker.fullNameNp ? worker.fullNameNp : worker.fullName;

  const getJobCategory = () =>
    locale === "ne" && worker.jobCategoryNameNp
      ? worker.jobCategoryNameNp
      : worker.jobCategoryNameEn;

  const getLocation = () => {
    const localUnit =
      locale === "ne" && worker.localUnitNameNp
        ? worker.localUnitNameNp
        : worker.localUnitNameEn;
    const district =
      locale === "ne" && worker.districtNameNp
        ? worker.districtNameNp
        : worker.districtNameEn;
    return `${localUnit}, ${district}`;
  };

  // Handle hire button press
  const handleHire = () => {
    onHire?.(worker.id);
  };

  // Handle call button press
  const handleCall = () => {
    onCall?.(worker.id);
  };

  // Format daily rate
  const formatRate = (rate?: number) => {
    if (!rate) return null;
    return `${t.ratePrefix} ${rate.toLocaleString()}${t.perDay}`;
  };

  // Get initials for avatar
  const getInitials = () => {
    const name = worker.fullName.trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const second = parts[1]?.[0] ?? "";

    if (first && second) {
      return `${first}${second}`.toUpperCase();
    }

    return name.substring(0, 2).toUpperCase();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <AnimatedCard
        style={[styles.card, animatedCardStyle]}
        mode="elevated"
        elevation={2}
        entering={FadeIn.duration(400).delay(100)}
      >
        <Card.Content style={styles.content}>
          {/* Header: Avatar, Name, Job Category, Availability Badge */}
          <View style={styles.header}>
            <Avatar.Text
              size={56}
              label={getInitials()}
              style={styles.avatar}
              labelStyle={styles.avatarLabel}
            />
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text
                  variant="titleMedium"
                  style={styles.name}
                  numberOfLines={1}
                >
                  {getName()}
                </Text>
                <PulsingBadge
                  isAvailable={worker.isAvailable}
                  label={worker.isAvailable ? t.available : t.unavailable}
                />
              </View>
              <Text variant="bodyMedium" style={styles.jobCategory}>
                {getJobCategory()}
              </Text>
              <View style={styles.locationRow}>
                <MapPin size={14} color={colors.terrain[500]} />
                <Text
                  variant="bodySmall"
                  style={styles.location}
                  numberOfLines={1}
                >
                  {getLocation()}
                </Text>
              </View>
            </View>
          </View>

          {/* Stats Row: Rating, Experience, Hires */}
          <View style={styles.statsRow}>
            {/* Rating */}
            <View style={styles.statItem}>
              <Star
                size={16}
                color={colors.gold[500]}
                fill={colors.gold[500]}
              />
              <Text variant="bodyMedium" style={styles.statValue}>
                {worker.avgRating.toFixed(1)}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                ({worker.totalReviews} {t.reviews})
              </Text>
            </View>

            {/* Experience */}
            <View style={styles.statItem}>
              <Clock size={16} color={colors.mountain[500]} />
              <Text variant="bodyMedium" style={styles.statValue}>
                {worker.experienceYrs}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                {t.experience}
              </Text>
            </View>

            {/* Total Hires */}
            <View style={styles.statItem}>
              <CheckCircle size={16} color={colors.success} />
              <Text variant="bodyMedium" style={styles.statValue}>
                {worker.totalHires}
              </Text>
              <Text variant="bodySmall" style={styles.statLabel}>
                {t.hires}
              </Text>
            </View>
          </View>

          {/* Daily Rate */}
          {worker.dailyRateNpr && (
            <View style={styles.rateContainer}>
              <Text variant="titleMedium" style={styles.rate}>
                {formatRate(worker.dailyRateNpr)}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              mode="contained"
              onPress={handleHire}
              disabled={!worker.isAvailable}
              style={[
                styles.hireButton,
                !worker.isAvailable && styles.hireButtonDisabled,
              ]}
              buttonColor={colors.crimson[500]}
              textColor={colors.white}
              contentStyle={styles.hireButtonContent}
              labelStyle={styles.hireButtonLabel}
            >
              {t.hire}
            </Button>
            <Button
              mode="outlined"
              onPress={handleCall}
              style={styles.callButton}
              textColor={colors.mountain[500]}
              contentStyle={styles.callButtonContent}
              icon={({ size, color }) => (
                <Phone size={size - 4} color={color} />
              )}
            >
              {""}
            </Button>
          </View>
        </Card.Content>
      </AnimatedCard>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  content: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  avatar: {
    backgroundColor: colors.crimson[700],
  },
  avatarLabel: {
    color: colors.white,
    fontWeight: "600",
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  name: {
    fontWeight: "600",
    color: colors.mountain[900],
    flex: 1,
    marginRight: 8,
  },
  jobCategory: {
    color: colors.crimson[500],
    fontWeight: "500",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  location: {
    color: colors.terrain[500],
    flex: 1,
  },
  badgeContainer: {
    alignSelf: "flex-start",
  },
  badge: {
    paddingHorizontal: 8,
    fontSize: 10,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    marginBottom: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.terrain[50],
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontWeight: "600",
    color: colors.mountain[900],
  },
  statLabel: {
    color: colors.terrain[500],
  },
  rateContainer: {
    marginBottom: 16,
    alignItems: "center",
  },
  rate: {
    color: colors.success,
    fontWeight: "700",
    fontSize: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  hireButton: {
    flex: 1,
    borderRadius: 12,
  },
  hireButtonDisabled: {
    opacity: 0.5,
  },
  hireButtonContent: {
    paddingVertical: 6,
  },
  hireButtonLabel: {
    fontWeight: "600",
    fontSize: 16,
  },
  callButton: {
    borderRadius: 12,
    borderColor: colors.mountain[500],
    minWidth: 56,
  },
  callButtonContent: {
    paddingVertical: 6,
  },
});

export default WorkerCard;
