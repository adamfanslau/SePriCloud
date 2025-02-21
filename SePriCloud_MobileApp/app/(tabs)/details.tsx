import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface IFileMetadata {
        id: string;
        datetime_added: Date;
        filename: string;
        tags: string | null,
        description: string | null
}

export default function DetailsScreen() {
    const [filesMetadata, setFilesMetadata] = useState<IFileMetadata[]>([]);

    useEffect(() => {
        fetch('http://192.168.1.7:3001/getAllFiles')
            .then((res) => res.json())
            .then((data) => {
                setFilesMetadata(data);
            });
    }, []);

    return (
        <View style={styles.container}>
            {filesMetadata.length > 0 ? (
                filesMetadata.map((file, index) => (
                    <>
                    <Image key={file.id} source={{uri: `http://192.168.1.7:3001/files/${file.filename}`}} style={styles.image} />
                    <Text key={file.filename}>{file.filename}</Text>
                    <Text key={new Date(file.datetime_added).toISOString()}>{new Date(file.datetime_added).toISOString()}</Text>
                    </>
                ))
            ) : (
                <Text>No files found</Text>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
});
