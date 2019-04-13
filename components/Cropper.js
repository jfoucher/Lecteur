import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import PropTypes from 'prop-types';

import DragButton from './DragButton.js'

export default class Cropper extends Component {
  constructor() {
    super();
    this.state = {
      height: 0,
      width: 0,
    }
    this.layoutChanged = this.layoutChanged.bind(this);
  }

  layoutChanged(event) {
    this.props.onLayout(event)
    const {x, y, width, height} = event.nativeEvent.layout;
    this.setState({x, y, width, height});
  }

    render() {
      const { anchor, position } = this.props;
        return (
          <View style={this.props.style} onLayout={this.layoutChanged}>
          
          <ScrollView
            minimumZoomScale={0.1} bottomRight
            maximumZoomScale={5}
            contentContainerStyle={styles.scroll}
          >
            <Image
              ref={view => { this.imageDisplay = view; }}
              source={{uri: 'data:image/png;base64,'+this.props.picture.base64}}
              style={{width: this.props.picture.width, height: this.props.picture.height}}
            />
          </ScrollView>
          <View style={[styles.cover, {
              top: 0,
              left: 0,
              right: 0,
              bottom: this.state.height - position.y1,
            }]}></View>
            <View style={[styles.cover, {
              top: position.y1,
              left: 0,
              right: this.state.width - position.x1,
              bottom: 0 ,
            }]}>
            </View>
            <DragButton style={{ top: position.y1 - 20, left: position.x1 - 20 }} moved={this.props.moved} done={this.props.done} />

            <View style={[styles.cover, {
              top: position.y2,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,255,0.5)',
            }]}></View>
            <View style={[styles.cover, {
              top: 0,
              left: position.x2,
              right: 0,
              bottom: this.state.height - position.y2,
              backgroundColor: 'rgba(0,0,255,0.5)',
            }]}>
            </View>
            <DragButton style={{ backgroundColor: 'rgba(0,0,255,1)',top: position.y2 - 20, left: position.x2 - 20}} moved={this.props.moved2} done={this.props.done2} />
        </View>
            

        );
    }
}

Cropper.propTypes = {
  style: PropTypes.object.isRequired,
  picture: PropTypes.object.isRequired,
  onLayout: PropTypes.func.isRequired,
  done: PropTypes.func.isRequired,
  moved: PropTypes.func.isRequired,
  done2: PropTypes.func.isRequired,
  moved2: PropTypes.func.isRequired,
  position: PropTypes.shape({
    x1: PropTypes.number.isRequired,
    y1: PropTypes.number.isRequired,
    x2: PropTypes.number.isRequired,
    y2: PropTypes.number.isRequired,
  }).isRequired,
}

const styles = StyleSheet.create({
  cover: {
    zIndex: 5,
    backgroundColor:'rgba(128,128,128,0.5)',
    position: 'absolute',
  },
  scroll: {
    flex:1,
    width: '100%',
    backgroundColor: '#ccc',
    zIndex: 3,
  },
});
