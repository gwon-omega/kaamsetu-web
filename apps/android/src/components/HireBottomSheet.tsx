import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View, StyleSheet, Keyboard, Platform } from "react-native";
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import {
  TextInput,
  Button,
  Text,
  Avatar,
  IconButton,
} from "react-native-paper";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeInDown,
  FadeInUp,
  Easing,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import {
  Calendar,
  FileText,
  Clock,
  X,
  Wallet,
  AlertCircle,
} from "lucide-react-native";

// Design tokens from AGENTS.md
const colors = {
  crimson: {
    50: "#FFF1F2",
    500: "#A02535",
    700: "#7C1D2B",
  },
  gold: {
    500: "#C9971C",
  },
  mountain: {
    900: "#0A1520",
  },
  terrain: {
    50: "#FAF7F0",
    300: "#D4C5B0",
    500: "#8A7A65",
  },
  success: "#2D6A4F",
  error: "#991B1B",
  white: "#FFFFFF",
};

// Worker data interface for the bottom sheet
export interface HireWorkerData {
  id: string;
  name: string;
  nameNp?: string;
  jobCategory: string;
  jobCategoryNp?: string;
  dailyRate?: number;
  avatarUrl?: string;
}

// Hire form data interface
export interface HireFormData {
  workDescription: string;
  workDate: string;
  workDurationDays: number;
  agreedRate: number;
}

// Component props interface
export interface HireBottomSheetProps {
  worker: HireWorkerData;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (hireData: HireFormData) => Promise<void>;
  locale?: "en" | "ne";
}

// Localization strings
const strings = {
  en: {
    hireWorker: "Hire Worker",
    workDescription: "Work Description",
    workDescriptionPlaceholder: "Describe the work to be done...",
    workDate: "Work Date",
    workDatePlaceholder: "YYYY-MM-DD",
    duration: "Duration (Days)",
    durationPlaceholder: "Number of days",
    dailyRate: "Daily Rate (NPR)",
    dailyRatePlaceholder: "Rate per day",
    totalCost: "Total Cost",
    ratePrefix: "Rs.",
    confirmHire: "Confirm Hire",
    cancel: "Cancel",
    required: "This field is required",
    invalidDate: "Invalid date format",
    invalidNumber: "Must be a valid number",
    minDuration: "Minimum 1 day required",
    minRate: "Rate must be greater than 0",
    loading: "Processing...",
    submitFailedTitle: "Could not send request",
    submitDefaultHint: "Please review your details and try again.",
    submitNetworkHint: "Check your internet connection and retry.",
    submitDuplicateHint:
      "A request already exists for this worker from your location.",
    submitAuthHint: "Please log in again and submit the request once more.",
    submitServiceHint:
      "Service is temporarily unavailable. Try again in a few minutes.",
  },
  ne: {
    hireWorker: "कामदार भर्ना गर्नुहोस्",
    workDescription: "कामको विवरण",
    workDescriptionPlaceholder: "गर्नुपर्ने कामको वर्णन गर्नुहोस्...",
    workDate: "काम मिति",
    workDatePlaceholder: "YYYY-MM-DD",
    duration: "अवधि (दिन)",
    durationPlaceholder: "दिनको संख्या",
    dailyRate: "दैनिक दर (रु.)",
    dailyRatePlaceholder: "प्रति दिन दर",
    totalCost: "कुल लागत",
    ratePrefix: "रु.",
    confirmHire: "भर्ना पुष्टि गर्नुहोस्",
    cancel: "रद्द गर्नुहोस्",
    required: "यो फिल्ड आवश्यक छ",
    invalidDate: "अमान्य मिति ढाँचा",
    invalidNumber: "मान्य संख्या हुनुपर्छ",
    minDuration: "न्यूनतम १ दिन आवश्यक",
    minRate: "दर ० भन्दा बढी हुनुपर्छ",
    loading: "प्रशोधन गर्दै...",
    submitFailedTitle: "अनुरोध पठाउन सकिएन",
    submitDefaultHint: "विवरण जाँचेर फेरि प्रयास गर्नुहोस्।",
    submitNetworkHint: "इन्टरनेट जडान जाँचेर पुन: प्रयास गर्नुहोस्।",
    submitDuplicateHint:
      "तपाईंको स्थानबाट यस कामदारलाई अनुरोध पहिले नै पठाइएको छ।",
    submitAuthHint: "कृपया पुन: लगइन गरेर फेरि अनुरोध पठाउनुहोस्।",
    submitServiceHint:
      "सेवा अस्थायी रूपमा उपलब्ध छैन। केही समयपछि पुन: प्रयास गर्नुहोस्।",
  },
};

