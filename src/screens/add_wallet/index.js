import React from 'react';
import { View, Text, AsyncStorage, Modal, Dimensions, Image, TouchableWithoutFeedback, TextInput, Platform, TouchableOpacity } from 'react-native';
import { Icon, Content } from 'native-base';
import moment from 'moment';
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
import Constants from '../../constants';
const backBtn = Platform.OS == "ios" ? { justifyContent: 'center', alignItems: 'center', height: 20, padding: 10, margin: 10, width: 20 } : { margin: 10 }

export default class AddWallet extends React.Component {

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

            // <Button title= "Save" onPress={()=> navigation.navigate('EditProfile')} />
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            isAddWalletModalShow: false,
            isRadioActive: false,
            walletArr: [],
            perviousPaymentArr: [],
            paypalEmail: '',
            radioImage: require('../../assets/inactive_radio.png')
        }
    }

    componentDidMount() {
        this.getUserPaymentEmailList()
        this.perviousPayment()

    }

    addWallet = () => {

        AsyncStorage.getItem('isLoggedIn')
            .then((value) => {
                if (value === null) {
                    return this.props.navigation.navigate('Account');
                } else {
                    AsyncStorage.getItem('deviceID').then((did) => {
                        if (did === null) {
                            return this.props.navigation.navigate('Account');
                        } else {
                            fetch(Constants.url.base + `user_payments`, {
                                method: 'POST',
                                headers: {
                                    'Authorization': 'Token token=' + value + ';device_id=' + did,
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    email: this.state.paypalEmail,
                                    method: 'Paypal'
                                }),
                            })
                                .then(response => response.json())
                                .then(responseData => {
                                    this.setState({ isAddWalletModalShow: false })
                                    this.getUserPaymentEmailList()

                                }).catch((err) => {
                                    this.setState({ isAddWalletModalShow: false })
                                    console.log(err)
                                });
                        }

                    })
                }
            });
    }


    perviousPayment() {

        AsyncStorage.getItem('isLoggedIn')
            .then((value) => {
                if (value === null) {
                    return this.props.navigation.navigate('Account');
                } else {
                    AsyncStorage.getItem('deviceID').then((did) => {
                        if (did === null) {
                            return this.props.navigation.navigate('Account');
                        } else {
                            fetch(Constants.url.base + `user_transactions`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': 'Token token=' + value + ';device_id=' + did,
                                    'Content-Type': 'application/json',
                                },
                            })
                                .then(response => response.json())
                                .then(responseData => {
                                    var arr = []
                                    for (var i = 0; i < responseData.data.length; i++) {
                                        if (responseData.data[i].status_name == "ACCEPTED") {
                                            arr.push(responseData.data[i])
                                        }
                                    }
                                    this.setState({ perviousPaymentArr: arr })

                                }).catch((err) => {
                                    console.log(err)
                                });
                        }

                    })
                }
            });
    }

    getUserPaymentEmailList = () => {

        AsyncStorage.getItem('isLoggedIn')
            .then((value) => {
                if (value === null) {
                    return this.props.navigation.navigate('Account');
                } else {
                    AsyncStorage.getItem('deviceID').then((did) => {
                        if (did === null) {
                            return this.props.navigation.navigate('Account');
                        } else {
                            fetch(Constants.url.base + `user_payments`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': 'Token token=' + value + ';device_id=' + did,
                                    'Content-Type': 'application/json',
                                },
                            })
                                .then(response => response.json())
                                .then(responseData => {
                                    this.setState({ walletArr: responseData.data })
                                    for (let i in responseData.data) {
                                        if (responseData.data[i].is_default) {
                                            this.setState({ activeIndex: i })
                                        }
                                    }
                                }).catch((err) => {
                                    console.log(err)
                                });
                        }

                    })
                }
            });
    }


    removeUserPaymentEmail = (item) => {
        var emailid = item.id
        if (item.is_default) {
            alert("You can't delete your default wallet")
        } else {
            AsyncStorage.getItem('isLoggedIn')
                .then((value) => {
                    if (value === null) {
                        return this.props.navigation.navigate('Account');
                    } else {
                        AsyncStorage.getItem('deviceID').then((did) => {
                            if (did === null) {
                                return this.props.navigation.navigate('Account');
                            } else {
                                fetch(Constants.url.base + `user_payments/${emailid}`, {
                                    method: 'DELETE',
                                    headers: {
                                        'Authorization': 'Token token=' + value + ';device_id=' + did,
                                        'Content-Type': 'application/json',
                                    },
                                })
                                    .then(response => response.json())
                                    .then(responseData => {
                                        this.getUserPaymentEmailList()
                                    }).catch((err) => {
                                        console.log(err)
                                    });
                            }

                        })
                    }
                });
        }
    }


    _openAddWalletModal = () => {
        this.setState({ isAddWalletModalShow: true })
    }


    _closeModal = () => {
        this.setState({ isAddWalletModalShow: false })

    }

    componentWillUnmount() {
        const { params } = this.props.navigation.state;
        const isFromBadges = params ? params.isFromBadges : null;
        if (isFromBadges) {
            params.onUpdate()
        }
    }




    checkRadio = (item, index) => {
        AsyncStorage.getItem('isLoggedIn')
            .then((value) => {
                if (value != null) {
                    AsyncStorage.getItem('deviceID').then((did) => {
                        if (did != null) {

                            fetch(Constants.url.base + `user_payments/${item.id}/default`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': 'Token token=' + value + ';device_id=' + did,
                                    'Content-Type': 'application/json',
                                },
                            })
                                .then(response => response.json())
                                .then(responseData => {
                                    this.setState({ activeIndex: index })
                                }).catch((err) => {
                                    console.log(err)
                                });
                        }

                    })
                }
            });
    }

    render() {
        return (
            <View style={{backgroundColor:'#FAFAFA'}}>
                {this.state.walletArr != undefined && this.state.walletArr.length > 0 &&
                    <View style={{ height: deviceHeight / 2 - 100,backgroundColor:'white' }}>
                        <Text style={{
                            marginLeft: 12,
                            paddingTop: 12,
                            paddingBottom: 3,
                            fontSize: 15,
                            color: '#C08A4F',
                        }}>ACTIVE WALLETS</Text>
                        <Content>
                            {this.state.walletArr.map((item, index) => {
                                return (
                                    <View style={{ flexDirection: 'row', height: 60, alignItems: 'center', justifyContent: 'flex-start', }}>
                                        <TouchableOpacity style={{ marginHorizontal: 10, }} onPress={() => this.checkRadio(item, index)}>
                                            <Image source={index == this.state.activeIndex ? require('../../assets/active_radio.png') : require('../../assets/inactive_radio.png')} />
                                        </TouchableOpacity>
                                        <Image style={{ height: 30, width: 55 }} source={require('../../assets/paypal.png')} />
                                        <Text style={{ margin: 5, fontSize: 16, width: '55%', color: 'black' }}>{item.email} </Text>
                                        <TouchableOpacity onPress={() => this.removeUserPaymentEmail(item)} style={{ position: 'absolute', right: 10 }}>
                                            <Image style={{ height: 26, width: 26 }} source={require('../../assets/ic-crossd.png')} />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })

                            }
                        </Content>
                    </View>}




                <TouchableOpacity onPress={this._openAddWalletModal} style={{ flexDirection: 'row', width: '35%', alignItems: 'center', margin: 15, backgroundColor:'#FAFAFA' }}>
                    <Image style={{ width: 25, height: 25 }} source={require('../../assets/ic-add.png')} />
                    <Text style={{ color: '#04a4cc', margin: 5, fontSize: 17 }}>Add Wallet</Text>
                </TouchableOpacity>

                {this.state.perviousPaymentArr.length > 0 &&
                    <View style={{ height: 300, marginVertical: 10,backgroundColor:'#FAFAFA' }}>
                        <Text style={{
                            marginLeft: 12,
                            paddingTop: 12,
                            paddingBottom: 3,
                            fontSize: 17,
                            color: '#7c6001',
                        }}>PREVIOUS WITHDRAWALS</Text>
                        <Content>
                            {this.state.perviousPaymentArr.map((item, index) => {
                                return (
                                    <View style={{ flexDirection: 'row', height: 40, marginHorizontal: 15, alignItems: 'center', justifyContent: 'flex-start', }}>
                                        <Text style={{ width: '75%', color: 'black', fontSize: 15, }}>{item.amount} Points = {item.amount / 10} SGD</Text>
                                        <Text style={{ marginHorizontal: 10 }}>{moment(item.created_at).format('MM/DD/YYYY')}</Text>
                                    </View>
                                );
                            })
                            }
                        </Content>
                    </View>}



                <Modal
                    visible={this.state.isAddWalletModalShow}
                    animationType={'fade'}
                    transparent={true}
                    presentationStyle="overFullScreen"
                    onRequestClose={this._closeModal}
                    >
                    <TouchableWithoutFeedback onPress={this._closeModal}>
                        <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>

                            <TouchableWithoutFeedback>
                                <View style={{ backgroundColor: "#fff", borderRadius: 2, position: 'absolute', width: 340, left: (deviceWidth / 2) - 170, top: (deviceHeight / 2) - 95, height: 190, paddingLeft: 10, paddingRight: 10, }}>
                                    <View style={{ width: '100%', alignItems: 'center' }}>
                                        <Text style={{ color: 'black', marginTop: 10, fontSize: 15 }}>ADD PAYPAL</Text>
                                        <TouchableOpacity onPress={() => this._closeModal()} style={{ position: 'absolute', right: 0, top: 5 }}>
                                            <Image style={{ height: 26, width: 26 }} source={require('../../assets/ic-crossd.png')} />
                                        </TouchableOpacity>
                                    </View>


                                    <TextInput onChangeText={(paypalEmail) => this.setState({ paypalEmail })} value={this.state.paypalEmail} style={{ height: 50, marginTop: 50, borderBottomColor: 'gray', borderBottomWidth: Platform.OS == 'ios' ? 1 : 0, fontSize: 15 }}
                                        placeholder='Enter Email'
                                        />

                                    <View style={{ flexDirection: 'row', marginTop: 25, justifyContent: 'flex-end' }}>
                                        <TouchableOpacity onPress={this.addWallet}>
                                            <Text style={{ color: '#00a4cb', fontWeight: '300', fontSize: 15 }}> CONFIRM </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={{ marginLeft: 8 }} onPress={this._closeModal} >
                                            <Text style={{ color: '#00a4cb', fontWeight: '300', fontSize: 15 }}> CANCEL </Text>
                                        </TouchableOpacity>
                                    </View>

                                </View>
                            </TouchableWithoutFeedback>

                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        );
    }

}
