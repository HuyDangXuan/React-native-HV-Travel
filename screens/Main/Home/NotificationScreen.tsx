import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import theme from "../../../config/theme";
import { useNavigation } from "@react-navigation/native";

const TABS = ["Your Trips", "Campaigns"];

const DATA = [
  {
    id: "1",
    icon: "bag",
    title: "Your purchased 2 days Bandarban package waits for payment.",
    time: "Apr 9, 8:30 PM",
  },
  {
    id: "2",
    icon: "sparkles",
    title: "Congratulations! You've been assigned as a Cercle sponsor.",
    time: "Apr 9, 8:30 PM",
  },
  {
    id: "3",
    icon: "star",
    title: "Thank you for your rating, We'd love your feedback!",
    time: "Apr 9, 8:30 PM",
  },
  {
    id: "4",
    icon: "trophy",
    title: "You successfully finished your 2 days Cox-Bazar tour.",
    time: "Mar 9, 8:30 PM",
  },
];

export default function NotificationScreen() {
    const [activeTab, setActiveTab] = useState(0);
    const navigation = useNavigation<any>();

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      <View style={styles.iconWrap}>
        <Ionicons name={item.icon} size={20} color="#1E90FF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={()=> navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab, index) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === index && styles.activeTab,
            ]}
            onPress={() => setActiveTab(index)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === index && styles.activeText,
              ]}
            >
              {tab}
            </Text>
            {tab === "Campaigns" && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>4</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    marginLeft: theme.spacing.md,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: "#1E90FF",
  },
  tabText: {
    fontSize: 14,
    color: "#888",
  },
  activeText: {
    color: "#1E90FF",
    fontWeight: "600",
  },
  badge: {
    backgroundColor: "#1E90FF",
    borderRadius: 10,
    paddingHorizontal: 6,
    marginLeft: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
  },
  item: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EAF4FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
});
