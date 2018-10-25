import React, { Component } from 'react';
import { Container, Header, Content, Icon } from 'native-base';
import { Image, Text,Dimensions, Platform, TouchableOpacity, AsyncStorage, View, ActivityIndicator } from 'react-native';
import { restoreSession, loginUserWithToken, adminToken } from '../../firebase/store/session/actions'
// import { createChatRef } from '../../firebase/store/chat/actions'
import firebaseService from '../../firebase/services/firebase';
import * as types from '../../firebase/store/chat/actionTypes';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

import Constants from '../../../constants';
import axios from 'axios';
const backBtn = Platform.OS == "ios" ? { justifyContent: 'center', alignItems: 'center', height: 20, padding: 10, margin: 10, width: 20 } : { margin: 10 }

export default class NewRequest extends Component {

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            tabBarLabel: 'New Request',
            headerTintColor: 'black',
            headerStyle: {
                backgroundColor: 'white'
            },
            headerLeft: <TouchableOpacity style={backBtn} onPress={() => navigation.goBack(null)} >
                <Icon name='arrow-back' style={{ color: 'black' }} />
            </TouchableOpacity>
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            data: [], 
            loaded: false
        }
    }

    componentDidMount() {
        this.getRequests()
        this.refeshFirebaseToken()
    }

    getvalue() {
        AsyncStorage.getItem('loggedinUserData')
            .then((value) => {
                if (value != null) {
                    var dataJson = JSON.parse(value)
                    this.props.firebaseToken(dataJson.profile_object.firebase_token)
                }
            })
    }

    async getRequests() {
        console.log('hryy data')
        try {
            const atoken = await AsyncStorage.getItem('isLoggedIn');
            if (atoken !== null) {
                try {
                    const deviceID = await AsyncStorage.getItem('deviceID');
                    if (deviceID != null) {
                        const api = axios.create({
                            baseURL: Constants.url.base,
                            timeout: 200000,
                            responseType: 'json',
                            headers: {
                                'Authorization': 'Token ' + atoken + ';device_id=' + deviceID
                            }
                        });
                        return api.get('requests').then((response) => {
                            console.log('got data', response)
                            this.setState({ data: response.data.requests, loaded: true })
                        }).catch((error) => {
                            this.setState({loaded: true})
                            console.log('got error', error)
                        })
                    }
                } catch (error) {
                    console.log('got error', error.response)
                }
            }
        } catch (error) {
            console.log('got error', error.response)
        }
    }

    refeshFirebaseToken() {
        console.log('got notification data', this.props.notifications)
    }

    async declineRequest(id) {
        try {
            const atoken = await AsyncStorage.getItem('isLoggedIn');
            if (atoken !== null) {
                try {
                    const deviceID = await AsyncStorage.getItem('deviceID');
                    if (deviceID != null) {
                        const api = axios.create({
                            baseURL: Constants.url.base,
                            timeout: 200000,
                            responseType: 'json',
                            headers: {
                                'Authorization': 'Token ' + atoken + ';device_id=' + deviceID
                            },
                            params: {
                                id: id
                            }
                        });
                        return api.post('requests/decline').then((response) => {
                            this.getRequests()
                        }).catch((error) => {
                            console.log('got error', error.response)
                        })
                    }
                } catch (error) {
                    console.log('got error', error.response)
                }
            }
        } catch (error) {
            console.log('got error', error.response)
        }
    }

    async acceptRequest(chatReqObj) {
        try {
            const atoken = await AsyncStorage.getItem('isLoggedIn');
            if (atoken !== null) {
                try {
                    const deviceID = await AsyncStorage.getItem('deviceID');
                    if (deviceID != null) {
                        const api = axios.create({
                            baseURL: Constants.url.base,
                            timeout: 200000,
                            responseType: 'json',
                            headers: {
                                'Authorization': 'Token ' + atoken + ';device_id=' + deviceID
                            },
                            params: {
                                id: chatReqObj.id
                            }
                        });
                        return api.get('requests/accept').then((response) => {
                            this.createChatRef(chatReqObj)
                            this.getRequests()
                        }).catch((error) => {
                            console.log('got error', error.response)
                        })
                    }
                } catch (error) {
                    console.log('got error', error.response)
                }
            }
        } catch (error) {
            console.log('got error', error.response)
        }
    }

    createChatRef = (chatReqObj) => {
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

        const messageModel = this.buildMessageModelForFirebase(chatReqObj);
        const productInfo = this.buildProductInfoForFirebase(chatReqObj);
        const senderUser = this.buildSenderForFirebase(chatReqObj);
        const recipientUser = this.buildRecipientForFirebase(chatReqObj);
        const senderConvo = this.buildConversationInfoForFirebase(chatReqObj,
            messageModel, productInfo, senderUser, recipientUser);
        const receiverConvo = this.buildConversationInfoForFirebase(chatReqObj,
            messageModel, productInfo, recipientUser, senderUser);

        var newMessageRef = FIREBASE_REF_CONVERSATION_LIST.child(newConvoId).child("messages")
        newMessageRef.push().set(messageModel, (error) => {
            if (error) {
                console.log('inside error')
            } else {
                var chatDetAct = {
                    "FIREBASE_CONVERSATION_ID": newConvoId,
                    "TITLE": senderConvo.title,
                    "PRODUCT_INFO": productInfo,
                    "SENDER_USER": senderUser,
                    "RECEIVER_USER": recipientUser
                }
                this.props.navigation.navigate('ChatScreen', { convo_info: chatDetAct });
            }
        })
        FIREBASE_REF_REQUESTSENDER_CONVO_LIST.child(newConvoId).set(receiverConvo);
        FIREBASE_REF_REQUESTRECIPIENT_CONVO_LIST.child(newConvoId).set(senderConvo);
    }

    chatMessageSuccess = () => ({
        type: types.CHAT_MESSAGE_SUCCESS
    })

    chatMessageError = error => ({
        type: types.CHAT_MESSAGE_ERROR,
        error
    })

    buildMessageModelForFirebase = (chatReqObj) => {
        var d = new Date().getTime();
        return {
            id: null,
            updatedAt: d,
            sender: this.buildSenderForFirebase(chatReqObj),
            type: "product",
            body: ""

        }
    }

    buildSenderForFirebase = (chatReqObj) => {
        return {
            id: chatReqObj.recipient.id,
            name: chatReqObj.recipient.name,
            imageUrl: chatReqObj.recipient.profile_pic_url
        }
    }
    buildRecipientForFirebase = (chatReqObj) => {
        return {
            id: chatReqObj.sender.id,
            name: chatReqObj.sender.name,
            imageUrl: chatReqObj.sender.profile_pic_url
        }
    }
    buildProductInfoForFirebase = (chatReqObj) => {
        return {
            id: chatReqObj.product.id,
            name: chatReqObj.product.name,
            imageUrl: chatReqObj.product.image_url
        }
    }

    buildConversationInfoForFirebase = (chatReqObj, messageModel, productInfo, senderUser, recipientUser) => {
        var newConvo = {
            users: this.ConversationUsersModel(senderUser, recipientUser),
            product: productInfo,
            lastMessage: messageModel,
            lastReadTill: 0
        }
        newConvo['title'] = recipientUser.name + " - " + chatReqObj.product.name;
        newConvo['image_url'] = chatReqObj.product.image_url;
        return newConvo;
    }

    ConversationUsersModel = (sender, receiver) => {
        return {
            sender: sender,
            receiver: receiver
        }
    }


    render() {

        
            return (

               
                <View style={ [{flex: 1, backgroundColor:'#fff'}, this.state.data.length == 0 ? {alignItems:'center', justifyContent:'center'} : {}]  }>
                   
                   {this.state.loaded &&  this.state.data.length == 0  && <Text style = {{fontSize:18, color:'black',textAlign:'center'}}>{"You have 0 pending chat requests :( \n Don't waste time! Upload or swipe \n more of your favorite products."}</Text>}
                    {this.state.loaded && this.state.data.length != 0 && <Content >
    
                        {this.state.data.map((item, index) => {
                            return (
                                <View key={item.id + index}>
                                    {/* <TouchableOpacity onPress={()=> this.props.navigation.navigate('ChatScreen')}> */}
                                    <View style={{ height: 70, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                        <Image style={{ height: 50, marginHorizontal: 10, width: 50, borderRadius: 25 }} source={{ uri: item.sender.profile_pic_url }} />
                                        <View style={{ width:deviceWidth - 220, flexDirection: 'column' }}>
                                            <Text style={{ color: 'black', fontSize: 13 }}>{item.sender.name}</Text>
                                            <Text style={{ fontSize: 13 }}>{item.product.brand + ' - ' + item.product.name}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', marginTop: -15, marginHorizontal: 8, alignItems: 'center' }}>
                                            <Image style={{ height: 20, margin: 8, width: 20 }} source={require('../../../assets/ic-badges.png')} />
                                            <Text style={{ fontSize: 15,width:25 }}>{item.sender.points}</Text>
                                        </View>
                                        <TouchableOpacity style={{ marginHorizontal: 5, }} onPress={() => this.acceptRequest(item)}>
                                            <Image style={{ height: 30, width: 30 }} source={require('../../../assets/ic-selected.png')} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => this.declineRequest(item.id)}>
                                            <Image style={{ height: 30, width: 30 }} source={require('../../../assets/ic-crossd.png')} />
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ width: '100%', height: 0.5, backgroundColor: 'gray' }} />
                                    {/* </TouchableOpacity> */}
                                </View>
                            );
                        })}
    
                         
                    </Content>
                 
                }
                  
                    
                    {!this.state.loaded && <View style={{
                        backgroundColor: '#fff',
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <ActivityIndicator size="large" />
                    </View>}
                </View>
            );
        
       
    }


};

