import React, { Component } from 'react';
import { Container, Header, Button, Icon, Fab, Content, } from 'native-base';
import {
    Image, Linking, View, TouchableOpacity, TouchableWithoutFeedback, StyleSheet, Text,
    Dimensions, ActivityIndicator, Alert, Animated, ScrollView, AsyncStorage, Platform, BackHandler
} from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import FABExample from '../fab/index.js'

import Constants from '../../constants';
import axios from 'axios';
import { IndicatorViewPager, PagerTitleIndicator } from 'rn-viewpager'
import { api } from '../../helpers';
//import styles from './profileStyle';
import Account from '../account/index';
import Topic from '../topics'
import Draft from '../draft'

import Avatar from '../../components/avatar'
import { LoginManager, LoginButton, AccessToken } from 'react-native-fbsdk';
const FBSDK = require('react-native-fbsdk');
const {
    GraphRequest,
    GraphRequestManager,
} = FBSDK;
import Ins from 'react-native-instagram-login';
import Pins from '../../components/react-native-pinterest'

const initialLayout = {
    height: 0,
    width: Dimensions.get('window').width,
};
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

const backBtn = Platform.OS == "ios" ? { justifyContent: 'center', alignItems: 'center', height: 20, padding: 10, margin: 10, width: 20 } : { margin: 10 }

const FirstRoute = () => <View style={[styles.container, { backgroundColor: '#ff4081' }]} />;
const SecondRoute = () => <View style={[styles.container, { backgroundColor: '#673ab7' }]} />;


export default class Profile extends Component {

    constructor(props) {
        super(props);
        const {state} = props.navigation;
        this.state = {
            active: false,
            index: 0,
            userData: [],
            routes: [],
            userID: state.params.userID,
            isDraftClicked: false,
            currentIndex: 0,
            currentDraftIndex: 0,

        };

        this.getTopic = this.getTopic.bind(this)
        this.getDraftTopic = this.getDraftTopic.bind(this)
    }

    state = {
        loaded: false,
        topics: [],

    }

    openUpdateProfile = data => {
        this.doMount(false);
    }

    gotoEdit = () => {
        this.props.navigation.navigate('EditProfile', { "userID": this.state.userID, "onUpdate": this.openUpdateProfile });
    }

    goBack = () => {
        const backFrom = this.props.navigation.state.params.dontBackToMe
        const { navigation } = this.props;
        const { params } = this.props.navigation.state;
        if (params.screenName == 'uploadProduct') {
            this.props.navigation.goBack(backFrom)
        } else {
            navigation.goBack();
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({ handleEdit: () => this.gotoEdit() });
        this.props.navigation.setParams({ handleBack: () => this.goBack() });
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        AsyncStorage.getItem('loggedinUserData').then((userData) => {
            if (userData != null) {
                userData = JSON.parse(userData);
                if (userData.profile_object.id == this.state.userID) {
                    this.props.navigation.setParams({ isMine: true });
                } else {
                    this.props.navigation.setParams({ isMine: false });
                }
            } else {
                this.props.navigation.setParams({ isMine: false });
            }
        })
        this.doMount(false);
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress);
    }

