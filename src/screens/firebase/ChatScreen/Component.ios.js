import React from 'react'
import { KeyboardAvoidingView } from 'react-native'

import MessagesList from './MessagesList'
import MessageForm from './MessageForm'

import styles from './Styles'

const ChatScreenComponent = (props) =>
  <KeyboardAvoidingView
    style={styles.container}
    behavior='padding'
    keyboardVerticalOffset={64}>

    <MessagesList id={props.id} convoData={props.convoData}/>
    <MessageForm id={props.id} convoData={props.convoData}/>
  </KeyboardAvoidingView>

export default ChatScreenComponent
