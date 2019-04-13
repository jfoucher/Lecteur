import React, {Component} from 'react';
import {
  View,
  PanResponder,
  StyleSheet,
} from 'react-native';

export default class DragButton extends Component {
    constructor(props) {
        super(props);
        this._panResponder = PanResponder.create({
          // Ask to be the responder:
          onStartShouldSetPanResponder: (evt, gestureState) => true,
          onStartShouldSetPanResponderCapture: (evt, gestureState) => true,
          onMoveShouldSetPanResponder: (evt, gestureState) => true,
          onMoveShouldSetPanResponderCapture: (evt, gestureState) => true,
    
          onPanResponderGrant: (evt, gestureState) => {
          },
          onPanResponderMove: (evt, gestureState) => {
            props.moved(gestureState)
          },
          onPanResponderTerminationRequest: (evt, gestureState) => true,
          onPanResponderRelease: (evt, gestureState) => {
            props.done(gestureState)
          },
        });
    }

    render() {
        return <View {...this._panResponder.panHandlers} style={[this.props.style, styles.button ]} />;
    }
}


const styles = StyleSheet.create({
  button: {
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: '#d6d7da',
    height: 60,
    width: 60,
    position: 'absolute',
    zIndex: 6,
  },
});
