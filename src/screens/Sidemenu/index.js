// import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { NavigationActions } from 'react-navigation';
import { ScrollView, Platform, Linking, Text, View, Image, StyleSheet, TouchableOpacity, TouchableHighlight, AsyncStorage } from 'react-native';
import { DrawerNavigator, addNavigationHelpers, StackNavigator } from 'react-navigation';
import {
    Container,
    Header,
    Left,
    Body,
    Right,
    Button,
    Icon,
    Content,
    Footer,

} from 'native-base';

// import { restoreSession,loginUserWithToken, adminToken } from '../firebase/store/session/actions'
// import { loadNotifications } from '../firebase/store/chat/actions'
import firebaseService from '../firebase/services/firebase';
import * as types from '../firebase/store/chat/actionTypes';
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Constants from '../../constants';
import { EventRegister } from 'react-native-event-listeners'

export default class SideMenu extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            header: null,
            headerMode: 'none',
        }
    }

    //   navigateToScreen = (route) => () => {
    //     const navigateAction = NavigationActions.navigate({
    //       routeName: route
    //     });
    //     this.props.navigation.dispatch(navigateAction);
    //   }
    signOutUser = () => {
        AsyncStorage.setItem('isLoggedIn', '');
        AsyncStorage.setItem('loggedinUserData', '');
        this.setState({ isLoggedIn: null });
        this.props.navigation.navigate('Home', { item: '1' });
    }

    signInUser = () => {
        this.setState({ pressStatus: true });
        this.props.navigation.navigate('Account');
        this.setState({ pressStatus: false });
    }
    userProfile = () => {
        this.setState({ pressStatus: true });
        this.props.navigation.navigate('Profile', { "userID": this.state.userID });
        this.setState({ pressStatus: false });
    }
    forceUpdateHandler() {
        this.forceUpdate();
    };
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: null,
            pressStatus: false,
            firstName: '',
            imgUrl: null,
            badgeimage: null,
            notif_count: '0',
            url: 'https://superble.com/how-to'
        }
        this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
        this.userProfile = this.userProfile.bind(this);
    }


    componentDidMount() {
        const { params } = this.props.navigation.state;
        const value = params ? params.user : null;
        AsyncStorage.getItem('updateSideMenu').then((data) => {
            if (data != null) {
                this.setState({ updateSideMenu: data })
            }
        })
        this.steuserState()
        this.getNotificationCout()
        this.profileUpdatelistener = EventRegister.addEventListener('profileUpdated', (data) => {
            this.steuserState();
        })
        this.notificationListener = EventRegister.addEventListener('changeUserStatus', (data) => {
            if (data.login) {
                this.getNotificationCout()
            }

        })
    }

    componentWillUnmount() {
        EventRegister.removeEventListener(this.notificationListener)
        EventRegister.removeEventListener(this.profileUpdatelistener)
    }

    getNotificationCout() {
        AsyncStorage.getItem('isLoggedIn')
            .then((value) => {
                if (value === null) {
                    this.setState({ isLoggedIn: null });
                } else {
                    this.setState({ isLoggedIn: value });
                    AsyncStorage.getItem('loggedinUserData')
                        .then((value) => {
                            if (value != null) {
                                var dataJson = JSON.parse(value);
                                firebaseService.database().ref('notifications').child(dataJson.profile_object.id).limitToLast(25).on('value', (snapshot) => {
                                    var jsonObj = snapshot.val()
                                    var arr = []
                                    var count = 0
                                    if (jsonObj) {
                                        var keys = Object.keys(jsonObj);
                                        for (let k of keys) {
                                            if (jsonObj[k].status == "unread") {
                                                count++;
                                            }
                                            arr.push(jsonObj[k])
                                        }
                                    }
                                    if (count > 9) {
                                        this.setState({ notif_count: count + '+' })
                                    } else {
                                        this.setState({ notif_count: count.toString() })
                                    }
                                })
                            }
                        })
                }
            })
    }

    alertFun() {

        this.setState({ views: 4 })
        AsyncStorage.getItem('isLoggedIn')
            .then((value) => {
                if (value === null) {
                    this.setState({ isLoggedIn: null });
                } else {
                    this.setState({ isLoggedIn: value });
                }
            });
    }


    steuserState() {
        AsyncStorage.getItem('isLoggedIn')
            .then((value) => {
                if (value === null) {
                    this.setState({ isLoggedIn: null });
                } else {
                    this.setState({ isLoggedIn: value });
                    AsyncStorage.getItem('loggedinUserData')
                        .then((value) => {
                            if (value != null) {
                                var dataJson = JSON.parse(value);
                                this.setState({ userID: dataJson.profile_object.id })
                                fetch(Constants.url.base + 'profiles/' + dataJson.profile_object.id + '/info?pageviews=true').then((response) => response.json()).then((responseJson) => {
                                    imgUrl = (responseJson.profile_object.url);
                                    this.setState({ imgUrl: imgUrl });
                                    firstName = (responseJson.profile_object.user_name);
                                    this.setState({ firstName: firstName, viewsCount: responseJson.profile_object.page_views, badgeimage: responseJson.profile_object.badge.image_url, points: responseJson.profile_object.points });
                                }).catch((err) => {
                                    console.log(err)
                                })
                            }
                        });


                }
            });
    }

    openLink = () => {
        Linking.canOpenURL(this.state.url).then(supported => {
            if (!supported) {
                console.log('Can\'t handle url: ' + this.state.url);
            } else {
                return Linking.openURL(this.state.url);
            }
        }).catch(err => console.error('An error occurred', err));
    }

    render() {

        const isLoggedIn = this.state.isLoggedIn;
        var imgUrl = firstName = '';
        if (this.state.imgUrl != null) {
            imgUrl = this.state.imgUrl;
        } else {
            imgUrl = 'https://forums.iboats.com/user/avatar?userid=503684&type=large';
        }
        AsyncStorage.getItem('isLoggedIn')
            .then((value) => {

                if (value === null) {
                    this.setState({ isLoggedIn: null });
                } else {
                    if (this.state.isLoggedIn != value) {
                        this.steuserState()

                    } else {

                        AsyncStorage.getItem('updateSideMenu')
                            .then((data) => {
                                if (data != null) {

                                    if (data != this.state.updateSideMenu) {
                                        this.setState({ updateSideMenu: data })
                                        this.steuserState()
                                    }
                                }
                            })
                    }
                    this.setState({ isLoggedIn: value });
                }
            });



        return (

            <Container>

                { /*<Left>
                    <Image
                        resizeMode='contain'
                        source={require('../../assets/main.png')}
                        style={{height:70, width:50, paddingLeft:20}}
                    />
                </Left>

                <Body>
                    <Text style={{fontSize:15,color:'#666666'}}> Guest </Text>
                </Body>
                <Right>
                </Right> */}




                {isLoggedIn !== null ? (
                    <Header style={styles.header}>
                        <View style={styles.avatarWrap1}>
                            <TouchableOpacity
                                onPress={() => this.userProfile()}>
                                <Image
                                    style={styles.avatarWrap}
                                    resizeMode='cover'
                                    source={{ uri: imgUrl }}
                                    />
                                <Image style={styles.userLevelWrap} resizeMode='cover'
                                    source={{ uri: this.state.badgeimage }} />

                            </TouchableOpacity>

                        </View>
                        <Body style={{/*justifyContent:'flex-start', alignItems:'center'*/}}>
                            <View style={{ width: '100%', paddingLeft: 10 }}>

                                <Text style={{ fontSize: 18, color: '#414042', paddingTop:10 }}> {this.state.firstName} </Text>

                            </View>
                            <View style={{ flexDirection: 'row', padding: 10, marginTop: 0, alignItems:'center' }}>
                                <Image
                                    style={{ width: 25, height: 25 }}
                                    resizeMode='cover'

                                    source={require('../../assets/ic-badges.png')}
                                    />
                                <Text style={{ fontSize: 15, color: '#666666',paddingRight:20 }}> {this.state.points} </Text>
                                <Image
                                    style={{ width: 25, height: 25 }}
                                    resizeMode='cover'
                                    source={require('../../assets/ic-eye.png')}
                                    />
                                <Text style={{ fontSize: 15, color: '#666666' }}> {this.state.viewsCount} </Text>
                            </View>
                        </Body>
                        {/* <Right>*/}
                        <View style={{width:50, alignItems:'flex-end',justifyContent:'flex-start',paddingTop:10}}>
                            <TouchableOpacity  style={{width:'100%', alignItems:'flex-end',justifyContent:'flex-start'}} onPress={() => this.props.navigation.navigate('NotificationAlert')}>
                                <Image style={[{ width: 26, height: 26,right:5,top:3 }]} source={require('../../assets/ic-notifications.png')} />
                                {this.state.notif_count != '0' && <View style={{ width: 17, height: 17, backgroundColor: 'red', borderRadius: 8.5, alignItems:'center',justifyContent:'center',top:-26 }}>
                                    <Text style={{ textAlign:'center',color:'#fff',fontSize:12 }}>{this.state.notif_count}</Text>
                                </View>}
                            </TouchableOpacity>
                            </View>
                        {/*</Right>*/}
                    </Header>
                ) : (

                        <Header style={styles.header}>
                            <Left>
                                <Image
                                    resizeMode='contain'
                                    source={require('../../assets/ic_superble_gray.png')}
                                    style={{ height: 70, width: 70, paddingLeft: 20 }}
                                    />
                            </Left>

                            <Body>
                                <Text style={{ fontSize: 18, color: '#666666',paddingLeft:15 }}> Guest </Text>

                            </Body>
                            <Right>
                            </Right>
							
                        </Header>
						
						
                    )}






                {isLoggedIn !== null ? (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Container style={{ top: 350, flexDirection: 'column', height: 600 }}>
                            <TouchableOpacity onPress={this.openLink}>
                                <Text style={styles.footerText}> How to Win Points </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Mybadges')}>
                                <Text style={styles.footerText}> My Badges </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Settings')}>
                                <Text style={styles.footerText}> Account Settings </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('InviteFriends')}>
                                <Text style={styles.footerText}> Invite Friends </Text>
                            </TouchableOpacity>
                        </Container>
                    </ScrollView>
                ) : (
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Container style={{ top: 450, flexDirection: 'column', height: 800}}>

                                <TouchableOpacity onPress={this.openLink}>
                                    <Text style={styles.footerText}> How to Win Points </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.signInUser()}
                                    style={this.state.pressStatus ? styles.footerTextAreaHover : styles.footerTextArea} >
                                    <Text style={styles.footerTextBottom}> Sign In </Text>
                                </TouchableOpacity>
                            </Container>
                        </ScrollView>
                    )}



            </Container>
        );
    }
}

