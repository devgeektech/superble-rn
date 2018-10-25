import React, { Component } from 'react'
import { FlatList, Text } from 'react-native'
import PropTypes from 'prop-types'
import { onlineStatus, readStatus } from '../../../firebase/store/chat'
import MessageRow from './MessageRow'



import styles from './Styles'

const ITEM_HEIGHT = 50

class MessageListComponent extends Component {

  constructor() {
    super()

    this.renderItem = ({item}) => {
      return <MessageRow message={item} convoData={this.props.convoData}/>
    }

    this.emptyList = () => {
      return (
        <Text
          style={styles.placeholder}>
          {'placeholder'}
        </Text>
      )
    }

    this.itemLayout = (data, index) => (
      {length: ITEM_HEIGHT, offset: ITEM_HEIGHT * index, index}
    )
  }
  componentDidMount() {
    var uid = this.props.convoData ?  this.props.convoData.RECEIVER_USER.id : null
    var cid = this.props.convoData ? this.props.convoData.FIREBASE_CONVERSATION_ID : null
    if(uid){
      onlineStatus(uid, true)
      readStatus(uid, cid)
    }
  }

  componentDidUpdate() {
    if (this.props.data.length) {
        this.flatList.scrollToIndex({animated: true, index: 0});
    }
  }

  componentWillUnmount(){
    var uid = this.props.convoData ?  this.props.convoData.RECEIVER_USER.id : null
    if(uid){
      onlineStatus(uid, false)
    }
  }

  render() {
    const data = this.props.data
    const contentContainerStyle = data.length ? null : styles.flatlistContainerStyle
    return (
      <FlatList
        ref={(c) => { this.flatList = c }}
        style={styles.container}
        contentContainerStyle={contentContainerStyle}
        data={data}
        keyExtractor={item => item.time}
        renderItem={this.renderItem}
        getItemLayout={this.itemLayout}
        ListEmptyComponent={this.emptyList}
        inverted />
    )
  }
}

MessageListComponent.propTypes = {
  data: PropTypes.array.isRequired,
}

export default MessageListComponent
