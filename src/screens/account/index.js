import React from 'react';
Spinner
import {
  Dimensions, Image, Modal, StyleSheet, Text, TouchableWithoutFeedback, View, TouchableOpacity, InteractionManager, AsyncStorage,
  TouchableHighlight, Alert, ScrollView, Switch, CameraRoll, Platform, PermissionsAndroid
} from 'react-native';
import { Button, Container, Content, Form, H1, H2, Header, Item, Input, Label, Spinner } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
import styles from './accountStyle';
import { LoginManager, LoginButton, AccessToken } from 'react-native-fbsdk';
const FBSDK = require('react-native-fbsdk');
const {
  GraphRequest,
  GraphRequestManager,
} = FBSDK;
import { GoogleSignin } from 'react-native-google-signin';
import settings from '../../../private/data/settings.json';
var ImagePicker = require('react-native-image-picker');
import Constants from '../../constants';
import axios from 'axios';
import Ins from 'react-native-instagram-login';
import Pins from '../../components/react-native-pinterest'
import UUIDGenerator from 'react-native-uuid-generator';
import { EventRegister } from 'react-native-event-listeners'

import { restoreSession, loginUserWithToken, adminToken } from '../firebase/store/session/actions'
import firebaseService from '../firebase/services/firebase';
import * as types from '../firebase/store/chat/actionTypes';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'


var DeviceId = '12345'; //Temp device id

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

