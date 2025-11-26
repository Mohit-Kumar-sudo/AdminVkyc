import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { Platform } from "react-native";
import { apiService } from "../../api";

export default function AddPropertyStaticScreen() {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      s_no: "",
      fullName: "",
      fatherName: "",
      occupation: "",
      gotra: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      mobile: "",
      email: "",
      landmark: "",
      OfficeAddress: "",
      YearsInIndore:","
    },
  });

  const [file, setFile] = useState(null);

  const onSubmit = async (data) => {
    const payload = {
      sNo: data.s_no,
      fullName: data.fullName,
      fatherName: data.fatherName,
      occupation: data.occupation,
      gotra: data.gotra,
      address: data.address,
      city: data.city,
      pinCode: data.pincode,
      state: data.state,
      phone: data.phone,
      mobile: data.mobile,
      email: data.email,
      landmark: data.landmark, 
      OfficeAddress: data.Office_address,
      YearsInIndore: data.YearsInIndore,
    };

    try {
    const res = await apiService.post("/api/users/add-user", payload); 
    Alert.alert("Success", "User added successfully!");
    console.log("API Response:", res.data);
    reset();
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
    Alert.alert("Error", "Failed to add user. Please try again.");
  }
  };

  // ✅ Pick Excel file
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
          "application/vnd.ms-excel", // .xls
        ],
      });

      if (result.canceled) return;

      const selectedFile = result.assets[0];
      setFile(selectedFile);
      Alert.alert("File Selected", selectedFile.name);
    } catch (error) {
      console.error("File Picker Error:", error);
      Alert.alert("Error", "Unable to pick file.");
    }
  };

  // ✅ Upload Excel file API
const uploadUsers = async () => {
  if (!file) {
    Alert.alert("No File", "Please select a file first.");
    return;
  }

  try {
    let formData = new FormData();

    if (Platform.OS === "web") {
      formData.append("file", file);
    } else {
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type:
          file.mimeType ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
    }

    const res = await apiService.post("/api/users/upload-users", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    Alert.alert("Success", "Users uploaded successfully!");
    console.log("Upload Response:", res.data);
    setFile(null);
  } catch (error) {
    console.error(
      "Upload Error:",
      error.response ? error.response.data : error.message
    );
    Alert.alert("Error", "Failed to upload users. Please try again.");
  }
};


  // ✅ Reusable field
  const renderField = (name, placeholder, keyboardType = "default") => (
    <Controller
      control={control}
      name={name}
      rules={{ required: `${placeholder} is required` }}
      render={({ field: { onChange, value } }) => (
        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, errors[name] && styles.inputError]}
            placeholder={placeholder}
            placeholderTextColor="#FFB347"
            value={value}
            onChangeText={onChange}
            keyboardType={keyboardType}
          />
          {errors[name] && (
            <Text style={styles.error}>{errors[name].message}</Text>
          )}
        </View>
      )}
    />
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 60 }}
    >
      <Text style={styles.header}>Add New User</Text>

      {renderField("s_no", "S.No", "numeric")}
      {renderField("fullName", "Full Name")}
      {renderField("fatherName", "Middle Name")}
      {renderField("occupation", "Last Name")}
      {renderField("gotra", "Gotra")}
      {renderField("address", "Address")}
      {renderField("city", "City")}
      {renderField("state", "State")}
      {renderField("pincode", "Pincode", "numeric")}
      {renderField("phone", "Phone", "phone-pad")}
      {renderField("mobile", "Mobile", "phone-pad")}
      {renderField("email", "Email", "email-address")}
      {renderField("landmark", "Landmark")}
      {renderField("OfficeAddress", "Office Address")}
      {renderField("YearsInIndore", "Years In Indore")}

      {/* Submit Button for single user */}
      <TouchableOpacity
        style={styles.submitButton}
        activeOpacity={0.8}
        onPress={handleSubmit(onSubmit)}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* File Upload Section */}
      <Text style={styles.header}>Upload Users via Excel</Text>

      <TouchableOpacity
        style={styles.fileButton}
        onPress={pickFile}
        activeOpacity={0.8}
      >
        <Text style={styles.fileButtonText}>
          {file ? `📄 ${file.name}` : "Choose Excel File"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: "#FF9500" }]}
        activeOpacity={0.8}
        onPress={uploadUsers}
      >
        <Text style={styles.submitButtonText}>Upload Users</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7E6",
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF6F00",
    marginBottom: 20,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 18,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 16,
    color: "black",
    borderWidth: 1,
    borderColor: "#FFB347",
    shadowColor: "#FFB347",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  inputError: {
    borderColor: "#FF3D00",
  },
  error: {
    color: "#FF3D00",
    fontSize: 13,
    marginTop: 4,
    marginLeft: 4,
  },
  submitButton: {
    backgroundColor: "#FF6F00",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 25,
    shadowColor: "#FF8C42",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#FFB347",
    marginVertical: 25,
  },
  fileButton: {
    backgroundColor: "#FFE0B2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFB347",
  },
  fileButtonText: {
    color: "#FF6F00",
    fontSize: 16,
    fontWeight: "600",
  },
});
