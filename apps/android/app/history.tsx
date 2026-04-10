import { ScrollView, StyleSheet, View } from "react-native";
import { Card, Text, Chip } from "react-native-paper";

const historyItems = [
  {
    id: "h1",
    workerNameEn: "Ram Bahadur Thapa",
    job: "Mason",
    amountNpr: 4500,
    date: "2026-03-14",
    status: "completed",
  },
  {
    id: "h2",
    workerNameEn: "Sita Kumari",
    job: "Cleaner",
    amountNpr: 2400,
    date: "2026-03-18",
    status: "pending",
  },
];

export default function HistoryScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text variant="headlineSmall" style={styles.title}>
        Hire History
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Track your recent and completed hire requests.
      </Text>

      {historyItems.map((item) => (
        <Card key={item.id} style={styles.card}>
          <Card.Content>
            <View style={styles.row}>
              <View style={styles.left}>
                <Text variant="titleMedium" style={styles.workerName}>
                  {item.workerNameEn}
                </Text>
                <Text variant="bodySmall" style={styles.meta}>
                  {item.job} - {item.date}
                </Text>
              </View>
              <View style={styles.right}>
                <Text variant="labelLarge" style={styles.amount}>
                  ru {item.amountNpr.toLocaleString()}
                </Text>
                <Chip
                  compact
                  mode="flat"
                  style={
                    item.status === "completed"
                      ? styles.completedChip
                      : styles.pendingChip
                  }
                  textStyle={styles.chipText}
                >
                  {item.status}
                </Chip>
              </View>
            </View>
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F0",
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    color: "#1C3557",
    fontWeight: "700",
  },
  subtitle: {
    color: "#6D5E4A",
    marginBottom: 6,
  },
  card: {
    backgroundColor: "#FFFFFF",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  left: {
    flex: 1,
  },
  right: {
    alignItems: "flex-end",
    gap: 6,
  },
  workerName: {
    color: "#1C3557",
    fontWeight: "600",
  },
  meta: {
    color: "#6D5E4A",
  },
  amount: {
    color: "#A02535",
    fontWeight: "700",
  },
  completedChip: {
    backgroundColor: "#dcfce7",
  },
  pendingChip: {
    backgroundColor: "#fef3c7",
  },
  chipText: {
    textTransform: "capitalize",
  },
});
