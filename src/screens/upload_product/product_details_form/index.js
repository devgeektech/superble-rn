import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Image,
    FlatList,
    Switch,
    StyleSheet,
    Linking,
    Modal,
    TouchableWithoutFeedback,
    Keyboard, AsyncStorage, Platform
} from 'react-native';

import { Button } from 'native-base';

import Constants from '../../../constants';
import axios from 'axios';

import SearchCategory from '../searchCategory'
import SearchName from '../searchName'
import SearchBrand from '../searchBrand'

import ModalDropdown from 'react-native-modal-dropdown';
import Pins from '../../../components/react-native-pinterest'
var ImagePicker = require('react-native-image-picker');

import { NavigationActions } from 'react-navigation';

const FBSDK = require('react-native-fbsdk');
const {
    ShareDialog,
} = FBSDK;

import { AppInstalledChecker, CheckPackageInstallation } from 'react-native-check-app-install';

import Share, { ShareSheet } from 'react-native-share';

import { Content, Spinner, Container, Header, Icon, Left, Body, Right } from 'native-base';

const screenHeight = Dimensions.get('window').height
const screenWidth = Dimensions.get('window').width

const backBtn = Platform.OS == "ios" ? { justifyContent: 'center', alignItems: 'center', height: 20, padding: 10, margin: 10, width: 20 } : { margin: 10 }

const resetRoutes = (navigation, routeName, params = {}) => {
    const resetAction = NavigationActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({ routeName, params })
        ],
    });
    navigation.dispatch(resetAction);
};