// SideMenu.propTypes = {
//   navigation: PropTypes.object
// };

const styles = StyleSheet.create({
    header: {
        height: 100,
        backgroundColor: '#fff',
		borderBottomWidth:1,
		borderTopColor: 'transparent',
		borderBottomColor:'#BCBCBC'
    },
    footer: {
        flexDirection: 'column',
        backgroundColor: '#fff',
        top: -10,
        borderTopColor: 'transparent'
    },
    footerText: {
        color: 'black',
        fontSize: 16,
        paddingTop: 15,
        paddingBottom: 15,
        paddingLeft: 15,
        fontWeight: '400',
    },
    footerTextArea: {
        backgroundColor: '#ffffff',
    },
    footerTextAreaHover: {
        backgroundColor: 'red',
    },
    userLevelWrap: {
        top: -2,
        right: -2,
        position: 'absolute',
        width: 30,
        height: 30,
        zIndex: 999,
    },
    footerTextBottom: {
        color: 'black',
        fontSize: 16,
        paddingTop: 15,
        paddingBottom: 35,
        paddingLeft: 15,
        fontWeight: '400',
        marginBottom: 10,
    },
    avatarWrap1: {
        width:80,
        alignItems:'center',
        justifyContent:'center',
        // width: 70,
        // height: 70,
        // borderRadius: 35,
        zIndex: 99,
        // overflow: 'hidden',
        // marginTop: 10,
    },
    avatarWrap: {
        width: 76,
        height: 76,
        borderRadius: 38,
        zIndex: 0,
    },
});