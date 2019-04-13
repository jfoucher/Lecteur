import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Image, ScrollView, ImageEditor, ImageStore, PixelRatio, TouchableHighlight} from 'react-native';

import { RNCamera } from 'react-native-camera';
import Tts from 'react-native-tts';
import RNTextDetector from 'react-native-text-detector';
import Cropper from './components/Cropper.js'
import CroppedImage from './components/CroppedImage.js'
import StatusBarBackground from './components/StatusBarBackground.js'
import MainButton from './components/MainButton.js';

export default class App extends Component {
  constructor() {
    super()
    this.state = {
      text: '',
      takingPicture: false,
      buttonText: 'Photo',
      picture: null,
      processing: false,
      topCrop: 40,
      leftCrop: 40,
      bottomCrop: 40,
      rightCrop: 40,
      x: 0, 
      y: 0, 
      width: 0, 
      height: 0, 
      scrollEnabled: true,
      croppedImage: null,
    }
    this.moved = this.moved.bind(this)
    this.done = this.done.bind(this)
    this.moved2 = this.moved2.bind(this)
    this.done2 = this.done2.bind(this)
    this.layoutChanged = this.layoutChanged.bind(this)
    this.takePicture = this.takePicture.bind(this)
  }

  layoutChanged(event) {
    const {x, y, width, height} = event.nativeEvent.layout;
    this.setState({x, y, width, height});
  }

  moved(gestureState) {
    if (this.state.rightCrop + gestureState.moveX > this.state.width - 50 || this.state.bottomCrop + gestureState.moveY > this.state.height) {
      return
    }
    this.setState({leftCrop: gestureState.moveX, topCrop: gestureState.moveY - 20, scrollEnabled: false})
  }

  done(gestureState) {
    if (this.state.rightCrop + gestureState.moveX > this.state.width - 50 || this.state.bottomCrop + gestureState.moveY > this.state.height) {
      return
    }
    this.setState({leftCrop: gestureState.moveX, topCrop: gestureState.moveY - 20, scrollEnabled: true})
  }
  moved2(gestureState) {
    if (gestureState.moveX - this.state.leftCrop < 50 || gestureState.moveY - this.state.topCrop < 50) {
      return
    }
    this.setState({rightCrop: this.state.width - gestureState.moveX, bottomCrop: this.state.height - gestureState.moveY + 20, scrollEnabled: false})
  }

  done2(gestureState) {
    if (gestureState.moveX - this.state.leftCrop < 50 || gestureState.moveY - this.state.topCrop < 50) {
      return
    }
    this.setState({rightCrop: this.state.width - gestureState.moveX, bottomCrop: this.state.height - gestureState.moveY + 20, scrollEnabled: true})
  }

