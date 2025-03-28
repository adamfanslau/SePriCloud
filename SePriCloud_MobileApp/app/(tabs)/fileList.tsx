import { Link } from "expo-router";
import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from "@/context/AuthProvider";

interface IFileMetadata {
        id: string;
        datetime_added: Date;
        filename: string;
        tags: string | null,
        description: string | null
}

export default function DetailsScreen() {
    const [filesMetadata, setFilesMetadata] = useState<IFileMetadata[]>([]);

    const { user } = useAuth();

    console.log('user: ', user);

    useFocusEffect(
        useCallback(() => {
          // Do something when the screen is focused
          fetch('http://192.168.1.7:3001/getAllFiles')
            .then((res) => res.json())
            .then((data) => {
                setFilesMetadata(data);
            });
          return () => {
            // Do something when the screen is unfocused
            // Useful for cleanup functions
          };
        }, [])
      );

    // useEffect(() => {
    //     fetch('http://192.168.1.7:3001/getAllFiles')
    //         .then((res) => res.json())
    //         .then((data) => {
    //             setFilesMetadata(data);
    //         });
    // }, []);

    return user ? (
        <ScrollView contentContainerStyle={styles.container}>
            {filesMetadata.length > 0 ? (
                filesMetadata.map((file, index) => (
                    <View key={file.id} style={styles.fileContainer}>
                        <Image source={{uri: `http://192.168.1.7:3001/files/${file.filename}`}} style={styles.image} />
                        <Text>{file.filename}</Text>
                        <Text>{new Date(file.datetime_added).toISOString()}</Text>
                    </View>
                ))
            ) : (
                <Text>No files found</Text>
            )}
        </ScrollView>
    ) : (
        <View style={styles.container} >
            <Link href='/(tabs)'>Log in to view this tab</Link>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    fileContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
});
