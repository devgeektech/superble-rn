'use strict';
import React from 'react';
import {AsyncStorage} from 'react-native';


class DeviceStorage {

  static get(key) {
    //console.log('inisde'+key);
    return AsyncStorage.getItem(key);
  }

  static save(key, value) {
      //console.log(value+' save1 '+JSON.stringify(value));
    return AsyncStorage.setItem(key, JSON.stringify(value));
  }

  static update(key, value) {
    return deviceStorage.get(key).then((item) => {
      value = typeof value === 'string' ? value : Object.assign({}, item, value);
      return AsyncStorage.setItem(key, JSON.stringify(value));
    });
  }

  static delete(key) {
    return AsyncStorage.removeItem(key);
  }
  static clearAll(){
    return AsyncStorage.clear();
  }
}

export {DeviceStorage};
