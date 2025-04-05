import { Link } from "expo-router";
import { Button, Image, Text, View, StyleSheet, Alert, Modal, ActivityIndicator, ScrollView, Dimensions, Pressable } from "react-native";
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useAuth } from "@/context/AuthProvider";

export default function HomeScreen() {
  const [imageArray, setImageArray] = useState<string [] | null>(null);
  const [uploading, setUploading] = useState(false);

  const { user, serverUrl, apiPrefix, apiKey } = useAuth();

  console.log('user: ', user);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
      allowsMultipleSelection: true,
    });

    console.log(result);

    if (!result.canceled) {
      const pickedImages: string [] = [];
      for (const asset of result.assets) {
        pickedImages.push(asset.uri);
      }
      setImageArray(pickedImages);
      console.log(pickedImages);
    }
  };

  const uploadImage = async () => {
    if (imageArray === null || imageArray.length === 0) {
      Alert.alert("No image selected", "Please select an image first.");
      return;
    }
    
    try {
      setUploading(true);
      const responseArray: FileSystem.FileSystemUploadResult [] = [];
      for (const image of imageArray) {
        responseArray.push(await FileSystem.uploadAsync(`https://${apiPrefix}.${serverUrl}/uploadFile`, image, {
        httpMethod: 'POST',
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        fieldName: 'file',
        headers: {
          'sepricloud-api-key': apiKey
        }
        }));
      }
      for (const response of responseArray) {
        console.log('Upload complete:', response);
      }
      
      Alert.alert("Success", "File uploaded successfully!");
    } catch (error) {
      console.error('Upload failed:', error);
      Alert.alert("Upload Failed", "There was an error uploading your file.");
    } finally {
      setUploading(false);
      setImageArray(null);
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

  // Calculate image dimensions for the grid
  const screenWidth = Dimensions.get('window').width;
  const imageWidth = (screenWidth - 60) / 2; // Account for padding and gap

  return (
    <View style={styles.container}>
      <LoadingModal />
      {user ? (
        <View style={styles.contentContainer}>
          <Pressable style={styles.pickButton} onPress={pickImage}>
            <Text style={styles.buttonText}>Pick image(s) from camera roll</Text>
          </Pressable>
          
          {imageArray && imageArray.length > 0 && (
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollViewContent}
            >
              <View style={styles.imageGrid}>
                {imageArray.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image source={{ uri: image }} style={{ width: imageWidth, height: imageWidth }} />
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
          {imageArray && imageArray.length > 0 && (
            <Pressable style={styles.clearButton} onPress={() => setImageArray(null)}>
              <Text style={styles.buttonText}>Clear selection</Text>
            </Pressable>
          )}
          {imageArray && imageArray.length > 0 && (
            <Pressable style={styles.uploadButton} onPress={uploadImage}>
              <Text style={styles.buttonText}>Upload Image(s)</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={styles.linkContainer} >
          <Link style={{fontSize: 18}} href='/(tabs)'>Log in to view this tab</Link>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  linkContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  pickButton: {
    backgroundColor: '#3f83cc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#c63434',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  uploadButton: {
    backgroundColor: '#3f83cc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    width: '100%',
    maxHeight: '70%',
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  imageContainer: {
    marginBottom: 12,
    overflow: 'hidden',
    padding: 4,
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
