import { Link } from "expo-router";
import { Button, Image, Text, View, StyleSheet, Alert } from "react-native";
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { readFile } from 'react-native-fs';
import axios from "axios";

export default function HomeScreen() {
  const [image, setImage] = useState<string | null>(null);

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



const loadImageBase64 = async (capturedImageURI: string) => {
  try {
    const base64Data = await readFile(capturedImageURI, 'base64');
    return 'data:image/jpeg;base64,' + base64Data;
    // return base64Data;
  } catch (error) {
    console.error('Error converting image to base64:', error);
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
    // const base64Image = await loadImageBase64(image);
    // const formData = new FormData();
    // formData.append('file', base64Image.)
    // const base64Image = await loadImageBase64(image);

    // axios({
    //     method: 'POST',
    //     url: 'http://192.168.1.7:3001/uploadFile',
    //     data: base64Image,
    //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //     }
    //   }).then(function (response) {
    //     console.log(response.data);
    //     return response.data;
    //   }).catch(function (error) {
    //     console.log(error.message);
    //     return null;
    //   });
  };

  return (
    <View style={styles.container} >
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={styles.image} />}
      {image && <Button title="Upload Image" onPress={uploadImage} />}
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