class Account extends React.Component {

  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    }
  }

  componentDidMount() {
    this.setupGoogleSignin();
  }

  googleAuth() {
    this.setupGoogleSignin();
  }

  async setupGoogleSignin() {
    try {
      await GoogleSignin.hasPlayServices({ autoResolve: true });
      await GoogleSignin.configure({
        iosClientId: settings.iOSClientId,
        webClientId: settings.webClientId,
        offlineAccess: false,
        forceConsentPrompt: true
      });

      const user = await GoogleSignin.currentUserAsync();
    }
    catch (err) {
      console.log("Google signin error", err.code, err.message);
    }
  }

  _signIn() {
    GoogleSignin.signIn()
      .then((json) => {
        let timeStamp = Math.floor(Date.now() / 1000);
        let email = json.email;
        let username = json.name;
        let newusername = username.replace(/\s/g, '') + timeStamp;
        let pass = 'TechAdmin911';
        this.setState({ UName: newusername });
        this.setState({ UEmail: email });
        this.setState({ UPass: pass });
        this.setState({ isFbLogin: true });
        this.setState({ avatarSource: { uri: json.photo } });
        var reqData = {
          google_access_token: "Bearer " + json.accessToken,
          referral_code: null,
          device_id: this.state.device_id,
          notification_token: null
        }
        this.createAccount('google', reqData);
      })
      .catch((err) => {
        console.log('WRONG SIGNIN', err);
      })
      .done();
  }

  _signOut() {
    GoogleSignin.revokeAccess().then(() => GoogleSignin.signOut()).then(() => {
      this.setState({ user: null });
    })
      .done();
  }



  generateUuid() {
    UUIDGenerator.getRandomUUID().then((uuid) => {
      this.setState({ device_id: uuid });
    });
  }


  fbAuth = (type) => {
    this.loggedOutUser()
    LoginManager.logInWithReadPermissions(['public_profile', 'email', 'user_photos', 'user_friends']).then(
      (result) => {
        if (result.isCancelled) {
        } else {
          this.setState({ isDataLoad: true });
          AccessToken.getCurrentAccessToken().then((data) => {
            if (type == 'login') {
              this.initFbUser(data.accessToken);
            } else {
              this.getFBMedia(data.accessToken)
            }
          })
        }
      },
      function (error) {
        console.log('Login failed with error: ' + error);
      }
    );
  }

  initFbUser = (token) => {
    AsyncStorage.setItem('isFbSynced', JSON.stringify({ token: token }))
    fetch('https://graph.facebook.com/v2.12/me?fields=id,name,email,gender,first_name,last_name,picture.type(large),birthday,link,photos,albums&access_token=' + token)
      .then((response) => response.json())
      .then((json) => {
        let timeStamp = Math.floor(Date.now() / 1000);
        let email = json.email;
        let username = json.name;
        let newusername = username.replace(/\s/g, '') + timeStamp;
        let pass = 'TechAdmin911';
        let profilePic = json.picture.data.url
        this.setState({ UName: newusername });
        this.setState({ UEmail: email });
        this.setState({ UPass: pass });
        this.setState({ isFbLogin: true });
        this.setState({ avatarSource: profilePic });
        var reqData = {
          fb_access_token: token,
          fb_email: json.email,
          referral_code: null,
          fb_user_id: json.id,
          fb_name: json.name,
          fb_last_name: json.last_name,
          gender: json.gender,
          date_of_birth: json.dob,
          url: json.picture.data.url,
          country_name: json.country,
          device_id: this.state.device_id,
          notification_token: null
        }
        this.createAccount('facebook', reqData); // register user
      })
      .catch(() => {
        console.log('ERROR GETTING DATA FROM FACEBOOK')
      })
  }

  getFBMedia = (token) => {
    AsyncStorage.setItem('isFbSynced', JSON.stringify({ token: token }))
    fetch('https://graph.facebook.com/v2.12/me/albums?access_token=' + token)
      .then((response) => response.json())
      .then((json) => {
        var len = 0;
        var albumArr = []
        if (json.data) {
          len = json.data.length;
          albumArr = json.data;
        }
        for (var i = 0; i < len; i++) {
          const infoRequest = new GraphRequest(
            '/' + albumArr[i].id + '/photos',
            {
              accessToken: token,
              parameters: {
                fields: {
                  string: 'id,name,source'
                }
              }
            },
            this._responseInfoCallback,
          );
          new GraphRequestManager().addRequest(infoRequest).start();
        }
      })
  }

  _responseInfoCallback(error, result) {
    this.setState({ isDataLoad: false });
    if (error) {
      this.setState({ isFbMedia: false })
      console.log('facebook error', error)
    } else {
      var data = this.state.fbImages
      data = data.concat(result.data)
      this.setState({ fbImages: data })
      this.setState({ isFbMedia: true })
    }
  }

  getInstaMedia(token) {
    AsyncStorage.setItem('isInstaSynced', JSON.stringify({ token: token }))
    fetch('https://api.instagram.com/v1/users/self/media/recent/?access_token=' + token)
      .then((response) => response.json())
      .then((json) => {
        if (json.data) {
          var arr = [];
          var cArr = json.data;
          for (var i = 0; i < cArr.length; i++) {
            if (cArr[i].type == "image") {
              arr.push({ source: cArr[i].images.standard_resolution.url })
            } else if (cArr[i].type == "carousel") {
              for (var j = 0; j < cArr[i].carousel_media.length; j++) {
                arr.push({ source: cArr[i].carousel_media[j].images.standard_resolution.url })
              }
            }
          }
          this.setState({ isInMedia: true })
          this.setState({ inImages: arr })
        }

      });
  }

  instLoginSuccess(token) {
    if (token) {
      this.getInstaMedia(token);
    }
  }

  instaLoginFailure(error) {
    console.log(error)
    alert('Authorization Failed')
  }

  async pinstLoginSuccess(token) {
    AsyncStorage.setItem('isPinstaSynced', JSON.stringify({ token: token }))
    try {
      const atoken = await AsyncStorage.getItem('isLoggedIn');
      if (atoken !== null) {
        try {
          const deviceID = await AsyncStorage.getItem('deviceID');
          if (deviceID != null) {
            const api = axios.create({
              baseURL: Constants.url.base,
              timeout: 0,
              responseType: 'json',
              headers: {
                'Authorization': 'Token ' + atoken + ';device_id=' + this.state.device_id
              },
              params: {
                access_token: token
              }
            });

            try {
              let response = await api.get(Constants.url.pinterest_images);
              var data = response.data.data;
              var arr = []
              if (arr) {
                for (var i = 0; i < data.length; i++) {
                  arr.push({ source: data[i] })
                }
              }
              this.setState({ isPnMedia: true })
              this.setState({ pnImages: arr })
            }
            catch (error) {
              console.log("HERE IS PROBLEM", JSON.stringify(error))
            }
          }
        } catch (error) {
          alert('No device id found')
        }
      }
    } catch (error) {
      alert('No access token found')
    }
  }

  pinstLoginFailure(error) {
    alert('something went wrong')
  }

  loggedOutUser = () => {
    LoginManager.logOut();
  }
  setModalVisibleTopics(visible) {
    this.setState({ modalVisible: visible });
  }
  setModalVisible(visible) {
    this.setState({ createAccount: visible });
  }

  setModalVisibleForgotPswd(visible) {
    this.setState({ forgotPswdAccount: visible });
  }

  setModalVisibleForgotPswdCloseLogin(arg1, arg2) {
    this.setState({ loginAccount: arg2, forgotPswdAccount: arg1, });
  }

  setModalVisibleLogin(visible) {
    this.setState({ loginAccount: visible });
  }

  handleModalClick() {
    if (this.props.isKeyboardOpened) {
      return this.refs.form.blur();
    }
    this.props.onClose(false);
  }

  createAccount = (typeOfUser, reqData) => {
    this.setState({ isDataLoad: true });
    var FName = this.state.FName;
    var LName = this.state.LName;
    var UName = this.state.UName;
    var UEmail = this.state.UEmail;
    var UPass = this.state.UPass;
    var profilePic = this.state.avatarSource
    var isError = false;
    this.setState({ isRegError: false });
    var imgUrl = 'cdn.shopify.com/s/files/1/2312/3313/products/Trio-Kit_SM_large.png';
    if (this.state.avatarSource != null) {
      imgUrl = this.state.avatarSource;
    }

    if (UName == null || UName.trim() == '') {
      this.setState({ registerUnameError: true });
      this.setState({ registerUname: 'Username must be at least 4 characters' });
      isError = true;
    } else if (UName.length < 4) {
      this.setState({ registerUnameError: true });
      this.setState({ registerUname: 'Username must be at least 4 characters' });
      isError = true;
    } else {
      this.setState({ registerUnameError: false });
      this.setState({ registerUname: '' });
    }

    if (UEmail == null || UEmail.trim() == '') {
      this.setState({ registerEmailError: true });
      this.setState({ registerEmail: 'Required' });
      isError = true;
    } else if (!this.validateEmail(UEmail)) {
      this.setState({ registerEmailError: true });
      this.setState({ registerEmail: 'Invalid Email' });
      isError = true;
    } else {
      this.setState({ registerEmailError: false });
      this.setState({ registerEmail: '' });
    }
    if (UPass == null || UPass.trim() == '' || UPass.length < 6) {
      this.setState({ registerPassError: true });
      this.setState({ registerPass: 'Password must be at least 6 characters and contains at least one number(0-9)' });
      isError = true;
    } else {
      var matches = /\d/.test(UPass);
      if (matches == false) {
        this.setState({ registerPassError: true });
        this.setState({ registerPass: 'Password must be at least 6 characters and contains at least one number(0-9)' });
        isError = true;
      } else {
        this.setState({ registerPassError: false });
        this.setState({ registerPass: '' });
      }
    }

    if (isError) {
      this.setState({ isDataLoad: false });
      this.setState({ isRegError: true });
      return false;
    }

    let photo = { uri: imgUrl.uri }
    let formdata = new FormData();
    formdata.append("first_name", FName)
    formdata.append("last_name", LName)
    formdata.append("user_name", UName)
    formdata.append("email", UEmail)
    formdata.append("password", UPass)
    formdata.append("device_id", this.state.device_id)
    if (Platform.OS == 'ios') {
      formdata.append("file", { uri: photo.uri, name: 'image.jpg', type: 'multipart/form-data' })
    } else {
      if (photo.uri) {
        formdata.append("file", { uri: photo.uri, name: 'image.jpg', type: 'image/jpeg' })
      }
    }

    fetch(Constants.url.base + 'sessions/' + typeOfUser, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': reqData ? 'application/json' : 'multipart/form-data'
      },
      body: reqData ? JSON.stringify(reqData) : formdata
    })
      .then(response => response.json())
      .then(responseData => {
        if (responseData.message) {
          alert(responseData.message);
          this.setState({ isDataLoad: false });
        } else {
          AsyncStorage.setItem('isLoggedIn', responseData.session_token);
          AsyncStorage.setItem('deviceID', this.state.device_id);
          AsyncStorage.setItem('loggedinUserData', JSON.stringify(responseData));
          this.props.firebaseToken(responseData.profile_object.firebase_token)
          EventRegister.emit('changeUserStatus', { login: true, id: responseData.profile_object.id })
          this.setState({ createAccount: false });
          this.setState({ FName: '' });
          this.setState({ LName: '' });
          this.setState({ UName: '' });
          this.setState({ UEmail: '' });
          this.setState({ UPass: '' });
          if (responseData.is_new_user) {
            this.setState({ modalSyncVisible: true })
            this.setState({ isDataLoad: false });
          } else {
            this.setState({ isDataLoad: false });
            this.props.navigation.navigate('Home');
          }
        }
      }).catch((error) => {
        alert(error)
        this.setState({ isDataLoad: false });
        console.log('error is here', error)
      })

  }

  loginAccount = () => {
    this.setState({ isDataLoad: true });
    if (this.state.isFbLogin) {
      var UName = this.state.UEmail;
    } else {
      var UName = this.state.UName;
    }

    var UPass = this.state.UPass;
    if (UName == null || UName.trim() == '') {
      this.setState({ loginEmailShowError: true });
      this.setState({ loginEmailError: 'Email or user name required' });
      this.setState({ isDataLoad: false });
      return false;

    } else if (UPass == null || UPass.trim() == '') {
      this.setState({ loginEmailShowError: false });
      this.setState({ loginEmailError: '' });
      this.setState({ loginPassShowError: true });
      this.setState({ loginPassError: 'Password required' });
      this.setState({ isDataLoad: false });
      return false;
    } else {
      this.setState({ loginEmailShowError: false });
      this.setState({ loginEmailError: '' });
      this.setState({ loginPassShowError: false });
      this.setState({ loginPassError: '' });
    }

    if (UName.indexOf('@') != -1) {
      var signinFormData = JSON.stringify({
        email: UName,
        password: UPass,
        device_id: this.state.device_id,
      });
    } else {
      var signinFormData = JSON.stringify({
        user_name: UName,
        password: UPass,
        device_id: this.state.device_id,
      });
    }


    fetch(Constants.url.base + 'sessions/sign_in/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: signinFormData
    })
      .then(response => response.json())
      .then(responseData => {

        if (responseData.message) {
          this.setState({ isDataLoad: false });
          if (responseData.message == 'ERROR: Invalid Password') {
            this.setState({ loginPassShowError: true });
            this.setState({ loginPassError: 'Password invalid' });
            return false;
          } else {
            this.setState({ loginEmailShowError: true });
            this.setState({ loginEmailError: 'Email or user name invalid' });
            return false;
          }
        } else {
          this.setState({ loginAccount: false });
          this.setState({ isLoggedIn: responseData.session_token });
          this.setState({ FName: '' });
          this.setState({ LName: '' });
          this.setState({ UName: '' });
          this.setState({ UEmail: '' });
          this.setState({ UPass: '' });
          this.setState({ isFbLogin: false });
          AsyncStorage.setItem('isLoggedIn', responseData.session_token);
          AsyncStorage.setItem('deviceID', this.state.device_id);
          AsyncStorage.setItem('loggedinUserData', JSON.stringify(responseData));
          this.props.firebaseToken(responseData.profile_object.firebase_token)
          EventRegister.emit('changeUserStatus', { login: true, id: responseData.profile_object.id })
          if (responseData.is_new_user) {
            this.setState({ modalSyncVisible: true })
            this.setState({ isDataLoad: false });
          } else {
            this.setState({ isDataLoad: false });
            this.props.navigation.navigate('Home');
          }
        }
      });
  }

  errorStyle = function (options) {
    return {
      height: '83%',
    }
  }

  forgotPswdAccount = () => {
    var UEmail = this.state.UEmail;
    if (UEmail == null || UEmail.trim() == '') {
      this.setState({ showPassError: true });
      this.setState({ forgotPassErrorText: 'Required' });
      return false;
    } else {
      this.setState({ showPassError: false });
      this.setState({ forgotPassErrorText: '' });
    }
    if (!this.validateEmail(UEmail)) {
      var data = JSON.stringify({
        user_name: UEmail,
      });
    } else {
      var data = JSON.stringify({
        email: UEmail,
      });
    }

    fetch(Constants.url.base + 'sessions/forgot_password/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: data
    })
      .then(response => response.json())
      .then(responseData => {
        let msg = responseData.message;

        if (msg.search('ERROR') == 0) {
          let error = (msg.split(':')[1].trim())
          this.setState({ showPassError: true });
          this.setState({ forgotPassErrorText: error });
        } else {
          this.setState({ showPassError: false });
          this.setState({ forgotPassErrorText: '' });
          alert(msg);
        }

      });

  }

  validateEmail = (email) => {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  _ImgPicker = () => {
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      allowsEditing: true,
      storageOptions: {
        skipBackup: true
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
      }
      else if (response.error) {
        alert(response.error)
      }
      else if (response.customButton) {
      }
      else {
        let source = { uri: response.uri };
        this.setState({
          avatarSource: source
        });
      }
    });

  }

  fetchMediafromLibrary() {
    CameraRoll.getPhotos({
      first: 20,
      assetType: 'Photos',
    })
      .then(r => {
        var arr = []
        var data = r.edges
        for (var i = 0; i < data.length; i++) {
          arr.push({ source: data[i].node.image.uri })
        }
        this.setState({ glImages: arr })
      })
      .catch((err) => {
        //Error Loading Images
      });
  }

  async uploadImage(image) {
    let formdata = new FormData();
    if (Platform.OS == 'ios') {
      formdata.append("file", { uri: image, name: 'image.jpg', type: 'multipart/form-data' })
    } else {
      formdata.append("file", { uri: image, name: 'image.jpg', type: 'image/jpeg' })
    }

    let response = await fetch(Constants.url.base + 'images', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'multipart/form-data',
      },
      body: formdata
    })
    let data = await response.json();
    return data
  }

  goToselectImage() {
    this.setState({ modalSyncVisible: false })
    this.setState({ modalMediaTypeVisible: true })
  }

  async getTopicList(token) {
    const api = axios.create({
      baseURL: Constants.url.base,
      timeout: 0,
      responseType: 'json',
      headers: {
        'Authorization': 'Token ' + token + ';device_id=' + this.state.device_id
      }
    });

    try {
      let response = await api.get(Constants.url.topics_signup);
      this.setState({ topics: response.data.topics })
      return response.data.topics;
    }
    catch (error) {
      console.log("HERE IS PROBLEM", JSON.stringify(error))
    }
  }

  renderTopics() {
    if (this.state.topics) {
      const lapsList = this.state.topics.map((item, index) => {
        return (
          <TouchableOpacity key={item.id} onPress={() => this.chooseItem(index)} style={[{ width: '45%', height: 100, margin: '2.5%', alignItems: 'center', justifyContent: 'center' }, this.state.topics[index].selected ? { backgroundColor: '#acbc4e' } : { backgroundColor: '#222222' }]} >
            <Text style={[styles.selecetTopicsButtonText, this.state.topics[index].selected ? { color: 'black' } : { color: '#fff' }]}>{item.name}</Text>
          </TouchableOpacity>
        )
      })
      return <View style={{ flexWrap: 'wrap', flexDirection: 'row' }}>
        {lapsList}
      </View>
    } else {
      return <View style={{ flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Text>No Topics Found.</Text>
      </View>
    }

  }

  renderGalleryImages() {
    // var payments = [];
    // for(let i = 0; i < noGuest; i++){

    // }
    if (this.state.loadGalleryImages) {
      const lapsList = this.state.loadGalleryImages.map((item, index) => {
        return (
          <TouchableOpacity key={'image' + index} onPress={() => this.chooseImages(index)} style={[{ width: '30%', height: 80, margin: '1.6%' }]} >
            <Image source={{ uri: item.source }} style={{ width: '100%', height: 80 }} />
            {this.state.loadGalleryImages[index].selected &&
              <View style={{ justifyContent: 'flex-end', flexDirection: 'row', width: '100%', height: 80, position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(238, 238, 238, 0.35)' }}>
                <Image source={require('../../assets/ic-selected.png')} style={{ width: 20, height: 20 }} />
              </View>
            }
          </TouchableOpacity>
        )
      })
      return <View style={{ flexWrap: 'wrap', flexDirection: 'row', paddingVertical: 10 }}>
        {lapsList}
      </View>
    } else {
      return <View style={{ flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
        <Text>No Images Found.</Text>
      </View>
    }

  }

  _switchAction(type, val) {
    switch (type) {
      case 'facebook':
        if (val) {
          this.fbAuth('getMedia');
        } else {
          this.setState({ isFbMedia: false })
        }
        break;
      case 'instagram':
        if (val) {
          this.refs.instagramLogin.show()
        } else {
          this.setState({ isInMedia: false })
        }
        break;
      case 'pinterest':
        if (val) {
          this.refs.pinterestLogin.show();
        } else {
          this.setState({ isPnMedia: false })
        }
        break;
    }
  }

  chooseImages = (index) => {
    var arr = this.state.loadGalleryImages
    var sArr = []
    if (this.state.selectedImages) {
      var sArr = this.state.selectedImages
    }
    var i = sArr.indexOf(arr[index])
    if (i != -1) {
      sArr.splice(i, 1)
    } else {
      sArr.push(arr[index].source)
    }
    arr[index].selected = !arr[index].selected
    this.setState({
      loadGalleryImages: arr,
      selectedImages: sArr
    })
  }

  async addImages() {
    this.setState({ isDataLoad: true })
    var imgArr = []
    if (this.state.selectedImages) {
      if (this.state.selectedImages.length > 0) {
        if (!this.state.isGallery) {
          this.createDraft(this.state.selectedImages)
        } else {
          for (var i = 0; i < this.state.selectedImages.length; i++) {
            this.uploadImage(this.state.selectedImages[i]).then((res) => {
              imgArr.push(res.url)
              if (imgArr.length == this.state.selectedImages.length) {
                this.createDraft(imgArr)
              }
            }).catch((error) => {
              console.log(error)
            })
          }
        }

      } else {
        this.cancelImagePickerModal()
      }
    } else {
      this.cancelImagePickerModal()
    }
  }

  async createDraft(imgArr) {
    try {
      const atoken = await AsyncStorage.getItem('isLoggedIn');
      if (atoken !== null) {
        try {
          const deviceID = await AsyncStorage.getItem('deviceID');
          if (deviceID != null) {
            const api = axios.create({
              baseURL: Constants.url.base,
              timeout: 200000,
              responseType: 'json',
              headers: {
                'Authorization': 'Token ' + atoken + ';device_id=' + deviceID
              }
            });
            var reqDAta = {
              image_urls: imgArr
            }
            api.post(Constants.url.save_images, reqDAta).then((res) => {
              this.setState({ isDataLoad: false })
              if (res.status == 200) {
                this.cancelImagePickerModal()
              } else {
                alert('something went wrong')
              }
            }).catch((error) => {
              this.setState({ isDataLoad: false })
              alert('something went wrong.')
            })
          }
        } catch (error) {
          this.setState({ isDataLoad: false })
          alert('Device-Id Not found.')
        }
      }
    } catch (error) {
      this.setState({ isDataLoad: false })
      alert('Access Token not found.')
    }
  }

  backToGalleryList() {
    this.setState({ selectedImages: [] })
    this.setState({ loadGalleryImages: [] })
    this.setState({ modalChooseMediaVisible: false })
    this.setState({ modalMediaTypeVisible: true })
  }

  async cancelImagePickerModal() {
    this.setState({ selectedImages: [] })
    this.setState({ loadGalleryImages: [] })
    this.setState({ modalChooseMediaVisible: false })
    this.setState({ modalMediaTypeVisible: false })
    this.setState({ modalSyncVisible: false })
    this.setState({ modalVisible: true })
    this.setState({ isDataLoad: true });
    try {
      const token = await AsyncStorage.getItem('isLoggedIn');
      if (token !== null) {
        this.getTopicList(token).then((data) => {
          this.setState({ isDataLoad: false });
        })
      }
    } catch (error) {
      alert('something went wrong');
    }
  }

  chooseItem = (index) => {
    var arr = this.state.topics
    var sArr = []
    if (this.state.selectedTopics) {
      var sArr = this.state.selectedTopics
    }
    var i = sArr.indexOf(arr[index].id)
    if (i != -1) {
      sArr.splice(i, 1)
    } else {
      sArr.push(arr[index].id)
    }
    arr[index].selected = !arr[index].selected
    this.setState({
      topics: arr,
      selectedTopics: sArr
    })
  }

  async addTopics() {
    if (this.state.selectedTopics.length < 3) {
      alert('Please select at leaset 3 topics')
    } else {
      try {
        const access_token = await AsyncStorage.getItem('isLoggedIn');
        const topics = axios.create({
          baseURL: Constants.url.base,
          timeout: 200000,
          responseType: 'json',
          headers: {
            'Authorization': 'Token ' + access_token + ';device_id=' + this.state.device_id
          }
        });
        try {
          let data = await topics.put(Constants.url.add_topics, { topic_id: this.state.selectedTopics })
          var topicsArr = []
          for (let i of this.state.selectedTopics) {
            topicsArr.push({ id: i })
          }
          try {
            const userData = await AsyncStorage.getItem('loggedinUserData');
            userData = JSON.parse(userData)
            userData.profile_object.user_topics = topicsArr
            try {
              let done = await AsyncStorage.setItem('loggedinUserData', JSON.stringify(userData))
              this.setModalVisibleTopics(false);
              this.props.navigation.navigate('Home');
            } catch (error) {
              console("something went wrong", error)
            }
          } catch (error) {
            console("something went wrong", error)
          }

        } catch (error) {
          console.log('Error is here', error)
        }
      } catch (error) {
        console.log('Error is here', error)
      }
    }

  }

  async requestCameraPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          'title': 'Superble App Gallery Permission',
          'message': 'Superble App needs access to your Gallery '
        }
      )
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera")
      } else {
        console.log("Camera permission denied")
      }
    } catch (err) {
      console.warn(err)
    }
  }

  showMediaPicker(type) {
    this.setState({ modalMediaTypeVisible: false })
    this.setState({ modalChooseMediaVisible: true })
    if (type == 'facebook') {
      this.setState({ loadGalleryImages: this.state.fbImages, isGallery: false })
    } else if (type == 'instagram') {
      this.setState({ loadGalleryImages: this.state.inImages, isGallery: false })
    } else if (type == 'pinterest') {
      this.setState({ loadGalleryImages: this.state.pnImages, isGallery: false })
    }
    else {
      this.setState({ loadGalleryImages: this.state.glImages, isGallery: true })
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      createAccount: false,
      forgotPswdAccount: false,
      loginAccount: false,
      isFbLogin: false,
      FName: null,
      LName: null,
      UName: null,
      UEmail: null,
      UPass: null,
      Test: 'welcome',
      isLoggedIn: null,
      loginEmailError: '',
      loginPassError: '',
      loginEmailShowError: false,
      loginPassShowError: false,
      showPassError: false,
      forgotPassErrorText: '',
      registerUnameError: false,
      registerUname: '',
      registerEmailError: false,
      registerEmail: '',
      registerPassError: false,
      registerPass: '',
      isDataLoad: false,
      avatarSource: null,
      isRegError: false,
      modalVisible: false,
      modalSyncVisible: false,
      modalMediaTypeVisible: false,
      modalChooseMediaVisible: false,
      loadGalleryImages: [],
      fbImages: [],
      pnImages: [],
      glImages: [],
      inImages: [],
    }
    if (Platform.OS == 'ios') {
      this.fetchMediafromLibrary()
    } else {
      this.requestCameraPermission().then(() => {
        this.fetchMediafromLibrary()
      })
    }
    this.generateUuid()
    this.addTopics = this.addTopics.bind(this)
    this._responseInfoCallback = this._responseInfoCallback.bind(this);


  }


  render = () => {
    let isDataLoad = this.state.isDataLoad;
    let customClass = 'styles.createAccountStyle';
    if (this.state.isRegError == true) {
      let customClass = 'styles.createAccountStyleError';
    }
    return (

      <ScrollView style={{ flex: 1 }} >
        <Container style={{ height: 650 }}>
          {isDataLoad === true &&
            <Container>

              <View style={{ flex: 1, flexDirection: 'column', position: 'relative', justifyContent: 'center', alignItems: 'center', }}>
                <Spinner color="#00C497" key={Math.random()} />
              </View>

            </Container>
          }
          {isDataLoad === false &&
            <Container>
              <Header style={styles.header} >
                <Item style={styles.imgItem}  >
                  <Image
                    style={styles.imgStyle}
                    source={require('../../assets/logo.png')}
                    resizeMode="center"
                    underlineColorAndroid='transparent'
                    />
                </Item>
              </Header>

              <View style={styles.container}>
                <View style={styles.headingH1}>
                  <H1 style={styles.heading}>Discover new products and experiences on Superble</H1>
                </View>
                <View style={styles.mainAccountView}>
                  <View style={styles.mainAccountSubView}>
                    <Image source={require('../../assets/icon1.png')} style={styles.mainAccountIconList} resizeMode='contain' /><Text style={styles.subHeadingList} >Ask who you want for an opinion</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={require('../../assets/icon2.png')} style={styles.mainAccountIconList} resizeMode='contain' /><Text style={styles.subHeadingList} >Build your own collection</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={require('../../assets/icon3.png')} style={styles.mainAccountIconList} resizeMode='contain' /><Text style={styles.subHeadingList} >Collect points and build trust</Text>
                  </View>
                  <View style={{ flexDirection: 'row' }}>
                    <Image source={require('../../assets/icon4.png')} style={styles.mainAccountIconList} resizeMode='contain' /><Text style={styles.subHeadingList} >Help others and earn credits</Text>
                  </View>
                </View>

                <View style={styles.secondryViewFb}>
                  <View style={styles.viewFbLogin}>
                    <Button
                      block
                      transparent
                      style={styles.buttonFbLogin}
                      onPress={this.fbAuth.bind(this, 'login')}
                      >
                      <Text style={styles.loginButtonFB}>Login with facebook</Text>
                    </Button>
                    {/* <LoginButton
	              publishPermissions={["publish_actions"]}
	              onLoginFinished={
	                (error, result) => {
	                  if (error) {
	                    alert("login has error: " + result.error);
	                  } else if (result.isCancelled) {
	                    alert("login is cancelled.");
	                  } else {
	                    AccessToken.getCurrentAccessToken().then(
	                      (data) => {
	                        alert(data.accessToken.toString())
	                      }
	                    )
	                  }
	                }
	              }
	              onLogoutFinished={() => alert("logout.")}/> */}

                    <Button
                      block
                      transparent
                      style={styles.buttonGLogin}
                      onPress={this._signIn.bind(this)}
                      >
                      <Text style={styles.loginButtonG}>Login with Google</Text>
                    </Button>

                  </View>
                  <View style={styles.logincreateAccount}>
                    <View style={styles.lcAccount}>
                      <Button
                        transparent
                        onPress={() => { this.setModalVisibleLogin(!this.state.loginAccount) } }
                        >
                        <Text style={styles.lcAccountText}>Login with email</Text>
                      </Button>
                    </View>
                    <View style={styles.lcAccountA}>
                      <Button
                        transparent
                        onPress={() => { this.setModalVisible(!this.state.createAccount) } }
                        >
                        <Text style={styles.lcAccountAText}>Create account</Text>
                      </Button>
                    </View>
                  </View>
                </View>

                {/* create account with signup modal */}

                <Modal
                  animationType={'fade'}
                  transparent={true}
                  visible={this.state.createAccount}
                  presentationStyle={'overFullScreen'}
                  onPressBackdrop={() => { this.handleModalClick() } }
                  onRequestClose={() => { this.setModalVisible(!this.state.createAccount) } }
                  >
                  <TouchableWithoutFeedback onPress={() => { this.setModalVisible(!this.state.createAccount) } }>
                    <View style={styles.createAccountMainView}>
                      <TouchableWithoutFeedback>
                        <View style={this.state.isRegError ? styles.createAccountStyleError : styles.createAccountStyle}>
                          <Container>
                            <H1 style={styles.createAccountHeader}>Create Account</H1>
                            <Content>
                              <Form>
                                <Grid>
                                  <Col>
                                    <Item floatingLabel>
                                      <Label style={styles.createAccountLable}>First Name</Label>
                                      <Input
                                        onChangeText={(FName) => { this.setState({ FName }); } }
                                        value={this.state.FName}
                                        autoCapitalize='none'
                                        />
                                    </Item>

                                    <Item floatingLabel>
                                      <Label style={styles.createAccountLable}>Last Name</Label>
                                      <Input
                                        onChangeText={(LName) => { this.setState({ LName }); } }
                                        value={this.state.LName}
                                        autoCapitalize='none'
                                        />
                                    </Item>
                                  </Col>
                                  <Col>
                                    <Row style={{ elevation: 1, borderColor: '#ccc', shadowOpacity: 1, shadowColor: '#ccc', marginTop: 15, marginRight: 10, marginLeft: 10, }}>

                                      {this.state.avatarSource != null &&
                                        <TouchableHighlight onPress={() => this._ImgPicker()} style={{ width: '100%', height: '100%' }}>
                                          <Image
                                            source={this.state.avatarSource}
                                            resizeMode='contain'
                                            style={{ width: '100%', height: '100%' }}
                                            />
                                        </TouchableHighlight>
                                      }
                                      {this.state.avatarSource == null &&
                                        <TouchableHighlight onPress={() => this._ImgPicker()} style={{ width: '100%', height: '100%' }}>
                                          <Image
                                            source={require('../../assets/camera.png')}
                                            resizeMode='contain'
                                            style={{ width: '30%', height: '30%', position: 'absolute', top: '35%', left: '35%' }}
                                            />
                                        </TouchableHighlight>
                                      }

                                    </Row>
                                  </Col>
                                </Grid>
                                <Item floatingLabel>
                                  <Label style={styles.createAccountLable}>Username</Label>
                                  <Input
                                    onChangeText={(UName) => { this.setState({ UName }); } }
                                    value={this.state.UName}
                                    autoCapitalize='none'
                                    />
                                </Item>
                                {this.state.registerUnameError == true &&
                                  <View>
                                    <Text style={{ marginLeft: 13, color: 'red', marginTop: 5 }}>{this.state.registerUname}</Text>
                                  </View>
                                }
                                <Item floatingLabel>
                                  <Label style={styles.createAccountLable}>Email</Label>
                                  <Input
                                    onChangeText={(UEmail) => { this.setState({ UEmail }); } }
                                    value={this.state.UEmail}
                                    placeholderTextColor="#ACBC4E"
                                    autoCapitalize='none'
                                    />
                                </Item>
                                {this.state.registerEmailError == true &&
                                  <View>
                                    <Text style={{ marginLeft: 13, color: 'red', marginTop: 5 }}>{this.state.registerEmail}</Text>
                                  </View>
                                }
                                <Item floatingLabel>
                                  <Label style={styles.createAccountLable}>Password</Label>
                                  <Input
                                    onChangeText={(UPass) => { this.setState({ UPass }); } }
                                    value={this.state.UPass}
                                    secureTextEntry={true}
                                    placeholderTextColor="#ACBC4E"
                                    autoCapitalize='none'
                                    />
                                </Item>
                                {this.state.registerPassError == true &&
                                  <View>
                                    <Text style={{ marginLeft: 13, color: 'red', marginTop: 5 }}>{this.state.registerPass}</Text>
                                  </View>
                                }

                                <Button block transparent style={styles.createAccountButton} onPress={() => this.createAccount('', null)}><Text style={styles.createAccountButtonText} >Sign up</Text></Button>
                              </Form>
                            </Content>
                          </Container>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>

                {/* login with email modal */}

                <Modal
                  animationType={'fade'}
                  transparent={true}
                  visible={this.state.loginAccount}
                  presentationStyle={'overFullScreen'}
                  onRequestClose={() => { this.setModalVisibleLogin(!this.state.loginAccount) } }
                  >
                  <TouchableWithoutFeedback onPress={() => { this.setModalVisibleLogin(!this.state.loginAccount) } }>
                    <View style={styles.loginAccountMainView}>
                      <TouchableWithoutFeedback>
                        <View style={styles.loginAccountStyle}>
                          <Container>
                            <H2 style={styles.loginAccountHeader}>Log In</H2>
                            <Content>
                              <Form>
                                <Item floatingLabel>
                                  <Label style={styles.loginAccountLable}>Username or Email</Label>
                                  <Input
                                    onChangeText={(UName) => { this.setState({ UName }); } }
                                    value={this.state.UName}
                                    autoCapitalize='none'
                                    />
                                </Item>
                                {this.state.loginEmailShowError == true &&
                                  <View>
                                    <Text style={{ marginLeft: 13, color: 'red', marginTop: 5 }}>{this.state.loginEmailError}</Text>
                                  </View>
                                }

                                <Item floatingLabel>
                                  <Label style={styles.loginAccountLable}>Password</Label>
                                  <Input
                                    onChangeText={(UPass) => { this.setState({ UPass }); } }
                                    value={this.state.UPass}
                                    secureTextEntry={true}
                                    autoCapitalize='none'
                                    />
                                </Item>
                                {this.state.loginPassShowError == true &&
                                  <View>
                                    <Text style={{ marginLeft: 13, color: 'red', marginTop: 5 }}>{this.state.loginPassError}</Text>
                                  </View>
                                }

                                <Button block transparent style={styles.loginAccountButton} onPress={() => this.loginAccount()}><Text style={styles.loginAccountButtonText} >Log In</Text></Button>
                                <View style={styles.forgotPasswordView}>
                                  <Button transparent onPress={() => { this.setModalVisibleForgotPswdCloseLogin(!this.state.forgotPswdAccount, !this.state.loginAccount) } }><Text style={styles.forgotButtonText}>Forgot Password</Text></Button>
                                </View>

                              </Form>
                            </Content>
                          </Container>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>

                {/* forgot password modal */}

                <Modal
                  animationType={'fade'}
                  transparent={true}
                  visible={this.state.forgotPswdAccount}
                  presentationStyle={'overFullScreen'}
                  onRequestClose={() => { this.setModalVisibleForgotPswd(!this.state.forgotPswdAccount) } }
                  >
                  <TouchableWithoutFeedback onPress={() => { this.setModalVisibleForgotPswd(!this.state.forgotPswdAccount) } }>
                    <View style={styles.forgotPswdAccountMainView}>
                      <TouchableWithoutFeedback>
                        <View style={styles.forgotPswdAccountStyle}>
                          <Container>
                            <H1 style={styles.forgotPswdAccountHeader}>Forgot password</H1>
                            <Content>
                              <Form>
                                <Item floatingLabel>
                                  <Label style={styles.forgotPswdAccountLable}>Username or Email</Label>
                                  <Input
                                    onChangeText={(UEmail) => { this.setState({ UEmail }); } }
                                    value={this.state.UEmail}
                                    autoCapitalize='none'
                                    />

                                </Item>
                                {this.state.showPassError == true &&
                                  <View>
                                    <Text style={{ marginLeft: 13, color: 'red', marginTop: 5 }}>{this.state.forgotPassErrorText}</Text>
                                  </View>
                                }

                                <Button block transparent style={styles.forgotPswdAccountButton} onPress={() => this.forgotPswdAccount()}><Text style={styles.forgotPswdAccountButtonText} >Send me link</Text></Button>
                              </Form>
                            </Content>
                          </Container>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>

                <Modal
                  animationType={'fade'}
                  transparent={true}
                  visible={this.state.modalVisible}
                  presentationStyle={'overFullScreen'}
                  onRequestClose={() => console.log('do nothing')}
                  >
                  <TouchableWithoutFeedback>
                    <View style={styles.selecetTopics}>
                      <TouchableWithoutFeedback>
                        <View style={styles.selecetTopicsStyle}>
                          <Container>
                            <Text style={{ color: '#000', textAlign: 'center', fontWeight: 'bold' }}>Pick 3 topics to follow</Text>
                            <Content>
                              {this.state.Topics ? this.renderTopics() : this.renderTopics()}
                            </Content>
                            <Button block transparent style={styles.selecetTopicsButton} onPress={() => this.addTopics()}><Text style={styles.selecetTopicsButtonText} >NEXT</Text></Button>
                          </Container>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>

                <Modal
                  animationType={'fade'}
                  transparent={true}
                  visible={this.state.modalSyncVisible}
                  presentationStyle={'overFullScreen'}
                  onRequestClose={() => console.log('do nothing')}
                  >
                  <TouchableWithoutFeedback>
                    <View style={styles.selecetTopics}>
                      <TouchableWithoutFeedback>
                        <View style={styles.selecetTopicsStyle}>
                          <Container>
                            <Text style={{ color: '#383636', textAlign: 'center', fontSize: 25 }}>Sync your accounts and start earning now</Text>
                            <Content>
                              <View style={styles.selectMediaProfileDiv}>
                                <View style={{ flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center' }}>
                                  <Image source={require('../../assets/p_facebook.png')} />
                                  <Text style={styles.selectMediaProfileDivText}>Facebook</Text>
                                </View>
                                <View>
                                  <Switch value={this.state.isFbMedia} onValueChange={(val) => this._switchAction('facebook', val)} />
                                </View>
                              </View>
                              <View style={styles.selectMediaProfileDiv}>
                                <View style={{ flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center' }}>
                                  <Image source={require('../../assets/p_instagram.png')} />
                                  <Text style={styles.selectMediaProfileDivText}>Instagram</Text>
                                </View>
                                <View>
                                  <Switch value={this.state.isInMedia} onValueChange={(val) => this._switchAction('instagram', val)} />
                                  <Ins
                                    ref='instagramLogin'
                                    clientId='e7b56b742f044fc7980d080c4406dd38'
                                    scopes={['public_content+follower_list']}
                                    redirectUrl='http://localhost'
                                    onLoginSuccess={(token) => this.instLoginSuccess(token)}
                                    onLoginFailure={(data) => this.instaLoginFailure(data)}
                                    />
                                </View>
                              </View>
                              <View style={styles.selectMediaProfileDiv}>
                                <View style={{ flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center' }}>
                                  <Image source={require('../../assets/p_pinterest.png')} />
                                  <Text style={styles.selectMediaProfileDivText}>Pinterest</Text>
                                </View>
                                <View>
                                  <Switch value={this.state.isPnMedia} onValueChange={(val) => this._switchAction('pinterest', val)} />
                                  <Pins
                                    ref='pinterestLogin'
                                    onLoginSuccess={(token) => this.pinstLoginSuccess(token)}
                                    onLoginFailure={(data) => this.pinstLoginFailure(data)}
                                    />
                                </View>
                              </View>
                            </Content>
                            <Button block transparent style={styles.selecetTopicsButton} onPress={() => this.goToselectImage()}><Text style={styles.selecetTopicsButtonText} >NEXT</Text></Button>
                          </Container>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>

                <Modal
                  animationType={'fade'}
                  transparent={true}
                  visible={this.state.modalMediaTypeVisible}
                  presentationStyle={'overFullScreen'}
                  onRequestClose={() => console.log('do nothing')}
                  >
                  <TouchableWithoutFeedback>
                    <View style={styles.selecetTopics}>
                      <TouchableWithoutFeedback>
                        <View style={styles.selecetTopicsStyle}>
                          <Container>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                              <Text style={{ color: '#383636', textAlign: 'center', fontSize: 18, width: '90%', paddingHorizontal: 20 }}>Select the pictures with the products you want to recommend</Text>
                              <TouchableOpacity onPress={() => this.cancelImagePickerModal()}>
                                <Image source={require('../../assets/cross2.png')} style={{ width: 20, height: 20 }} />
                              </TouchableOpacity>
                            </View>
                            <Content>
                              {this.state.glImages.length > 0 &&
                                <View style={{ flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', padding: 15 }}>
                                  <TouchableOpacity onPress={() => this.showMediaPicker('gallery')}>
                                    <Image source={{ uri: this.state.glImages[0].source }} style={{ width: 70, height: 70 }} />
                                  </TouchableOpacity>
                                  <Text style={styles.selectMediaProfileDivText}>Gallery</Text>
                                </View>
                              }
                              {this.state.isFbMedia &&
                                <View style={{ flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', padding: 15 }}>
                                  <TouchableOpacity onPress={() => this.showMediaPicker('facebook')}>
                                    {this.state.fbImages.length > 0 &&
                                      <Image source={{ uri: this.state.fbImages[0].source }} style={{ width: 70, height: 70 }} />
                                    }
                                  </TouchableOpacity>
                                  <Text style={styles.selectMediaProfileDivText}>Facebook</Text>
                                </View>
                              }
                              {this.state.isInMedia &&
                                <View style={{ flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', padding: 15 }}>
                                  <TouchableOpacity onPress={() => this.showMediaPicker('instagram')}>
                                    {this.state.inImages.length > 0 &&
                                      <Image source={{ uri: this.state.inImages[0].source }} style={{ width: 70, height: 70 }} />
                                    }
                                  </TouchableOpacity>
                                  <Text style={styles.selectMediaProfileDivText}>Instagram</Text>
                                </View>
                              }
                              {this.state.isPnMedia &&
                                <View style={{ flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center', padding: 15 }}>
                                  <TouchableOpacity onPress={() => this.showMediaPicker('pinterest')}>
                                    {this.state.pnImages.length > 0 &&
                                      <Image source={{ uri: this.state.pnImages[0].source }} style={{ width: 70, height: 70 }} />
                                    }
                                  </TouchableOpacity>
                                  <Text style={styles.selectMediaProfileDivText}>Pinterest</Text>
                                </View>
                              }
                            </Content>
                            <TouchableOpacity onPress={() => this.setState({ modalMediaTypeVisible: false, modalSyncVisible: true })}>
                              <Text>Back to sync</Text>
                            </TouchableOpacity>
                          </Container>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>

                <Modal
                  animationType={'fade'}
                  transparent={true}
                  visible={this.state.modalChooseMediaVisible}
                  presentationStyle={'overFullScreen'}
                  onRequestClose={() => console.log('do nothing')}
                  >
                  <TouchableWithoutFeedback>
                    <View style={styles.selecetTopics}>
                      <TouchableWithoutFeedback>
                        <View style={styles.selecetTopicsStyle}>
                          <Container>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, borderBottomColor: '#ccc', borderBottomWidth: 1 }}>
                              <TouchableOpacity onPress={() => this.backToGalleryList()}>
                                <Text style={{ color: '#383636', textAlign: 'center', fontSize: 18, paddingHorizontal: 20 }}>Cancel</Text>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => this.addImages()}>
                                <Text style={{ color: '#383636', textAlign: 'center', fontSize: 18, paddingHorizontal: 20 }}>Done</Text>
                              </TouchableOpacity>
                            </View>
                            <Content>
                              {this.state.loadGalleryImages ? this.renderGalleryImages() : this.renderGalleryImages()}
                            </Content>
                          </Container>
                        </View>
                      </TouchableWithoutFeedback>
                    </View>
                  </TouchableWithoutFeedback>
                </Modal>

              </View>



            </Container>
          }
        </Container>
      </ScrollView  >

    );
  }
}

const mapStateToProps = state => ({
  notifications: state.chat.notifications,
  error: state.chat.loadMessagesError
})


const mapDispatchToProps = {
  firebaseToken: loginUserWithToken,
  //    createChatRef: createChatRef
}

Account.propTypes = {
  firebaseToken: PropTypes.func.isRequired,
  //    createChatRef: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Account)