// Form validation errors interface
interface FormErrors {
  workDescription?: string;
  workDate?: string;
  workDurationDays?: string;
  agreedRate?: string;
}

interface SubmissionFeedback {
  title: string;
  message: string;
  hint: string;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim();
  }

  return "";
}

function buildSubmissionFeedback(
  error: unknown,
  locale: "en" | "ne",
): SubmissionFeedback {
  const t = strings[locale];
  const message = toErrorMessage(error);
  const normalized = message.toLowerCase();

  if (
    normalized.includes("network") ||
    normalized.includes("fetch") ||
    normalized.includes("timed out") ||
    normalized.includes("connection")
  ) {
    return {
      title: t.submitFailedTitle,
      message: message || t.submitNetworkHint,
      hint: t.submitNetworkHint,
    };
  }

  if (
    normalized.includes("already") ||
    normalized.includes("duplicate") ||
    normalized.includes("23505") ||
    normalized.includes("409")
  ) {
    return {
      title: t.submitFailedTitle,
      message: message || t.submitDuplicateHint,
      hint: t.submitDuplicateHint,
    };
  }

  if (
    normalized.includes("unauthorized") ||
    normalized.includes("authentication") ||
    normalized.includes("401")
  ) {
    return {
      title: t.submitFailedTitle,
      message: message || t.submitAuthHint,
      hint: t.submitAuthHint,
    };
  }

  if (
    normalized.includes("503") ||
    normalized.includes("unavailable") ||
    normalized.includes("temporarily")
  ) {
    return {
      title: t.submitFailedTitle,
      message: message || t.submitServiceHint,
      hint: t.submitServiceHint,
    };
  }

  return {
    title: t.submitFailedTitle,
    message: message || t.submitDefaultHint,
    hint: t.submitDefaultHint,
  };
}

// Animated components
const AnimatedView = Animated.createAnimatedComponent(View);

/**
 * HireBottomSheet - A bottom sheet component for hiring workers
 * Uses @gorhom/bottom-sheet with Reanimated 3 for smooth animations
 */
