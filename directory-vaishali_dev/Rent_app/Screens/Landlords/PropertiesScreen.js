import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { apiService } from "../../api";

export default function PropertiesScreen() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async (pageNumber = 1) => {
  try {
    if (pageNumber === 1) setLoading(true);
    const res = await apiService.get("/api/users", { page: pageNumber, limit: 10 });
    const fetchedUsers = res.data.users || res.data;
    setUsers(pageNumber === 1 ? fetchedUsers : [...users, ...fetchedUsers]);
    setPage(res.data.page);
    setTotalPages(res.data.totalPages);
    setLoading(false);
    setRefreshing(false);
  } catch (error) {
    console.error("Error fetching users:", error);
    setLoading(false);
    setRefreshing(false);
  }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const loadMore = () => {
    if (page < totalPages) {
      fetchUsers(page + 1);
    }
  };

  const refreshList = () => {
    setRefreshing(true);
    fetchUsers(1);
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => openUserDetails(item)}
    >
      <Text style={styles.userName}>
        {item.sNo}
      </Text>
      <Text style={styles.userEmail}>{item.firstName}{item.middleName}{item.lastName}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>All Users</Text>

      {loading && page === 1 ? (
        <ActivityIndicator size="large" color="#FF6F00" />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          refreshing={refreshing}
          onRefresh={refreshList}
          ListFooterComponent={
            page < totalPages ? <ActivityIndicator size="small" color="#FF6F00" /> : null
          }
        />
      )}

      {/* User Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalHeader}>User Details</Text>

          {selectedUser && (
            <>
              <Text style={styles.detailText}>
                <Text style={styles.label}>S.No:</Text> {selectedUser.sNo}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Full Name:</Text>{" "}
                {selectedUser.firstName} {selectedUser.middleName}{" "}
                {selectedUser.lastName}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Gotra:</Text> {selectedUser.gotra}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Address:</Text> {selectedUser.address}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>City:</Text> {selectedUser.city}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>State:</Text> {selectedUser.state}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Pincode:</Text> {selectedUser.pinCode}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Phone:</Text> {selectedUser.phone}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Mobile:</Text> {selectedUser.mobile}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Email:</Text> {selectedUser.email}
              </Text>
            </>
          )}

          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7E6", paddingTop: 30 },
  header: { fontSize: 26, fontWeight: "700", color: "#FF6F00", textAlign: "center", marginBottom: 20 },
  userCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFB347",
  },
  userName: { fontSize: 18, fontWeight: "600", color: "#333" },
  userEmail: { fontSize: 14, color: "#666", marginTop: 4 },
  modalContainer: { flex: 1, backgroundColor: "#FFF7E6", padding: 20 },
  modalHeader: { fontSize: 24, fontWeight: "700", color: "#FF6F00", marginBottom: 20, textAlign: "center" },
  detailText: { fontSize: 16, marginBottom: 12 },
  label: { fontWeight: "700", color: "#FF6F00" },
  closeButton: {
    backgroundColor: "#FF6F00",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  closeButtonText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
