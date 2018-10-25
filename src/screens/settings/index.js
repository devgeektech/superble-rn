import React from 'react';
import { Alert, Dimensions, Image, Modal, StyleSheet, Text, Platform, TextInput, TouchableOpacity, TouchableWithoutFeedback, View, ScrollView, Linking, Share, AsyncStorage } from 'react-native';
import { Container, Header, Left, Body, Right, Button, Icon, Content, Card, CardItem, Item, ListItem } from 'native-base';
import FABExample from '../fab/index.js'
import firebaseService from '../firebase/services/firebase';
import Constants from '../../constants';
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
import email from 'react-native-email'
import { EventRegister } from 'react-native-event-listeners'

const backBtn = Platform.OS == "ios" ? { justifyContent: 'center', alignItems: 'center', height: 20, padding: 10, margin: 10, width: 20 } : { margin: 10 }

let currentEmail = 'abc@xyz.com'
export default class Settings extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title: '',
            headerTintColor: 'black',
            headerStyle: {
                backgroundColor: 'white'
            },
            headerLeft: <TouchableOpacity style={backBtn} onPress={() => navigation.goBack()} >
                {/* <Image style={{height:20,padding:10, margin:10, width:20}}source ={require('../../assets/back.png')}/> */}
                <Icon name='arrow-back' style={{ color: 'black' }} />
            </TouchableOpacity>,

        }
    };

    constructor(props) {
        super(props);
        this.state = {
            pwModalVisible: false,
            emailModalVisible: false,
            confirmLogoutVisible: false,
            emailPassword: '',
            newEmail: '',
            newPassword: '',
            password: '',
            oldPassword: '',
            confirmPassword: '',
            confirmEmail: ''

        }
    }
    componentWillMount() {
        AsyncStorage.getItem('loggedinUserData').then((userData) => {
            if (userData != null) {
                userData = JSON.parse(userData)
                this.setState({ userEmail: userData.profile_object.email })
            }
        })
    }


    getUserData() {
        AsyncStorage.getItem('loggedinUserData').then((userData) => {
            if (userData != null) {
                userData = JSON.parse(userData)
                userData.profile_object.email = this.state.newEmail
                AsyncStorage.setItem('loggedinUserData', JSON.stringify(userData))
                this.setState({ userEmail: this.state.newEmail, newEmail: '', confirmEmail: '', password: '' })

            }
        })
    }
    _changePwModelOpen = () => {
        this.setState({ pwModalVisible: true })
    }

    _changeEmailModelOpen = () => {
        this.setState({ emailModalVisible: true })
    }

    _closeModal = () => {
        this.setState({ pwModalVisible: false })
        this.setState({ emailModalVisible: false })
    }


    changePassword = () => {

        if (this.state.newPassword != this.state.confirmPassword) {
            alert("Password doesn't match")
            return
        }
        if (this.state.oldPassword == '' || this.state.newPassword == '' || this.state.confirmPassword == '') {
            alert("All fields are required")
            return
        } else {
            AsyncStorage.getItem('isLoggedIn')
                .then((value) => {
                    if (value != null) {

                        AsyncStorage.getItem('deviceID').then((did) => {
                            if (did != null) {

                                fetch(Constants.url.base + 'sessions/edit_password', {
                                    method: 'PUT',
                                    headers: {
                                        'Authorization': 'Token token=' + value + ';device_id=' + did,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        password: this.state.oldPassword,
                                        new_password: this.state.newPassword,
                                        sessiontoken: value
                                    }),
                                }).then((response) => response.json())
                                    .then((responseJson) => {
                                        if (responseJson.message == "Password changed successfully") {
                                            this.setState({ oldPassword: '', newPassword: '', confirmPassword: '' })
                                            Alert.alert("Alert", responseJson.message, [
                                                { text: "OK", onPress: () => { this.setState({ pwModalVisible: false }) } }
                                            ])
                                        } else {
                                            Alert.alert("Alert", responseJson.message, [
                                                { text: "OK" }
                                            ])
                                        }
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                    });
                            }

                        })
                    }
                });
        }

    }
    changeEmail = () => {

        if (this.state.newEmail != this.state.confirmEmail) {
            alert("Email doesn't match")
            return
        }

        if (this.state.newEmail == '' || this.state.password == '' || this.state.confirmEmail == '') {
            alert("All fields are required")
            return
        } else {
            AsyncStorage.getItem('isLoggedIn')
                .then((value) => {
                    if (value != null) {

                        AsyncStorage.getItem('deviceID').then((did) => {
                            if (did != null) {
                                fetch(Constants.url.base + 'sessions/edit_email', {
                                    method: 'PUT',
                                    headers: {
                                        'Authorization': 'Token token=' + value + ';device_id=' + did,
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                        email: this.state.userEmail,
                                        password: this.state.password,
                                        new_email: this.state.newEmail,
                                        sessiontoken: value
                                    }),
                                }).then((response) => response.json())
                                    .then(responseJson => {
                                        if (responseJson.message == "Email changed successfully") {
                                            this.getUserData()
                                            Alert.alert("Alert", responseJson.message, [
                                                { text: "OK", onPress: () => { this.setState({ emailModalVisible: false }) } }
                                            ])
                                        } else {
                                            Alert.alert("Alert", responseJson.message, [
                                                { text: "OK" }
                                            ])
                                        }
                                    })
                                    .catch((error) => {
                                        console.log(error)
                                    });
                            }

                        })
                    }
                });
        }
    }

    openMail = () => {
        const to = "supportcrew@superble.com"
        email(to, {
            subject: 'Feedback',
            body: ``
        }).catch(console.error)

    }

    _shareFunction = () => {
        let content_share = {
            message: 'Hi',
            title: 'Hello'
        };
        let options_share = {};
        Share.share(content_share, options_share);
    }

    signOutUser = () => {
        AsyncStorage.removeItem('isLoggedIn');
        AsyncStorage.removeItem('loggedinUserData');
        // this.setState({isLoggedIn: null});
        firebaseService.auth().signOut();
        this.setState({ confirmLogoutVisible: false })
        EventRegister.emit('changeUserStatus', { login: false })
        this.props.navigation.navigate('Home', { item: '1' });
    }
    _showLogoutModal() {
        this.setState({ confirmLogoutVisible: true })
    }

    _closeLogoutModal() {
        this.setState({ confirmLogoutVisible: false })
    }
    render() {
        return (
            <Container style={{backgroundColor:'#fafafa'}}>
                <Content>
                    <Text style={styles.titles}>Basic Settings</Text>
                    <ListItem style={{ flexDirection: 'column', paddingTop:0 }}>

                        <View style={styles.mainView}>
                            <Left style={{ width: '5%' }}>

                                <Image style={{ width: 18, marginLeft: 5, height: 18 }} source={require('../../assets/ic-feedback2.png')} />
                            </Left>
                            <View style={styles.textView}>
                                <TouchableOpacity onPress={() => this._changeEmailModelOpen()} >
                                    <Text style={styles.subText}> Change Email </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.mainView}>
                            <Left style={{ width: '5%' }}>

                                <Image style={{ width: 18, marginLeft: 5, height: 18 }} source={require('../../assets/ic-change-password.png')} />
                            </Left>
                            <View style={styles.textView}>
                                <TouchableOpacity onPress={() => this._changePwModelOpen()} >
                                    <Text style={styles.subText}> Change Password </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.mainView}>
                            <Left style={{ width: '5%' }}>

                                <Image style={{ width: 18, marginLeft: 5, height: 18 }} source={require('../../assets/ic-notifications.png')} />
                            </Left>
                            <View style={styles.textView}>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('Notifications')} >
                                    <Text style={styles.subText}> Notifications </Text>
                                </TouchableOpacity >
                            </View>
                        </View>
                        <View style={styles.mainView}>
                            <Left style={{ width: '5%' }}>
                                <Image style={{ width: 18, marginLeft: 5, height: 18 }} source={require('../../assets/ic-wallet.png')} />
                            </Left>
                            <View style={styles.textView}>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('AddWallet')} >
                                    <Text style={styles.subText}> Add Wallet </Text>
                                </TouchableOpacity >
                            </View>
                        </View>
                    </ListItem>

                    <Text style={styles.titles}>Details</Text>
                    <ListItem style={{ flexDirection: 'column',paddingTop:0 }}>

                        <View style={styles.mainView}>
                            <Left style={{ width: '5%' }}>

                                <Image style={{ width: 18, marginLeft: 5, height: 18 }} source={require('../../assets/ic-about-superble.png')} />
                            </Left>
                            <View style={styles.textView}>
                                <TouchableOpacity onPress={() => Linking.openURL('https://superble.com/about-us')}>
                                    <Text style={styles.subText}> About Us </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.mainView}>
                            <Left style={{ width: '5%' }}>

                                <Image style={{ width: 18, marginLeft: 5, height: 18 }} source={require('../../assets/ic-privacy.png')} />
                            </Left>
                            <View style={styles.textView}>
                                <TouchableOpacity onPress={() => Linking.openURL('https://superble.com/privacy-policy')}>
                                    <Text style={styles.subText}> Privacy </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.mainView}>
                            <Left style={{ width: '5%' }}>

                                <Image style={{ width: 18, marginLeft: 5, height: 18 }} source={require('../../assets/ic-terms-of-service.png')} />
                            </Left>
                            <View style={styles.textView}>
                                <TouchableOpacity onPress={() => this.props.navigation.navigate('Terms')} >
                                    <Text style={styles.subText}> Terms </Text>
                                </TouchableOpacity >
                            </View>
                        </View>
                    </ListItem>

                    <Text style={styles.titles}> Profile </Text>

                    <ListItem style={{ flexDirection: 'column',paddingTop:0 }}>

                        <View style={styles.mainView}>
                            <Left style={{ width: '5%' }}>

                                <Image style={{ width: 18, marginLeft: 5, height: 18 }} source={require('../../assets/ic-feedback.png')} />
                            </Left>
                            <View style={styles.textView}>
                                <TouchableOpacity onPress={() => this.openMail()} >
                                    <Text style={styles.subText}> Send Feedback </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.mainView}>
                            <Left style={{ width: '5%' }}>
                                <Image style={{ width: 18, marginLeft: 8, height: 18, tintColor:'#404042' }} source={require('../../assets/ic_logout_dark.png')} />
                            </Left>
                            <View style={styles.textView}>
                                <TouchableOpacity onPress={() => this._showLogoutModal()}>
                                    <Text style={styles.subText}> Logout </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </ListItem>

                    {/* Change Password Model */}
                    <Modal
                        visible={this.state.pwModalVisible}
                        animationType={'fade'}
                        transparent={true}
                        presentationStyle="overFullScreen"
                        onRequestClose={() => this._closeModal()}
                        >
                        <TouchableWithoutFeedback onPress={() => { this._closeModal() } }>
                            <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>

                                <TouchableWithoutFeedback>
                                    <View style={{ backgroundColor: "#fff", borderRadius: 2, position: 'absolute', left: '5%', right: '5%', top: '20%', height: '35%', paddingLeft: 10, paddingRight: 10, }}>
                                        <Text style={{ color: 'gray', marginTop: 10, fontSize: 20 }}>Change Password</Text>
                                        <TextInput onChangeText={(oldPassword) => this.setState({ oldPassword })} value={this.state.oldPassword} style={{ height: 50, borderBottomColor: 'gray', borderBottomWidth: Platform.OS == 'ios' ? 1 : 0, fontSize: 15 }}
                                            placeholder='Old Password' secureTextEntry={true} autoCapitalize='none'
                                            />
                                        <TextInput onChangeText={(newPassword) => this.setState({ newPassword })} value={this.state.newPassword} style={{ height: 50, borderBottomColor: 'gray', borderBottomWidth: Platform.OS == 'ios' ? 1 : 0, fontSize: 15 }}
                                            placeholder='New Password (6-20 chars)' secureTextEntry={true} autoCapitalize='none'
                                            />
                                        <TextInput onChangeText={(confirmPassword) => this.setState({ confirmPassword })} value={this.state.confirmPassword} style={{ height: 50, borderBottomColor: 'gray', borderBottomWidth: Platform.OS == 'ios' ? 1 : 0, fontSize: 15 }}
                                            placeholder='Re-Confirm Password' secureTextEntry={true} autoCapitalize='none'
                                            />
                                        <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'flex-end' }}>
                                            <TouchableOpacity onPress={this.changePassword} >
                                                <Text style={{ color: '#5D87A1', fontWeight: '300', fontSize: 15 }}> CONFIRM </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => this._closeModal()} >
                                                <Text style={{ color: '#5D87A1', fontWeight: '300', fontSize: 15 }}> CANCEL </Text>
                                            </TouchableOpacity>
                                        </View>

                                    </View>
                                </TouchableWithoutFeedback>

                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                    {/* Chnage Email Modal */}
                    <Modal
                        visible={this.state.emailModalVisible}
                        animationType={'fade'}
                        transparent={true}
                        presentationStyle="overFullScreen"
                        onRequestClose={() => this._closeModal()}
                        >
                        <TouchableWithoutFeedback onPress={() => { this._closeModal() } }>
                            <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>

                                <TouchableWithoutFeedback>
                                    <View style={{ backgroundColor: "#fff", position: 'absolute', marginLeft: (deviceWidth / 2) - 160, borderRadius: 2, width: 320, top: (deviceHeight/2)-125, height: 250, paddingLeft: 10, paddingRight: 10, }}>
                                        <Text style={{ color: 'gray', marginTop: 10, fontSize: 20 }}>Change Email</Text>
                                       {/* <TextInput style={{ height: 50, borderBottomColor: 'gray', borderBottomWidth: Platform.OS == 'ios' ? 1 : 0, fontSize: 15 }} editable={false}
                                            value={this.state.userEmail} autoCapitalize='none'
                                            />*/}
                                        <TextInput onChangeText={(password) => this.setState({ password })} value={this.state.password} style={{ height: 50, borderBottomColor: 'gray', borderBottomWidth: Platform.OS == 'ios' ? 1 : 0, fontSize: 15 }}
                                            placeholder='Password' secureTextEntry={true} autoCapitalize='none'
                                            />
                                        <TextInput onChangeText={(newEmail) => this.setState({ newEmail })} value={this.state.newEmail} style={{ height: 50, borderBottomColor: 'gray', borderBottomWidth: Platform.OS == 'ios' ? 1 : 0, fontSize: 15 }}
                                            placeholder='New Email Address' autoCapitalize='none'
                                            />
                                        <TextInput onChangeText={(confirmEmail) => this.setState({ confirmEmail })} value={this.state.confirmEmail} style={{ height: 50, borderBottomColor: 'gray', borderBottomWidth: Platform.OS == 'ios' ? 1 : 0, fontSize: 15 }}
                                            placeholder='Re-Confirm New Email Address' autoCapitalize='none'
                                            />
                                        <View style={{ flexDirection: 'row', marginTop: 15, justifyContent: 'flex-end' }}>
                                            <TouchableOpacity onPress={this.changeEmail} >
                                                <Text style={{ color: '#5D87A1', fontWeight: '300', fontSize: 15 }}> CONFIRM </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity style={{ marginLeft: 8 }} onPress={() => this._closeModal()} >
                                                <Text style={{ color: '#5D87A1', fontWeight: '300', fontSize: 15 }}> CANCEL </Text>
                                            </TouchableOpacity>
                                        </View>

                                    </View>
                                </TouchableWithoutFeedback>

                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                    <Modal
                        visible={this.state.confirmLogoutVisible}
                        animationType={'fade'}
                        transparent={true}
                        presentationStyle="overFullScreen"
                        onRequestClose={() => this._closeLogoutModal()}
                        >
                        <TouchableWithoutFeedback onPress={() => { this._closeLogoutModal() } }>
                            <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>

                                <TouchableWithoutFeedback>
                                    <View style={{ backgroundColor: "#fff", alignItems: 'center', height: 130, marginTop: (deviceHeight / 2) - 60, width: 350, marginLeft: (deviceWidth / 2) - 175, padding: 15 }}>
                                        <Text style={{color:'black'}}>Do you really want to close Superble?</Text>
                                        <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginTop: 30 }}>
                                            <TouchableOpacity onPress={() => this._closeLogoutModal()} style={{ width: '48%', backgroundColor: '#fff', paddingVertical: 15, marginRight: '2%', borderColor: '#ccc', borderWidth: 1 }}>
                                                <Text style={{ color: 'rgba(0, 0, 0, 0.5)', textAlign: 'center', fontWeight: 'bold' }}> CANCEL </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity onPress={() => this.signOutUser()} style={{ width: '48%', backgroundColor: 'black', paddingVertical: 15, marginLeft: '2%' }}>
                                                <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}> LOG OUT </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                </Content>

                <FABExample navigator={this.props.navigation} />
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    icons: {
        marginLeft: 5,
        color: '#000',
    },
    mainView: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        paddingVertical: 10,
        width: '100%',
    },
    titles: {
        marginLeft: 10,
        paddingTop: 12,
        paddingBottom: 3,
        color: '#C08A4F',
    },
    textView: {
        width: '90%',
    },
	
	subText:{
	color:'#000'}
})