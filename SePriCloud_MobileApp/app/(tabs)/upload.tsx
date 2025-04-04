import { Link } from "expo-router";
import { Button, Image, Text, View, StyleSheet, Alert, Modal, ActivityIndicator } from "react-native";
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useAuth } from "@/context/AuthProvider";

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { user, serverUrl, apiPrefix, apiKey } = useAuth();

  console.log('user: ', user);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsEditing: false,
      // aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      console.log(image);
    }
  };

  const uploadImage = async () => {
    if (!image) {
      Alert.alert("No image selected", "Please select an image first.");
      return;
    }
    
    try {
      setUploading(true);
      
      const response = await FileSystem.uploadAsync(`https://${apiPrefix}.${serverUrl}/uploadFile`, image, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        headers: {
          'sepricloud-api-key': apiKey
        }
      });
      
      console.log('Upload complete:', response);
      Alert.alert("Success", "File uploaded successfully!");
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert("Upload Failed", "There was an error uploading your file.");
    } finally {
      setUploading(false);
      setImage(null);
    }
  };

  // Loading modal component
  const LoadingModal = () => (
    <Modal
      transparent={true}
      animationType="fade"
      visible={uploading}
      onRequestClose={() => {}}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.modalText}>Uploading...</Text>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container} >
      <LoadingModal />
      {user ? (
        <>
          <Button title="Pick an image from camera roll" onPress={pickImage} />
          {image && <Image source={{ uri: image }} style={styles.image} />}
          {image && <Button title="Upload Image" onPress={uploadImage} />}
        </>
      ) : (
        <Link href='/(tabs)'>Log in to view this tab</Link>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '500',
  }
});
