import React, { Component } from 'react';
import { Container, Header, View, Button, Icon, Fab, Content } from 'native-base';
import { Dimensions, Platform, Image, Modal, Animated, Easing, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, ScrollView, Linking, Share, AsyncStorage, TouchableNativeFeedback } from 'react-native';
import styles from './fabStyleCss';
var ImagePicker = require('react-native-image-picker');

import Constants from '../../constants';
import axios from 'axios';

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;


export default class FABExample extends Component {
    constructor(props) {
        super(props);
        this.state = {
            active: false,
            firstModalVisible: false,
            secondModalVisible: false,
            isFabTabbed: false
        };

        this._showFirstModal = this._showFirstModal.bind(this)
        this._ImgPicker = this._ImgPicker.bind(this)
    }

    _closeFirstModal() {
        this.setState({ firstModalVisible: false })
    }

    _showFirstModal() {
        AsyncStorage.getItem('isLoggedIn').then((token) => {
            if (token == null) {
                this.props.navigator.navigate('Account');
            } else {
                this.setState({ firstModalVisible: true })
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    _closeSecondModal() {
        this.setState({ secondModalVisible: false })
    }

    _showSecondModal() {
        this.setState({ firstModalVisible: false, secondModalVisible: true })
    }

    _articleClick() {
        this.setState({ firstModalVisible: false, secondModalVisible: false })
        this.props.navigator.navigate('UploadArticleStep1')
    }

    _ImgPicker = (camera) => {
        const options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            allowsEditing: true,
            storageOptions: {
                skipBackup: true
            }
        };

        if (camera) {
            ImagePicker.launchCamera(options, (response) => {
                if (response.didCancel) {

                }
                else if (response.error) {
                    alert(response.error)
                }
                else {
                    let source = { uri: response.uri };
                    this._closeSecondModal()
                    this.uploadImage(response.uri)
                }
            })
        } else {
            ImagePicker.launchImageLibrary(options, (response) => {
                if (response.didCancel) {

                }
                else if (response.error) {
                    alert(response.error)
                }
                else {
                    let source = { uri: response.uri };
                    this._closeSecondModal()
                    this.uploadImage(response.uri)
                }
            });
        }

    }

    uploadImage(image) {
        let formdata = new FormData();
        if (Platform.OS == "ios") {
            formdata.append("file", { uri: image, name: 'image.jpg', type: 'multipart/form-data' })
        } else {
            formdata.append("file", { uri: image, name: 'image.jpg', type: 'image/jpeg' })
        }

        fetch(Constants.url.base + 'images', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            body: formdata
        })
            .then(response => response.json())
            .then(responseData => {
                this.props.navigator.navigate('UploadProductStep1', { imageData: responseData });
            }).catch((error) => {
                console.log(error)
            })
    }

    _openCat() {
        AsyncStorage.getItem('isLoggedIn').then((token) => {
            if (token == null) {
                this.props.navigator.navigate('Account');
            } else {
                this.props.navigator.navigate('Chat')
            }
        }).catch((error) => {
            console.log(error)
        })
    }

    componentDidMount() {

        this.animatedValue = new Animated.ValueXY({ x: 50, y: 300 })
    }

    fabTabbed = () => {
        if (this.state.isFabTabbed) {
            this.setState({ isFabTabbed: false })
        } else {
            this.setState({ isFabTabbed: true })
        }

    }
    render() {
        return (
            <View style={styles.createAccountMainView}>

                {this.state.isFabTabbed && <View style={{ bottom: 90, right: 20, position: 'absolute', zIndex: 999 }}>
                    <TouchableOpacity style={{ marginBottom: 15, height: 55, width: 55, borderRadius: 27, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eeb14c' }} onPress={() => this._openCat()}>
                        <Image source={require('../../assets/ic_chat.png')} style={{ height: 25, width: 25, resizeMode: 'contain' }} />
                    </TouchableOpacity>
                    <TouchableOpacity style={{ height: 55, width: 55, borderRadius: 27, justifyContent: 'center', alignItems: 'center', backgroundColor: '#eeb14c' }} onPress={() => this._showFirstModal()}>
                        <Image source={require('../../assets/ic_add.png')} style={{ height: 25, width: 25, resizeMode: 'contain' }} />
                    </TouchableOpacity>
                </View>}



                <TouchableOpacity style={{ bottom: 20, right: 20, position: 'absolute', zIndex: 999 }} onPress={() => this.fabTabbed()}>
                    <View style={{ backgroundColor: this.state.isFabTabbed ? '#fff' : '#eeb14c', height: 55, shadowColor: 'black', elevation: 1, shadowOpacity: 0.5, shadowRadius: 5, shadowOffset: { width: 0, height: 0 }, borderRadius: 27, justifyContent: 'center', alignItems: 'center', width: 55 }}>
                        <Image source={this.state.isFabTabbed ? require('../../assets/ic_superble_orange.png') : require('../../assets/ic_superble_white_notitle.png')} style={{ height: 25, width: 20, resizeMode: 'contain' }} />
                    </View>
                </TouchableOpacity>
                {/* <Fab
            active={this.state.active}
            direction="up"
            containerStyle={{marginRight:15 }}
            style={{backgroundColor:'#ffffff'}}
            position="bottomRight"
            onPress={() => this.setState({ active: !this.state.active, firstModalVisible:false })}>
            
                    <Image 
                        source={require('../../assets/main.png')}
                        style={{height:30, width:30}}
                    />
                    <Button style={{ backgroundColor: '#F6BE11' }} onPress={()=> this._showFirstModal()}>
                    <Icon name="ios-add-circle-outline" />
                    </Button>
                    <Button style={{ backgroundColor: '#F6BE11' }} onPress={()=> this._openCat()}>
                    <Icon name="ios-chatbubbles-outline" />
                    </Button>
          </Fab> */}

                <Modal
                    visible={this.state.firstModalVisible}
                    animationType={'fade'}
                    transparent={true}
                    presentationStyle="overFullScreen"
                    onRequestClose={() => this._closeFirstModal()}
                    >
                    <TouchableWithoutFeedback onPress={() => { this._closeFirstModal() } }>
                        <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>

                            <TouchableWithoutFeedback>
                                <View style={{ backgroundColor: "#fff", alignItems: 'center', height: 140, marginTop: (deviceHeight / 2) - 60, width: 320, marginLeft: (deviceWidth / 2) - 160, padding: 30 }}>
                                    <Text style={{color:'black'}}>What would you like to upload?</Text>
                                    <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginTop: 20 }}>
                                        <TouchableOpacity onPress={() => this._showSecondModal()} style={{ width: '48%', backgroundColor: 'black', paddingVertical: 15, marginRight: '2%' }}>
                                            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}> PRODUCT </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => this._articleClick()} style={{ width: '48%', backgroundColor: 'black', paddingVertical: 15, marginLeft: '2%' }}>
                                            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}> ARTICLE </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                <Modal
                    visible={this.state.secondModalVisible}
                    animationType={'fade'}
                    transparent={true}
                    presentationStyle="overFullScreen"
                    onRequestClose={() => this._closeSecondModal()}
                    >
                    <TouchableWithoutFeedback onPress={() => { this._closeSecondModal() } }>
                        <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>

                            <TouchableWithoutFeedback>
                                <View style={{ backgroundColor: "#fff", alignItems: 'center', height: 140, marginTop: (deviceHeight / 2) - 60, width: 320, marginLeft: (deviceWidth / 2) - 160, padding: 30 }}>
                                    <Text style={{color:'black'}}>What would you like to upload?</Text>
                                    <View style={{ flexWrap: 'wrap', flexDirection: 'row', marginTop: 30 }}>
                                        <TouchableOpacity onPress={() => this._ImgPicker(false)} style={{ width: '48%', backgroundColor: 'black', paddingVertical: 15, marginRight: '2%' }}>
                                            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}> GALLERY </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => this._ImgPicker(true)} style={{ width: '48%', backgroundColor: 'black', paddingVertical: 15, marginLeft: '2%' }}>
                                            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}> CAMERA </Text>
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
};
