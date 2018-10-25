import React from 'react';
import DeviceInfo from 'react-native-device-info';
import { api } from './api';

export const config = {
  headers: { 'Content-Type': 'application/json' }
};
export function getApi() {
  return 'http://c25.add.myftpupload.com/webservice/';
}
export function getDetails(url) {
  return api.get(url).
    then((response) => response);
}
export function getPostLogin(url, data, headers) {
  return api.post(url, data);
}
export function fetchData(url, data, headers) {
  return fetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  ).then(response => response.json()).then(data => data);
}

export function getDeviceInfo() {
  return DeviceInfo.getUniqueID();
}
export function getIsTablet() {
  return DeviceInfo.isTablet();
}
