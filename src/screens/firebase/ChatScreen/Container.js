import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ChatScreen from './Component'
import LogoutButton from './LogoutButton'
import { restoreSession,loginUserWithToken } from '../../firebase/store/session/actions'
import {loadMessages} from '../../firebase/store/chat/actions'
import{AsyncStorage} from 'react-native';
import { connect } from 'react-redux'

class ChatScreenContainer extends Component {

  static navigationOptions = {
    title: '',
    headerRight: <LogoutButton />
  }

  constructor(props){
    super(props)
    const { params } = this.props.navigation.state;
    const convoData = params ? params.convo_info : null;
    this.state = {
      convoData: convoData,
      convo_id: convoData.FIREBASE_CONVERSATION_ID
    }
  }


  render() {
    return (
      <ChatScreen id={this.state.convo_id} convoData={this.state.convoData}/>
    )
  }
}

const mapStateToProps = state => ({
  restoring: state.session.restoring,
  logged: state.session.user != null,
})

const mapDispatchToProps = {
  // restore: restoreSession,
  // data: loadMessages,
  
}

ChatScreenContainer.propTypes = {
  // restoring: PropTypes.bool.isRequired,
  // logged: PropTypes.bool.isRequired,
  // restore: PropTypes.func.isRequired,
  // data: PropTypes.func.isRequired,
  
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatScreenContainer)

