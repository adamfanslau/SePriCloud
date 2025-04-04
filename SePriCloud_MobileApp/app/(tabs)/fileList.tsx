import { Link } from "expo-router";
import { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Modal, 
  TextInput,
  FlatList,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from "@/context/AuthProvider";

interface IFileMetadata {
  id: string;
  added_by: string;
  datetime_added: Date;
  filename: string;
  tags: string[] | null;
  description: string | null;
  imageUri?: string; // Store the preloaded image URI
}

type SortField = 'added_by' | 'datetime_added';
type SortOrder = 'asc' | 'desc';

export default function DetailsScreen() {
  const [filesMetadata, setFilesMetadata] = useState<IFileMetadata[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<IFileMetadata[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<IFileMetadata | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [sortField, setSortField] = useState<SortField>('datetime_added');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  // Replace single tagInput with a map of fileId -> tagInput
  const [tagInputs, setTagInputs] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);

  const { user, serverUrl, apiPrefix, apiKey } = useAuth();

  useFocusEffect(
    useCallback(() => {
      // Fetch files when the screen is focused
      setIsLoading(true);
      console.log(`https://${apiPrefix}.${serverUrl}/getAllFiles`);
      fetch(`https://${apiPrefix}.${serverUrl}/getAllFiles`, {headers: {'sepricloud-api-key': apiKey}})
        .then((res) => res.json())
        .then((data) => {
          // Convert tags from string to array if necessary
          const processedData = data.map((file: any) => ({
            ...file,
            tags: file.tags ? typeof file.tags === 'string' ? file.tags.split(',') : file.tags : [],
            imageUri: `https://${apiPrefix}.${serverUrl}/files/${file.filename}`,
          }));
          
          // Initialize tag inputs for each file
          const initialTagInputs: {[key: string]: string} = {};
          processedData.forEach((file: IFileMetadata) => {
            initialTagInputs[file.id] = '';
          });
          setTagInputs(initialTagInputs);
          
          setFilesMetadata(processedData);
          sortAndFilterFiles(processedData, sortField, sortOrder, searchQuery);
          setIsLoading(false);
        })
        .catch(error => {
          console.error("Error fetching files:", error);
          setIsLoading(false);
        });
    }, [serverUrl])
  );

  useEffect(() => {
    sortAndFilterFiles(filesMetadata, sortField, sortOrder, searchQuery);
  }, [sortField, sortOrder, searchQuery]);

  const sortAndFilterFiles = (files: IFileMetadata[], field: SortField, order: SortOrder, query: string) => {
    // Filter files by tags
    let filtered = files;
    if (query.trim() !== '') {
      filtered = files.filter(file => 
        file.tags && file.tags.some(tag => 
          tag.toLowerCase().includes(query.toLowerCase())
        )
      );
    }

    // Sort files
    const sorted = [...filtered].sort((a, b) => {
      if (field === 'added_by') {
        const comparison = a.added_by.localeCompare(b.added_by);
        return order === 'asc' ? comparison : -comparison;
      } else {
        const dateA = new Date(a.datetime_added).getTime();
        const dateB = new Date(b.datetime_added).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      }
    });

    setFilteredFiles(sorted);
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleImagePress = (file: IFileMetadata) => {
    setSelectedImage(file);
    setModalVisible(true);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedImage) return;
    
    const currentIndex = filteredFiles.findIndex(file => file.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredFiles.length - 1;
    } else {
      newIndex = currentIndex < filteredFiles.length - 1 ? currentIndex + 1 : 0;
    }
    
    setSelectedImage(filteredFiles[newIndex]);
  };

  // Update to handle tag input change for specific file
  const handleTagInputChange = (fileId: string, text: string) => {
    setTagInputs(prev => ({
      ...prev,
      [fileId]: text
    }));
  };

  // New function to send updated tags to the API
  const updateTagsOnServer = (fileId: string, tags: string[]) => {
    // Convert tags array to comma-delimited string
    const tagsString = tags.join(',');
    
    // Send update to the server
    fetch(`https://${apiPrefix}.${serverUrl}/updateTags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sepricloud-api-key': apiKey
      },
      body: JSON.stringify({
        id: fileId,
        tags: tagsString
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update tags');
      }
      console.log('Tags updated successfully');
    })
    .catch(error => {
      console.error('Error updating tags:', error);
      // Optional: Implement error handling UI feedback here
    });
  };

  const addTag = (fileId: string) => {
    const tagToAdd = tagInputs[fileId];
    if (!tagToAdd || !tagToAdd.trim()) return;
    
    const updatedFiles = filesMetadata.map(file => {
      if (file.id === fileId) {
        const newTags = [...(file.tags || []), tagToAdd.trim()];
        
        // Send updated tags to server
        updateTagsOnServer(fileId, newTags);
        
        return { ...file, tags: newTags };
      }
      return file;
    });
    
    setFilesMetadata(updatedFiles);
    sortAndFilterFiles(updatedFiles, sortField, sortOrder, searchQuery);
    
    // Reset only the specific tag input that was used
    setTagInputs(prev => ({
      ...prev,
      [fileId]: ''
    }));
  };

  const removeTag = (fileId: string, tagToRemove: string) => {
    const updatedFiles = filesMetadata.map(file => {
      if (file.id === fileId && file.tags) {
        const newTags = file.tags.filter(tag => tag !== tagToRemove);
        
        // Send updated tags to server
        updateTagsOnServer(fileId, newTags);
        
        return { ...file, tags: newTags };
      }
      return file;
    });
    
    setFilesMetadata(updatedFiles);
    sortAndFilterFiles(updatedFiles, sortField, sortOrder, searchQuery);
  };

  // Update the modal to handle tag management for the selected image
  const addTagToSelectedImage = () => {
    if (!selectedImage || !tagInputs[selectedImage.id]) return;
    
    addTag(selectedImage.id);
    
    // Update the selected image state to reflect the change
    if (selectedImage) {
      const updatedFile = filesMetadata.find(file => file.id === selectedImage.id);
      if (updatedFile) {
        setSelectedImage(updatedFile);
      }
    }
  };

  const removeTagFromSelectedImage = (tagToRemove: string) => {
    if (!selectedImage) return;
    
    removeTag(selectedImage.id, tagToRemove);
    
    // Update the selected image state to reflect the change
    const updatedFile = filesMetadata.find(file => file.id === selectedImage.id);
    if (updatedFile) {
      setSelectedImage(updatedFile);
    }
  };

  const renderImageModal = () => (
    <Modal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => setModalVisible(false)}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        
        {selectedImage && (
          <View style={styles.modalContent}>
            {/* Using the preloaded image URI instead of fetching again */}
            <FastImage
              source={{
                uri: selectedImage.imageUri,
                priority: FastImage.priority.normal,
                }}
              style={styles.modalImage}
              resizeMode={FastImage.resizeMode.contain}
            />
            
            <View style={styles.imageInfo}>
              <Text style={styles.modalText}>Added by: {selectedImage.added_by}</Text>
              <Text style={styles.modalText}>
                {new Date(selectedImage.datetime_added).toLocaleString('en-IE', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                  weekday: 'long'
                })}
              </Text>
              
              <View style={styles.tagContainer}>
                <Text style={styles.tagLabel}>Tags:</Text>
                <View style={styles.tagList}>
                  {selectedImage.tags && selectedImage.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
            
            <View style={styles.navigationButtons}>
              <TouchableOpacity 
                style={styles.navButton} 
                onPress={() => navigateImage('prev')}
              >
                <Text style={styles.navButtonText}>Previous</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.navButton} 
                onPress={() => navigateImage('next')}
              >
                <Text style={styles.navButtonText}>Next</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );

  return user ? (
    <View style={styles.mainContainer}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by tags..."
          placeholderTextColor="#666" // Darker placeholder text
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      
      {/* Sort Controls with Label */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <TouchableOpacity 
          style={[
            styles.sortButton, 
            sortField === 'added_by' && styles.activeSortButton
          ]} 
          onPress={() => toggleSort('added_by')}
        >
          <Text style={[
            styles.sortButtonText,
            sortField === 'added_by' && styles.activeSortButtonText
          ]}>
            Added by {sortField === 'added_by' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.sortButton, 
            sortField === 'datetime_added' && styles.activeSortButton
          ]} 
          onPress={() => toggleSort('datetime_added')}
        >
          <Text style={[
            styles.sortButtonText,
            sortField === 'datetime_added' && styles.activeSortButtonText
          ]}>
            Timestamp {sortField === 'datetime_added' && (sortOrder === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Image List */}
      <FlatList
        data={filteredFiles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.fileContainer}>
            {/* Image (Left Side) - Using preloaded imageUri */}
            <TouchableOpacity 
              style={styles.imageContainer}
              onPress={() => handleImagePress(item)}
            >
              <FastImage
                source={{
                    uri: item.imageUri,
                    priority: FastImage.priority.normal,
                }}
                style={styles.image}
              />
            </TouchableOpacity>
            
            {/* Details (Right Side) */}
            <View style={styles.detailsContainer}>
              <Text style={styles.detailText}>Added by: {item.added_by}</Text>
              <Text style={styles.detailText}>
                {new Date(item.datetime_added).toLocaleString('en-IE', {
                  year: 'numeric',
                  month: 'long',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
              
              {/* Tags Section */}
              <View style={styles.tagsSection}>
                <Text style={styles.tagsLabel}>Tags:</Text>
                <View style={styles.tagsList}>
                  {item.tags && item.tags.map((tag, index) => (
                    <View key={index} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                      <TouchableOpacity onPress={() => removeTag(item.id, tag)}>
                        <Text style={styles.removeTagText}> ×</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                <View style={styles.addTagContainer}>
                  <TextInput
                    style={styles.tagInput}
                    placeholder="Add tag..."
                    placeholderTextColor="#666" // Darker placeholder text
                    value={tagInputs[item.id] || ''}
                    onChangeText={(text) => handleTagInputChange(item.id, text)}
                    onSubmitEditing={() => addTag(item.id)}
                  />
                  <TouchableOpacity 
                    style={styles.addTagButton} 
                    onPress={() => addTag(item.id)}
                  >
                    <Text style={styles.addTagButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {isLoading ? "Loading images..." : "No images found"}
            </Text>
          </View>
        }
      />
      
      {renderImageModal()}
    </View>
  ) : (
    <View style={styles.container} >
      <Link href='/(tabs)'>Log in to view this tab</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  searchContainer: {
    padding: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    color: '#333', // Make sure text color is dark for better readability
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start', // Changed from space-around to align label with buttons
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginRight: 12,
  },
  sortButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    minWidth: 120,
    alignItems: 'center',
    marginRight: 8, // Add spacing between buttons
  },
  activeSortButton: {
    backgroundColor: '#007bff',
  },
  sortButtonText: {
    fontWeight: '500',
    color: '#333',
  },
  activeSortButtonText: {
    color: '#fff',
  },
  listContainer: {
    padding: 10,
  },
  fileContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  imageContainer: {
    width: '50%',
  },
  image: {
    width: '100%',
    height: 200,
  },
  detailsContainer: {
    width: '50%',
    padding: 12,
    justifyContent: 'flex-start',
  },
  detailText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  tagsSection: {
    marginTop: 10,
  },
  tagsLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    flexDirection: 'row',
    backgroundColor: '#e1f5fe',
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
    margin: 2,
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    color: '#0277bd',
  },
  removeTagText: {
    fontSize: 18,
    color: '#e57373',
    fontWeight: 'bold',
  },
  addTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  tagInput: {
    flex: 1,
    height: 30,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 12,
    marginRight: 4,
    color: '#333', // Ensure text is dark
  },
  addTagButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  addTagButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalImage: {
    width: '100%',
    height: '70%',
  },
  imageInfo: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
  },
  modalText: {
    color: '#fff',
    marginBottom: 5,
  },
  tagContainer: {
    marginTop: 10,
  },
  tagLabel: {
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  modalAddTagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  modalTagInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 4,
    paddingHorizontal: 8,
    fontSize: 14,
    marginRight: 8,
    color: '#fff',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalAddTagButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  modalAddTagButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    bottom: 40,
    paddingHorizontal: 20,
  },
  navButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: 120,
    alignItems: 'center',
  },
  navButtonText: {
    color: '#fff',
    fontWeight: '500',
  }
});
