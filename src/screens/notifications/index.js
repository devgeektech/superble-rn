import React from 'react';
import { View, Text,Dimensions,Modal, StyleSheet, Image, Alert, AsyncStorage,TouchableWithoutFeedback, TouchableOpacity, Platform } from 'react-native';
import { Container, Header, Button, Card, CardItem, Icon, CheckBox, Left, Right } from 'native-base';
import Constants from '../../constants';
const backBtn = Platform.OS == "ios" ? { justifyContent: 'center', alignItems: 'center', height: 20, padding: 10, margin: 10, width: 20 } : { margin: 10 }
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

export default class Notifications extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isChanged: false,
            navigate: this.props.navigation.navigate,
            isNotificationEnable: false,
            unlockedNewBadget: false,
            halfWayNewBadget: false,
            closeANewBadget: false,
            veryCloseToBadget: false,
            isVibrateOn: true,
            notificationEnableValue: 'both',
            unlockedNewBadgetValue: 'both',
            halfWayNewBadgetValue: 'both',
            closeANewBadgetValue: 'both',
            veryCloseToBadgetValue: 'both',
            confirmBack:false
        };
    }
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title: '',
            headerTintColor: 'black',
            headerLeft: <TouchableOpacity style={backBtn} onPress={() => params.handleEdit && params.handleEdit()} >
                <Icon name='arrow-back' style={{ color: 'black' }} />
            </TouchableOpacity>

            // <Icon style={{marginLeft:15}} name='arrow-back' onPress = {() => } />
        };
    };

    gotoEdit = () => {
        if (this.state.isChanged) {
            // Alert.alert(
            //     '',
            //     'Do you want to go back without saving?',
            //     [
            //         { text: 'NO', style: 'cancel' },
            //         { text: 'YES', onPress: () => this.props.navigation.goBack() },
            //     ],
            //     { cancelable: true }
            // )
            this.setState({confirmBack:true})
        } else {
            this.props.navigation.goBack()
        }

    }

    componentDidMount() {
        this.props.navigation.setParams({ handleEdit: () => this.gotoEdit() });
        this.getNotificationData()

        AsyncStorage.getItem('vibrateIsOn').then((value) => {
            if (value === null) {
                this.setState({ isVibrateOn: true })
            } else {
                let userData = JSON.parse(value)
                this.setState({ isVibrateOn: userData.vibrateIsOn })
            }

        })

    }

    getNotificationData() {
        AsyncStorage.getItem('isLoggedIn')
            .then((value) => {
                if (value != null) {
                    AsyncStorage.getItem('deviceID').then((did) => {
                        if (did != null) {
                            fetch(Constants.url.base + `notifications/settings`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': 'Token token=' + value + ';device_id=' + did,
                                    'Content-Type': 'application/json',
                                },

                            })
                                .then(response => response.json())
                                .then(responseData => {
                                    if (responseData.notification_data.enable_notifications == 'both') {
                                        this.setState({ isNotificationEnable: true, notificationEnableValue: 'both' })
                                    } else {
                                        this.setState({ isNotificationEnable: false, notificationEnableValue: 'phone' })
                                    }

                                    if (responseData.notification_data.halfway_to_badge == 'both') {
                                        this.setState({ halfWayNewBadget: true, halfWayNewBadgetValue: 'both' })
                                    } else {
                                        this.setState({ halfWayNewBadget: false, halfWayNewBadgetValue: 'phone' })
                                    }
                                    if (responseData.notification_data.unlock_new_badge == 'both') {
                                        this.setState({ unlockedNewBadget: true, unlockedNewBadgetValue: 'both' })
                                    } else {
                                        this.setState({ unlockedNewBadget: false, unlockedNewBadgetValue: 'phone' })
                                    }

                                    if (responseData.notification_data.very_close_to_badge == 'both') {
                                        this.setState({ veryCloseToBadget: true, veryCloseToBadgetValue: 'both' })
                                    } else {
                                        this.setState({ veryCloseToBadget: false, veryCloseToBadgetValue: 'phone' })
                                    }

                                    if (responseData.notification_data.close_to_badge == 'both') {
                                        this.setState({ closeANewBadget: true, closeANewBadgetValue: 'both' })
                                    } else {
                                        this.setState({ closeANewBadget: false, closeANewBadgetValue: 'phone' })
                                    }


                                }).catch((err) => {
                                    console.log(err)
                                });
                        }

                    })
                }
            });
    }

    vibrateIsOn() {

        if (this.state.isVibrateOn) {
            this.setState({ isVibrateOn: false, })
            let vibrateOn = {
                vibrateIsOn: false
            };
            AsyncStorage.setItem('vibrateIsOn', JSON.stringify(vibrateOn), () => {
            });
        } else {
            let vibrateOn = {
                vibrateIsOn: true
            };
            this.setState({ isVibrateOn: true })
            AsyncStorage.setItem('vibrateIsOn', JSON.stringify(vibrateOn), () => {
            });
        }
    }

    _closeConfirmModal(){
        this.setState({confirmBack:false})
    }

    backToSetting(){
        this.setState({confirmBack:false})
        this.props.navigation.goBack()
    }



    saveNotificationData() {

        AsyncStorage.getItem('isLoggedIn')
            .then((value) => {
                if (value != null) {
                    AsyncStorage.getItem('deviceID').then((did) => {
                        if (did != null) {
                            var data = {
                                enable_notifications: this.state.notificationEnableValue,
                                unlock_new_badge: this.state.unlockedNewBadgetValue,
                                halfway_to_badge: this.state.halfWayNewBadgetValue,
                                close_to_badge: this.state.closeANewBadgetValue,
                                very_close_to_badge: this.state.veryCloseToBadgetValue,
                            }

                            fetch(Constants.url.base + `notifications`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': 'Token token=' + value + ';device_id=' + did,
                                    'Content-Type': 'application/json',
                                },


                                body: JSON.stringify(data),

                            })
                                .then(response => response.json())
                                .then(responseData => {
                                    this.setState({ isChanged: false })
                                }).catch((err) => {
                                    console.log(err)
                                });
                        }

                    })
                }
            });
    }

    enableNotification() {
        if (this.state.isNotificationEnable) {
            this.setState({ isNotificationEnable: false, notificationEnableValue: 'phone' })
        } else {
            this.setState({ isNotificationEnable: true, notificationEnableValue: 'both' })
        }
        this.setState({ isChanged: true })
    }

    unlockedNewBadget() {
        if (this.state.unlockedNewBadget) {
            this.setState({ unlockedNewBadget: false, unlockedNewBadgetValue: 'phone' })
        } else {
            this.setState({ unlockedNewBadget: true, unlockedNewBadgetValue: 'both' })
        }
        this.setState({ isChanged: true })
    }

    halfWayNewBadget() {
        if (this.state.halfWayNewBadget) {
            this.setState({ halfWayNewBadget: false, halfWayNewBadgetValue: 'phone' })
        } else {
            this.setState({ halfWayNewBadget: true, halfWayNewBadgetValue: 'both' })
        }
        this.setState({ isChanged: true })
    }

    closeANewBadget() {
        if (this.state.closeANewBadget) {
            this.setState({ closeANewBadget: false, closeANewBadgetValue: 'phone' })
        } else {
            this.setState({ closeANewBadget: true, closeANewBadgetValue: 'both' })
        }
        this.setState({ isChanged: true })
    }

    veryCloseToBadget() {
        if (this.state.veryCloseToBadget) {
            this.setState({ veryCloseToBadget: false, closeANewBadgetValue: 'phone' })
        } else {
            this.setState({ veryCloseToBadget: true, closeANewBadgetValue: 'both' })
        }
        this.setState({ isChanged: true })
    }




    goBack = () => {
        this.props.navigation.navigate('Settings')
    }
    render() {
        // this.setState({notificationEnableValue = this.state.isNotificationEnable ? 'both' :'phone'})
        return (
            <Container style={{ flex: 1 }}>
                <Card style={{ flex: 3, paddingBottom: 10 }}>
                    <CardItem>
                        <Text style={styles.title}> Push Notifications </Text>
                    </CardItem>

                    <CardItem style={{paddingTop:0}}>
                        <Left>
                            <Text style={styles.subText}> Enable Notifications </Text>
                        </Left>
                        <Right style={styles.checkbox}>
                            <CheckBox color="#A9BC4C" onPress={(value) =>
                                this.enableNotification()
                            } checked={this.state.isNotificationEnable} />
                        </Right>
                    </CardItem>

                    <CardItem>
                        <Left>
                            <Text style={styles.subText}> RingTone </Text>
                        </Left>
                        <Right style={styles.checkbox}>
                            <CheckBox color="#A9BC4C" />
                        </Right>
                    </CardItem>

                    <CardItem>
                        <Left>
                            <Text style={styles.subText}> Vibrate </Text>
                        </Left>
                        <Right style={styles.checkbox}>
                            <CheckBox color="#A9BC4C" onPress={(value) =>
                                this.vibrateIsOn()
                            } checked={this.state.isVibrateOn} />
                        </Right>
                    </CardItem>
                </Card>

                <Card style={{ flex: 7 }}>
                    <CardItem>
                        <Left>
                            <Text style={styles.title}> Points and Badges </Text>
                        </Left>
                        <Right>
                            <Icon name="md-phone-portrait" />
                        </Right>
                    </CardItem>

                    <CardItem  style={{paddingTop:0}}>
                        <Left>
                            <Text style={styles.subText}> I unlocked a new badge </Text>
                        </Left>
                        <Right style={styles.checkbox}>
                            <CheckBox color="#A9BC4C" onPress={(value) =>
                                this.unlockedNewBadget()
                            } checked={this.state.unlockedNewBadget} />
                        </Right>
                    </CardItem>

                    <CardItem>
                        <Left>
                            <Text style={styles.subText}> I am half way to a new badge </Text>
                        </Left>
                        <Right style={styles.checkbox}>
                            <CheckBox color="#A9BC4C" onPress={(value) =>
                                this.halfWayNewBadget()
                            } checked={this.state.halfWayNewBadget} />
                        </Right>
                    </CardItem>

                    <CardItem>
                        <Left>
                            <Text style={styles.subText}> I am close to a new badge </Text>
                        </Left>
                        <Right style={styles.checkbox}>
                            <CheckBox color="#A9BC4C" onPress={(value) =>
                                this.closeANewBadget()
                            } checked={this.state.closeANewBadget} />
                        </Right>
                    </CardItem>

                    <CardItem>
                        <Left>
                            <Text style={styles.subText}> I am very close to a new badge </Text>
                        </Left>
                        <Right style={styles.checkbox}>
                            <CheckBox color="#A9BC4C" onPress={(value) =>
                                this.veryCloseToBadget()
                            } checked={this.state.veryCloseToBadget} />
                        </Right>
                    </CardItem>

                    <View style={{ position: 'absolute', bottom: 0, width: '100%' }}>
                        <Button block style={{ backgroundColor: '#EEB111' }} onPress={() => this.saveNotificationData()}>
                            <Text style={{ color: '#fff' }}> SAVE </Text>
                        </Button>
                    </View>
                </Card>
                <Modal
                    visible={this.state.confirmBack}
                    animationType={'fade'}
                    transparent={true}
                    presentationStyle="overFullScreen"
                    onRequestClose={() => this._closeConfirmModal()}
                    >
                    <TouchableWithoutFeedback onPress={() => { this._closeConfirmModal() } }>
                        <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>

                            <TouchableWithoutFeedback>
                                <View style={{ backgroundColor: "#fff", alignItems: 'center', height: 140, marginTop: (deviceHeight / 2) - 60, width: 340, marginLeft: (deviceWidth / 2) - 170, padding: 15 }}>
                                    <Text style={{ color: 'black',fontSize:15,paddingTop:10 }}>Do you want to go back without saving?</Text>
                                    <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginTop: 30 }}>
                                        <TouchableOpacity onPress={() => this._closeConfirmModal()} style={{ width: '48%', backgroundColor: '#fff', paddingVertical: 15, marginRight: '2%', borderColor: '#ccc', borderWidth: 1 }}>
                                            <Text style={{ color: 'rgba(0, 0, 0, 0.5)', textAlign: 'center', fontWeight: 'bold' }}> NO </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => this.backToSetting()} style={{ width: '48%', backgroundColor: 'black', paddingVertical: 15, marginLeft: '2%' }}>
                                            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}> YES </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    title: {
        color: '#C08A4F',
    },
    checkbox: {
        paddingRight: 5,
    },

    subText: {
        color: '#000'
    }
})