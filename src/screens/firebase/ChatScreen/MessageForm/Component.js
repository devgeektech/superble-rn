import React, { Component } from 'react'
import { Text, View, TextInput, TouchableOpacity, Image, Alert, AsyncStorage } from 'react-native'
import PropTypes from 'prop-types'
import firebaseService from '../../services/firebase';
import axios from 'axios';
import Constants from '../../../../constants';

import styles from './Styles'

const OPACITY_ENABLED = 1.0
const OPACITY_DISABLED = 0.2

class MessageFormComponent extends Component {

  constructor(props) {
    super(props)
    this.handleMessageChange = (message) => {
      this.props.updateMessage(message)
    }

    this.handleButtonPress = () => {
      AsyncStorage.getItem('loggedinUserData').then((userdata)=>{
        userdata = JSON.parse(userdata)
        var uid = userdata.profile_object.id
        var convoData = this.props.convoData;
        let createdAt = new Date().getTime()
        let chatMessage = {
          body: this.props.message,
          type: "product",
          updatedAt: createdAt,
          sender: {
            id: uid,
            imageUrl: convoData.RECEIVER_USER.imageUrl ? convoData.RECEIVER_USER.imageUrl : 'https://forums.iboats.com/user/avatar?userid=503684&type=large', 
            name: convoData.RECEIVER_USER.name
          }
        }
        this.props.sendMessage(convoData.FIREBASE_CONVERSATION_ID, chatMessage, convoData.RECEIVER_USER.id, convoData.SENDER_USER.id)
        this.pushMessage(convoData.SENDER_USER.id)
      })
    }
  }

  pushMessage(id) {
    AsyncStorage.getItem('isLoggedIn').then((atoken) =>{
      if (atoken !== null){
        AsyncStorage.getItem('deviceID').then((deviceID) => {
          if(deviceID != null){
              const api = axios.create({
              baseURL: Constants.url.base,
              timeout: 0,
              responseType: 'json',
              headers: {
                  'Authorization': 'Token '+atoken+';device_id='+deviceID,
                  'Content-type': 'application/json'
              }
              });
              var bodyData = {
                recipient_id: id
              }
              return api.post('conversations/send_message_notification', bodyData).then((res) => {
                console.log('push notification send', res)
              }).catch((error) => {
                  console.log('error while sending message',error.response)
              });
          }
        })
      }
    })
      
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.sendingError && this.props.sendingError) {
      Alert.alert('error', this.props.sendingError)
    }
  }

  render() {
    const sending = this.props.sending
    const isButtonDisabled = sending || this.props.message.trim().length == 0
    const opacity = isButtonDisabled ? OPACITY_DISABLED : OPACITY_ENABLED

    return (
      <View style={styles.container}>

        <TextInput
          style={styles.textInput}
          placeholder={'Write a message'}
          returnKeyType='send'
          onChangeText={this.handleMessageChange}
          value={this.props.message}
          underlineColorAndroid={'transparent'}
          editable={!sending} />

          <TouchableOpacity
            style={styles.button}
            onPress={this.handleButtonPress}
            disabled={isButtonDisabled}>
             <Image
                source={require('../../../../assets/ic_feedback.png')}
                style={{width:35,height:30}} />

          </TouchableOpacity>

      </View>
    );
  }
}

MessageFormComponent.propTypes = {
  sending: PropTypes.bool.isRequired,
  sendMessage: PropTypes.func.isRequired,
  updateMessage: PropTypes.func.isRequired,
  message: PropTypes.string.isRequired,
  sendingError: PropTypes.string
}

export default MessageFormComponent
