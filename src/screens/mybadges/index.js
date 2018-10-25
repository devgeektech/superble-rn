import React from 'react';

import { ScrollView, Modal, TouchableWithoutFeedback, StyleSheet, Dimensions, TouchableOpacity, View, Text, Animated, Easing, Image, Platform, AsyncStorage } from 'react-native';
import { Container, Header, Button, Card, CardItem, Icon, CheckBox, Left, Right } from 'native-base';
// import HeaderImageScrollView, { TriggeringView } from 'react-native-image-header-scroll-view';
import FABExample from '../fab/index.js';
import Constants from '../../constants'
import Carousel, { ParallaxImage } from 'react-native-snap-carousel';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import { sliderWidth, itemWidth } from './SlideEntryStyle';
import SliderEntry from './SlideEntry';
import styles, { colors } from './indexStyle';
import { ENTRIES1, ENTRIES2 } from './entries';
import { scrollInterpolators, animatedStyles } from './animation';
import HTMLView from 'react-native-htmlview';
const Header_Maximum_Height = Dimensions.get('window').height / 2 - 50;
const Header_Minimum_Height = 64;
// import SideSwipe from 'react-native-sideswipe';

const { width } = Dimensions.get('window');
const contentOffset = (width - 500) / 2;
const IS_ANDROID = Platform.OS === 'android';
const SLIDER_1_FIRST_ITEM = 0;
// import Carousel from 'react-native-carousel-view';
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

const xOffset = new Animated.Value(0);


export default class Mybadges extends React.Component {

    static navigationOptions = ({ navigation, screenProps }) => ({
        header: null    
    });
    constructor() {
        super();

        this.state = {
            loadedEntries: false,
            slider1ActiveSlide: 0,
            currentIndex: 0,
            isModalOpen: false,
            isModalOpen2: false,
            userPaymentInfo: [],
            activeSlide: null,
            entries: ENTRIES1,
            currentLevel: 0,
            points: 0,
            isModalOpen3: false
        }

        this.getUserPaymentInfo = this.getUserPaymentInfo.bind(this);
    }


    componentDidMount() {
        this.getuserData()
        this.getUserPaymentInfo()
    }
    getuserData() {
        AsyncStorage.getItem('loggedinUserData')
            .then((value) => {
                if (value != null) {
                    var userData = JSON.parse(value);
                    fetch(Constants.url.base + 'profiles/' + userData.profile_object.id + '/info?pageviews=true').then((response) => response.json()).then((dataJson) => {

                        var imgUrl = (dataJson.profile_object.url);
                        if (imgUrl == null || imgUrl == undefined) {
                            imgUrl = 'https://forums.iboats.com/user/avatar?userid=503684&type=large';
                        }
                        for (let i in this.state.entries) {
                            if (dataJson.profile_object.badge_name == this.state.entries[i].title) {
                                this.setState({ slider1ActiveSlide: parseInt(i), currentLevel: parseInt(i) })
                                var entriesArr = this.state.entries
                                entriesArr[i].illustration = ENTRIES2[i].illustration
                                // for (var j = 0; j <= i; j++) {
                                //     entriesArr[j].illustration = ENTRIES2[j].illustration
                                // }
                                this.setState({
                                    loadedEntries: true,
                                    entries: entriesArr
                                })
                            }
                        }

                        this.setState({ imgUrl: imgUrl });
                        firstName = (dataJson.profile_object.user_name);
                        this.setState({ firstName: firstName, badgeimage: dataJson.profile_object.badge.image_url, badgeName: dataJson.profile_object.badge_name, points: dataJson.profile_object.points });
                        this.setState({ userID: dataJson.profile_object.id })

                    }).catch((err) => {
                        console.log(err)
                    })
                }
            });
    }
    _openModal = () => {
        this.setState({ isModalOpen: true })
    }
    _closeModal = () => {
        this.setState({ isModalOpen: false })
    }
    _closeModal2 = () => {
        this.setState({ isModalOpen2: false })
    }
    _closeModal2a = () => {
        this.setState({ isModalOpen2: false })
        this.props.navigation.navigate('AddWallet', { "isFromBadges": true, "onUpdate": this.getUserPaymentInfo });
    }
    _closeModal3 = () => {
        this.getuserData()
        this.getUserPaymentInfo()
        this.setState({ isModalOpen3: false })
    }