    handleBackPress = () => {
        this.goBack(); // works best when the goBack is async
        return true;
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title: '',
            headerTintColor: 'black',
            headerStyle: {
                backgroundColor: 'white'
            },
            headerLeft: <TouchableOpacity style={backBtn} onPress={() => params.handleBack && params.handleBack()} >
                {/* <Image style={{height:20,padding:10, margin:10, width:20}}source ={require('../../assets/back.png')}/> */}
                <Icon name='arrow-back' style={{ color: 'black' }} />
            </TouchableOpacity>,
            headerRight: <TouchableOpacity onPress={() => params.handleEdit && params.handleEdit()}>
                {params.isMine && <Image source={require('../../assets/ic-edit-drafts-o.png')} style={[{ width: 45, height: 45, marginRight: 0 }]} />}
            </TouchableOpacity>
        }
    };

    async getTopicList() {
        const api = axios.create({
            baseURL: Constants.url.base,
            timeout: 0,
            responseType: 'json',
        });

        try {
            let response = await api.get('profiles/' + this.state.userID + '/get_topics');
            return response.data.data;
        } catch (error) {
            console.log("HERE IS PROBLEM", JSON.stringify(error))
        }
    }

    async getUserInfo() {
        try {
            const atoken = await AsyncStorage.getItem('isLoggedIn');
            if (atoken !== null) {
                try {
                    const deviceID = await AsyncStorage.getItem('deviceID');
                    if (deviceID != null) {
                        const api = axios.create({
                            baseURL: Constants.url.base,
                            timeout: 0,
                            responseType: 'json',
                            headers: {
                                'Authorization': 'Token ' + atoken + ';device_id=' + deviceID
                            }
                        });

                        try {
                            let response = await api.get('profiles/' + this.state.userID + '/info?pageviews=true');
                            return response.data.profile_object;
                        } catch (error) {
                            console.log("HERE IS PROBLEM", JSON.stringify(error))
                        }
                    }
                } catch (error) {
                    console.log(error)
                    alert('No device Id found.')
                }
            } else {
                const api = axios.create({
                    baseURL: Constants.url.base,
                    timeout: 0,
                    responseType: 'json',
                    // headers: {
                    //     'Authorization': 'Token '+atoken+';device_id='+this.state.device_id
                    // }
                });

                try {
                    let response = await api.get('profiles/' + this.state.userID + '/info?pageviews=true');
                    return response.data.profile_object;
                } catch (error) {
                    console.log("HERE IS PROBLEM", JSON.stringify(error))
                }
            }
        } catch (error) {
            alert('No Access token Found.')
        }
    }

    doMount(ifUpdate) {
        this.setState({ isDraftClicked: ifUpdate })
        this.getTopicList().then((data) => {
            var topicArr = data['likes_cat'].concat(data['product_cat'])
            var darftArr = data['draft_articles_cat'].concat(data['draft_product_cat'])
            var myr = []
            for (var i = 0; i < topicArr.length; i++) {
                myr.push({ key: topicArr[i].id.toString(), title: topicArr[i].name });
            }
            var drr = []
            for (var i = 0; i < darftArr.length; i++) {
                drr.push({ key: darftArr[i].id.toString(), title: darftArr[i].name });
            }
            if (darftArr.length < 1) {
                drr = [{
                    key: '1', title: 'No Category'
                }]
            }

            this.setState({
                topics: topicArr,
                drafts: darftArr,
                routesDraft: drr,
                routesLiked: myr,
                routes: ifUpdate ? drr : myr
            })

            if (ifUpdate) {
                this.getDraftTopic(drr[0].key).then((data) => {
                    var arr = [{ isFirst: true }]
                    arr = arr.concat(data.added.added_products)
                    this.setState({ draftTopics: arr });
                });
            } else {
                this.getTopic(myr[0].key).then((data) => {
                    this.setState({ topicsValue: data.liked.liked_products.concat(data.added.added_products) });
                });
            }
        })
        this.getUserInfo().then((data) => {
            this.setState({ userData: data, loaded: true });
        });
        AsyncStorage.getItem('isFbSynced').then((data) => {
            if (data != null) {
                data = JSON.parse(data)
                this.setState({ isFb: true, fb_token: data.token })
            } else {
                this.setState({ isFb: false })
            }
        })
        AsyncStorage.getItem('isInstaSynced').then((data) => {
            if (data != null) {
                data = JSON.parse(data)
                this.setState({ isIn: true, in_token: data.token })
            } else {
                this.setState({ isIn: false })
            }
        })
        AsyncStorage.getItem('isPinstaSynced').then((data) => {
            if (data != null) {
                data = JSON.parse(data)
                this.setState({ isPn: true, pn_token: data.token })
            } else {
                this.setState({ isPn: false })
            }
        })

    }
    _handleIndexChange = index => this.setState({ index });

    openLink = (url) => {
        Linking.canOpenURL(url).then(supported => {
            if (!supported) {
            } else {
                return Linking.openURL(url);
            }
        }).catch(err => console.error('An error occurred', err));
    }

    syncFb() {
        const { params = {} } = this.props.navigation.state;
        if (params.isMine) {
            if (this.state.isFb) {
                AsyncStorage.removeItem('isFbSynced')
                this.setState({ isFb: false, fb_token: undefined })
            } else {
                this.fbAuth()
            }
        } else {
            if (this.state.userData.fb_user_id) {
                this.openLink("https://www.facebook.com/" + this.state.userData.fb_user_id)
            }
        }

    }

    syncIn() {
        const { params = {} } = this.props.navigation.state;
        if (params.isMine) {
            if (this.state.isIn) {
                AsyncStorage.removeItem('isInstaSynced')
                this.setState({ isIn: false, in_token: undefined })
            } else {
                this.refs.instagramLogin.show()
            }
        } else {
            if (this.state.userData.instagram_user_id) {
                this.openLink("https://www.instagram.com/" + this.state.userData.instagram_user_id)
            }
        }
    }
    whenTabbedOnDraft = () => {

        this.setState({ isDraftClicked: true, routes: this.state.routesDraft })
        this.getDraftTopic(this.state.routesDraft[this.state.currentDraftIndex].key).then((data) => {
            var arr = [{ isFirst: true }]
            arr = arr.concat(data.added.added_products)

            this.setState({
                draftTopics: arr,
            });
        });
    }
    syncPn() {
        const { params = {} } = this.props.navigation.state;
        if (params.isMine) {
            if (this.state.isPn) {
                AsyncStorage.removeItem('isPinstaSynced')
                this.setState({ isPn: false, pn_token: undefined })
            } else {
                this.refs.pinterestLogin.show();
            }
        } else {
            if (this.state.userData.pinterest_user_id) {
                this.openLink("https://www.pinterest.com/" + this.state.userData.pinterest_user_id)
            }
        }

    }
    syncWeb() {
        if (this.state.userData.social_url != '' && this.state.userData.social_url != null && this.state.userData.social_url != undefined) {
            if (!String.prototype.contains) {
                String.prototype.contains = function () {
                    return String.prototype.indexOf.apply(this, arguments) !== -1;
                };
            }

            if (this.state.userData.social_url.contains('https') || this.state.userData.social_url.contains('http')) {
                this.openLink(this.state.userData.social_url)
            } else {
                this.openLink('http://' + this.state.userData.social_url)
            }

        }
    }

    userInfoHeader() {
        const { params = {} } = this.props.navigation.state;
        let userData = this.state.userData;
        var views = userData.page_views
        var points = userData.points
        var drafts = userData.draft_count
        if (views > 1000) {
            views = (views / 1000).toFixed(1) + 'K'
        }
        if (points > 1000) {
            points = (points / 1000).toFixed(1) + 'K'
        }
        if (drafts > 1000) {
            drafts = (drafts / 1000).toFixed(1) + 'K'
        }
        let pic = {}
        if (userData.url != null) {
            pic = {
                uri: userData.url
            };
        } else {
            pic = {
                uri: 'https://forums.iboats.com/user/avatar?userid=503684&type=large'
            };
        }

        // let pic = {
        //     uri:userData.url
        // };
        return (
            // backgroundColor: '#fafafa'
            <View style={{ height: 'auto', maxHeight: deviceHeight / 2, padding: 10, paddingBottom: 0, backgroundColor: '#fafafa' }}>
                <View style={{ flexDirection: 'row', marginTop: 5, marginLeft: 6 }}>
                    <View style={{ width: 100, flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start' }}>
                        <Avatar img={pic} size={80} />
                        <Image style={{ position: 'absolute', right: 8, top: 0, zIndex: 100, width: 30, height: 30 }} resizeMode='cover'
                            source={{ uri: userData.badge.image_url }} />
                    </View>
                    <View style={{ width: deviceWidth - 100 }}>
                        <View style={{ flex: 1, flexDirection: 'row', paddingLeft: 0, paddingRight: 20, marginTop: 0, alignItems: 'center' }}>
                            <TouchableOpacity onPress={() => this.setState({ isDraftClicked: false, routes: this.state.routesLiked })} style={{ flex: 0.3, flexDirection: 'column', alignItems: 'center', justifyContent:'center' }}>
                                <Text style={{ color: '#000', fontSize: 17, fontWeight: 'bold', textAlign:"center" }}>
                                    {views} </Text>
                                <Text style={{ fontSize: 15, color: '#404042' }}>{"VIEWS"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Mybadges')} style={{ flex: 0.3, flexDirection: 'column', alignItems: 'center' , justifyContent:'center'}}>
                                <Text style={{ color: '#000', fontSize: 17, fontWeight: 'bold' }}>
                                    {points} </Text>
                                <Text style={{ fontSize: 15, color: '#404042', }}>{"POINTS"}</Text>
                            </TouchableOpacity>
                            {params.isMine && <TouchableOpacity onPress={() => this.whenTabbedOnDraft()} style={{ flex: 0.3, flexDirection: 'column', alignItems: 'center', justifyContent:'center' }}>
                                <Text style={{ color: '#000', fontSize: 17, fontWeight: 'bold' }}>
                                    {drafts} </Text>
                                <Text style={{ fontSize: 15, color: '#404042', }}>{"DRAFTS"}</Text>
                            </TouchableOpacity>
                            }
                        </View>

                    </View>
                </View>

                <View style={{ flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: 'flex-start', marginTop: 10, marginRight: 5, marginLeft: 10 }}>
                    <Text style={{ fontSize: 18, color: '#414042' }}>{userData.user_name}</Text>
                    <Text style={{ fontSize: 15, color: '#404042' }} numberOfLines={6}>{userData.bio}</Text>
                </View>

                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: 'flex-start', marginTop: 15, marginBottom: 15, marginRight: 5, marginLeft: 5, }}>
                    {params.isMine && <View style={styles.mainAccountView}>
                        <TouchableOpacity onPress={() => this.syncFb()} style={styles.mainAccountSubView}>
                            <Image source={this.state.isFb ? require('../../assets/facebook/facebook.png') : require('../../assets/facebook/facebook-grey.png')} style={styles.mainAccountIconList} resizeMode='contain' />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.syncIn()} style={{ flexDirection: 'row', marginLeft: 10 }}>

                            <Image source={this.state.isIn ? require('../../assets/instagram/instagram.png') : require('../../assets/instagram/instagram-grey.png')} style={styles.mainAccountIconList} resizeMode='contain' />
                        </TouchableOpacity>
                        <Ins
                            ref='instagramLogin'
                            clientId='e7b56b742f044fc7980d080c4406dd38'
                            scopes={['public_content+follower_list']}
                            redirectUrl='http://localhost'
                            onLoginSuccess={(token) => this.instLoginSuccess(token)}
                            onLoginFailure={(data) => this.instaLoginFailure(data)}
                            />
                        <TouchableOpacity onPress={() => this.syncPn()} style={{ flexDirection: 'row', marginLeft: 10 }}>

                            <Image source={this.state.isPn ? require('../../assets/pinterest/pinterest.png') : require('../../assets/pinterest/pinterest-grey.png')} style={styles.mainAccountIconList} resizeMode='contain' />
                        </TouchableOpacity>
                        <Pins
                            ref='pinterestLogin'
                            onLoginSuccess={(token) => this.pinstLoginSuccess(token)}
                            onLoginFailure={(data) => this.pinstLoginFailure(data)}
                            />
                        {userData.social_url != '' && userData.social_url != null && userData.social_url != undefined &&
                            <TouchableOpacity onPress={() => this.syncWeb()} style={{ flexDirection: 'row', marginLeft: 10 }}>
                                <Image source={require('../../assets/ic-web/ic-web.png')} style={styles.mainAccountIconList} resizeMode='contain' />
                            </TouchableOpacity>
                        }
                    </View>}
                    {!params.isMine &&
                        <View style={styles.mainAccountView}>
                            <TouchableOpacity onPress={() => this.syncFb()} style={styles.mainAccountSubView}>
                                <Image source={userData.fb_user_id ? require('../../assets/facebook/facebook.png') : require('../../assets/facebook/facebook-grey.png')} style={styles.mainAccountIconList} resizeMode='contain' />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.syncIn()} style={{ flexDirection: 'row', marginLeft: 10 }}>
                                <Image source={userData.instagram_user_id ? require('../../assets/instagram/instagram.png') : require('../../assets/instagram/instagram-grey.png')} style={styles.mainAccountIconList} resizeMode='contain' />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => this.syncPn()} style={{ flexDirection: 'row', marginLeft: 10 }}>
                                <Image source={userData.pinterest_user_id ? require('../../assets/pinterest/pinterest.png') : require('../../assets/pinterest/pinterest-grey.png')} style={styles.mainAccountIconList} resizeMode='contain' />
                            </TouchableOpacity>
                            {userData.social_url != '' && userData.social_url != null && userData.social_url != undefined &&
                                <TouchableOpacity onPress={() => this.syncWeb()} style={{ flexDirection: 'row', marginLeft: 10 }}>

                                    <Image source={require('../../assets/ic-web/ic-web.png')} style={styles.mainAccountIconList} resizeMode='contain' />
                                </TouchableOpacity>
                            }
                        </View>
                    }
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', height: 1, backgroundColor: '#ccc' }}>
                </View>
            </View>)
    }
    makeBottomBorder() {
        return <Topic topics={this.state.topicsValue} loaded={true} navigator={this.props.navigation} onUpdate={() => this.doMount(false)} />
    }

    draftTopics() {
        return <Draft topics={this.state.draftTopics} loaded={true} navigator={this.props.navigation} onUpdate={() => this.doMount(true)} />
    }

    async getTopic(catId) {
        try {
            const atoken = await AsyncStorage.getItem('isLoggedIn');
            if (atoken !== null) {
                try {
                    const deviceID = await AsyncStorage.getItem('deviceID');
                    if (deviceID != null) {

                        try {
                            var param = {
                                "parent_category_id": catId,
                                "type": "both",
                                "page": 1,
                                "per_page": 20
                            }
                            const api = axios.create({
                                baseURL: Constants.url.base,
                                timeout: 20000,
                                responseType: 'json',
                                headers: {
                                    'Authorization': 'Token ' + atoken + ';device_id=' + deviceID
                                },
                                params: param
                            });
                            let response = await api.get(`profiles/${this.state.userData.id}/get_products`);
                            return response.data;
                        }

                        catch (error) {
                            console.log("HERE IS PROBLEM", error)

                        }
                    }
                } catch (error) {
                    console.log("HERE IS PROBLEM", error)
                }
            } else {
                try {
                    var param = {
                        "parent_category_id": catId,
                        "type": "both",
                        "page": 1,
                        "per_page": 20
                    }
                    const api = axios.create({
                        baseURL: Constants.url.base,
                        timeout: 20000,
                        responseType: 'json',
                        params: param
                    });
                    let response = await api.get(`profiles/${this.state.userData.id}/get_products`);
                    return response.data;
                }

                catch (error) {
                    console.log("HERE IS PROBLEM", error)

                }
            }
        } catch (error) {
            console.log("HERE IS PROBLEM", error)
        }
    }



    async getDraftTopic(catId) {
        try {
            const atoken = await AsyncStorage.getItem('isLoggedIn');
            if (atoken !== null) {
                try {
                    const deviceID = await AsyncStorage.getItem('deviceID');
                    if (deviceID != null) {
                        try {
                            var param = {
                                "parent_category_id": catId,
                                "type": "added",
                                "discovery_status": 2,
                                "product_status": 2,
                                "page": 1,
                                "per_page": 20
                            }
                            const api = axios.create({
                                baseURL: Constants.url.base,
                                timeout: 0,
                                responseType: 'json',
                                headers: {
                                    'Authorization': 'Token ' + atoken + ';device_id=' + deviceID
                                },
                                params: param
                            });

                            let response = await api.get(`profiles/${this.state.userData.id}/get_products`);
                            return response.data;
                        }
                        catch (error) {
                            console.log("HERE IS PROBLEM", error)
                        }
                    }
                } catch (error) {
                    console.log("HERE IS PROBLEM", error)
                }
            }
        } catch (error) {
            console.log("HERE IS PROBLEM", error)
        }
    }

    setTabIndex = (index) => {


        if (index < 0 || index > this.state.routes.length) return

        if (this.state.isDraftClicked) {

            this.setState({ currentDraftIndex: index })
            this.getDraftTopic(this.state.routesDraft[index].key).then((data) => {
                var arr = [{ isFirst: true }]
                arr = arr.concat(data.added.added_products)

                this.setState({

                    draftTopics: arr,
                });
            });
            //  new Draft().fetchMediafromLibrary()
        } else {
            this.setState({ currentIndex: index })
            this.getTopic(this.state.routes[index].key).then((data) => {
                this.setState({ topicsValue: data.liked.liked_products.concat(data.added.added_products) });
            });
        }

    }
    _renderTitleIndicator() {

        const tabTitle = []

        for (let i = 0; i < this.state.routes.length; i++) {
            tabTitle.push(this.state.routes[i].title.toUpperCase())
        }
        return <PagerTitleIndicator
            titles={tabTitle}
            trackScroll={true}

            itemStyle={{ paddingHorizontal:15, backgroundColor: 'white' }}
            selectedItemStyle={{ paddingHorizontal:15,backgroundColor: 'white' }}
            itemTextStyle={{ fontSize:14, color: 'black' }}
            selectedItemTextStyle={{fontSize:14, color: 'black' }}
            selectedBorderStyle={{
                height: 3,
                backgroundColor: '#b0bb43'
            }}
            />;
    }
    _onPageScroll(scrollData) {
        let {offset, position} = scrollData

    }


    onPageSelecet(value) {
        this.setTabIndex(value.position)
    }
    render() {
        if (this.state.loaded) {
            return (
                <View style={styles.container}>
                    {this.userInfoHeader()}
                    <IndicatorViewPager
                        style={{ backgroundColor: 'white' }}
                        indicator={this._renderTitleIndicator()}
                        onPageSelected={this.onPageSelecet.bind(this)}
                        onPageScroll={this._onPageScroll.bind(this)} />
                    <View style={{ color: '#888', width: '100%', height: 8 }}></View>
                    {!this.state.isDraftClicked && this.state.routes.length > 0 && this.makeBottomBorder()}
                    {this.state.isDraftClicked && this.state.routes.length > 0 && this.draftTopics()}
                    <FABExample navigator={this.props.navigation} />
                </View>
            );
        } else {
            return (
                <View style={{
                    backgroundColor: '#fff',
                    alignItems: 'center',
                    justifyContent: 'center', height: Dimensions.get('window').height
                }}>
                    <ActivityIndicator size="large" />
                </View>
            )
        }

    }

    fbAuth = () => {
        LoginManager.logInWithReadPermissions(['public_profile', 'email', 'user_photos', 'user_friends']).then(
            (result) => {
                if (result.isCancelled) {
                    console.log('Login was cancelled');
                } else {
                    AccessToken.getCurrentAccessToken().then((data) => {
                        AsyncStorage.setItem('isFbSynced', JSON.stringify({ token: data.accessToken }))
                        this.setState({ isFb: true, fb_token: data.accessToken })
                    })
                }
            },
            function (error) {
                console.log('Login failed with error: ' + error);
            }
        );
    }

    instLoginSuccess(token) {
        if (token) {
            AsyncStorage.setItem('isInstaSynced', JSON.stringify({ token: token }))
            this.setState({ isIn: true, in_token: token })
        }
    }

    instaLoginFailure(error) {
        console.log(error)
    }

    pinstLoginSuccess(token) {
        if (token) {
            AsyncStorage.setItem('isPinstaSynced', JSON.stringify({ token: token }))
            this.setState({ isPn: true, pn_token: token })
        }
    }

    pinstLoginFailure(error) {
        console.log('something went wrong')
    }







};
const styles = StyleSheet.create({
    tabContainer: {
        flex: 1,

    },

    container: {
        flex: 1,
        flexDirection: 'column',
    },

    headerTitle: {
        height: 50,
        width: 100,
        color: '#484848',
        fontSize: 15,
        textAlign: 'left',
        alignSelf: 'flex-start',
        fontFamily: 'Lato-Regular'
    },
    tabbar: {
        backgroundColor: '#ffffff',
    },
    label: {
        color: '#404042',
        fontWeight: '400',
    },

    labelStyle: {
        flex: 1,
        color: 'black'
    },
    activeTab: {
        flex: 1,
        backgroundColor: 'white',
        color: '#404042'
    }, fullWidthButton: {
        backgroundColor: '#133457',
        padding: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,

    }, fullWidthButtonText: {
        fontSize: 10,
        color: 'white',

    }, text: {
        marginTop: 10,
        color: '#5D5D5D',
        fontSize: 7,

    },
    largeText: {
        fontSize: 20,
        color: '#404042',

    },


    mainAccountView: {
        flexDirection: 'row',
    },
    mainAccountSubView: {
        flexDirection: 'row',
    },
    mainAccountIconList: {
        width: 30,
        height: 30,
        marginLeft: "5%",

    }, subHeadingList: {
        color: "#000",
        fontSize: 17,

    },
});