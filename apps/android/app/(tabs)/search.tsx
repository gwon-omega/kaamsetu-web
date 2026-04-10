import { useState, useCallback, useMemo } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import {
  Text,
  Searchbar,
  Card,
  Chip,
  Button,
  Menu,
  Divider,
} from "react-native-paper";
import { Link, useLocalSearchParams } from "expo-router";
import { Star, ChevronDown, Filter, X, MapPin } from "lucide-react-native";
import { provinces, districts } from "@shram-sewa/shared/constants";
import type { WorkerDisplay } from "@shram-sewa/shared";
import type { WorkerFilters } from "@shram-sewa/shared/api";
import Animated, {
  FadeInDown,
  FadeIn,
  FadeOut,
  Layout,
} from "react-native-reanimated";
import { isSupabaseConfigured } from "../../src/lib";
import {
  useJobCategories,
  useLocalUnitsByDistrict,
  useWorkersSearch,
} from "../../src/hooks";

const mutedText = "#6D5E4A";

type JobCategoryRow = {
  id: number;
  slug: string;
  name_en: string;
  icon: string | null;
};

type LocalUnitRow = {
  id: number;
  district_id: number;
  name_en: string;
};

interface FilterState {
  provinceId: number | null;
  districtId: number | null;
  localUnitId: number | null;
  jobCategory: string | null;
  availableOnly: boolean;
}

// Loading skeleton component
const SkeletonCard = () => (
  <Card style={styles.workerCard}>
    <Card.Content style={styles.workerContent}>
      <View style={[styles.avatar, styles.skeletonAvatar]} />
      <View style={styles.workerInfo}>
        <View
          style={[
            styles.skeletonLine,
            { width: "70%", height: 16, marginBottom: 8 },
          ]}
        />
        <View
          style={[
            styles.skeletonLine,
            { width: "50%", height: 12, marginBottom: 8 },
          ]}
        />
        <View style={[styles.skeletonLine, { width: "80%", height: 12 }]} />
      </View>
    </Card.Content>
  </Card>
);

