import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { loadMessages } from '../../../firebase/store/chat/actions'
import { getChatItems } from '../../../firebase/store/chat/selectors'

import MessageListComponent from './Component'

class MessagesListContainer extends Component {

  componentDidMount() {
    this.props.loadMessages(this.props.id)
  }



  render() {
    const data = getChatItems(this.props.messages).reverse();
    return (
      <MessageListComponent
        data={data} convoData={this.props.convoData}/>
    )
  }
}

const mapStateToProps = state => ({
  messages: state.chat.messages,
  error: state.chat.loadMessagesError
})

const mapDispatchToProps = {
  loadMessages: loadMessages
}

MessagesListContainer.propTypes = {
  messages: PropTypes.object,
  error: PropTypes.string,
  loadMessages: PropTypes.func.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(MessagesListContainer)
