/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, Button, Image, ScrollView, ImageEditor, ImageStore, PixelRatio, TouchableHighlight} from 'react-native';

import { RNCamera } from 'react-native-camera';
import Tts from 'react-native-tts';
import RNTextDetector from 'react-native-text-detector';
import { white } from 'ansi-colors';
import DragButton from './components/DragButton.js'
import StatusBarBackground from './components/StatusBarBackground.js'

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {

  constructor() {
    super()
    this.state = {
      text: '',
      takingPicture: false,
      buttonText: 'Photo',
      picture: null,
      processing: false,
      topCrop: 10,
      leftCrop: 10,
      bottomCrop: 10,
      rightCrop: 10,
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
  }

  moved(gestureState) {
    this.setState({leftCrop: gestureState.moveX, topCrop: gestureState.moveY - 20, scrollEnabled: false})
  }

  done(gestureState) {
    this.setState({leftCrop: gestureState.moveX, topCrop: gestureState.moveY - 20, scrollEnabled: true})
  }
  moved2(gestureState) {
    this.setState({rightCrop: this.state.width - gestureState.moveX, bottomCrop: this.state.height - gestureState.moveY + 20, scrollEnabled: false})
  }

  done2(gestureState) {
    this.setState({rightCrop: this.state.width - gestureState.moveX, bottomCrop: this.state.height - gestureState.moveY + 20, scrollEnabled: true})
  }

  render() {
    let mainView = null
    
    if (this.state.picture && this.state.picture.uri) {
      mainView = <View style={styles.main} onLayout={(event) => {
        const {x, y, width, height} = event.nativeEvent.layout;
        this.setState({x, y, width, height});
      }}>
      <View style={{zIndex: 5, backgroundColor:'rgba(128,128,128,0.5)', position: 'absolute', top: 0, left: 0, right:0, bottom: this.state.height - this.state.topCrop}}></View>
      <View style={{zIndex: 5, backgroundColor:'rgba(128,128,128,0.5)', position: 'absolute', top: this.state.topCrop, left: 0, right:this.state.width - this.state.leftCrop, bottom: 0}}>
      </View>
        <DragButton style={{borderRadius: 20, borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: '#d6d7da', height: 60, width: 60, position: 'absolute', top: this.state.topCrop - 30, left: this.state.leftCrop - 30, zIndex: 6}} moved={this.moved} done={this.done} />


      <View style={{zIndex: 5, backgroundColor:'rgba(128,128,128,0.5)', position: 'absolute', top: this.state.height - this.state.bottomCrop, left: 0, right:0, bottom: 0}}></View>
      <View style={{zIndex: 5, backgroundColor:'rgba(128,128,128,0.5)', position: 'absolute', top: 0, left: this.state.width - this.state.rightCrop, right:0, bottom: this.state.bottomCrop}}>
      </View>
        <DragButton style={{borderRadius: 20, borderWidth: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderColor: '#d6d7da', height: 60, width: 60, position: 'absolute', top: this.state.height - this.state.bottomCrop - 30, left: this.state.width - this.state.rightCrop - 30, zIndex: 6}} moved={this.moved2} done={this.done2} />
        <ScrollView
          minimumZoomScale={0.1} 
          maximumZoomScale={5}
          contentContainerStyle={styles.scroll}
 
        >
          <Image
            ref={view => { this.imageDisplay = view; }}
            source={{uri: 'data:image/png;base64,'+this.state.picture.base64}}
            style={{width: this.state.picture.width, height: this.state.picture.height}}
          />
        </ScrollView>
      </View>
    }

    if (this.state.processing) {
      mainView = <View style={styles.main}><View style={styles.text}><Text style={{fontSize: 20}}>Analyse en cours</Text></View></View>
    }
    if (this.state.croppedImage || this.state.text) {
      mainView = <View style={styles.main}>
      <View style={styles.text}>
      {this.state.croppedImage ? <Image source={{uri: this.state.croppedImage.uri}} style={{width: this.state.croppedImage.width, height: this.state.croppedImage.height}} /> : null}
      {this.state.text.length > 0 ? <Text style={{marginTop: 10}}>{this.state.text}</Text> : null}
      </View>
      </View>
    }

    return (
      <View style={styles.container} scrollEnabled={false}>
      <StatusBarBackground style={{backgroundColor:'rgba(255,255,0, 0.5)'}}/>
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
        <View style={{ flex: 0, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-evenly' }}>
          <TouchableHighlight onPress={this.takePicture.bind(this)} underlayColor="white">
            <View style={styles.button}>
              <Text style={styles.buttonText}>{this.state.buttonText}</Text>
            </View>
          </TouchableHighlight>
        </View>
      </View>
    );
  }

  componentWillUnmount() {
    ImageStore.removeImageForTag(this.state.croppedImage)
  }

  takePicture = async function() {
    if (this.state.text) {
      this.setState({text: '', croppedImage: null, buttonText: 'Photo'})
      this.camera.resumePreview()
      return
    }
    if (this.state.picture) {
      this.imageDisplay.measure( async (fx, fy, width, height, px, py) => {
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
  scroll: {
    flex:1,
    width: '100%',
    backgroundColor: '#ccc',
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
  button: {
    borderRadius: 3,
    marginBottom: 10,
    marginTop: 10,
    alignItems: 'center',
    backgroundColor: '#2196F3'
  },
  buttonText: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 80,
    paddingRight: 80,
    color: 'white'
  }
});
