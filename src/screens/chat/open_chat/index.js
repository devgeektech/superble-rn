import React, { Component } from 'react';
import { Container, Header, Content, Icon } from 'native-base';
import { Image, Text, Platform, View, TouchableOpacity, AsyncStorage, ActivityIndicator } from 'react-native';

import { restoreSession, loginUserWithToken, adminToken } from '../../firebase/store/session/actions'
import firebaseService from '../../firebase/services/firebase';
import * as types from '../../firebase/store/chat/actionTypes';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Constants from '../../../constants';
import axios from 'axios';
const backBtn = Platform.OS == "ios" ? { justifyContent: 'center', alignItems: 'center', height: 20, padding: 10, margin: 10, width: 20 } : { margin: 10 }

export default class OpenChat extends Component {
	static navigationOptions = ({ navigation }) => {
		const { params = {} } = navigation.state;
		return {
			tabBarLabel: 'Open Chats',
			headerTintColor: 'black',
			headerStyle: {
				backgroundColor: 'white'
			},
			headerLeft: <TouchableOpacity style={backBtn} onPress={() => navigation.goBack(null)} >
				{/* <Image style={{height:20,padding:10, margin:10, width:20}}source ={require('../../assets/back.png')}/> */}
				<Icon name='arrow-back' style={{ color: 'black' }} />
			</TouchableOpacity>
		}
	};

	constructor(props) {
		super(props)
		this.state = {
			data: [],
			loaded: false
		}
	}

	componentDidMount() {
		this.loadPreviousChats()
	}

	loadPreviousChats = () => {
		AsyncStorage.getItem('loggedinUserData').then((userdata) => {
			userdata = JSON.parse(userdata)
			var uid = userdata.profile_object.id
			const FIREBASE_REF_CONVERSATION_LIST = firebaseService.database().ref('users').child(uid)
			FIREBASE_REF_CONVERSATION_LIST.orderByChild("lastMessage/updatedAt").on('value', (snapshot) => {
				var jsonObj = snapshot.val()
				var arr = []
				if (jsonObj) {
					var keys = Object.keys(jsonObj);
					for (let k of keys) {
						arr.push(jsonObj[k])
					}
				}
				arr.reverse()
				var ids = "";
				for (i = 0; i < arr.length; i++) {
					ids = arr[i].users.receiver.id + "," + ids;
				}
				this.getUserImage(ids).then((res) => {
					for (i = 0; i < arr.length; i++) {
						for(j = 0; j < res.length; j++){
							if(arr[i].users.receiver.id == res[j].id){
								arr[i].users.receiver = res[j]
							}
						}
					}
					this.setState({ data: arr, loaded: true })
				})
			}, error => {
				this.setState({ loaded: true })
			})
		})
	}

	async getUserImage(ids) {
		try {
			const atoken = await AsyncStorage.getItem('isLoggedIn');
			if (atoken !== null) {
				try {
					const deviceID = await AsyncStorage.getItem('deviceID');
					if (deviceID != null) {
						const api = axios.create({
							baseURL: Constants.url.base,
							timeout: 200000,
							headers: {
                                'Authorization': 'Token ' + atoken + ';device_id=' + deviceID
                            },
							params: {user_ids: ids}
						});
						console.log('reached', atoken, deviceID)
						return await api.get('profiles/list_names_by_ids').then((response) => {
							return response.data.users
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

	_openChat(chatReqObj) {
		const senderId = parseFloat(chatReqObj.users.sender.id);
		const recipientId = parseFloat(chatReqObj.users.receiver.id);
		var newConvoId;
		if (recipientId > senderId) {
			newConvoId = "convo_" + senderId + "_" + recipientId + "_" + chatReqObj.product.id;
		} else {
			newConvoId = "convo_" + recipientId + "_" + senderId + "_" + chatReqObj.product.id;
		}

		const productInfo = this.buildProductInfoForFirebase(chatReqObj);
		const senderUser = this.buildSenderForFirebase(chatReqObj);
		const recipientUser = this.buildRecipientForFirebase(chatReqObj);

		var chatDetAct = {
			"FIREBASE_CONVERSATION_ID": newConvoId,
			"TITLE": recipientUser.name + " - " + chatReqObj.product.name,
			"PRODUCT_INFO": productInfo,
			"SENDER_USER": senderUser,
			"RECEIVER_USER": recipientUser
		}
		this.props.navigation.navigate('ChatScreen', { convo_info: chatDetAct });
	}

	buildSenderForFirebase = (chatReqObj) => {
		return {
			id: chatReqObj.users.receiver.id,
			name: chatReqObj.users.receiver.name,
			imageUrl: chatReqObj.users.receiver.imageUrl
		}
	}

	buildRecipientForFirebase = (chatReqObj) => {
		return {
			id: chatReqObj.users.sender.id,
			name: chatReqObj.users.sender.name,
			imageUrl: chatReqObj.users.sender.imageUrl
		}
	}

	buildProductInfoForFirebase = (chatReqObj) => {
		return {
			id: chatReqObj.product.id,
			name: chatReqObj.product.name,
			imageUrl: chatReqObj.product.imageUrl
		}
	}

	render() {
		return (
			<View style={[{flex: 1, backgroundColor:'#fff'},this.state.data.length == 0 ? {alignItems:'center', justifyContent:'center'} : {}]}>
			{this.state.loaded && this.state.data.length == 0 && <Text style = {{fontSize:18, color:'black',textAlign:'center'}}>{"Don't waste time! Invite people to talk about the products you love!"}</Text>}
				{this.state.loaded && this.state.data.length != 0 && <Content>
					
					{this.state.data.map((item, index) => {
						return (
							<TouchableOpacity key={item.title} onPress={() => this._openChat(item)}>
								<View style={{ height: 70, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
									<Image style={{ height: 50, marginHorizontal: 10, width: 50, borderRadius: 25 }} source={{ uri: item.users.receiver.imageUrl ? item.users.receiver.imageUrl : item.users.receiver.image_url }} />
									<View style={{ width: '70%', flexDirection: 'column' }}>
										<Text style={{ color: 'black', fontSize: 16 }}>{item.users.receiver.name ? item.users.receiver.name : item.users.receiver.user_name}</Text>
										<Text>{item.lastMessage.body.length > 20 ? item.lastMessage.body.slice(0,20)+'..' : item.lastMessage.body}</Text>
									</View>
									{item.unreadCount > 0 && <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: 'red', width: 26, height: 26, borderRadius: 13 }}>
										<Text style={{ textAlign: 'center', color: '#fff', justifyContent: 'center', alignItems: 'center' }}>
											{item.unreadCount}
										</Text>
									</View>
									}
								</View>
								<View style={{ width: '100%', height: 0.5, backgroundColor: 'gray' }} />
							</TouchableOpacity>
						);
					})}
				</Content>}
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