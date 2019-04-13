import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    Image,
} from 'react-native';
import PropTypes from 'prop-types';

export default class CroppedImage extends Component {
    render() {
        const { image } = this.props;
        return (
            <View style={styles.text}>
                <Image source={{uri: image.uri}} style={{width: image.width, height: image.height}} />
            </View>
        );
    }
}

CroppedImage.propTypes = {
    image: PropTypes.object.isRequired,
}
  
const styles = StyleSheet.create({
    text: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  