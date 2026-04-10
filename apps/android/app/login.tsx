import { useEffect, useState } from "react";
import { View, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { Text, Button, TextInput, SegmentedButtons } from "react-native-paper";
import { useRouter } from "expo-router";
import { Phone, Shield } from "lucide-react-native";
import { authApi } from "@shram-sewa/shared/api";
import { isSupabaseConfigured } from "../src/lib";
import { useAuthSession } from "../src/hooks";

export default function LoginScreen() {
  const router = useRouter();
  const backendReady = isSupabaseConfigured();
  const sessionQuery = useAuthSession(backendReady);

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [locale, setLocale] = useState("en");

  const isNepali = locale === "ne";

  useEffect(() => {
    if (sessionQuery.data?.user?.id) {
      router.replace("/(tabs)/profile");
    }
  }, [router, sessionQuery.data?.user?.id]);

  const handleSendOtp = async () => {
    if (!backendReady) {
      setError("Supabase is not configured.");
      return;
    }

    if (!/^9[78]\d{8}$/.test(phone)) {
      setError(
        isNepali
          ? "मान्य नम्बर प्रविष्ट गर्नुहोस्"
          : "Enter valid Nepal number",
      );
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await authApi.requestOtp(`+977${phone}`);
      setStep("otp");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to send OTP",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!backendReady) {
      setError("Supabase is not configured.");
      return;
    }

    if (otp.length !== 6) {
      setError(isNepali ? "६ अङ्क OTP चाहिन्छ" : "6-digit OTP required");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await authApi.verifyOtp(`+977${phone}`, otp);
      router.replace("/(tabs)/profile");
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : "Failed to verify OTP",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Language Toggle */}
        <SegmentedButtons
          value={locale}
          onValueChange={setLocale}
          buttons={[
            { value: "ne", label: "नेपाली" },
            { value: "en", label: "English" },
          ]}
          style={styles.langToggle}
        />

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>🏔️</Text>
          <Text variant="headlineLarge" style={styles.logoText}>
            {isNepali ? "श्रम सेवा" : "Shram Sewa"}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {step === "phone" ? (
            <>
              <Text variant="labelLarge" style={styles.label}>
                <Phone size={16} color="#1C3557" />{" "}
                {isNepali ? "मोबाइल नम्बर" : "Mobile Number"}
              </Text>
              <View style={styles.phoneRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+977</Text>
                </View>
                <TextInput
                  mode="outlined"
                  placeholder="98XXXXXXXX"
                  value={phone}
                  onChangeText={(text) =>
                    setPhone(text.replace(/\D/g, "").slice(0, 10))
                  }
                  keyboardType="phone-pad"
                  style={styles.phoneInput}
                />
              </View>
              {error && <Text style={styles.errorText}>{error}</Text>}
              <Button
                mode="contained"
                style={styles.submitButton}
                loading={isLoading}
                disabled={isLoading || phone.length < 10}
                onPress={handleSendOtp}
              >
                {isNepali ? "OTP पठाउनुहोस्" : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <Text variant="labelLarge" style={styles.label}>
                <Shield size={16} color="#1C3557" /> OTP
              </Text>
              <TextInput
                mode="outlined"
                placeholder="000000"
                value={otp}
                onChangeText={(text) =>
                  setOtp(text.replace(/\D/g, "").slice(0, 6))
                }
                keyboardType="number-pad"
                style={styles.otpInput}
              />
              {error && <Text style={styles.errorText}>{error}</Text>}
              <Button
                mode="contained"
                style={styles.submitButton}
                loading={isLoading}
                disabled={isLoading || otp.length !== 6}
                onPress={handleVerifyOtp}
              >
                {isNepali ? "प्रमाणित गर्नुहोस्" : "Verify"}
              </Button>
              <Button mode="text" onPress={() => setStep("phone")}>
                {isNepali ? "नम्बर बदल्नुहोस्" : "Change number"}
              </Button>
            </>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF7F0" },
  content: { flex: 1, padding: 24, justifyContent: "center" },
  langToggle: { marginBottom: 32 },
  logoContainer: { alignItems: "center", marginBottom: 40 },
  logoEmoji: { fontSize: 64, marginBottom: 8 },
  logoText: { fontWeight: "700", color: "#1C3557" },
  formContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    elevation: 2,
  },
  label: { color: "#1C3557", marginBottom: 12, fontWeight: "600" },
  phoneRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  countryCode: {
    justifyContent: "center",
    paddingHorizontal: 16,
    backgroundColor: "#F0EBE1",
    borderRadius: 8,
  },
  countryCodeText: { color: "#1C3557", fontWeight: "600" },
  phoneInput: { flex: 1, backgroundColor: "#FFFFFF" },
  otpInput: {
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 8,
    marginBottom: 16,
  },
  errorText: { color: "#dc2626", marginBottom: 12, textAlign: "center" },
  submitButton: { backgroundColor: "#A02535", marginTop: 8 },
});
