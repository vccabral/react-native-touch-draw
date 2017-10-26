import React, { Component } from 'react';
import { 
  View, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import { 
  Constants, 
  GLView 
} from 'expo';
import Expo from 'expo';
import REGL from 'regl';
import DrawableView from './index';

console.disableYellowBox = true;

export default class TestApp extends Component {
  render() {
    return (
      <View style={{flex:1}}>
        <DrawableView
          style={{flex: 1, backgroundColor: "transparent"}}
        /> 
      </View>  
    );
  }
}

