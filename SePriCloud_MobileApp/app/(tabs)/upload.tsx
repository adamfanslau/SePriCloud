import { Link } from "expo-router";
import { Button, Image, Text, View, StyleSheet, Alert } from "react-native";
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useAuth } from "@/context/AuthProvider";

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);

  const { user } = useAuth();

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
    await FileSystem.uploadAsync('http://192.168.1.7:3001/uploadFile', image, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'file'
    });
  };

  return (
    <View style={styles.container} >
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
});
