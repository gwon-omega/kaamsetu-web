import { StatusBar } from "expo-status-bar";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const highlights = [
  "Offline-first worker discovery",
  "Built for low-end Android phones",
  "Shared business logic through pnpm workspaces",
];

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          <Text style={styles.kicker}>Production Bootstrap</Text>
          <Text style={styles.title}>Shram Sewa</Text>
          <Text style={styles.body}>
            Android is now scaffolded as a real Expo app with a path for offline
            UI, shared packages, and later native feature work.
          </Text>

          <View style={styles.list}>
            {highlights.map((item) => (
              <View key={item} style={styles.listItem}>
                <View style={styles.dot} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>Continue setup</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#E8DDD0",
    shadowColor: "#0A1520",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  kicker: {
    color: "#7C1D2B",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  title: {
    color: "#0A1520",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 12,
  },
  body: {
    color: "#142740",
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  list: {
    gap: 12,
    marginBottom: 24,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#C9971C",
  },
  listText: {
    color: "#1C3557",
    fontSize: 15,
    flexShrink: 1,
  },
  button: {
    backgroundColor: "#7C1D2B",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#FAF7F0",
    fontSize: 16,
    fontWeight: "700",
  },
});
