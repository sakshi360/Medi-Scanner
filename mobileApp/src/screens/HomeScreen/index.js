import React, {useState} from 'react';
import {
  Platform,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import BottomSheet from 'reanimated-bottom-sheet';
import Animated from 'react-native-reanimated';
import ImagePicker from 'react-native-image-crop-picker';
import ViewShot, {captureScreen} from 'react-native-view-shot';
import RNFetchBlob from 'react-native-fetch-blob';
import moment from 'moment';
import Amplify, {Storage} from 'aws-amplify';
import {RNS3} from 'react-native-aws3';
import {useNavigation} from '@react-navigation/native';

const index = () => {
  const [image, setImage] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [progressText, setProgressText] = useState('');
  const [progressPerc, setProgressPerc] = useState('');
  const [isLoading, setisLoading] = useState(false);
  const bs = React.createRef();
  fall = new Animated.Value(1);
  const refs = React.createRef();
  const navigation = useNavigation();

  // const fetchResourceFromURI = async uri => {
  //   const response = await fetch(uri);
  //   console.log('RESPNSE----->12', response);
  //   const blob = await response.blob();
  //   return blob;
  // };
  const onSubmitPressed = data => {
    console.log(data);
    setNewImage(null);
    setProgressText('');
    setProgressPerc('');
    navigation.navigate('Prescription', {data: 'Manas'});
  };

  const randomCharac = () => {
    var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    var charactersLength = characters.length;

    for (var i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    console.log('result----->', result);
    return result;
  };

  const takeScreenShot = () => {
    if (image == null) {
      alert(
        'Please click on above image to choose prescription from camera / gallery',
      );
      return;
    }
    // To capture Screenshot of whole screen
    // captureScreen({
    //   // Either png or jpg (or webm Android Only), Defaults: png
    //   format: 'jpg',
    //   // Quality 0.0 - 1.0 (only available for jpg)
    //   quality: 0.8,
    // }).then(
    //   //callback function to get the result URL of the screnshot
    //   uri => {
    //     setNewImage(uri);
    //   },
    //   error => console.error('Oops, Something Went Wrong', error),
    // );
    if (isLoading) return;
    setisLoading(true);
    // To capture particular view
    refs.current.capture().then(
      async uri => {
        console.log('do something with ', uri);
        setNewImage(uri);
        return RNS3.put(
          {
            // `uri` can also be a file system path (i.e. file://)
            uri: uri,
            name: `${randomCharac()}.png`,
            type: '.png',
          },
          {
            //  keyPrefix: '**Your Key Prefix**', // Ex. myuploads/
            bucket: '**Your bucket name **',
            region: 'us-east-1',
            accessKey: '**Your access key **',
            secretKey: '**Your secret Key **',
            successActionStatus: 201,
          },
        )
          .progress(progress =>
            setProgressText(
              `Uploading: ${Math.round(
                (progress.loaded / progress.total) * 100,
              )} %`,
              setProgressPerc(
                `${Math.round((progress.loaded / progress.total) * 100)} %`,
              ),
            ),
          )
          .then(response => {
            console.log('RESP------>', response);
            setImage(null);
            setisLoading(false);
            // let {bucket, etag, key, location} = response.body.postResponse;
            setProgressText(`Uploaded Successfully`);
            onSubmitPressed(response);
          })
          .catch(err => {
            setProgressText('Upload Error');
            setisLoading(false);
            console.log('ERROR------->', err);
          });
        // const img = await fetchResourceFromURI(uri);
        // return Storage.put(uri, img, {
        //   level: 'private',
        //   contentType: 'png',
        //   progressCallback(uploadProgress) {
        // setProgressText(
        //   `Progress: ${Math.round(
        //     (uploadProgress.loaded / uploadProgress.total) * 100,
        //   )} %`,
        // );
        //     console.log(
        //       `Progress: ${uploadProgress.loaded}/${uploadProgress.total}`,
        //     );
        //   },
        // })
        //   .then(res => {
        //     setProgressText('Upload Done: 100%');
        //     setImage(null);
        //     // setNewImage(null)
        //     setisLoading(false);
        //     Storage.get(res.key)
        //       .then(result => console.log('RESULT------->', result))
        //       .catch(err => {
        //         setProgressText('Upload Error');
        //         console.log(err);
        //       });
        //   })
        //   .catch(err => {
        //     setisLoading(false);
        //     setProgressText('Upload Error');
        //     console.log('ERROR------->', err);
        //   });
        // const imageBase64 = 'data:image/jpg;base64,' + uri;
        // const url =
        //   'https://3wqrt1h390.execute-api.us-east-1.amazonaws.com/prescriptionIngestor/upload';
        // return fetch(url, {
        //   method: 'POST',
        //   headers: {
        //     Accept: 'application/json',
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     img: imageBase64,
        //   }),
        // })
        //   .then(resp => {
        //     console.log('RESPONSE ------->', resp);
        //   })
        //   .catch(error => {
        //     console.warn('ERROR------->', error);
        //   });
        // RNFetchBlob.fetch(
        //   'POST',
        //   'https://3wqrt1h390.execute-api.us-east-1.amazonaws.com/prescriptionIngestor/upload',
        //   {
        //     Accept: 'application/json',
        //     'Content-Type': 'application/json',
        //   },
        //   [
        //     // element with property `filename` will be transformed into `file` in form data
        //     // {name: 'avatar', filename: 'avatar.png', data: binaryDataInBase64},
        //     {
        //       name: 'avatar',
        //       filename: 'avatar.png',
        //       data: JSON.stringify({
        //         path: uri,
        //       }),
        //     },
        //   ],
        // )
        //   .then(resp => {
        //     console.log(resp);
        //   })
        //   .catch(err => {
        //     console.log('ERROR:', err);
        //   });
        // const formData = new FormData();
        // formData.append('file', {
        //   uri: uri,
        //   type: 'jpg',
        //   name: 'avater.jpg',
        // });
        // let res = fetch(
        //   'https://3wqrt1h390.execute-api.us-east-1.amazonaws.com/prescriptionIngestor/upload',
        //   {
        //     method: 'post',
        //     body: formData,
        //     headers: {
        //       'Content-Type': 'multipart/form-data',
        //     },
        //   },
        // )
        //   .then(resp => {
        //     console.log('responseJson------->', resp);
        //   })
        //   .catch(err => {
        //     console.log('ERROR:', err);
        //   });
        // RNFetchBlob.fs.readFile(uri, 'base64').then(base64data => {
        //   console.log('base64data---------->', base64data);
        //   RNFetchBlob.fetch(
        //     'POST',
        //     'https://3wqrt1h390.execute-api.us-east-1.amazonaws.com/prescriptionIngestor/upload',
        //     {
        //       Authorization: 'Bearer access-token',
        //       'Content-Type': 'multipart/form-data',
        //     },
        //     [
        //       // element with property `filename` will be transformed into `file` in form data
        //       // {name: 'avatar', filename: 'avatar.png', data: binaryDataInBase64},
        //       {
        //         name: 'avatar',
        //         filename: 'avatar.png',
        //         data: JSON.stringify({
        //           path: base64data,
        //         }),
        //       },
        //     ],
        //   )
        // .then(resp => {
        //   console.log(resp);
        // })
        // .catch(err => {
        //   console.log('ERROR:', err);
        // });
        // });
      },
      error => console.error('Oops, Something Went Wrong', error),
    );
  };
  const takePhotoFromCamera = () => {
    console.warn('Take Photo');
    ImagePicker.openCamera({
      width: 300,
      height: 300,
      cropping: true,
      includeBase64: true,
    }).then(image => {
      // getting image in normal path and base64
      // console.log('image', image);
      setImage(image.path);
      bs.current.snapTo(1);
    });
  };
  const chooseFromLibrary = () => {
    console.warn('Choose From library');
    ImagePicker.openPicker({
      width: 300,
      height: 500,
      cropping: false,
      includeBase64: true,
    }).then(image => {
      // getting image in normal path and base64
      // console.log('image', image);
      bs.current.snapTo(1);
      setImage(image.path);
    });
  };
  renderInner = () => (
    <View style={styles.panel}>
      <View style={styles.panelHeaderView}>
        <Text style={styles.panelTitle}>Upload Photo</Text>
        <Text style={styles.panelSubtitle}>Choose Your Profile Picture</Text>
      </View>
      <TouchableOpacity
        style={styles.panelButton}
        onPress={takePhotoFromCamera}>
        <Text style={styles.panelButtonTitle}>Take Photo</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.panelButton} onPress={chooseFromLibrary}>
        <Text style={styles.panelButtonTitle}>Choose From Library</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.panelButton}
        onPress={() => bs.current.snapTo(1)}>
        <Text style={styles.panelButtonTitle}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
  renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.panelHeader}>
        <View style={styles.panelHandle} />
      </View>
    </View>
  );
  const dateFormat = () => {
    return moment().format();
  };
  const imageDt = () => {
    if (image != null) {
      return <Image source={{uri: image}} style={styles.imageDimension} />;
    } else {
      return (
        <View style={{justifyContent: 'center', alignItems: 'center'}}>
          <Image
            source={require('../assets/homeLogo.png')}
            style={[styles.imageDimension, styles.imageBorderRadius]}
          />
          <Text>Click here to upload prescription</Text>
        </View>
      );
    }
  };
  const newImageDt = () => {
    if (newImage != null) {
      return (
        <Image
          source={{uri: newImage}}
          style={styles.newImageStyles}
          resizeMode="contain"
        />
      );
    }
  };
  return (
    <View style={styles.container}>
      <BottomSheet
        ref={bs}
        snapPoints={[330, 0]}
        renderContent={this.renderInner}
        renderHeader={this.renderHeader}
        initialSnap={1}
        callbackNode={this.fall}
        enabledGestureInteraction={true}
      />
      <Animated.View
        style={[
          styles.animatedView,
          {opacity: Animated.add(0.1, Animated.multiply(this.fall, 1.0))},
        ]}>
        <TouchableOpacity
          onPress={() => {
            bs.current.snapTo(0);
            setNewImage(null);
            setProgressText('');
            setProgressPerc('');
          }}
          style={styles.imageView}>
          <ViewShot
            ref={refs}
            options={{format: 'png', quality: 1.0}}
            style={styles.viewShotView}>
            <Text style={styles.text}>Manas</Text>
            <Text style={styles.text}>{dateFormat()}</Text>
            {imageDt()}
          </ViewShot>
        </TouchableOpacity>
        <View style={styles.newImageView}>{newImageDt()}</View>
        <TouchableOpacity
          style={styles.commandButton}
          onPress={() => takeScreenShot()}>
          <Text style={styles.panelButtonTitle}>Submit</Text>
        </TouchableOpacity>
        {/* <Text>{progressText}</Text> */}
      </Animated.View>
      <Modal visible={isLoading} transparent={true} animationType={'none'}>
        <View style={styles.modalBackground}>
          <View style={styles.activityIndicatorWrapper}>
            <ActivityIndicator animating={isLoading} size="large" />
            <Text>{progressPerc}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  text: {backgroundColor: '#fff'},
  commandButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FF6347',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    left: Dimensions.get('window').width / 4,
    width: 200,
  },
  panel: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
  },
  header: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#333333',
    shadowOffset: {width: -1, height: -3},
    shadowRadius: 2,
    shadowOpacity: 0.4,
    paddingTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 40,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
  panelHeaderView: {alignItems: 'center'},
  panelTitle: {
    fontSize: 27,
    height: 35,
  },
  panelSubtitle: {
    fontSize: 14,
    color: 'gray',
    height: 30,
    marginBottom: 10,
  },
  panelButton: {
    padding: 13,
    borderRadius: 10,
    backgroundColor: '#FF6347',
    alignItems: 'center',
    marginVertical: 7,
  },
  panelButtonTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'white',
  },
  imageDimension: {
    width: 250,
    height: 250,
    borderColor: '#000',
  },
  imageBorderRadius: {borderRadius: 125},
  newImageStyles: {
    width: 300,
    height: 350,
    borderColor: '#000',
  },
  animatedView: {
    flex: 1,
  },
  imageView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  viewShotView: {justifyContent: 'center', alignItems: 'center'},
  newImageView: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040',
  },
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
export default index;