export const HireBottomSheet: React.FC<HireBottomSheetProps> = ({
  worker,
  isOpen,
  onClose,
  onConfirm,
  locale = "en",
}) => {
  const t = strings[locale];
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Form state
  const [workDescription, setWorkDescription] = useState("");
  const [workDate, setWorkDate] = useState("");
  const [workDurationDays, setWorkDurationDays] = useState("1");
  const [agreedRate, setAgreedRate] = useState(
    worker.dailyRate?.toString() || "",
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submissionFeedback, setSubmissionFeedback] =
    useState<SubmissionFeedback | null>(null);

  // Animation values
  const formOpacity = useSharedValue(0);
  const totalCostScale = useSharedValue(1);

  // Snap points for bottom sheet
  const snapPoints = useMemo(() => ["75%", "90%"], []);

  // Calculate total cost
  const totalCost = useMemo(() => {
    const days = parseInt(workDurationDays, 10) || 0;
    const rate = parseInt(agreedRate, 10) || 0;
    return days * rate;
  }, [workDurationDays, agreedRate]);

  // Animate total cost when it changes
  useEffect(() => {
    totalCostScale.value = withSpring(1.1, {
      damping: 10,
      stiffness: 300,
    });
    setTimeout(() => {
      totalCostScale.value = withSpring(1, {
        damping: 15,
        stiffness: 200,
      });
    }, 150);
  }, [totalCost, totalCostScale]);

  // Handle bottom sheet open/close
  useEffect(() => {
    if (isOpen) {
      bottomSheetRef.current?.expand();
      formOpacity.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.ease),
      });
    } else {
      bottomSheetRef.current?.close();
      formOpacity.value = 0;
      // Reset form
      resetForm();
    }
  }, [isOpen, formOpacity]);

  // Reset form state
  const resetForm = useCallback(() => {
    setWorkDescription("");
    setWorkDate("");
    setWorkDurationDays("1");
    setAgreedRate(worker.dailyRate?.toString() || "");
    setErrors({});
    setSubmissionFeedback(null);
    setIsLoading(false);
  }, [worker.dailyRate]);

  // Validate form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    // Work description validation
    if (!workDescription.trim()) {
      newErrors.workDescription = t.required;
    }

    // Work date validation
    if (!workDate.trim()) {
      newErrors.workDate = t.required;
    } else {
      // Simple YYYY-MM-DD validation
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(workDate)) {
        newErrors.workDate = t.invalidDate;
      }
    }

    // Duration validation
    const durationNum = parseInt(workDurationDays, 10);
    if (!workDurationDays.trim() || isNaN(durationNum)) {
      newErrors.workDurationDays = t.invalidNumber;
    } else if (durationNum < 1) {
      newErrors.workDurationDays = t.minDuration;
    }

    // Rate validation
    const rateNum = parseInt(agreedRate, 10);
    if (!agreedRate.trim() || isNaN(rateNum)) {
      newErrors.agreedRate = t.invalidNumber;
    } else if (rateNum <= 0) {
      newErrors.agreedRate = t.minRate;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [workDescription, workDate, workDurationDays, agreedRate, t]);

  // Handle confirm hire
  const handleConfirm = useCallback(async () => {
    Keyboard.dismiss();
    setSubmissionFeedback(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await onConfirm({
        workDescription: workDescription.trim(),
        workDate: workDate.trim(),
        workDurationDays: parseInt(workDurationDays, 10),
        agreedRate: parseInt(agreedRate, 10),
      });
      onClose();
    } catch (error) {
      console.error("Hire confirmation failed:", error);
      setSubmissionFeedback(buildSubmissionFeedback(error, locale));
    } finally {
      setIsLoading(false);
    }
  }, [
    workDescription,
    workDate,
    workDurationDays,
    agreedRate,
    validateForm,
    onConfirm,
    onClose,
    locale,
  ]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose],
  );

  // Render backdrop
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
        pressBehavior="close"
      />
    ),
    [],
  );

  // Get worker initials for avatar
  const getInitials = useCallback(() => {
    const name = worker.name;
    const parts = name.split(" ");
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }, [worker.name]);

  // Get localized name
  const getWorkerName = useCallback(() => {
    return locale === "ne" && worker.nameNp ? worker.nameNp : worker.name;
  }, [locale, worker.name, worker.nameNp]);

  // Get localized job category
  const getJobCategory = useCallback(() => {
    return locale === "ne" && worker.jobCategoryNp
      ? worker.jobCategoryNp
      : worker.jobCategory;
  }, [locale, worker.jobCategory, worker.jobCategoryNp]);

  // Animated styles
  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }));

  const totalCostAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: totalCostScale.value }],
  }));

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${t.ratePrefix} ${amount.toLocaleString()}`;
  };

  // Get today's date as default
  const getTodayDate = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Set default date if empty
  useEffect(() => {
    if (isOpen && !workDate) {
      setWorkDate(getTodayDate());
    }
  }, [isOpen, workDate, getTodayDate]);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={isOpen ? 0 : -1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      <BottomSheetView style={styles.contentContainer}>
        <AnimatedView style={[styles.formContainer, formAnimatedStyle]}>
          {/* Header with close button */}
          <View style={styles.header}>
            <Text variant="titleLarge" style={styles.headerTitle}>
              {t.hireWorker}
            </Text>
            <IconButton
              icon={() => <X size={24} color={colors.mountain[900]} />}
              onPress={handleCancel}
              style={styles.closeButton}
            />
          </View>

          {/* Worker Info */}
          <AnimatedView
            entering={FadeInDown.duration(300).delay(100)}
            style={styles.workerInfo}
          >
            {worker.avatarUrl ? (
              <Avatar.Image
                size={56}
                source={{ uri: worker.avatarUrl }}
                style={styles.avatar}
              />
            ) : (
              <Avatar.Text
                size={56}
                label={getInitials()}
                style={styles.avatar}
                labelStyle={styles.avatarLabel}
              />
            )}
            <View style={styles.workerDetails}>
              <Text variant="titleMedium" style={styles.workerName}>
                {getWorkerName()}
              </Text>
              <Text variant="bodyMedium" style={styles.workerCategory}>
                {getJobCategory()}
              </Text>
              {worker.dailyRate && (
                <Text variant="bodySmall" style={styles.workerRate}>
                  {formatCurrency(worker.dailyRate)}/
                  {locale === "ne" ? "दिन" : "day"}
                </Text>
              )}
            </View>
          </AnimatedView>

          {/* Form Fields */}
          <AnimatedView
            entering={FadeInUp.duration(300).delay(200)}
            style={styles.form}
          >
            {/* Work Description */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <FileText size={18} color={colors.crimson[500]} />
                <Text variant="labelLarge" style={styles.inputLabel}>
                  {t.workDescription}
                </Text>
              </View>
              <TextInput
                mode="outlined"
                placeholder={t.workDescriptionPlaceholder}
                value={workDescription}
                onChangeText={setWorkDescription}
                multiline
                numberOfLines={3}
                style={styles.textInput}
                outlineStyle={styles.textInputOutline}
                outlineColor={
                  errors.workDescription ? colors.error : colors.terrain[300]
                }
                activeOutlineColor={colors.crimson[500]}
                textColor={colors.mountain[900]}
                error={!!errors.workDescription}
              />
              {errors.workDescription && (
                <View style={styles.errorRow}>
                  <AlertCircle size={14} color={colors.error} />
                  <Text variant="bodySmall" style={styles.errorText}>
                    {errors.workDescription}
                  </Text>
                </View>
              )}
            </View>

            {/* Work Date */}
            <View style={styles.inputGroup}>
              <View style={styles.inputLabelRow}>
                <Calendar size={18} color={colors.crimson[500]} />
                <Text variant="labelLarge" style={styles.inputLabel}>
                  {t.workDate}
                </Text>
              </View>
              <TextInput
                mode="outlined"
                placeholder={t.workDatePlaceholder}
                value={workDate}
                onChangeText={setWorkDate}
                style={styles.textInput}
                outlineStyle={styles.textInputOutline}
                outlineColor={
                  errors.workDate ? colors.error : colors.terrain[300]
                }
                activeOutlineColor={colors.crimson[500]}
                textColor={colors.mountain[900]}
                keyboardType={Platform.OS === "ios" ? "default" : "default"}
                error={!!errors.workDate}
              />
              {errors.workDate && (
                <View style={styles.errorRow}>
                  <AlertCircle size={14} color={colors.error} />
                  <Text variant="bodySmall" style={styles.errorText}>
                    {errors.workDate}
                  </Text>
                </View>
              )}
            </View>

            {/* Duration and Rate Row */}
            <View style={styles.rowInputs}>
              {/* Duration */}
              <View style={[styles.inputGroup, styles.halfInput]}>
                <View style={styles.inputLabelRow}>
                  <Clock size={18} color={colors.crimson[500]} />
                  <Text variant="labelLarge" style={styles.inputLabel}>
                    {t.duration}
                  </Text>
                </View>
                <TextInput
                  mode="outlined"
                  placeholder={t.durationPlaceholder}
                  value={workDurationDays}
                  onChangeText={setWorkDurationDays}
                  style={styles.textInput}
                  outlineStyle={styles.textInputOutline}
                  outlineColor={
                    errors.workDurationDays ? colors.error : colors.terrain[300]
                  }
                  activeOutlineColor={colors.crimson[500]}
                  textColor={colors.mountain[900]}
                  keyboardType="numeric"
                  error={!!errors.workDurationDays}
                />
                {errors.workDurationDays && (
                  <View style={styles.errorRow}>
                    <AlertCircle size={14} color={colors.error} />
                    <Text variant="bodySmall" style={styles.errorText}>
                      {errors.workDurationDays}
                    </Text>
                  </View>
                )}
              </View>

              {/* Daily Rate */}
              <View style={[styles.inputGroup, styles.halfInput]}>
                <View style={styles.inputLabelRow}>
                  <Wallet size={18} color={colors.crimson[500]} />
                  <Text variant="labelLarge" style={styles.inputLabel}>
                    {t.dailyRate}
                  </Text>
                </View>
                <TextInput
                  mode="outlined"
                  placeholder={t.dailyRatePlaceholder}
                  value={agreedRate}
                  onChangeText={setAgreedRate}
                  style={styles.textInput}
                  outlineStyle={styles.textInputOutline}
                  outlineColor={
                    errors.agreedRate ? colors.error : colors.terrain[300]
                  }
                  activeOutlineColor={colors.crimson[500]}
                  textColor={colors.mountain[900]}
                  keyboardType="numeric"
                  error={!!errors.agreedRate}
                />
                {errors.agreedRate && (
                  <View style={styles.errorRow}>
                    <AlertCircle size={14} color={colors.error} />
                    <Text variant="bodySmall" style={styles.errorText}>
                      {errors.agreedRate}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Total Cost Display */}
            <AnimatedView
              style={[styles.totalCostContainer, totalCostAnimatedStyle]}
            >
              <Text variant="titleMedium" style={styles.totalCostLabel}>
                {t.totalCost}
              </Text>
              <Text variant="headlineMedium" style={styles.totalCostValue}>
                {formatCurrency(totalCost)}
              </Text>
            </AnimatedView>

            {submissionFeedback ? (
              <View style={styles.submissionFeedback}>
                <View style={styles.feedbackHeaderRow}>
                  <AlertCircle size={16} color={colors.error} />
                  <Text variant="labelLarge" style={styles.feedbackTitle}>
                    {submissionFeedback.title}
                  </Text>
                </View>
                <Text variant="bodySmall" style={styles.feedbackMessage}>
                  {submissionFeedback.message}
                </Text>
                <Text variant="bodySmall" style={styles.feedbackHint}>
                  {submissionFeedback.hint}
                </Text>
              </View>
            ) : null}
          </AnimatedView>

          {/* Action Buttons */}
          <AnimatedView
            entering={FadeInUp.duration(300).delay(300)}
            style={styles.actions}
          >
            <Button
              mode="outlined"
              onPress={handleCancel}
              disabled={isLoading}
              style={styles.cancelButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.cancelButtonLabel}
              textColor={colors.terrain[500]}
            >
              {t.cancel}
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={isLoading}
              disabled={isLoading}
              style={styles.confirmButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.confirmButtonLabel}
              buttonColor={colors.crimson[500]}
              textColor={colors.white}
            >
              {isLoading ? t.loading : t.confirmHire}
            </Button>
          </AnimatedView>
        </AnimatedView>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.terrain[50],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: colors.terrain[300],
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  formContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingTop: 8,
  },
  headerTitle: {
    fontWeight: "700",
    color: colors.mountain[900],
  },
  closeButton: {
    margin: 0,
  },
  workerInfo: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: colors.mountain[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: {
    backgroundColor: colors.crimson[700],
  },
  avatarLabel: {
    color: colors.white,
    fontWeight: "600",
  },
  workerDetails: {
    marginLeft: 16,
    flex: 1,
  },
  workerName: {
    fontWeight: "600",
    color: colors.mountain[900],
  },
  workerCategory: {
    color: colors.crimson[500],
    fontWeight: "500",
    marginTop: 2,
  },
  workerRate: {
    color: colors.success,
    fontWeight: "600",
    marginTop: 4,
  },
  form: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  inputLabel: {
    color: colors.mountain[900],
    fontWeight: "500",
  },
  textInput: {
    backgroundColor: colors.white,
  },
  textInputOutline: {
    borderRadius: 12,
  },
  rowInputs: {
    flexDirection: "row",
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 4,
  },
  errorText: {
    color: colors.error,
  },
  totalCostContainer: {
    backgroundColor: colors.crimson[50],
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.crimson[500],
    borderStyle: "dashed",
  },
  totalCostLabel: {
    color: colors.terrain[500],
    fontWeight: "500",
    marginBottom: 4,
  },
  totalCostValue: {
    color: colors.crimson[700],
    fontWeight: "700",
  },
  submissionFeedback: {
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  feedbackHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  feedbackTitle: {
    color: colors.error,
    fontWeight: "700",
  },
  feedbackMessage: {
    color: "#7F1D1D",
    lineHeight: 18,
  },
  feedbackHint: {
    color: "#991B1B",
    marginTop: 4,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 12,
    borderColor: colors.terrain[300],
    borderWidth: 1.5,
  },
  confirmButton: {
    flex: 2,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  cancelButtonLabel: {
    fontWeight: "600",
  },
  confirmButtonLabel: {
    fontWeight: "600",
    fontSize: 16,
  },
});

export default HireBottomSheet;
