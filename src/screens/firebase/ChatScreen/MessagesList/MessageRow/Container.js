import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { AsyncStorage } from 'react-native'

import MessageRow from './Component'

import firebaseService from '../../../../firebase/services/firebase'

class MessageRowContainer extends Component {

  constructor(props) {
    super(props)

    this.state ={
      uid: 0
    }
  }

  componentDidMount(){
    AsyncStorage.getItem('loggedinUserData').then((userdata)=>{
      userdata = JSON.parse(userdata)
      var uid = userdata.profile_object.id
      this.setState({uid: uid})
    })
  }

  render() {
    const isCurrentUser = this.state.uid == this.props.message.sender.id;
    return (
      <MessageRow
        message={this.props.message}
        isCurrentUser={isCurrentUser}
        convoData={this.props.convoData}/>
    );
  }
}

MessageRowContainer.propTypes = {
  message: PropTypes.object.isRequired,
}

export default MessageRowContainer
