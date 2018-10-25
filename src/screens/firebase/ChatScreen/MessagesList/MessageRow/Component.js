import React, { Component } from 'react'
import { View, Text, Image, TouchableOpacity, AsyncStorage } from 'react-native'
import PropTypes from 'prop-types'
import relativeDate from 'relative-date'
import Constants from '../../../../../constants';
import axios from 'axios';
import firebaseService from '../../../../firebase/services/firebase'


import styles from './Styles'

const MESSAGE_TEXT_MARGIN = 50

class MessageRowComponent extends Component {

  componentDidMount(){
  }

  constructor(props) {
    super(props)
    this.state = {
      isLiked: false
    }
  }

  async likeDislikeMessage(convodata, message){
    try {
      const atoken = await AsyncStorage.getItem('isLoggedIn');
      if (atoken !== null){
        try {
          const deviceID = await AsyncStorage.getItem('deviceID');
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
                recipient_id: convodata.SENDER_USER.id,
                product_id: convodata.PRODUCT_INFO.id,
                message_id: message.id
              }
              return api.post('superbles/superble_message/', bodyData).then((res) => {
                if(res.data.message == "Like removed"){
                  firebaseService.database().ref('conversations').child(convodata.FIREBASE_CONVERSATION_ID).child("messages").child(message.id).child("superbles").child(convodata.SENDER_USER.id).set(false)
                }else if(res.data.message == "Like added") {
                  firebaseService.database().ref('conversations').child(convodata.FIREBASE_CONVERSATION_ID).child("messages").child(message.id).child("superbles").child(convodata.SENDER_USER.id).set(true)
                }
              }).catch((error) => {
                  console.log('error while submitting',error.response)
              });
          }
      }catch(error){
          alert('No device Id found.')
      }
    }
    }catch(error){
        alert('No Access token Found.')
    }
  }

  render() {
  const isCurrentUser = this.props.isCurrentUser
  const alignItems = isCurrentUser ? 'flex-end' : 'flex-start'
  const margin = isCurrentUser ? {marginLeft: MESSAGE_TEXT_MARGIN} : {marginRight: MESSAGE_TEXT_MARGIN}
  const date = relativeDate(new Date(this.props.message.updatedAt))
  const convoData = this.props.convoData
  const liked = this.props.message.superbles ? this.props.message.superbles[convoData.SENDER_USER.id] : false
  const liked2 = this.props.message.superbles ? this.props.message.superbles[convoData.RECEIVER_USER.id] : false
  
  if(this.props.message.body != ""){
  return (
    <View style={styles.container}>
      { isCurrentUser && <View style={ [styles.bubbleView] }>
        <View style={{flexWrap:'wrap', flexDirection:'row',width:30}}>
          <TouchableOpacity onPress={()=> alert("Sorry you can't like yours own message")}>
              <Image source={liked2 ? require('../../../../../assets/like-superble.png') : require('../../../../../assets/ic-superble-00.png')} style={{width:30, height:30}}/>
          </TouchableOpacity>
        </View>
        <View style={{flexWrap:'wrap', flexDirection:'row',width:'88%', justifyContent:'flex-end', alignItems:'center'}}>
          <View style={{backgroundColor:'#dddddd', borderRadius: 3, padding: 3, maxWidth: '88%'}}> 
            <Text style={[styles.messageText, {flex: 1}]}>{this.props.message.body}</Text>
          </View>
          <Image source={convoData.RECEIVER_USER.imageUrl ? {uri: convoData.RECEIVER_USER.imageUrl} : require('../../../../../assets/chatUserScreen.png')} style={{width:36, height:36, borderRadius:18}}/>
        </View>
      </View>}
      { !isCurrentUser && <View style={ [styles.bubbleView] }>
        <View style={{flexWrap:'wrap', flexDirection:'row',width:'88%', justifyContent:'flex-start', alignItems:'center'}}>
          <Image source={convoData.SENDER_USER.imageUrl ? {uri: convoData.SENDER_USER.imageUrl} : require('../../../../../assets/chatUserScreen.png')} style={{width:36, height:36, borderRadius:18}}/>
          <View style={{backgroundColor:'#fff',borderColor:'#777',borderWidth:0.5, borderRadius: 3, padding: 3, maxWidth: '88%'}}> 
            <Text style={[styles.messageText, {flex: 1}]}>{this.props.message.body}</Text>
          </View>
        </View>
        <View style={{flexWrap:'wrap', flexDirection:'row',width:30}}>
          <TouchableOpacity onPress={()=> this.likeDislikeMessage(convoData, this.props.message)} >
            <Image source={liked ? require('../../../../../assets/like-superble.png') : require('../../../../../assets/ic-superble-00.png')} style={{width:30, height:30}}/>
          </TouchableOpacity>
        </View>
      </View>}
    </View>
  )
}else {
  return null
}
}
}

MessageRowComponent.propTypes = {
  isCurrentUser: PropTypes.bool.isRequired,
  message: PropTypes.shape({
    createdAt: PropTypes.number.isRequired,
    text: PropTypes.string.isRequired,
    user: PropTypes.shape({
      email: PropTypes.string.isRequired
    })
  })
}

export default MessageRowComponent