const LoadingSkeleton = () => (
  <View style={styles.skeletonContainer}>
    {[1, 2, 3, 4].map((i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);

// Filter dropdown component
interface FilterDropdownProps {
  label: string;
  value: string | null;
  options: { id: number | string; name: string }[];
  onSelect: (id: number | string | null) => void;
  disabled?: boolean;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  disabled = false,
}) => {
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find((o) => String(o.id) === String(value));

  return (
    <Menu
      visible={visible}
      onDismiss={() => setVisible(false)}
      anchor={
        <Pressable
          onPress={() => !disabled && setVisible(true)}
          style={({ pressed }) => [
            styles.filterDropdown,
            disabled && styles.filterDropdownDisabled,
            pressed && !disabled && styles.filterDropdownPressed,
          ]}
        >
          <Text
            style={[
              styles.filterDropdownText,
              !selectedOption && styles.filterDropdownPlaceholder,
            ]}
            numberOfLines={1}
          >
            {selectedOption?.name || label}
          </Text>
          <ChevronDown size={16} color={disabled ? "#D4C5B0" : mutedText} />
        </Pressable>
      }
      contentStyle={styles.menuContent}
    >
      <Menu.Item
        onPress={() => {
          onSelect(null);
          setVisible(false);
        }}
        title={`All ${label}`}
        leadingIcon={value ? undefined : "check"}
      />
      <Divider />
      {options.slice(0, 20).map((option) => (
        <Menu.Item
          key={option.id}
          onPress={() => {
            onSelect(option.id);
            setVisible(false);
          }}
          title={option.name}
          leadingIcon={
            String(option.id) === String(value) ? "check" : undefined
          }
        />
      ))}
    </Menu>
  );
};

// Animated components
const AnimatedCard = Animated.createAnimatedComponent(Card);
const AnimatedView = Animated.createAnimatedComponent(View);

export default function SearchScreen() {
  const params = useLocalSearchParams<{
    provinceId?: string;
    jobCategory?: string;
    available?: string;
  }>();

  const backendReady = isSupabaseConfigured();

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    provinceId: params.provinceId ? Number(params.provinceId) : null,
    districtId: null,
    localUnitId: null,
    jobCategory: params.jobCategory || null,
    availableOnly: params.available === "true",
  });
  const [showFilters, setShowFilters] = useState(false);

  const jobCategoriesQuery = useJobCategories(backendReady);
  const jobCategoryRows = (jobCategoriesQuery.data ?? []) as JobCategoryRow[];

  const selectedJobCategory = useMemo(
    () =>
      filters.jobCategory
        ? (jobCategoryRows.find((row) => row.slug === filters.jobCategory) ??
          null)
        : null,
    [filters.jobCategory, jobCategoryRows],
  );

  const searchFilters = useMemo<WorkerFilters>(
    () => ({
      provinceId: filters.provinceId ?? undefined,
      districtId: filters.districtId ?? undefined,
      localUnitId: filters.localUnitId ?? undefined,
      jobCategoryId: selectedJobCategory?.id,
      isAvailable: filters.availableOnly ? true : undefined,
    }),
    [
      filters.provinceId,
      filters.districtId,
      filters.localUnitId,
      filters.availableOnly,
      selectedJobCategory?.id,
    ],
  );

  const workersQuery = useWorkersSearch(searchFilters, 1, 100, backendReady);
  const localUnitsQuery = useLocalUnitsByDistrict(
    filters.districtId,
    backendReady,
  );

  // Filter options
  const provinceOptions = useMemo(
    () => provinces.map((p) => ({ id: p.id, name: p.nameEn })),
    [],
  );

  const districtOptions = useMemo(() => {
    if (!filters.provinceId) return [];
    return districts
      .filter((d) => d.provinceId === filters.provinceId)
      .map((d) => ({ id: d.id, name: d.nameEn }));
  }, [filters.provinceId]);

  const localUnitOptions = useMemo(
    () =>
      ((localUnitsQuery.data ?? []) as LocalUnitRow[]).map((localUnit) => ({
        id: localUnit.id,
        name: localUnit.name_en,
      })),
    [localUnitsQuery.data],
  );

  const jobOptions = useMemo(
    () =>
      jobCategoryRows.map((job) => ({
        id: job.slug,
        name: job.name_en,
      })),
    [jobCategoryRows],
  );

  const quickJobChips = useMemo(
    () => [
      { slug: null, nameEn: "All", icon: "🔍" },
      ...jobCategoryRows.slice(0, 6).map((job) => ({
        slug: job.slug,
        nameEn: job.name_en,
        icon: job.icon ?? "🛠️",
      })),
    ],
    [jobCategoryRows],
  );

  // Filtered workers
  const filteredWorkers = useMemo(() => {
    const workers = workersQuery.data?.data ?? [];
    if (!searchQuery.trim()) {
      return workers;
    }

    const query = searchQuery.trim().toLowerCase();
    return workers.filter((worker) => {
      const englishName = worker.fullName.toLowerCase();
      const nepaliName = worker.fullNameNp?.toLowerCase() ?? "";
      return englishName.includes(query) || nepaliName.includes(query);
    });
  }, [workersQuery.data?.data, searchQuery]);

  const handleRefresh = useCallback(async () => {
    await workersQuery.refetch();
  }, [workersQuery]);

  const clearFilters = () => {
    setFilters({
      provinceId: null,
      districtId: null,
      localUnitId: null,
      jobCategory: null,
      availableOnly: false,
    });
  };

  const activeFilterCount =
    (filters.provinceId ? 1 : 0) +
    (filters.districtId ? 1 : 0) +
    (filters.localUnitId ? 1 : 0) +
    (filters.jobCategory ? 1 : 0) +
    (filters.availableOnly ? 1 : 0);

  const renderWorker = ({
    item,
    index,
  }: {
    item: WorkerDisplay;
    index: number;
  }) => {
    const provinceName =
      item.province.nameEn ||
      provinces.find((province) => province.id === item.provinceId)?.nameEn ||
      "Nepal";

    return (
      <Link href={`/worker/${item.id}`} asChild>
        <Pressable
          style={({ pressed }) => [pressed && styles.workerCardPressed]}
          android_ripple={{ color: "#F0EBE1" }}
        >
          <AnimatedCard
            style={styles.workerCard}
            entering={FadeInDown.delay(index * 28)
              .duration(200)
              .springify()}
            layout={Layout.springify().damping(18).stiffness(170)}
          >
            <Card.Content style={styles.workerContent}>
              <View style={styles.avatar}>
                <Text style={styles.avatarIcon}>
                  {item.jobCategory.icon || "👤"}
                </Text>
              </View>
              <View style={styles.workerInfo}>
                <View style={styles.nameRow}>
                  <Text variant="titleMedium" style={styles.workerName}>
                    {item.fullName}
                  </Text>
                  {item.isAvailable ? (
                    <View style={styles.availableDot} />
                  ) : (
                    <View style={styles.busyDot} />
                  )}
                </View>
                <View style={styles.locationRow}>
                  <MapPin size={12} color={mutedText} />
                  <Text variant="bodySmall" style={styles.locationText}>
                    {provinceName}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.jobText}>
                  {item.jobCategory.nameEn ||
                    item.jobCategoryNameEn ||
                    "Worker"}
                </Text>
                <View style={styles.statsRow}>
                  <View style={styles.ratingContainer}>
                    <Star color="#C9971C" size={14} fill="#C9971C" />
                    <Text style={styles.ratingText}>
                      {item.avgRating > 0 ? item.avgRating.toFixed(1) : "0.0"}
                    </Text>
                  </View>
                  <Text style={styles.hiresText}>{item.totalHires} hires</Text>
                  <Text style={styles.rateText}>
                    रु {(item.dailyRateNpr ?? 0).toLocaleString()}/day
                  </Text>
                </View>
              </View>
            </Card.Content>
          </AnimatedCard>
        </Pressable>
      </Link>
    );
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search workers by name..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
        />
        <Pressable
          onPress={() => setShowFilters(!showFilters)}
          style={({ pressed }) => [
            styles.filterButton,
            activeFilterCount > 0 && styles.filterButtonActive,
            pressed && styles.filterButtonPressed,
          ]}
        >
          <Filter
            size={20}
            color={activeFilterCount > 0 ? "#FFFFFF" : "#1C3557"}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {!backendReady ? (
        <View style={styles.backendWarning}>
          <Text style={styles.backendWarningText}>
            Enable Supabase to load worker data.
          </Text>
        </View>
      ) : null}

      {/* Filter dropdowns */}
      {showFilters && (
        <AnimatedView
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(160)}
          style={styles.filtersContainer}
        >
          <View style={styles.filterRow}>
            <FilterDropdown
              label="Province"
              value={filters.provinceId ? String(filters.provinceId) : null}
              options={provinceOptions}
              onSelect={(id) =>
                setFilters((f) => ({
                  ...f,
                  provinceId: id ? Number(id) : null,
                  districtId: null,
                  localUnitId: null,
                }))
              }
            />
            <FilterDropdown
              label="District"
              value={filters.districtId ? String(filters.districtId) : null}
              options={districtOptions}
              onSelect={(id) =>
                setFilters((f) => ({
                  ...f,
                  districtId: id ? Number(id) : null,
                  localUnitId: null,
                }))
              }
              disabled={!filters.provinceId}
            />
          </View>
          <View style={styles.filterRow}>
            <FilterDropdown
              label="Local Unit"
              value={filters.localUnitId ? String(filters.localUnitId) : null}
              options={localUnitOptions}
              onSelect={(id) =>
                setFilters((f) => ({
                  ...f,
                  localUnitId: id ? Number(id) : null,
                }))
              }
              disabled={!filters.districtId}
            />
            <FilterDropdown
              label="Job Category"
              value={filters.jobCategory}
              options={jobOptions}
              onSelect={(id) =>
                setFilters((f) => ({
                  ...f,
                  jobCategory: id ? String(id) : null,
                }))
              }
            />
          </View>
          <View style={styles.filterActions}>
            <Chip
              mode={filters.availableOnly ? "flat" : "outlined"}
              selected={filters.availableOnly}
              onPress={() =>
                setFilters((f) => ({ ...f, availableOnly: !f.availableOnly }))
              }
              style={
                filters.availableOnly
                  ? styles.availableChipActive
                  : styles.availableChip
              }
            >
              🟢 Available Only
            </Chip>
            {activeFilterCount > 0 && (
              <Button
                mode="text"
                onPress={clearFilters}
                icon={({ size, color }) => <X size={size} color={color} />}
                textColor="#A02535"
              >
                Clear All
              </Button>
            )}
          </View>
        </AnimatedView>
      )}

      {/* Job filter chips (quick access) */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={quickJobChips}
        keyExtractor={(item) => item.slug || "all"}
        contentContainerStyle={styles.chipContainer}
        renderItem={({ item }) => (
          <Chip
            mode={filters.jobCategory === item.slug ? "flat" : "outlined"}
            selected={filters.jobCategory === item.slug}
            onPress={() =>
              setFilters((f) => ({ ...f, jobCategory: item.slug }))
            }
            style={[
              styles.chip,
              filters.jobCategory === item.slug && styles.chipActive,
            ]}
            textStyle={
              filters.jobCategory === item.slug
                ? styles.chipTextActive
                : undefined
            }
          >
            {item.icon} {item.nameEn}
          </Chip>
        )}
      />

      {/* Results count */}
      <View style={styles.resultsHeader}>
        <Text variant="labelLarge" style={styles.resultCount}>
          {filteredWorkers.length} workers found
        </Text>
        {filters.availableOnly && (
          <Chip mode="flat" style={styles.availableFilterChip} compact>
            Available
          </Chip>
        )}
      </View>

      {/* Results list */}
      {workersQuery.isLoading && !workersQuery.data ? (
        <LoadingSkeleton />
      ) : workersQuery.isError ? (
        <View style={styles.errorContainer}>
          <Text variant="titleMedium" style={styles.errorTitle}>
            Unable to load workers
          </Text>
          <Text style={styles.errorText}>
            {workersQuery.error instanceof Error
              ? workersQuery.error.message
              : "Please try again."}
          </Text>
          <Button mode="contained" onPress={() => workersQuery.refetch()}>
            Retry
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredWorkers}
          keyExtractor={(item) => item.id}
          renderItem={renderWorker}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={workersQuery.isRefetching}
              onRefresh={handleRefresh}
              colors={["#A02535"]}
              tintColor="#A02535"
            />
          }
          ListEmptyComponent={
            <AnimatedView
              entering={FadeIn.delay(120).duration(220)}
              style={styles.emptyContainer}
            >
              {workersQuery.isFetching ? (
                <ActivityIndicator color="#A02535" />
              ) : (
                <>
                  <Text style={styles.emptyIcon}>🔍</Text>
                  <Text variant="titleMedium" style={styles.emptyTitle}>
                    No workers found
                  </Text>
                  <Text variant="bodyMedium" style={styles.emptyText}>
                    Try adjusting your filters or search query
                  </Text>
                  <Button
                    mode="outlined"
                    onPress={clearFilters}
                    style={styles.clearButton}
                  >
                    Clear all filters
                  </Button>
                </>
              )}
            </AnimatedView>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF7F0" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  searchbar: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    elevation: 2,
  },
  searchInput: { fontSize: 15 },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  filterButtonActive: {
    backgroundColor: "#A02535",
  },
  filterButtonPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.96,
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#8A6410",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { color: "#FFFFFF", fontSize: 10, fontWeight: "700" },
  backendWarning: {
    backgroundColor: "#FFF8E6",
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E8DDD0",
  },
  backendWarningText: {
    color: "#8A6410",
    fontWeight: "600",
    textAlign: "center",
  },
  filtersContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  filterRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  filterDropdown: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F5EFE3",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E8DDD0",
  },
  filterDropdownDisabled: {
    opacity: 0.5,
  },
  filterDropdownPressed: {
    transform: [{ scale: 0.99 }],
  },
  filterDropdownText: {
    flex: 1,
    fontSize: 13,
    color: "#1C3557",
  },
  filterDropdownPlaceholder: {
    color: mutedText,
  },
  menuContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    maxHeight: 300,
  },
  filterActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  availableChip: {
    backgroundColor: "transparent",
    borderColor: "#2D6A4F",
  },
  availableChipActive: {
    backgroundColor: "#dcfce7",
  },
  chipContainer: { paddingHorizontal: 16, paddingBottom: 8, gap: 8 },
  chip: {
    marginRight: 8,
    backgroundColor: "#FFFFFF",
    borderColor: "#E8DDD0",
  },
  chipActive: {
    backgroundColor: "#A02535",
    borderColor: "#A02535",
  },
  chipTextActive: {
    color: "#FFFFFF",
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  resultCount: { color: "#1C3557", fontWeight: "600" },
  availableFilterChip: { backgroundColor: "#dcfce7" },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  workerCard: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    elevation: 2,
  },
  workerCardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.992 }],
  },
  workerContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0EBE1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarIcon: { fontSize: 30 },
  workerInfo: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  workerName: { fontWeight: "600", color: "#1C3557" },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#16a34a",
    shadowColor: "#16a34a",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  busyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#dc2626",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
    marginBottom: 2,
  },
  locationText: { color: mutedText, fontSize: 11 },
  jobText: { color: "#A02535", marginTop: 2, fontWeight: "500" },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  ratingContainer: { flexDirection: "row", alignItems: "center", gap: 4 },
  ratingText: { fontSize: 13, fontWeight: "600", color: "#8A6410" },
  hiresText: { fontSize: 12, color: mutedText },
  rateText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1C3557",
    marginLeft: "auto",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyIcon: { fontSize: 64, marginBottom: 8 },
  emptyTitle: { color: "#1C3557", fontWeight: "600" },
  emptyText: { color: mutedText, textAlign: "center" },
  clearButton: { marginTop: 8, borderColor: "#A02535" },
  errorContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    gap: 8,
  },
  errorTitle: {
    color: "#991B1B",
    fontWeight: "700",
  },
  errorText: {
    color: mutedText,
    textAlign: "center",
    marginBottom: 8,
  },
  skeletonContainer: { paddingHorizontal: 16 },
  skeletonAvatar: { backgroundColor: "#E8DDD0" },
  skeletonLine: {
    backgroundColor: "#E8DDD0",
    borderRadius: 4,
  },
});
