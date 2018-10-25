import React from 'react'
import { View } from 'react-native'

import MessagesList from './MessagesList'
import MessageForm from './MessageForm'

import styles from './Styles'

const ChatScreenComponent = (props) =>
  <View style={styles.container}>
    <MessagesList id={props.id} convoData={props.convoData}/>
    <MessageForm id={props.id} convoData={props.convoData}/>
  </View>

export default ChatScreenComponent
