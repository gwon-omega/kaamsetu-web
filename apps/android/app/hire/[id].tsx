import { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Text,
  Card,
  Button,
  TextInput,
  SegmentedButtons,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle } from "lucide-react-native";
import {
  createIpFingerprint,
  isSupabaseConfigured,
  resolveClientIpAddress,
} from "../../src/lib";
import {
  useCreateHireMutation,
  useUpdateHireStatusMutation,
  useWorker,
} from "../../src/hooks";

function getActionableHireError(error: unknown): {
  message: string;
  hint: string;
} {
  const fallback = {
    message: "Failed to submit hire request.",
    hint: "Please review your details and try again.",
  };

  if (!(error instanceof Error)) {
    return fallback;
  }

  const message = error.message?.trim() || fallback.message;
  const normalized = message.toLowerCase();

  if (
    normalized.includes("network") ||
    normalized.includes("fetch") ||
    normalized.includes("timed out") ||
    normalized.includes("connection")
  ) {
    return {
      message,
      hint: "Check your internet connection, then retry.",
    };
  }

  if (
    normalized.includes("already") ||
    normalized.includes("duplicate") ||
    normalized.includes("23505") ||
    normalized.includes("409")
  ) {
    return {
      message,
      hint: "A request from this location may already exist for this worker.",
    };
  }

  if (
    normalized.includes("unauthorized") ||
    normalized.includes("authentication") ||
    normalized.includes("401")
  ) {
    return {
      message,
      hint: "Please log in again and submit the request once more.",
    };
  }

  if (normalized.includes("503") || normalized.includes("unavailable")) {
    return {
      message,
      hint: "Service is temporarily unavailable. Try again shortly.",
    };
  }

  return {
    message,
    hint: fallback.hint,
  };
}

