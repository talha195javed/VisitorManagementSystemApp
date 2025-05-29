import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ImageBackground
} from 'react-native';

// Import background image
import BackgroundImage from '../assets/images/welcome2.webp'; // Change path if needed

const CheckOut = () => {
    const [visitorId, setVisitorId] = useState('');
    const [visitorName, setVisitorName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedVisitor, setSelectedVisitor] = useState(null);

    // API call function
    const searchVisitors = async (query, searchBy) => {
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(`http://10.0.2.2:8000/api/visitor/search_visitor?q=${query}&searchBy=${searchBy}`);
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error("Error fetching visitors:", error);
        }
    };

    // Handle Visitor ID Input
    const handleVisitorIdChange = (text) => {
        setVisitorId(text);
        if (text) {
            setVisitorName('');
        }
        searchVisitors(text, 'id');
    };

    // Handle Visitor Name Input
    const handleVisitorNameChange = (text) => {
        setVisitorName(text);
        if (text) {
            setVisitorId('');
        }
        searchVisitors(text, 'name');
    };

    // Select Visitor
    const handleSelectVisitor = (visitor) => {
        setVisitorId(visitor.id);
        setVisitorName(visitor.full_name);
        setSelectedVisitor(visitor);
        setSearchResults([]);
    };

    return (
        <ImageBackground source={BackgroundImage} style={styles.backgroundImage}>
            <View style={styles.overlay} />
            <View style={styles.container}>
                <Text style={styles.heading}>Visitor Check-Out</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Enter Visitor ID"
                    value={visitorId}
                    onChangeText={handleVisitorIdChange}
                    editable={!visitorName}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Enter Visitor Name"
                    value={visitorName}
                    onChangeText={handleVisitorNameChange}
                    editable={!visitorId}
                />

                {/* Display search results */}
                {searchResults.length > 0 && (
                    <FlatList
                        data={searchResults}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity style={styles.resultItem} onPress={() => handleSelectVisitor(item)}>
                                <Text style={styles.resultText}>{item.id} | {item.full_name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                )}

                <TouchableOpacity
                    style={[styles.checkoutButton, !selectedVisitor && styles.disabledButton]}
                    disabled={!selectedVisitor}
                >
                    <Text style={styles.buttonText}>Check Out</Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: 'cover',
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dark overlay for readability
    },
    container: {
        flex: 1,
        width: '100%',
        padding: 20,
        justifyContent: 'center',
    },
    heading: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        color: '#fff',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 15,
        marginBottom: 10,
        backgroundColor: '#fff',
    },
    resultItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: '#fff',
    },
    resultText: {
        fontSize: 16,
    },
    checkoutButton: {
        marginTop: 20,
        backgroundColor: '#dc3545',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CheckOut;
