import { Link } from "expo-router";
import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from "@/context/AuthProvider";

interface IFileMetadata {
        id: string;
        added_by: string;
        datetime_added: Date;
        filename: string;
        tags: string | null,
        description: string | null
}

export default function DetailsScreen() {
    const [filesMetadata, setFilesMetadata] = useState<IFileMetadata[]>([]);

    const { user, serverUrl, apiPrefix, apiKey } = useAuth();

    console.log('fileList -> user: ', user);
    console.log('fileList -> serverUrl: ', serverUrl);

    useFocusEffect(
        useCallback(() => {
          // Do something when the screen is focused
          console.log(`https://${apiPrefix}.${serverUrl}/getAllFiles`);
          fetch(`https://${apiPrefix}.${serverUrl}/getAllFiles`, {headers: {'sepricloud-api-key': apiKey}})
            .then((res) => res.json())
            .then((data) => {
                setFilesMetadata(data);
            });
        }, [serverUrl])
    );

    return user ? (
        <ScrollView contentContainerStyle={styles.container}>
            {filesMetadata.length > 0 ? (
                filesMetadata.map((file, index) => (
                    <View key={file.id} style={styles.fileContainer}>
                        <Image
                            source={{uri: `https://${apiPrefix}.${serverUrl}/files/${file.filename}`}}
                            style={styles.image}
                        />
                        <Text>Added by: {file.added_by}</Text>
                        <Text>
                            {new Date(file.datetime_added).toLocaleString(`en-IE`, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    weekday: 'long'
				            })}
                        </Text>
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
