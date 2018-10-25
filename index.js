import React from 'react'
import { AppRegistry } from 'react-native';
import { Provider } from 'react-redux';
import App from './App';
import appStore from './src/store/appStore';
if (!__DEV__) {
  console.log = () => {};
}
AppRegistry.registerComponent('superble', () => App);
