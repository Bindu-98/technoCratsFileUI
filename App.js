
import * as React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View, TouchableOpacity, PermissionsAndroid,Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';

function ListFiles() {
  const [data, setData] = useState([]);
  const getPosts = () => {
    fetch("http://localhost:8080/api/v1/file/get-all",{
      method:'GET',
      headers:{
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then(res => res.json())
      .then(res => {
        console.log('data', res)
        setData(res);
      }).catch(e => { console.log(e) })
  }

  useEffect(() => {
    getPosts();
  }, [])

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <FlatList
      data={data}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({item}) =>{
        return (
          <View style={styles.views} >
            <Text style={styles.text}>File Name : {item.name}</Text>
            <Text style={styles.text}>Download Item : {item.url}</Text>
            <Button title="View A File" component={item.url} color="#3ea055"/>
          </View>
        )
      }}
      />
    </View>
  );
}

function FileUpload() {
  const [singleFile, setSingleFile] = useState(null);

  const checkPermissions = async () => {
    try {
      const result = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );

      if (!result) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title:
              'You need to give storage permission to download and save the file',
            message: 'App needs access to your camera ',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the camera');
          return true;
        } else {
          Alert.alert('Error');

          console.log('Camera permission denied');
          return false;
        }
      } else {
        return true;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const uploadImage = async () => {
    const BASE_URL = 'xxxx';

    // Check if any file is selected or not
    if (singleFile != null) {
      // If file selected then create FormData
      const data = new FormData();

      data.append('file_attachment', {
        uri: singleFile.uri,
        name: singleFile.name,
        type: singleFile.mimeType,
      });

      // return
      try {
        let res = await fetch(BASE_URL + 'tutorial/upload.php', {
          method: 'post',
          body: data,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
          timeout: 5000,
        });

        let result = await res.json();
        console.log('result', result);
        if (result.status == 1) {
          Alert.alert('Info', result.msg);
        }
      } catch (error) {
        // Error retrieving data
        // Alert.alert('Error', error.message);
        console.log('error upload', error);
      }
    } else {
      // If no file selected the show alert
      Alert.alert('Please Select File first');
    }
  };

  async function selectFile() {
    try {
      const result = await checkPermissions();

      if (result) {
        const result = await DocumentPicker.getDocumentAsync({
          copyToCacheDirectory: false,
          type: 'image/*',
        });

        if (result.type === 'success') {
          // Printing the log realted to the file
          console.log('res : ' + JSON.stringify(result));
          // Setting the state to show single file attributes
          setSingleFile(result);
        }
      }
    } catch (err) {
      setSingleFile(null);
      console.warn(err);
      return false;
    }
  }

  return (
    <View style={styles.mainBody}>
      <View style={{ alignItems: 'center' }}>
        <Text
          style={{
            fontSize: 30,
            textAlign: 'center',
            marginTop: 20,
            marginBottom: 30,
          }}>
          React Native File Upload Example
        </Text>
      </View>
      {/*Showing the data of selected Single file*/}
      {singleFile != null ? (
        <Text style={styles.textStyle}>
          File Name: {singleFile.name ? singleFile.name : ''}
          {'\n'}
          Type: {singleFile.type ? singleFile.type : ''}
          {'\n'}
          File Size: {singleFile.size ? singleFile.size : ''}
          {'\n'}
          URI: {singleFile.uri ? singleFile.uri : ''}
          {'\n'}
        </Text>
      ) : null}

      <TouchableOpacity
        style={styles.buttonStyle}
        activeOpacity={0.5}
        onPress={selectFile}>
        <Text style={styles.buttonTextStyle}>Select File</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.buttonStyle}
        activeOpacity={0.5}
        onPress={uploadImage}>
        <Text style={styles.buttonTextStyle}>Upload File</Text>
      </TouchableOpacity>
    </View>
  );
}

function Welcome({ navigation }) {
  return (
   <View style={styles.container}>
     <StatusBar style="auto" />
     <Text>Welcome to Diabetese Aid Application</Text>
      <View style={styles.buttonContainer}>
        <View style={styles.buttonWrapper}>
          <Button title="List All Files" onPress={() => navigation.navigate('ListFiles')}/>
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="Upload A File" onPress={() => navigation.navigate('FileUpload')}/>
        </View>
        <View style={styles.buttonWrapper}>
          <Button title="View A File" onPress={() => navigation.navigate('ViewAFile')}/>
        </View>
        </View>
     </View>
 );
}

function ViewAFile() {
  return (
   <View style={styles.container}>
     <StatusBar style="auto" />
     <Text>Welcome to Diabetese Aid Application</Text>
   </View>
 );
}

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Welcome'>
        <Stack.Screen name="Welcome" component={Welcome} options={{ title: 'File Upload Service' }}/>
        <Stack.Screen name="ListFiles" component={ListFiles} />
        <Stack.Screen name="FileUpload" component={FileUpload} />
        <Stack.Screen name="ViewAFile" component={ViewAFile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  views:{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'left',
    backgroundColor: '#023047',
    width: '99%',
    textAlign: 'center',
    height: '200px',
    borderRadius: '16px',
    position: 'relative',
    padding:'20px',
    margin: '10px',
    
  },
  text:{
    padding: '10px',
    margin: '10px',
    textAlign: 'left',
    borderRadius: '16px',
    backgroundColor: '#8ecae6',
  },
  buttonContainer:{
    margin: '20px',
    display: 'flex'
  },
  buttonWrapper:{
    margin:'10px'
  },
  mainBody: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  buttonStyle: {
    backgroundColor: '#307ecc',
    borderWidth: 0,
    color: '#FFFFFF',
    borderColor: '#307ecc',
    height: 40,
    alignItems: 'center',
    borderRadius: 30,
    marginLeft: 35,
    marginRight: 35,
    marginTop: 15,
  },
  buttonTextStyle: {
    color: '#FFFFFF',
    paddingVertical: 10,
    fontSize: 16,
  },
  textStyle: {
    backgroundColor: '#fff',
    fontSize: 15,
    marginTop: 16,
    marginLeft: 35,
    marginRight: 35,
    textAlign: 'center',
  }
});