export default class UploadProductStep1 extends Component {

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            headerTintColor: 'black',
            headerLeft: <TouchableOpacity style={backBtn} onPress={() => navigation.goBack()} >
                <Icon name='arrow-back' style={{ color: 'black' }} />
            </TouchableOpacity>,
            headerRight: <TouchableOpacity onPress={() => params.gotoSubmit && params.gotoSubmit()} style={{ marginRight: 10 }}>
                <Text style={{ color: 'black' }}>{params.isDraft ? 'Save as Draft' : 'Submit'}</Text>
            </TouchableOpacity>
        }
    };

    submit = () => {
        const { params = {} } = this.props.navigation.state;
        if (params.isDraft) {
            clearInterval(this.timer)
            this.uploadProduct(2).then((data) => {
                if (params.existinData) {
                    this.props.navigation.goBack()
                    this.props.navigation.state.params.onUpdate('updated');
                } else {
                    // this.props.navigation.navigate('Home');
                    this.props.navigation.navigate('Profile', { "userID": this.state.userID, dontBackToMe: this.props.navigation.state.key, screenName: 'uploadProduct' });
                    // this.props.navigation.navigate('Product', { item: this.state.upData.product_id, dontBackToMe: this.props.navigation.state.key, screenName: 'uploadProduct' })
                }
            })
        } else  {
            if (this.state.exp == null || this.state.exp == '') {
                alert('Description must not be empty')
                this.props.navigation.setParams({ isDraft: true });
                return
            } else {
                var length = this.state.exp.length;
                if (length < 20) {
                    alert('Your description must be atleast 20 characters long.')
                    this.props.navigation.setParams({ isDraft: true });
                    return
                }
            }
            if (this.state.name == null || this.state.name == '') {
                alert('Title must not be empty')
                this.props.navigation.setParams({ isDraft: true });
                return
            }
            if (this.state.category == null || this.state.category == '') {
                alert('Category must not be empty')
                this.props.navigation.setParams({ isDraft: true });
                return
            }
            if (this.state.brand == null || this.state.brand == '') {
                alert('Brand must not be empty')
                this.props.navigation.setParams({ isDraft: true });
                return
            }

            clearInterval(this.timer)
            this.setState({ status: 1 })
            this.uploadProduct(1).then((data) => {
                this.setState({ isSubmitted: true, modalSyncVisible: true, upData: data })
            })
        }
    }

    componentWillUnmount() {
        if (!this.state.isSubmitted) {
            this.uploadProduct(2)
        }
        clearInterval(this.timer)
    }

    componentDidMount() {
        this.props.navigation.setParams({ gotoSubmit: () => this.submit() });
        this.props.navigation.setParams({ isDraft: false });

        const { params } = this.props.navigation.state;
        const image = params ? params.imageData : null;

        if (params.existinData) {
            var edata = params.existinData
            this.setState({
                imageUrl: edata.image_url,
                imageId: edata.image_ids[0],
                exp: edata.description ? edata.description : '',
                name: edata.title ? edata.title : '',
                brand: edata.brand ? edata.brand.name : '',
                category: edata.category ? edata.category.name : '',
                status: 2,
                product_id: edata.id,
                gender: edata.gender_name,
                genderIndex: edata.gender + 1,
                category_id: edata.category ? edata.category.id : '',
                product_type: edata.type,
                categoryModalVisible: false,
                nameModalVisible: false,
                brandModalVisible: false,
                showGender: false
            })
        } else {
            this.setState({
                imageUrl: image.url,
                imageId: image.id,
            })
        }

        AsyncStorage.getItem('loggedinUserData')
            .then((value) => {
                if (value != null) {
                    var dataJson = JSON.parse(value);
                    this.setState({ userID: dataJson.profile_object.id })
                }
            });
    }


    goToName = () => {
        Keyboard.dismiss()
        this.setState({ nameModalVisible: true })
    }
    goToCategory = () => {
        Keyboard.dismiss()
        this.setState({ categoryModalVisible: true })
    }
    goToBrand = () => {
        Keyboard.dismiss()
        this.setState({ brandModalVisible: true })
    }

    closeCategoryModal() {
        this.setState({ categoryModalVisible: false })
    }
    closeNameModal() {
        this.setState({ nameModalVisible: false })
    }
    closeBrandModal() {
        this.setState({ brandModalVisible: false })
    }

    constructor(props) {
        super(props)
        const { params } = this.props.navigation.state;
        const image = params ? params.imageData : null;
        this.state = {
            isSubmitted: false,
            exp: '',
            name: '',
            brand: '',
            category: '',
            status: 2,
            product_id: null,
            gender: 'both',
            genderIndex: 3,
            category_id: '',
            product_type: '',
            categoryModalVisible: false,
            nameModalVisible: false,
            brandModalVisible: false,
            showGender: false,
            secondModalVisible: false,
            modalSyncVisible: false,
            isFbMedia: false,
            isPnMedia: false,
            isInMedia: false,
            isTwitterMedia: false,
        }
        this.uploadProduct = this.uploadProduct.bind(this)
        this.timer = setInterval(() => this.uploadProduct(2), 20000)
        this._showSecondModal = this._showSecondModal.bind(this)
        this._ImgPicker = this._ImgPicker.bind(this)
        this.uploadImage = this.uploadImage.bind(this)
    }

    setName(text) {
        const { params = {} } = this.props.navigation.state;
        this.props.navigation.setParams({ isDraft: false });
        this.closeNameModal()
        this.setState({ name: text })
    }

    setCategory(data) {
        const { params = {} } = this.props.navigation.state;
        this.props.navigation.setParams({ isDraft: false });
        this.closeCategoryModal()
        if (data.gender_name == null || data.gender_name == "") {
            this.setState({ gender: "both", genderIndex: 3 })
        } else {
            this.setState({ gender: data.gender_name, genderIndex: data.gender + 1 })
        }
        if (data.gender_name != null && data.gender_name == "both") {
            this.setState({ showGender: true })
        }
        this.setState({ category: data.name, category_id: data.id })
    }

    setBrand(text) {
        const { params = {} } = this.props.navigation.state;
        this.props.navigation.setParams({ isDraft: false });
        this.closeBrandModal()
        this.setState({ brand: text })
    }

    setExp(exp) {
        const { params = {} } = this.props.navigation.state;
        this.props.navigation.setParams({ isDraft: false });
        this.setState({ exp });
    }

    async uploadProduct(status) {
        var reqData = {
            status: status,
            title: this.state.name,
            description: this.state.exp,
            product_id: this.state.product_id,
            image_url: this.state.imageUrl,
            image_id: this.state.imageId,
            gender: this.state.gender,
            category_id: this.state.category_id,
            brand: this.state.brand
        }
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

                        return api.post('products', reqData).then((response) => {
                            this.setState({ product_id: response.data.product_id })
                            return response.data;
                        }).catch((error) => {
                            alert(error.response.data.message)
                            console.log('got error', error.response)
                        })
                    }
                } catch (error) {
                    alert('No device id found')
                }
            }
        } catch (error) {
            alert('No access token found')
        }
    }

    changeGender(value) {
        this.setState({ gender: value })
    }

    _closeSecondModal() {
        this.setState({ secondModalVisible: false })
    }

    _showSecondModal() {
        this.setState({ secondModalVisible: true })
    }

    cancelShareModal() {
        this.setState({ modalSyncVisible: false })
        //   resetRoutes(this.props.navigation, 'Product', { item: this.state.upData.product_id})
        this.props.navigation.navigate('Product', { item: this.state.upData.product_id, dontBackToMe: this.props.navigation.state.key, screenName: 'uploadProduct' })
        //   this.props.navigation.navigate('Home',{ item: this.state.upData.product_id, dontBackToMe: this.props.navigation.state.key, screenName: 'uploadProduct'})

    }

    FBShare(referal_code) {

        const shareLinkContent = {
            contentType: 'link',
            contentUrl: 'https://staging.superble.com/product/' + this.state.upData.seo_friendly_path + '/' + this.state.upData.product_id + "?referral_code=" + referal_code,
            contentDescription: this.state.upData.product_brand + ' - ' + this.state.upData.product_title
        };

        var tmp = this;
        ShareDialog.canShow(shareLinkContent).then((canShow) => {
            if (canShow) {
                return ShareDialog.show(shareLinkContent);
            }
        }).then((result) => {
            if (result.isCancelled) {
                console.log('Share cancelled');
            } else {
                alert('Shared successfully')
            }
        }, (error) => {
            alert('Share fail with error: ' + error);
        }
            );
    }

    PinterestShare(referal_code) {

        var shareLink = 'https://staging.superble.com/product/' + this.state.upData.seo_friendly_path + '/' + this.state.upData.product_id + "?referral_code=" + referal_code
        var linkDescription = this.state.upData.product_brand + ' - ' + this.state.upData.product_title
        var pinterestLink = `https://in.pinterest.com/pin/create/button/?url=${shareLink}&media=&description=${linkDescription}`
        Linking.canOpenURL(pinterestLink).then(supported => {
            if (!supported) {
                console.log('Can\'t handle url: ' + pinterestLink);
            } else {
                return Linking.openURL(pinterestLink);
            }
        }).catch(err => console.error('An error occurred', err));
    }

    twitterShare(referal_code) {

        var shareLink = 'https://staging.superble.com/product/' + this.state.upData.seo_friendly_path + '/' + this.state.upData.product_id + "?referral_code=" + referal_code
        var linkDescription = this.state.upData.product_brand + ' - ' + this.state.upData.product_title
        let twitterURL = `http://twitter.com/share?text=${linkDescription}&url=${shareLink}`;
        const shareOptions = {
            title: "React Native",
            message: linkDescription,
            url: shareLink,
            subject: "Share Link" //  for email
        };

        Share.shareSingle(Object.assign(shareOptions, {
            "social": "twitter"
        }));
    }

    confirmShare() {
        const { params = {} } = this.props.navigation.state;
        if (params.existinData) {
            this.props.navigation.goBack()
            this.props.navigation.state.params.onUpdate('updated');
        } else {
            this.props.navigation.navigate('Product', { item: this.state.upData.product_id, dontBackToMe: this.props.navigation.state.key, screenName: 'uploadProduct' })
            // this.props.navigation.navigate('Home',{ item: this.state.upData.product_id, dontBackToMe: this.props.navigation.state.key, screenName: 'uploadProduct'})
            // this.props.navigation.navigate('Profile', {"userID": this.state.userID});
        }
        AsyncStorage.getItem('loggedinUserData').then((userData) => {
            if (userData != null) {
                userData = JSON.parse(userData);
                if (this.state.isFbMedia) {
                    this.FBShare(userData.profile_object.referral_code, )
                }
                if (this.state.isPnMedia) {
                    this.PinterestShare(userData.profile_object.referral_code)
                }

                if (this.state.isTwitterMedia) {
                    AppInstalledChecker
                        .checkURLScheme('twitter')
                        .then((isInstalled) => {
                            if (isInstalled || !this.state.isPnMedia) {
                                this.twitterShare(userData.profile_object.referral_code)
                            }
                        })
                }

                this.setState({ modalSyncVisible: false })
            }
        })
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
                this.setState({ imageId: responseData.id, imageUrl: responseData.url })
            }).catch((error) => {
                console.log(error)
            })
    }

    _switchAction(type, val) {
        switch (type) {
            case 'facebook':
                if (val) {
                    this.setState({ isFbMedia: true })
                } else {
                    this.setState({ isFbMedia: false })
                }
                break;
            case 'instagram':
                if (val) {
                    this.setState({ isInMedia: true })
                } else {
                    this.setState({ isInMedia: false })
                }
                break;
            case 'pinterest':
                if (val) {
                    this.setState({ isPnMedia: true })
                } else {
                    this.setState({ isPnMedia: false })
                }
                break;
            case 'twitter':
                if (val) {
                    this.setState({ isTwitterMedia: true })
                } else {
                    this.setState({ isTwitterMedia: false })
                }
                break;
        }
    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', flexDirection: 'column', backgroundColor: 'white' }}>
                <Content>
                    <View style={{ flex: 1, alignItems: 'center', flexDirection: 'column', paddingBottom: 20 }}>
                        <TouchableOpacity onPress={() => this._showSecondModal()}>
                            <Image style={{ width: screenWidth, height: screenHeight / 1.8 }} source={{ uri: this.state.imageUrl }} />
                        </TouchableOpacity>
                        <TextInput multiline={true}
                            style={[styles.input, styles.input2]}
                            selectionColor={'black'} placeholder='Write your experience...'
                            underlineColorAndroid='transparent'
                            numberOfLines = {3}
                            onChangeText={(exp) => this.setExp(exp)}
                            value={this.state.exp}></TextInput>
                        {this.state.exp != '' && <Text onPress={this.goToCategory} style={styles.input} selectionColor={'black'} placeholder='Category'>{this.state.category != '' ? this.state.category : 'Category'}</Text>}
                        {this.state.exp != '' && this.state.showGender &&
                            <View style={[{ flex: 1, flexDirection: 'row' }, styles.input]}>
                                <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
                                    <Text style={styles.textTitle}> {'Gender'} </Text>
                                </View>
                                <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-end', paddingRight: 10 }}>
                                    <View style={{flexDirection:'row'}}>
                                        <ModalDropdown
                                            options={['male', 'female', 'both']}
                                            dropdownStyle={{ width: 120, maxHeight: 120, }}
                                            style={{ paddingHorizontal: 0 }}
                                            textStyle={{ color: 'black', fontSize: 16 }}
                                            defaultIndex={this.state.genderIndex}
                                            defaultValue={this.state.gender}
                                            dropdownTextStyle={{ fontSize: 14, color: 'black', textAlign: 'left' }}
                                            onSelect={(index, value) => this.changeGender(value)}
                                            />
                                        <Image style={[styles.dropdown_2_image, { width: 10, height: 10, marginLeft: 15,marginTop:5 }]} mode='stretch' source={require('../../../assets/dropd.png')} />
                                    </View>
                                </View>
                            </View>}
                        {this.state.exp != '' && <Text onPress={this.goToBrand} style={styles.input} selectionColor={'black'} placeholder='Brand'>{this.state.brand != '' ? this.state.brand : 'Brand'}</Text>}
                        {this.state.exp != '' && <Text onPress={this.goToName} style={styles.input} selectionColor={'black'} placeholder='Name'>{this.state.name != '' ? this.state.name : 'Name'}</Text>}
                    </View>
                </Content>

                <Modal
                    animationType={'fade'}
                    transparent={true}
                    visible={this.state.categoryModalVisible}
                    presentationStyle={'overFullScreen'}
                    onRequestClose={() => console.log('do nothing')}
                    >
                    <TouchableWithoutFeedback>
                        <SearchCategory onClickClose={() => this.closeCategoryModal()} onSelectText={(text) => this.setCategory(text)} />
                    </TouchableWithoutFeedback>
                </Modal>
                <Modal
                    animationType={'fade'}
                    transparent={true}
                    visible={this.state.brandModalVisible}
                    presentationStyle={'overFullScreen'}
                    onRequestClose={() => console.log('do nothing')}
                    >
                    <TouchableWithoutFeedback>
                        <SearchBrand onClickClose={() => this.closeBrandModal()} onSelectText={(text) => this.setBrand(text)} />
                    </TouchableWithoutFeedback>
                </Modal>
                <Modal
                    animationType={'fade'}
                    transparent={true}
                    visible={this.state.nameModalVisible}
                    presentationStyle={'overFullScreen'}
                    onRequestClose={() => console.log('do nothing')}
                    >
                    <TouchableWithoutFeedback>
                        <SearchName onClickClose={() => this.closeNameModal()} onSelectText={(text) => this.setName(text)} />
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
                        <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: screenHeight, width: screenWidth }}>

                            <TouchableWithoutFeedback>
                                <View style={{ backgroundColor: "#fff", alignItems: 'center', height: 120, marginTop: (screenHeight / 2) - 60, width: 280, marginLeft: (screenWidth / 2) - 140, padding: 15 }}>
                                    <Text>What would you like to upload?</Text>
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

                <Modal
                    animationType={'fade'}
                    transparent={true}
                    visible={this.state.modalSyncVisible}
                    presentationStyle={'overFullScreen'}
                    onRequestClose={() => console.log('do nothing')}
                    >
                    <TouchableWithoutFeedback>
                        <View style={styles.selecetTopics}>
                            <TouchableWithoutFeedback>
                                <View style={styles.selecetTopicsStyle}>
                                    <Container>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                            <Text style={{ color: '#383636', textAlign: 'center', fontSize: 18, width: '90%', paddingHorizontal: 20 }}>Share To</Text>
                                            <TouchableOpacity onPress={() => this.cancelShareModal()}>
                                                <Image source={require('../../../assets/cross2.png')} style={{ width: 20, height: 20 }} />
                                            </TouchableOpacity>
                                        </View>
                                        <Content>
                                            <View style={styles.selectMediaProfileDiv}>
                                                <View style={{ flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center' }}>
                                                    <Image source={require('../../../assets/p_facebook.png')} />
                                                    <Text style={styles.selectMediaProfileDivText}>Facebook</Text>
                                                </View>
                                                <View>
                                                    <Switch value={this.state.isFbMedia} onValueChange={(val) => this._switchAction('facebook', val)}
                                                        />
                                                </View>
                                            </View>
                                            <View style={styles.selectMediaProfileDiv}>
                                                <View style={{ flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center' }}>
                                                    <Image source={require('../../../assets/p_twitter.png')} />
                                                    <Text style={styles.selectMediaProfileDivText}>Twitter</Text>
                                                </View>
                                                <View>
                                                    <Switch value={this.state.isTwitterMedia} onValueChange={(val) => this._switchAction('twitter', val)}
                                                        />

                                                </View>
                                            </View>
                                            {/* <View style={styles.selectMediaProfileDiv}>
                          <View style={{flexWrap: 'wrap', flexDirection: 'row', alignItems:'center'}}>  
                            <Image source={require('../../../assets/p_instagram.png')}/> 
                            <Text style={styles.selectMediaProfileDivText}>Instagram</Text>
                          </View>
                          <View>
                            <Switch value={this.state.isInMedia} onValueChange={(val) => this._switchAction('instagram', val)} disabled={false}
                                activeText={'On'} inActiveText={'Off'} circleSize={30} barHeight={1} circleBorderWidth={3} backgroundActive={'green'}
                                backgroundInactive={'gray'} circleActiveColor={'#30a566'} circleInActiveColor={'#000000'}
                              />
                              
                          </View>
                        </View> */}
                                            <View style={styles.selectMediaProfileDiv}>
                                                <View style={{ flexWrap: 'wrap', flexDirection: 'row', alignItems: 'center' }}>
                                                    <Image source={require('../../../assets/p_pinterest.png')} />
                                                    <Text style={styles.selectMediaProfileDivText}>Pinterest</Text>
                                                </View>
                                                <View>
                                                    <Switch value={this.state.isPnMedia} onValueChange={(val) => this._switchAction('pinterest', val)}
                                                        />
                                                    <Pins
                                                        ref='pinterestLogin'
                                                        onLoginSuccess={(token) => this.pinstLoginSuccess(token)}
                                                        onLoginFailure={(data) => this.pinstLoginFailure(data)}
                                                        />
                                                </View>
                                            </View>
                                            <View>
                                            </View>
                                        </Content>
                                        <Button block transparent style={styles.selecetTopicsButton} onPress={() => this.confirmShare()}><Text style={styles.selecetTopicsButtonText} >CONFIRM</Text></Button>
                                    </Container>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </View>
        );
    }

}

const styles = StyleSheet.create({
    input: { borderColor: 'gray', borderWidth: 0.5, paddingVertical: 10, borderRadius: 2, paddingLeft: 10, width: screenWidth - 20, marginTop: 10, height: null, },
    input2: { height: 80, textAlignVertical:'top' },
    selectMediaProfileDiv: {
        // flexWrap: 'wrap',
        flexDirection: 'row',
        paddingHorizontal: 25,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    selectMediaProfileDivText: { fontSize: 18, marginLeft: 15 },
    header: {
        backgroundColor: "#fff",
        elevation: 0,
        height: 150,
        borderBottomColor: 'transparent',
    },
    headingH1: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    heading: {
        margin: 10,
        textAlign: 'center',
    },
    selecetTopicsButton: {
        backgroundColor: "black",
        marginLeft: 10,
        marginRight: 10,
        marginTop: 15,
        height: 60,
        borderRadius: 0
    },
    selecetTopicsButtonText: {
        color: "white",
        fontSize: 17,
    },
    selecetTopics: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        height: screenHeight,
        width: screenWidth
    },
    selecetTopicsStyle: {
        backgroundColor: "#fff",
        position: 'absolute',
        left: '5%',
        right: '5%',
        height: '80%',
        top: '10%',
        padding: 10,
    },
})