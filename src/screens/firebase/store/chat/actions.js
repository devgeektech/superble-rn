import { AsyncStorage } from 'react-native';
import * as types from './actionTypes'
import firebaseService from '../../services/firebase';

const FIREBASE_REF_MESSAGES = firebaseService.database().ref('notifications').child('61')
const FIREBASE_REF_MESSAGES_LIMIT = 20

// long senderId = Long.parseLong(chatRequest.getSender().getId());
// long recipientId = Long.parseLong(chatRequest.getRecipient().getId());

export const sendMessage = (uid,message, cid, rid) => {
  return (dispatch) => {
    dispatch(chatMessageLoading())
    var newMessageRef = firebaseService.database().ref('conversations').child(uid).child("messages").push()
    var key = newMessageRef.key
    message.id = key
    lastMessageOfCurrentUser(uid, cid, message)
    lastMessageOfReceiverUser(uid, rid, message)
    newMessageRef.set(message, (error) => {
        if (error) {
          dispatch(chatMessageError(error.message))
        } else {
          dispatch(chatMessageSuccess())
        }
      })
      var status = false;
      var unreadCount = 0;
      firebaseService.database().ref('onlineUsers').child(rid).on('value', (snapshot) => {
        status = snapshot.val()
      })
      var RECEIVER_USER_CHAT_REF = firebaseService.database().ref('users').child(rid)
      var notificationQueueReference = firebaseService.database().ref("notificationsQueue");
      RECEIVER_USER_CHAT_REF.child(uid).child("unreadCount").on('value', (snapshot) => {
        if(snapshot.val()){
          unreadCount = snapshot.val()
        }
      })
        if(!status){
          var newNotification = notificationQueueReference.push();
          var notificationModel = {
            conversationId:uid,
            message:message,
            recieverId:rid
          }
          newNotification.set(notificationModel);
          RECEIVER_USER_CHAT_REF.child(uid).child("unreadCount").set(unreadCount + 1)
        }else {
          RECEIVER_USER_CHAT_REF.child(uid).child("unreadCount").set(0)
        }
  }
}

export const onlineStatus = (userid, status) => {
  firebaseService.database().ref('onlineUsers').child(userid).set(status, (error) => {
    if (error) {
      console.log('status changed error')
    } else {
      console.log('status changed successfully')
    }
  })
}

export const readStatus = (rid, uid) => {
  firebaseService.database().ref('users').child(rid).child(uid).child("unreadCount").set(0)
}

const lastMessageOfCurrentUser = (mid, cid, message) => {
  var C_USER_REF = firebaseService.database().ref('users').child(cid).child(mid)
  C_USER_REF.child("lastMessage").set(message, (error) => {
    if (error) {
      console.log('last message update cu error')
    } else {
      console.log('last message update cu successfully')
    }
  })
}

const lastMessageOfReceiverUser = (mid, rid, message) => {
  var R_USER_REF = firebaseService.database().ref('users').child(rid).child(mid)
  R_USER_REF.child("lastMessage").set(message, (error) => {
    if (error) {
      console.log('last message update ru error')
    } else {
      console.log('last message update ru successfully')
    }
  })
}

export const updateMessage = text => {
  return (dispatch) => {
    dispatch(chatUpdateMessage(text))
  }
}

export const loadNotifications = (userid) =>{
  return (dispatch) => {
    firebaseService.database().ref('notifications').child(userid).limitToLast(FIREBASE_REF_MESSAGES_LIMIT).on('value', (snapshot) => {
      var jsonObj = snapshot.val()
      var arr = []
      var keys = Object.keys(jsonObj);
      for(let k of keys){
        arr.push(jsonObj[k])
      }
      dispatch(loadNoficationSuccess(arr))
    }, (errorObject) => {
      dispatch(loadMessagesError(errorObject.message))
    })
  }
}

export const loadMessages = (newConvoId) => {
  return (dispatch) => {
    firebaseService.database().ref('conversations').child(newConvoId).child("messages").on('value', (snapshot) => {
      dispatch(loadMessagesSuccess(snapshot.val()))
    }, (errorObject) => {
      dispatch(loadMessagesError(errorObject.message))
    })
  }
}