    getUserPaymentInfo() {
        AsyncStorage.getItem('isLoggedIn')
            .then((value) => {
                if (value != null) {
                    AsyncStorage.getItem('deviceID').then((did) => {
                        if (did != null) {
                            fetch(Constants.url.base + `user_payments`, {
                                method: 'GET',
                                headers: {
                                    'Authorization': 'Token token=' + value + ';device_id=' + did,
                                    'Content-Type': 'application/json',
                                },
                            })
                                .then(response => response.json())
                                .then(responseData => {
                                    this.setState({ userPaymentInfo: responseData.data })
                                    for (let i of this.state.userPaymentInfo) {
                                        if (i.is_default) {
                                            this.setState({ user_payment_id: i.id })
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


    redeemPoints = () => {

        if (this.state.points >= 1000) {
            if (this.state.userPaymentInfo.length > 0) {
                AsyncStorage.getItem('isLoggedIn')
                    .then((value) => {
                        if (value != null) {
                            AsyncStorage.getItem('deviceID').then((did) => {
                                if (did != null) {
                                    fetch(Constants.url.base + `user_transactions`, {
                                        method: 'POST',
                                        headers: {
                                            'Authorization': 'Token token=' + value + ';device_id=' + did,
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({ user_payment_id: this.state.user_payment_id, amount: this.state.points }),
                                    })
                                        .then(response => response.json())
                                        .then(responseData => {
                                            this.setState({ isModalOpen3: true })
                                        }).catch((err) => {
                                            this.setState({ isAddWalletModalShow: false })
                                            console.log(err)
                                        });
                                }

                            })
                        }
                    });
            } else {
                this.setState({ isModalOpen2: true })
            }
        } else {
            this._openModal()
        }

    }

    render() {
        const animationStyle = { opacity: this.animationScale }
        const { slider1ActiveSlide } = this.state;
        return (
            <View style={{ flex: 1 }}>

                <ParallaxScrollView
                    backgroundColor="#b0bb43"
                    contentBackgroundColor="#eae9e9"
                    stickyHeaderHeight={60}
                    parallaxHeaderHeight={265}
                    renderStickyHeader={() => (
                        <View key="sticky-header" >
                            <Header style={{ backgroundColor: '#b0bb43', alignItems: 'center' }}>
                                <View style={{ width: '75%' }}>
                                    <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{this.state.entries[this.state.slider1ActiveSlide].title}</Text>
                                </View>
                            </Header>
                        </View>
                    )}
                    renderFixedHeader={() => (
                        <View key="fixed-header" style={styles2.fixedSection}>
                            <Header style={[{ backgroundColor: 'transparent',elevation: 0, alignItems: 'center' }, styles2.fixedSectionText, Platform.OS == 'ios' ? {} : { justifyContent: 'flex-start' }]}>
                                <Left>
                                    <Button transparent onPress={() => this.props.navigation.goBack()} >
                                        <Icon name='arrow-back' style={{ color: 'black' }} />
                                    </Button>
                                </Left>
                            </Header>
                        </View>
                    )}

                    renderForeground={() => (
                        <View style={styles.exampleContainer}>
                            {this.state.loadedEntries && <Carousel
                                ref={(c) => { this._slider1Ref = c } }
                                data={this.state.entries}
                                renderItem={(({ item, index }, parallaxProps) => {
                                    return (

                                        <SliderEntry
                                            data={item}
                                            even={(index + 1) % 2 === 0}
                                            parallax={false}
                                            parallaxProps={parallaxProps}
                                            />
                                    );
                                })}
                                sliderWidth={sliderWidth}
                                itemWidth={itemWidth}
                                hasParallaxImages={false}
                                firstItem={this.state.slider1ActiveSlide}

                                inactiveSlideScale={0.5}
                                inactiveSlideOpacity={0.7}
                                // inactiveSlideShift={20}
                                containerCustomStyle={styles.slider}
                                contentContainerCustomStyle={styles.sliderContentContainer}
                                loop={false}
                                loopClonesPerSide={2}
                                autoplay={false}
                                autoplayDelay={500}
                                autoplayInterval={3000}
                                onSnapToItem={(index) => this.setState({ slider1ActiveSlide: index })}
                                />}
                            {this.state.loadedEntries && <Text style={{ width: '100%', color: 'white', textAlign: 'center' }}>{this.state.entries[this.state.slider1ActiveSlide].subtitle + ' points'}</Text>}
                        </View>
                    )}>
                    <View style={{ height: 500 }}>
                        <View>

                            <CardItem style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image style={{ height: 26, width: 26, borderRadius: 10 }} source={{ uri: this.state.imgUrl }} />
                                <Text style={{ marginHorizontal: 10,fontSize:16,color:'black' }}>{this.state.firstName}</Text>
                            </CardItem>
                            <CardItem>

                                <HTMLView
                                value={this.state.entries[this.state.slider1ActiveSlide].description}
                                stylesheet={stylesSheet}
						        />

                                {/* <Text style={{color:'black'}}> {} </Text> */}
                            </CardItem>
                        </View>

                        <View style={{ marginTop: 10 }}>
                            <CardItem>
                                <Left>
                                    <Text style={{color:'black' }}> Current points </Text>
                                </Left>
                                <Right>
                                    <Text style={{ fontWeight: 'bold',color:'black' }}> {this.state.points} </Text>
                                </Right>
                            </CardItem>

                            <CardItem>
                                <Left>
                                    <Text style={{color:'black' }}> Points to next badge </Text>
                                </Left>
                                <Right>
                                    <Text style={{ fontWeight: 'bold',color:'black' }}>{ENTRIES1[this.state.currentLevel + 1].subtitle - this.state.points}</Text>
                                </Right>
                            </CardItem>
                        </View>
                    </View>
                </ParallaxScrollView>
                <Modal
                    visible={this.state.isModalOpen}
                    animationType={'fade'}
                    transparent={true}
                    presentationStyle="overFullScreen"
                    onRequestClose={this._closeModal}
                    >
                    <TouchableWithoutFeedback onPress={this._closeModal}>
                        <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}>

                            <TouchableWithoutFeedback>
                                <View style={{ backgroundColor: "#fff", borderRadius: 2, position: 'absolute', left: '5%', right: '5%', top: '35%', height: '26%', paddingLeft: 10, paddingRight: 10, }}>
                                    <View style={{ width: '100%', alignItems: 'center' }}>
                                        <Text style={{ color: 'gray', fontWeight: 'bold', marginTop: 18, fontSize: 16 }}>SORRY, NOT ENOUGH POINTS</Text>
                                        <Text style={{ marginVertical: 20, fontSize: 15, }}>You can only redeem 1000 points or more</Text>
                                    </View>



                                    <TouchableOpacity onPress={this._closeModal} style={{ height: 55, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }} onPress={this._closeModal} >
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}> I GOT IT </Text>
                                    </TouchableOpacity>


                                </View>
                            </TouchableWithoutFeedback>

                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                <Modal
                    visible={this.state.isModalOpen2}
                    animationType={'fade'}
                    transparent={true}
                    presentationStyle="overFullScreen"
                    onRequestClose={this._closeModal2}
                    >
                    <TouchableWithoutFeedback onPress={this._closeModal2}>
                        <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}>

                            <TouchableWithoutFeedback>
                                <View style={{ backgroundColor: "#fff", borderRadius: 2, position: 'absolute', left: '5%', right: '5%', top: '35%', height: '30%', paddingLeft: 10, paddingRight: 10, }}>
                                    <View style={{ width: '100%', alignItems: 'center' }}>
                                        <Text style={{ color: 'gray', fontWeight: 'bold', marginTop: 18, fontSize: 16 }}>NO ACTIVE WALLET</Text>
                                        <Text style={{ marginVertical: 20, fontSize: 15, }}>Please add wallet to redeem points</Text>
                                    </View>



                                    <TouchableOpacity onPress={this._closeModal2a} style={{ height: 55, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }} >
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}> OK</Text>
                                    </TouchableOpacity>


                                </View>
                            </TouchableWithoutFeedback>

                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                <Modal
                    visible={this.state.isModalOpen3}
                    animationType={'fade'}
                    transparent={true}
                    presentationStyle="overFullScreen"
                    onRequestClose={this._closeModal3}
                    >
                    <TouchableWithoutFeedback onPress={this._closeModal3}>
                        <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}>

                            <TouchableWithoutFeedback>
                                <View style={{ backgroundColor: "#fff", borderRadius: 2, position: 'absolute', left: '5%', right: '5%', top: '35%', height: '30%', paddingLeft: 10, paddingRight: 10, }}>
                                    <View style={{ width: '100%', alignItems: 'center' }}>
                                        {/* <Text style={{ color: 'gray', fontWeight: 'bold', marginTop: 18, fontSize: 16 }}>SUCCESS</Text> */}
                                        <Text style={{ marginVertical: 20, fontSize: 15, textAlign: 'center' }}>{'Thank You  \n \n You will receive your money ASAP'}</Text>
                                    </View>
                                    <TouchableOpacity onPress={this._closeModal3} style={{ height: 55, justifyContent: 'center', alignItems: 'center', backgroundColor: 'black' }} >
                                        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}> OK</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>

                <TouchableOpacity onPress={this.redeemPoints} style={{ justifyContent: 'center', bottom: 0, width: SCREEN_WIDTH, position: 'absolute', height: 45, alignItems: 'center', backgroundColor: '#fdbd39' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 14, color: 'white' }}>REDEEM YOUR POINTS</Text>
                </TouchableOpacity>
                <FABExample navigator={this.props.navigation} />
            </View>

        );
    }
}

const styles2 = StyleSheet.create(
    {
        MainContainer:
        {
            flex: 1,
            paddingTop: (Platform.OS == 'ios') ? 20 : 0
        },
        imageStyle: { height: 150, width: 150, resizeMode: 'cover', borderRadius: 75, },

        HeaderStyle:
        {
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            left: 0,
            right: 0,
            top: (Platform.OS == 'ios') ? 20 : 0,
        },
        card: {
            height: 300,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 4,
            borderColor: 'black',
            borderWidth: 1,
            backgroundColor: '#F5FCFF',
        },
        scrollView: {
            width: 250,
            flexDirection: 'row',
        },
        scrollPage: {
            width: 250,
            padding: 0,
            backgroundColor: 'red'
        },
        HeaderInsideTextStyle:
        {
            color: "#fff",
            fontSize: 18,
            textAlign: 'center'
        },

        TextViewStyle:
        {
            textAlign: 'center',
            color: "#000",
            fontSize: 18,
            margin: 5,
            padding: 7,
            backgroundColor: "#ECEFF1"
        },
        fixedSection: {
            position: 'absolute',
            left: 0,
            right: 0
        },
        fixedSectionText: {
            // color: '#999',
            // fontSize: 20
        },
    });
    
    const stylesSheet = StyleSheet.create({
        span: {
                   color: '#b0bb43', // make links coloured pink
        },
        p: {
            color: 'black', // make links coloured pink
 },
      });