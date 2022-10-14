import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  Modal,
  Alert,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';
import UIStepper from 'react-native-ui-stepper';
import {useNavigation} from '@react-navigation/native';

const index = data => {
  const [prescriptionData, setprescriptionData] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    if (prescriptionData.length === 0) {
      const apiCall = setTimeout(() => getPrescriptionData(), 5000);
      return () => clearTimeout(apiCall);
    }
  });

  const setValue = (value, index) => {
    console.log('value------>', value);
    console.log('index------>', index);
  };

  const getPrescriptionData = async () => {
    try {
      let prescriptionDetails = await fetch(
        `https://7jhep8vc79.execute-api.us-east-1.amazonaws.com/getMedicinesDetails?username=${data}`,
        // `https://7jhep8vc79.execute-api.us-east-1.amazonaws.com/getMedicinesDetails${payload.receiptId}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
        .then(response => {
          const js = response.json();
          return js;
        })
        .catch(error => {
          return error;
        });

      const arrayList =
        prescriptionDetails.medicines.length > 0
          ? prescriptionDetails.medicines
          : [];
      setprescriptionData(arrayList);
      console.log('prescriptionDetails', prescriptionDetails);
      return prescriptionDetails;
    } catch (error) {
      return error;
    }
  };

  const ListEmptyComponent = () => {
    return (
      <Modal
        visible={prescriptionData.length === 0 ? true : false}
        transparent={true}
        animationType={'slide'}>
        <View style={styles.waitingView}>
          <Text style={styles.waitingText}>Processing...</Text>
          <Image
            source={require('../assets/loadinggif.gif')}
            style={{width: 200, height: 200}}
            resizeMode="cover"
          />
        </View>
      </Modal>
    );
  };

  const purchase = () => {
    Alert.alert(
      'Purchased successfully',
      'Your purchased transaction details sent to your email',
      [{text: 'OK', onPress: () => navigation.navigate('Home')}],
    );
  };
  const renderItem = ({item, index}) => {
    return (
      <View style={styles.itemCell}>
        <View style={styles.itemCellView}>
          <Text>{item}</Text>
          <UIStepper
            onValueChange={value => setValue(value, index)}
            initialValue={1}
            minimumValue={1}
            maximumValue={10}
            tintColor={'indigo'}
            borderColor={'indigo'}
            borderRadius={35}
            height={35}
            width={100}
            borderWidth={2}
            displayValue={true}
            textColor={'green'}
            onMinimumReached={() => alert('Reached Minimum value')}
            onMaximumReached={() => alert('Reached Maximum value')}
          />
        </View>
        {/* <View style={styles.divider} /> */}
      </View>
    );
  };
  return (
    <View style={styles.mainView}>
      {/* <Text>Prescription Screen</Text> */}
      <FlatList
        renderItem={renderItem}
        data={prescriptionData}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={ListEmptyComponent}
      />
      <View style={styles.buttonView}>
        <TouchableOpacity
          style={styles.commandButton}
          onPress={() => purchase()}>
          <Text style={styles.panelButtonTitle}>Purchase</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default index;

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    padding: 2,
  },
  buttonView: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  commandButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FF6347',
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  item: {
    backgroundColor: '#f5f520',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  divider: {
    borderBottomColor: '#000',
    borderBottomWidth: 1,
  },
  itemCellView: {
    flex: 1,
    height: 51,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#D3D3D3',
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 6,
    shadowOpacity: 0.26,
    elevation: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    flexDirection: 'row',
  },
  itemCell: {paddingTop: 10},
  mainView: {flex: 1, padding: 20},
  waitingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {fontSize: 50},
  activityIndicatorWrapper: {
    backgroundColor: '#D3D3D3',
    height: 100,
    width: 100,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