  render() {
    let mainView = null
    if (this.state.picture && this.state.picture.uri) {
      mainView = (
          <Cropper
            ref={view => { this.cropper = view; }}
            style={styles.main}
            onLayout={this.layoutChanged}
            picture={this.state.picture}
            moved={this.moved}
            done={this.done}
            moved2={this.moved2}
            done2={this.done2}
            position={{
              x1: this.state.leftCrop,
              y1: this.state.topCrop,
              x2: this.state.width - this.state.rightCrop,
              y2: this.state.height - this.state.bottomCrop,
            }}
          />

      );
    }

    if (this.state.processing) {
      mainView = <View style={styles.main}><View style={styles.text}><Text style={{fontSize: 20}}>Analyse en cours</Text></View></View>
    }
    if (this.state.croppedImage) {
      mainView = <View style={styles.main}>
        <CroppedImage image={this.state.croppedImage} />
        { this.state.text ? <View style={styles.text}><Text>{this.state.text}</Text></View> : null }
      </View>
    }

    return (
      <View style={styles.container} scrollEnabled={false}>

        <View style={styles.block}>
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}
            permissionDialogTitle={'Permission to use camera'}
            permissionDialogMessage={'We need your permission to use your camera phone'}
          />
          
          
            
            { mainView }
            
            
        </View>
        <MainButton action={this.takePicture} text={this.state.buttonText} />
      </View>
    );
  }

  componentWillUnmount() {
    if (this.state.croppedImage) {
      ImageStore.removeImageForTag(this.state.croppedImage)
    }
  }

  takePicture = async function() {
    if (this.state.text) {
      this.setState({text: '', croppedImage: null, buttonText: 'Photo'})
      this.camera.resumePreview()
      return
    }
    if (this.state.picture) {
      this.cropper.imageDisplay.measure( async (fx, fy, width, height, px, py) => {
          const proportion = this.state.picture.width / width
          const topCrop = proportion * (-py + this.state.topCrop + 20)
          const newHeight =  proportion * (this.state.height - this.state.topCrop - this.state.bottomCrop)
          const leftCrop =  proportion * (-px + this.state.leftCrop)
          const newWidth =  proportion * (this.state.width - this.state.leftCrop - this.state.rightCrop)


          // We have the image dimensions and position, as well as the screen crop values.
          // adjust everything to real image dimensions and crop
          cropData = {
            offset:{x: leftCrop, y: topCrop}, 
            size:{width: newWidth, height: newHeight},
            // displaySize:{width:20, height:20},
            // resizeMode:'contain', 
          }
          // Crop the image. 
          try{
              await ImageEditor.cropImage(this.state.picture.uri, 
                  cropData, async (successURI) => {
                    ImageStore.getBase64ForTag(successURI, async (res) => {
                      //console.log('image data', res)
                      this.setState({croppedImage: {
                        uri: 'data:image/png;base64,'+res,
                        height: newHeight / PixelRatio.get(),
                        width: newWidth / PixelRatio.get(),
                      }})
                      this.setState({processing: true, buttonText: 'En cours'})
                      ret = await this.detectText('data:image/png;base64,'+res)
                      this.setState({buttonText: 'Nouvelle photo', picture: null, processing: false})
                      this.setState({croppedImage: {
                        uri: 'data:image/png;base64,'+res,
                        height: newHeight / PixelRatio.get(),
                        width: newWidth / PixelRatio.get(),
                      }})
                      //this.setState({croppedImage: null})
                      ImageStore.removeImageForTag(successURI)
                    }, (err) => {
                      ImageStore.removeImageForTag(successURI)
                    })
                    
                    
                    //
                  }, 
                  (error) =>{console.log('cropImage,',error)}
              )
          }
          catch(error){
          }
      })
      return
    }
    if (this.camera && this.state.picture === null) {
      const options = { width: 600, quality: 0.8, base64: true, doNotSave: false, pauseAfterCapture: true };
      this.setState({picture: null, topCrop: 40, leftCrop: 40, bottomCrop: 40, rightCrop: 40 })
      try {
        this.setState({takingPicture: true})
        const data = await this.camera.takePictureAsync(options);
        //const ret = await this.detectText(data.uri)
        this.setState({takingPicture: false, buttonText: 'Lire', picture: data})
      } catch(e) {
        this.setState({text: 'Impossible' + JSON.stringify(e), takingPicture: false, buttonText: 'Nouvelle photo'})
        this.camera.resumePreview()
      }
    }
  };

  detectText = async (uri) => {
    
    try {
      const visionResp = await RNTextDetector.detectFromUri(uri);
      if (visionResp.error) {
        this.setState({text: 'Aucun texte', picture: null})
        Tts.speak('Désolé, je n\'ai détecté aucun texte.', { iosVoiceId: 'com.apple.ttsbundle.Thomas-compact' });
        return
      }
      const hasText = visionResp.filter((item) => {
        return item.text && item.text.length > 1
      })
      if (hasText.length > 0) {
        const text = visionResp.map((item) => {
          return item.text
        }).join(' ');
        this.setState({text: text, picture: null})
        Tts.speak(text, { iosVoiceId: 'com.apple.ttsbundle.Thomas-compact' });
      } else {
        this.setState({text: 'Aucun texte', picture: null})
        Tts.speak('Désolé, je n\'ai détecté aucun texte.', { iosVoiceId: 'com.apple.ttsbundle.Thomas-compact' });
      }
      
    } catch (e) {
      this.setState({text: 'Aucun texte', picture: null})
      Tts.speak('Désolé, je n\'ai détecté aucun texte.', { iosVoiceId: 'com.apple.ttsbundle.Thomas-compact' });
    }
    
  }
}

const styles = StyleSheet.create({
  container: {
    overflow:'hidden',
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    width: '100%',
  },

  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  block: {
    position: 'relative',
    backgroundColor: 'red',
    color: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    position: 'absolute',
    backgroundColor: 'black',
    zIndex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  main: {
    position: 'absolute',
    backgroundColor: 'white',
    zIndex: 3,
    flex: 1,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  text: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  capture: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});
