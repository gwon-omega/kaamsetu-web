import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ImageBackground,
} from "react-native";
import { Text, Card, Button, Chip } from "react-native-paper";
import { Link } from "expo-router";
import {
  provinces,
  jobCategories,
  provinceVisuals,
  provinceVisualsById,
} from "@shram-sewa/shared/constants";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Users, MapPin, Building2, Briefcase } from "lucide-react-native";

const motionTiming = {
  fast: 180,
  standard: 240,
  stagger: 32,
};

const mutedText = "#6D5E4A";

// Animated components
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Stats data with icons
const statsData = [
  { value: "7", label: "Provinces", icon: MapPin, color: "#A02535" },
  { value: "77", label: "Districts", icon: Building2, color: "#8A6410" },
  { value: "753", label: "Local Units", icon: Users, color: "#1C3557" },
  { value: "12", label: "Job Types", icon: Briefcase, color: "#2D6A4F" },
];

// Available workers pulse animation
const AvailableCountBadge = () => {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 420, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 420, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedView style={animatedStyle}>
      <Chip
        mode="flat"
        style={styles.availableBadge}
        textStyle={styles.availableBadgeText}
      >
        🟢 240+ Workers Available
      </Chip>
    </AnimatedView>
  );
};

export default function HomeScreen() {
  const fallbackVisual =
    provinceVisuals[0] ??
    ({
      provinceId: 0,
      majorCityEn: "Nepal",
      majorCityNp: "नेपाल",
      imageUrl:
        "https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=1280&h=800&fit=crop",
      imageUrlSmall:
        "https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg?auto=compress&cs=tinysrgb&w=720&h=460&fit=crop",
      credit: "Pexels fallback",
    } as const);

  const heroVisual = provinceVisualsById[3] ?? fallbackVisual;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Section with stagger animation */}
      <AnimatedView
        entering={FadeInDown.delay(30)
          .duration(motionTiming.standard)
          .springify()}
        style={styles.heroWrap}
      >
        <ImageBackground
          source={{ uri: heroVisual.imageUrl }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <Chip
              mode="outlined"
              style={styles.badge}
              textStyle={styles.badgeText}
            >
              753 Local Units
            </Chip>
            <Text variant="displaySmall" style={styles.title}>
              श्रम सेवा
            </Text>
            <Text variant="headlineSmall" style={styles.titleEn}>
              Shram Sewa
            </Text>
            <Text variant="bodyLarge" style={styles.subtitle}>
              Nepal's first local government manpower platform
            </Text>
            <Text variant="labelSmall" style={styles.heroCityTag}>
              Focus city: {heroVisual.majorCityEn}
            </Text>
            <AvailableCountBadge />
            <View style={styles.heroButtons}>
              <Link href="/search" asChild>
                <Button
                  mode="contained"
                  style={styles.primaryButton}
                  contentStyle={styles.primaryButtonContent}
                  labelStyle={styles.primaryButtonLabel}
                  icon="magnify"
                >
                  Find Workers
                </Button>
              </Link>
              <Link href="/login" asChild>
                <Button
                  mode="outlined"
                  style={styles.secondaryButton}
                  textColor="#FFFFFF"
                >
                  Register as Worker
                </Button>
              </Link>
            </View>
          </View>
        </ImageBackground>
      </AnimatedView>

      {/* Stats with stagger */}
      <AnimatedView
        entering={FadeInDown.delay(90).duration(motionTiming.fast)}
        style={styles.statsRow}
      >
        {statsData.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <AnimatedCard
              key={stat.label}
              style={styles.statCard}
              entering={FadeInUp.delay(140 + index * motionTiming.stagger)
                .duration(motionTiming.fast)
                .springify()}
            >
              <Card.Content style={styles.statContent}>
                <IconComponent
                  size={20}
                  color={stat.color}
                  style={styles.statIcon}
                />
                <Text
                  variant="headlineMedium"
                  style={[styles.statValue, { color: stat.color }]}
                >
                  {stat.value}
                </Text>
                <Text variant="labelSmall" style={styles.statLabel}>
                  {stat.label}
                </Text>
              </Card.Content>
            </AnimatedCard>
          );
        })}
      </AnimatedView>

      {/* Provinces with horizontal stagger */}
      <AnimatedView
        entering={FadeInDown.delay(220).duration(motionTiming.fast)}
      >
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Search by Province
        </Text>
      </AnimatedView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.horizontalScroll}
      >
        {provinces.map((province, index) => {
          const provinceVisual =
            provinceVisualsById[province.id] ?? fallbackVisual;

          return (
            <Link
              key={province.id}
              href={`/search?provinceId=${province.id}`}
              asChild
            >
              <AnimatedPressable
                style={styles.provinceCard}
                android_ripple={{
                  color: "rgba(240, 235, 225, 0.25)",
                  radius: 48,
                }}
                entering={FadeInRight.delay(260 + index * motionTiming.stagger)
                  .duration(motionTiming.fast)
                  .springify()}
              >
                <ImageBackground
                  source={{ uri: provinceVisual.imageUrlSmall }}
                  style={styles.provinceMedia}
                  imageStyle={styles.provinceMediaImage}
                >
                  <View style={styles.provinceOverlay} />
                  <View style={styles.provinceContent}>
                    <View
                      style={[
                        styles.provinceIcon,
                        { backgroundColor: province.colorHex },
                      ]}
                    >
                      <Text style={styles.provinceNumber}>{province.id}</Text>
                    </View>
                    <Text
                      variant="labelMedium"
                      style={styles.provinceName}
                      numberOfLines={1}
                    >
                      {province.nameEn}
                    </Text>
                    <Text
                      variant="labelSmall"
                      style={styles.provinceCity}
                      numberOfLines={1}
                    >
                      {provinceVisual.majorCityEn}
                    </Text>
                  </View>
                </ImageBackground>
              </AnimatedPressable>
            </Link>
          );
        })}
      </ScrollView>

      {/* Job Categories with grid stagger */}
      <AnimatedView
        entering={FadeInDown.delay(340).duration(motionTiming.fast)}
      >
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Job Categories
        </Text>
      </AnimatedView>
      <View style={styles.categoryGrid}>
        {jobCategories.slice(0, 8).map((job, index) => (
          <Link key={job.slug} href={`/search?jobCategory=${job.slug}`} asChild>
            <AnimatedPressable
              style={styles.categoryCard}
              android_ripple={{ color: "#F0EBE1", radius: 34 }}
              entering={FadeInUp.delay(400 + index * 36)
                .duration(motionTiming.fast)
                .springify()}
            >
              <Text style={styles.categoryIcon}>{job.icon}</Text>
              <Text
                variant="labelMedium"
                style={styles.categoryText}
                numberOfLines={1}
              >
                {job.nameEn}
              </Text>
            </AnimatedPressable>
          </Link>
        ))}
      </View>

      {/* How it works */}
      <AnimatedCard
        style={styles.howItWorks}
        entering={FadeInDown.delay(520)
          .duration(motionTiming.standard)
          .springify()}
      >
        <Card.Content>
          <Text variant="titleMedium" style={styles.howTitle}>
            How It Works
          </Text>
          <View style={styles.steps}>
            {[
              {
                step: "1",
                title: "Search",
                desc: "Select location & job type",
                emoji: "🔍",
              },
              {
                step: "2",
                title: "Choose",
                desc: "Browse available workers",
                emoji: "👥",
              },
              {
                step: "3",
                title: "Hire",
                desc: "One-click hiring",
                emoji: "✅",
              },
            ].map((item, index) => (
              <AnimatedView
                key={item.step}
                style={styles.stepItem}
                entering={FadeInUp.delay(580 + index * 42).duration(
                  motionTiming.fast,
                )}
              >
                <View style={styles.stepCircle}>
                  <Text style={styles.stepEmoji}>{item.emoji}</Text>
                </View>
                <Text variant="labelLarge" style={styles.stepTitle}>
                  {item.title}
                </Text>
                <Text variant="bodySmall" style={styles.stepDesc}>
                  {item.desc}
                </Text>
              </AnimatedView>
            ))}
          </View>
        </Card.Content>
      </AnimatedCard>

      {/* Quick hire banner */}
      <AnimatedCard
        style={styles.quickHireBanner}
        entering={FadeInDown.delay(700)
          .duration(motionTiming.standard)
          .springify()}
      >
        <Card.Content style={styles.quickHireContent}>
          <View style={styles.quickHireText}>
            <Text variant="titleMedium" style={styles.quickHireTitle}>
              Need a worker today?
            </Text>
            <Text variant="bodySmall" style={styles.quickHireDesc}>
              Browse instantly available workers in your area
            </Text>
          </View>
          <Link href="/search?available=true" asChild>
            <Button
              mode="contained"
              style={styles.quickHireButton}
              labelStyle={styles.quickHireButtonLabel}
            >
              Quick Hire
            </Button>
          </Link>
        </Card.Content>
      </AnimatedCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF7F0" },
  content: { padding: 16, paddingBottom: 32 },
  heroWrap: { borderRadius: 22, overflow: "hidden" },
  hero: { minHeight: 318, justifyContent: "center" },
  heroImage: { borderRadius: 22 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 21, 32, 0.58)",
  },
  heroContent: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  badge: {
    marginBottom: 16,
    backgroundColor: "rgba(250, 247, 240, 0.9)",
    borderColor: "rgba(201, 151, 28, 0.9)",
  },
  badgeText: { color: "#1C3557", fontWeight: "700" },
  title: {
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: 1,
  },
  titleEn: { fontWeight: "500", color: "#F5EFE3", marginBottom: 8 },
  subtitle: {
    color: "#E8DDD0",
    textAlign: "center",
    marginBottom: 8,
    maxWidth: 290,
  },
  heroCityTag: { color: "#C8D6E5", marginBottom: 14 },
  availableBadge: { backgroundColor: "#dcfce7", marginBottom: 20 },
  availableBadgeText: { color: "#166534", fontWeight: "600" },
  heroButtons: {
    flexDirection: "column",
    gap: 12,
    width: "100%",
    paddingHorizontal: 20,
  },
  primaryButton: { backgroundColor: "#A02535", borderRadius: 12 },
  primaryButtonContent: { paddingVertical: 8 },
  primaryButtonLabel: { fontWeight: "700", fontSize: 16 },
  secondaryButton: {
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  statsRow: { flexDirection: "row", gap: 8, marginVertical: 24 },
  statCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12 },
  statContent: { alignItems: "center", paddingVertical: 16 },
  statIcon: { marginBottom: 4 },
  statValue: { fontWeight: "700" },
  statLabel: { color: mutedText, marginTop: 2 },
  sectionTitle: {
    fontWeight: "600",
    color: "#1C3557",
    marginTop: 8,
    marginBottom: 16,
  },
  horizontalScroll: { marginBottom: 24 },
  provinceCard: {
    width: 126,
    height: 134,
    marginRight: 12,
    borderRadius: 16,
    overflow: "hidden",
  },
  provinceMedia: {
    flex: 1,
  },
  provinceMediaImage: {
    borderRadius: 16,
  },
  provinceOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 21, 32, 0.38)",
  },
  provinceContent: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  provinceIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  provinceNumber: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  provinceName: {
    color: "#FFFFFF",
    textAlign: "left",
    fontSize: 12,
    fontWeight: "700",
  },
  provinceCity: {
    color: "#E8DDD0",
    textAlign: "left",
  },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryCard: {
    width: "23%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: { fontSize: 28, marginBottom: 8 },
  categoryText: { color: "#1C3557", textAlign: "center" },
  howItWorks: {
    marginTop: 32,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
  },
  howTitle: {
    fontWeight: "600",
    color: "#1C3557",
    marginBottom: 20,
    textAlign: "center",
  },
  steps: { flexDirection: "row", justifyContent: "space-around" },
  stepItem: { alignItems: "center", flex: 1 },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF1F2",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  stepEmoji: { fontSize: 22 },
  stepTitle: { color: "#1C3557", fontWeight: "600", marginBottom: 4 },
  stepDesc: { color: mutedText, textAlign: "center", marginTop: 2 },
  quickHireBanner: {
    backgroundColor: "#1C3557",
    borderRadius: 16,
    marginBottom: 16,
  },
  quickHireContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickHireText: { flex: 1, marginRight: 16 },
  quickHireTitle: { color: "#FFFFFF", fontWeight: "600" },
  quickHireDesc: { color: "#C8D6E5", marginTop: 2 },
  quickHireButton: { backgroundColor: "#C9971C", borderRadius: 12 },
  quickHireButtonLabel: { color: "#0A1520", fontWeight: "700" },
});