export const createChatRef = (chatReqObj)=> {
  return (dispatch) => {
    const FIREBASE_REF_CONVERSATION_LIST = firebaseService.database().ref('conversations');
    const FIREBASE_REF_REQUESTSENDER_CONVO_LIST = firebaseService.database().ref('users').child(chatReqObj.sender.id);
    const FIREBASE_REF_REQUESTRECIPIENT_CONVO_LIST = firebaseService.database().ref('users').child(chatReqObj.recipient.id);
    const senderId = parseFloat(chatReqObj.sender.id);
    const recipientId = parseFloat(chatReqObj.recipient.id);
    var newConvoId;
    if (recipientId > senderId) {
        newConvoId = "convo_" + senderId + "_" + recipientId + "_" + chatReqObj.product.id;
    } else {
        newConvoId = "convo_" + recipientId + "_" + senderId + "_" + chatReqObj.product.id;
    }
    const messageModel = buildMessageModelForFirebase(chatReqObj);
    const productInfo = buildProductInfoForFirebase(chatReqObj);
    const senderUser = buildSenderForFirebase(chatReqObj);
    const recipientUser = buildRecipientForFirebase(chatReqObj);
    const senderConvo = buildConversationInfoForFirebase(chatReqObj,
                messageModel, productInfo, senderUser, recipientUser);
    const receiverConvo = buildConversationInfoForFirebase(chatReqObj,
                messageModel, productInfo, recipientUser, senderUser);

        // put to Firebase
    var newMessageRef = FIREBASE_REF_CONVERSATION_LIST.child(newConvoId).child("messages")
    newMessageRef.push().set(messageModel, (error) => {
      if (error) {
        dispatch(chatMessageError(error.message))
      } else {
        dispatch(chatMessageSuccess())
      }
    })
    
    
    
    
    // .set(messageModel, new DatabaseReference.CompletionListener() {
    //         @Override
    //         public void onComplete(DatabaseError databaseError, DatabaseReference databaseReference) {
    //             Intent chatDetAct = new Intent(getActivity(), ChatDetailsActivity.class);
    //             chatDetAct.putExtra("FIREBASE_CONVERSATION_ID", newConvoId);
    //             chatDetAct.putExtra("TITLE", senderConvo.getTitle());
    //             chatDetAct.putExtra("PRODUCT_INFO", productInfo);
    //             chatDetAct.putExtra("SENDER_USER", senderUser);
    //             chatDetAct.putExtra("RECEIVER_USER", recipientUser);
    //             startActivity(chatDetAct);
    //         }

    // Chat Request Receiver = Chat Sender = Chat Initiator
    FIREBASE_REF_REQUESTSENDER_CONVO_LIST.child(newConvoId).set(receiverConvo);
    FIREBASE_REF_REQUESTRECIPIENT_CONVO_LIST.child(newConvoId).set(senderConvo);
  }
}

const buildMessageModelForFirebase = (chatReqObj) =>{
  var d = new Date();
  var n = d.getMilliseconds();
  return {
    id:null, 
    updatedAt: (n / 1000), 
    sender: buildSenderForFirebase(chatReqObj),
    type: "product",
    body: ""
                
  }
}

const buildSenderForFirebase = (chatReqObj) => {
  return {
      id: chatReqObj.recipient.id,
      name: chatReqObj.recipient.name,
      imageUrl:chatReqObj.recipient.profile_pic_url
  }
}
const buildRecipientForFirebase = (chatReqObj) => {
  return {
    id: chatReqObj.sender.id,
    name: chatReqObj.sender.name,
    imageUrl:chatReqObj.sender.profile_pic_url
  }
}
const buildProductInfoForFirebase = (chatReqObj) => {
  return {
    id: chatReqObj.product.id,
    name: chatReqObj.product.name,
    imageUrl:chatReqObj.product.image_url
  }
}

const buildConversationInfoForFirebase = (chatReqObj, messageModel, productInfo, senderUser, recipientUser) => {
  var newConvo = {
    users: ConversationUsersModel(senderUser, recipientUser),
    product: productInfo,
    lastMessage: messageModel,
    lastReadTill: 0
  }
  newConvo['title'] = recipientUser.name + " - " + chatReqObj.product.name;
  newConvo['image_url'] = chatReqObj.product.image_url;
  return newConvo;
}

const ConversationUsersModel = (sender,receiver) => {
  return {
    sender:sender,
    receiver:receiver
  }
}

const chatMessageLoading = () => ({
  type: types.CHAT_MESSAGE_LOADING
})

const chatMessageSuccess = () => ({
  type: types.CHAT_MESSAGE_SUCCESS
})

const chatMessageError = error => ({
  type: types.CHAT_MESSAGE_ERROR,
  error
})

const chatUpdateMessage = text => ({
  type: types.CHAT_MESSAGE_UPDATE,
  text
})

const loadMessagesSuccess = messages => ({
  type: types.CHAT_LOAD_MESSAGES_SUCCESS,
  messages
})
const loadNoficationSuccess = notifications => ({
  type: types.NOTIFICATION_MESSAGE_SUCCESS,
  notifications
})


const loadMessagesError = error => ({
  type: types.CHAT_LOAD_MESSAGES_ERROR,
  error
})