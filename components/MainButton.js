import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    TouchableHighlight,
    Text,
} from 'react-native';

export default class MainButton extends Component {
    render() {
        return (
            <View style={styles.main}>
                <TouchableHighlight onPress={this.props.action} underlayColor="white">
                    <View style={styles.button}>
                        <Text style={styles.buttonText}>{this.props.text}</Text>
                    </View>
                </TouchableHighlight>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    main: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-evenly'
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
  