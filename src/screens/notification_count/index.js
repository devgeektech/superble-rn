import React, { Component } from 'react';
import { Container, Header, Content, Button, Icon } from 'native-base';
import { Image, Text, TouchableOpacity, AsyncStorage, View, Platform, ActivityIndicator } from 'react-native';

import firebaseService from '../firebase/services/firebase';
import * as types from '../firebase/store/chat/actionTypes';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import relativeDate from 'relative-date';
const backBtn = Platform.OS == "ios" ? { justifyContent: 'center', alignItems: 'center', height: 20, padding: 10, margin: 10, width: 20 } : { margin: 10 }

export default class NotificationAlert extends Component {

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title: '',
            headerTintColor: 'black',
            headerStyle: {
                backgroundColor: 'white'
            },
            headerLeft: <TouchableOpacity style={backBtn} onPress={() => navigation.goBack()} >
                <Icon name='arrow-back' style={{ color: 'black' }} />
            </TouchableOpacity>,

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
        this.getNotificationCout()
    }

    getNotificationCout() {
        AsyncStorage.getItem('loggedinUserData').then((userData) => {
            userData = JSON.parse(userData)
            if (userData) {
                var uid = userData.profile_object.id
                firebaseService.database().ref('notifications').child(uid).limitToLast(20).on('value', (snapshot) => {
                    var jsonObj = snapshot.val()
                    var arr = []
                    if (jsonObj) {
                        var keys = Object.keys(jsonObj);
                        for (let k of keys) {
                            firebaseService.database().ref('notifications').child(uid).child(k).child("status").set("read")
                            arr.push(jsonObj[k])
                        }
                        arr.reverse()
                    }
                    this.setState({ data: arr, loaded: true });
                }, (error)=> {
                    this.setState({loaded: true})
                })
            }
        })
    }

    navigateTo(item) {
        switch (item.type) {
            case "badge_progressed":
                this.props.navigation.navigate('Mybadges')
            case "badge_lost":
                this.props.navigation.navigate('Mybadges')
            case "point_earned":
                this.props.navigation.navigate('Mybadges')
            case "badge_upgraded":
                this.props.navigation.navigate('Mybadges')
                break;
            case "request_accepted":
                this.props.navigation.navigate('Chat')
                // move to open chat 
                break;
            case "request_sent":
                this.props.navigation.navigate('Chat')
                // move to new request
                break;
            case "liked_message":
                this.props.navigation.navigate('Chat')
                // move to chat 
                break;
            case "chat":
                this.props.navigation.navigate('ChatScreen')
                // move to chat 
                break;
            case "post_question":
                this.props.navigation.navigate('Product', { item: item.product_id })
            // move to product details
            case "liked_comment":
                this.props.navigation.navigate('Product', { item: item.product_id })
                // move to product
                break;
            default:
                resultIntent = new Intent(context, HomeActivity.class);
                broadcaster.onProfileUpdated();
                break;
        }

    }


    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.state.loaded && <Content>

                    {this.state.data.map((item, index) => {
                        return (
                            <TouchableOpacity key={item.created_at + index} onPress={() => this.navigateTo(item)}>
                                <View style={{ height: 70, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                    <Image style={{ height: 50, marginHorizontal: 10, width: 50, borderRadius: 25 }} source={{ uri: item.image_url }} />
                                    <View style={{ width: '50%', flexDirection: 'column' }}>
                                        <Text>{item.message}</Text>
                                    </View>
                                    <Text style={{ width: '30%', textAlign: 'right', fontSize: 10 }}>{relativeDate(new Date(item.created_at * 1000))}</Text>
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
                    </View>
                    }
            </View>
        );
    }
};

