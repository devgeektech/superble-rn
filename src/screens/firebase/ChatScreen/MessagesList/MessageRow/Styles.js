import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eeeeee',
    borderRadius: 5
  },
  bubbleView: {
    // backgroundColor: '#1E90FF',
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
    // borderRadius: 8,
    // padding:8
  },
  userText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  messageText: {
    // backgroundColor: 'lightgrey',
    // padding: 2,
    alignItems: 'center',
    justifyContent:'center',
    // borderRadius: 5,
    // flex: 1,
    color: '#777',
    fontSize: 16
  }
})