export default function HireScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const createHire = useCreateHireMutation();
  const updateHireStatus = useUpdateHireStatusMutation();
  const workerQuery = useWorker(id, true);
  const worker = workerQuery.data;

  const [workDate, setWorkDate] = useState("");
  const [duration, setDuration] = useState("1");
  const [description, setDescription] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitHint, setSubmitHint] = useState("");
  const [createdHireId, setCreatedHireId] = useState<string | null>(null);
  const [statusInfo, setStatusInfo] = useState("");

  const dailyRate = worker?.dailyRateNpr ?? 0;
  const totalCost = dailyRate * parseInt(duration);

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitHint("");

    if (!id) {
      setSubmitError("Worker ID is missing.");
      setSubmitHint("Please return to worker details and try again.");
      return;
    }

    if (!worker) {
      setSubmitError("Worker details are still loading. Please try again.");
      setSubmitHint("Wait for worker details to load, then resubmit.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setSubmitError(
        "Supabase is not configured. Set EXPO_PUBLIC_* Supabase variables.",
      );
      setSubmitHint("Contact support or configure environment variables.");
      return;
    }

    const hirerIp = await resolveClientIpAddress();

    const parsedWorkDate = new Date(workDate);
    if (Number.isNaN(parsedWorkDate.getTime())) {
      setSubmitError("Work date must be in YYYY-MM-DD format.");
      setSubmitHint("Use a valid date such as 2026-04-06.");
      return;
    }

    try {
      const createdHire = await createHire.mutateAsync({
        workerId: id,
        hirerIp: hirerIp ?? undefined,
        ipFingerprint: createIpFingerprint(),
        workDescription: description.trim(),
        workDate: parsedWorkDate,
        workDurationDays: Math.max(1, parseInt(duration, 10) || 1),
        agreedRateNpr: dailyRate,
        hireProvinceId: worker.provinceId,
        hireDistrictId: worker.districtId,
        hireLocalUnitId: worker.localUnitId,
      });

      setCreatedHireId(createdHire.id);
      setIsSuccess(true);
    } catch (error) {
      const feedback = getActionableHireError(error);
      setSubmitError(feedback.message);
      setSubmitHint(feedback.hint);
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}>
          <CheckCircle color="#16a34a" size={64} />
        </View>
        <Text variant="headlineSmall" style={styles.successTitle}>
          Request Sent!
        </Text>
        <Text variant="bodyLarge" style={styles.successText}>
          {worker
            ? `${worker.fullName} will respond soon.`
            : "The worker will respond soon."}
        </Text>
        {createdHireId ? (
          <Button
            mode="outlined"
            style={styles.cancelRequestButton}
            loading={updateHireStatus.isPending}
            disabled={updateHireStatus.isPending}
            onPress={async () => {
              try {
                await updateHireStatus.mutateAsync({
                  hireId: createdHireId,
                  status: "cancelled",
                });
                setStatusInfo("Request cancelled.");
              } catch (error) {
                setStatusInfo(
                  error instanceof Error
                    ? error.message
                    : "Unable to update status.",
                );
              }
            }}
          >
            Cancel Request
          </Button>
        ) : null}
        {statusInfo ? (
          <Text style={styles.statusInfoText}>{statusInfo}</Text>
        ) : null}
        <Button
          mode="contained"
          style={styles.homeButton}
          onPress={() => router.push("/")}
        >
          Back to Home
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.formCard}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.formTitle}>
              Hire Request
            </Text>

            <Text style={styles.workerInfoText}>
              {workerQuery.isLoading
                ? "Loading worker details..."
                : worker
                  ? `Worker: ${worker.fullName} (${worker.jobCategory.nameEn})`
                  : "Worker details unavailable"}
            </Text>

            {/* Work Date */}
            <View style={styles.inputGroup}>
              <Text variant="labelLarge" style={styles.label}>
                Work Date
              </Text>
              <TextInput
                mode="outlined"
                placeholder="YYYY-MM-DD"
                value={workDate}
                onChangeText={setWorkDate}
                style={styles.input}
              />
            </View>

            {/* Duration */}
            <View style={styles.inputGroup}>
              <Text variant="labelLarge" style={styles.label}>
                Duration
              </Text>
              <SegmentedButtons
                value={duration}
                onValueChange={setDuration}
                buttons={[
                  { value: "1", label: "1 day" },
                  { value: "2", label: "2 days" },
                  { value: "3", label: "3 days" },
                  { value: "5", label: "5 days" },
                ]}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text variant="labelLarge" style={styles.label}>
                Work Description
              </Text>
              <TextInput
                mode="outlined"
                placeholder="Describe the work required..."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                style={styles.textArea}
              />
            </View>

            {/* Cost Summary */}
            <Card style={styles.summaryCard} mode="contained">
              <Card.Content style={styles.summaryContent}>
                <View style={styles.summaryRow}>
                  <Text variant="bodyLarge">Daily Rate</Text>
                  <Text variant="bodyLarge">
                    रु {dailyRate.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text variant="bodyLarge">Duration</Text>
                  <Text variant="bodyLarge">{duration} days</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryRow}>
                  <Text variant="titleMedium" style={styles.totalLabel}>
                    Total
                  </Text>
                  <Text variant="headlineSmall" style={styles.totalValue}>
                    रु {totalCost.toLocaleString()}
                  </Text>
                </View>
              </Card.Content>
            </Card>

            <Button
              mode="contained"
              style={styles.submitButton}
              loading={createHire.isPending}
              disabled={
                createHire.isPending ||
                workerQuery.isLoading ||
                !worker ||
                dailyRate <= 0 ||
                !workDate ||
                !description
              }
              onPress={handleSubmit}
            >
              {createHire.isPending ? "Sending..." : "Send Hire Request"}
            </Button>

            {submitError ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{submitError}</Text>
                {submitHint ? (
                  <Text style={styles.errorHintText}>{submitHint}</Text>
                ) : null}
              </View>
            ) : null}
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF7F0" },
  content: { padding: 16 },
  formCard: { backgroundColor: "#FFFFFF" },
  formTitle: {
    fontWeight: "700",
    color: "#1C3557",
    marginBottom: 24,
    textAlign: "center",
  },
  workerInfoText: {
    color: "#6D5E4A",
    textAlign: "center",
    marginBottom: 16,
  },
  inputGroup: { marginBottom: 20 },
  label: { color: "#1C3557", marginBottom: 8, fontWeight: "600" },
  input: { backgroundColor: "#FFFFFF" },
  textArea: { backgroundColor: "#FFFFFF" },
  summaryCard: { backgroundColor: "#FAF7F0", marginTop: 8, marginBottom: 24 },
  summaryContent: { paddingVertical: 8 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  divider: { height: 1, backgroundColor: "#E4DDD0", marginVertical: 8 },
  totalLabel: { fontWeight: "600", color: "#1C3557" },
  totalValue: { fontWeight: "700", color: "#A02535" },
  submitButton: { backgroundColor: "#A02535", paddingVertical: 6 },
  errorContainer: {
    marginTop: 12,
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    color: "#991B1B",
    textAlign: "center",
    fontWeight: "600",
  },
  errorHintText: {
    color: "#7F1D1D",
    marginTop: 6,
    textAlign: "center",
  },
  successContainer: {
    flex: 1,
    backgroundColor: "#FAF7F0",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  successIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: { fontWeight: "700", color: "#1C3557", marginBottom: 8 },
  successText: { color: "#6D5E4A", marginBottom: 32 },
  homeButton: { backgroundColor: "#A02535", paddingHorizontal: 32 },
  cancelRequestButton: {
    borderColor: "#A02535",
    marginBottom: 10,
  },
  statusInfoText: {
    color: "#6D5E4A",
    marginBottom: 14,
  },
});
