import React, { Component } from 'react';
import { Container, Fab, Content, Icon, Button } from 'native-base';
import {
    Image, Keyboard, Modal, View, TouchableOpacity,
    TouchableWithoutFeedback, StyleSheet, Alert, Text, TextInput, Dimensions,
    ActivityIndicator, ScrollView, Header, Left, Body, Right,
    Title, AsyncStorage, TouchableNativeFeedback, Platform
} from 'react-native';
import { TabViewAnimated, TabBar, SceneMap } from 'react-native-tab-view';
import Constants from '../../constants';
import { api } from '../../helpers';
import CountryList from '../../constants/countries';
//import styles from './profileStyle';
import Account from '../account/index';
import Topic from '../topics'
import Avatar from '../../components/avatar'
import ModalDropdown from 'react-native-modal-dropdown';
var ImagePicker = require('react-native-image-picker');
import { DatePickerDialog } from 'react-native-datepicker-dialog';
import { NavigationActions } from 'react-navigation';
import moment from 'moment';
const initialLayout = {
    height: 0,
    width: Dimensions.get('window').width,
};
import axios from 'axios';
import { EventRegister } from 'react-native-event-listeners'
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

const backBtn = Platform.OS == "ios" ? { justifyContent: 'center', alignItems: 'center', height: 20, padding: 10, margin: 10, width: 20 } : { margin: 10 }

const FirstRoute = () => <View style={[styles.container, { backgroundColor: '#ff4081' }]} />;
const SecondRoute = () => <View style={[styles.container, { backgroundColor: '#673ab7' }]} />;

export default class EditProfile extends Component {

    // static navigatorButtons = {
    //     rightButtons: [
    //       {
    //         title: 'Edit', // for a textual button, provide the button title (label)
    //         id: 'edit', // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
    //         testID: 'e2e_rules', // optional, used to locate this view in end-to-end tests
    //         disabled: true, // optional, used to disable the button (appears faded and doesn't interact)
    //         disableIconTint: true, // optional, by default the image colors are overridden and tinted to navBarButtonColor, set to true to keep the original image colors
    //         showAsAction: 'ifRoom', // optional, Android only. Control how the button is displayed in the Toolbar. Accepted valued: 'ifRoom' (default) - Show this item as a button in an Action Bar if the system decides there is room for it. 'always' - Always show this item as a button in an Action Bar. 'withText' - When this item is in the action bar, always show it with a text label even if it also has an icon specified. 'never' - Never show this item as a button in an Action Bar.
    //         buttonColor: 'blue', // Optional, iOS only. Set color for the button (can also be used in setButtons function to set different button style programatically)
    //         buttonFontSize: 14, // Set font size for the button (can also be used in setButtons function to set different button style programatically)
    //         buttonFontWeight: '600', // Set font weight for the button (can also be used in setButtons function to set different button style programatically)
    //       },
    //       {
    //         icon: require('../../assets/p_instagram.png'), // for icon button, provide the local image asset name
    //         id: 'add' // id for this button, given in onNavigatorEvent(event) to help understand which button was clicked
    //       }
    //     ]
    //   };

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title: '',
            headerTintColor: 'white',
            headerStyle: {
                backgroundColor: '#404042'
            },
            headerLeft: <TouchableOpacity style={backBtn} onPress={() => navigation.goBack()} >
                <Icon name='arrow-back' style={{ color: '#fff' }} />
            </TouchableOpacity>,
            headerRight: <TouchableOpacity onPress={() => params.handleSave && params.handleSave()}>
                <Image source={require('../../assets/tick.png')} style={[{ tintColor: 'white', width: 22, height: 22, marginRight: 10 }]} />
            </TouchableOpacity>
        }
    };

    saveDetails = () => {
        this.updateUserProfile();
    }

    componentDidMount() {
        this.props.navigation.setParams({ handleSave: () => this.saveDetails() });
    }
    constructor(props) {
        super(props);
        const {state} = props.navigation;
        this.state = {
            active: false,
            index: 0,
            userData: [],
            routes: [],
            userID: state.params.userID,
            isCountryModalVisible: false,
            countryArr: CountryList,
            loaded: false,
            topics: [],
            userName: '',
            information: '',
            website: '',
            name: '',
            surName: '',
            birthday: '',
            gender: '',
            genderIndex: 1,
            nationality: ''
        };

        this.renderScenceFromArray = this.renderScenceFromArray.bind(this)
        this.doMount();
    }

    async getTopicList() {
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
                                'Authorization': 'Token ' + atoken + ';device_id=' + this.state.device_id
                            }
                        });

                        try {
                            let response = await api.get('profiles/' + this.state.userID + '/info');
                            return response.data.profile_object;
                        } catch (error) {
                            console.log("HERE IS PROBLEM", error)
                        }
                    }
                } catch (error) {
                    console.log(error)
                    alert('No device Id found.')
                }
            }
        } catch (error) {
            alert('No Access token Found.')
        }
    }
    doMount() {
        this.getTopicList().then((data) => {
            this.setState({
                userName: data.user_name ? data.user_name : '',
                information: data.bio ? data.bio : '',
                website: data.social_url ? data.social_url : '',
                name: data.first_name ? data.first_name : '',
                surName: data.last_name ? data.last_name : '',
                birthday: data.date_of_birth ? data.date_of_birth : '',
                gender: data.gender ? data.gender : 'male',
                nationality: data.country_name ? data.country_name : '',
                userData: data,
                loaded: true,
                topics: data.user_topics,

            });

            if (this.state.gender == 'male') {
                this.setState({ genderIndex: 1 })

            } else {
                this.setState({ genderIndex: 2 })
            }

        });
    }
    async updateUserProfile() {
        this.setState({ loaded: false })
        const data = new FormData();
        data.append('user_name', this.state.userName);
        data.append('first_name', this.state.name);
        data.append('last_name', this.state.surName);
        data.append('gender', this.state.gender);
        data.append('date_of_birth', this.state.birthday);
        data.append('country_name', this.state.nationality);
        data.append('social_url', this.state.website);
        data.append('bio', this.state.information);
        if (this.state.image) {
            if (Platform.OS == "ios") {
                data.append("file", { uri: this.state.image.uri, name: 'image.jpg', type: 'multipart/form-data' })
            } else {
                data.append("file", { uri: this.state.image.uri, name: 'image.jpg', type: 'image/jpeg' })
            }

        }

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
                        return api.put('profiles/' + this.state.userID, data).then((data) => {
                            AsyncStorage.getItem('loggedinUserData').then((data) => {
                                var tempData = JSON.parse(data)
                                tempData.profile_object.user_name = this.state.userName
                                AsyncStorage.setItem('loggedinUserData', JSON.stringify(tempData))
                                this.goBack()
                            })
                            this.setState({ loaded: true })
                            EventRegister.emit('profileUpdated', {})
                            return data.data;
                        }).catch((error) => {
                            console.log('error while submitting', error.response)
                        });
                    }
                } catch (error) {
                    alert('No device Id found.')
                }
            }
        } catch (error) {
            alert('No Access token Found.')
        }
    };

    goBack() {
        const { navigation } = this.props;
        navigation.goBack();
        navigation.state.params.onUpdate('updated');
    }

    saveUserData() {
        var response = this.updateUserProfile();
    }

    _handleIndexChange = index => this.setState({ index });


    _renderHeader = props => <TabBar {...props} scrollEnabled style={styles.tabbar} labelStyle={styles.label} />;

    _renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
    });

    renderScenceFromArray(routes) {
        return <Topic {...routes} />;
    }
    changeUserProfileImage() {
        const options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            allowsEditing: true,
            storageOptions: {
                skipBackup: true
            }
        };

        ImagePicker.showImagePicker(options, (response) => {
            if (response.didCancel) {
            }
            else if (response.error) {
                alert(response.error)
            }
            else if (response.customButton) {
            }
            else {
                let source = { uri: response.uri };
                this.setState({
                    image: source
                });
            }
        });
    }

    onDOBDatePicked = (date) => {
        this.setState({
            dobDate: date,
            birthday: moment(date).format('YYYY-MM-DD')
        });
    }

    _datePicker = () => {
        this.refs.dobDialog.open({
            date: new Date(),
            maxDate: new Date()
        });
    }

    changeGender(value) {
        this.setState({ gender: value })
    }

    divider1dp(heightDp) {
        return <View style={{ flex: 1, height: heightDp, backgroundColor: '#A2A2A2' }} />
    }

    renderCoutryList() {
        const lapsList = this.state.countryArr.map((item, index) => {
            return (
                <TouchableOpacity key={'country' + index} onPress={() => this.onClickCountry(item.name)} style={{ width: '100%', padding: 5 }} >
                    <Text >{item.name}</Text>
                </TouchableOpacity>
            )
        })
        return <View style={{ paddingVertical: 5 }}>
            {lapsList}
        </View>
    }

    searchInputHandle(value) {
        var filteredArray = CountryList.filter((item) => {
            var title = item.name.toLowerCase()
            return title.indexOf(value.toLowerCase()) != -1;
        });
        this.setState({ countryArr: filteredArray })
    }

    onClickCountry(country) {
        this.setState({ nationality: country, isCountryModalVisible: false, countryArr: CountryList })
    }

    userInfoHeader() {
        let userData = this.state.userData;
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

        return (

            <View style={{ flex: 1, flexDirection: 'column', padding: 0, backgroundColor: '#fafafa' }}>

                <View style={{ flex: 1, flexDirection: 'row', paddingHorizontal: 10, paddingVertical: 5, marginTop: 15, marginBottom: 25 }}>
                    <View style={{ flex: 0.2, flexDirection: 'column', alignItems: 'center' }}>
                        <Avatar img={this.state.image ? this.state.image : pic} size={80} />
                    </View>
                    <View style={{ flex: 0.8 }}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
                                {/* <Button onPress = {() => this.changeUserProfileImage()}
                                    title="Change Profile Picture"
                                    color="#7F7F7F" /> */}
                                <TouchableOpacity onPress={() => this.changeUserProfileImage()}
                                    style={styles.changeProfileBtn}>
                                    <Text style={{ color: '#000', textAlign: 'center', fontSize: 12 }}>CHANGE PROFILE PICTURE</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: 'flex-start', marginRight: 5, marginLeft: 10, paddingHorizontal: 10 }}>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start',height:'100%',justifyContent:'center'}}>
                        <Text style={styles.textTitle}>
                            {'Username'} </Text>
                    </View>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start' }}>
                        <TextInput
                            ref='TextInputComment'
                            {...this.props}
                            editable={true}
                            multiline={false}
                            numberOfLines={1}
                            underlineColorAndroid="transparent"
                            placeholder="User Name"
                            onChangeText={userName => this.setState({ userName })}
                            value={this.state.userName}
                            style={{ backgroundColor: '#FAFAFA', textAlign: 'right', textAlignVertical: 'top', width: '100%',height:40,color:'#000' }}
                            />
                    </View>

                </View>
                {this.divider1dp(1)}

                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: 'flex-start', marginRight: 5, marginLeft: 10, paddingHorizontal: 10 }}>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start',height:'100%',justifyContent:'center' }}>
                        <Text style={styles.textTitle}>
                            {'Information'} </Text>
                    </View>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start' }}>
                        <TextInput
                            ref='TextInputComment'
                            {...this.props}
                            editable={true}
                            multiline={false}
                            numberOfLines={1}
                            maxLength={150}
                            underlineColorAndroid="transparent"
                            placeholder="Information"
                            onChangeText={information => this.setState({ information })}
                            value={this.state.information}

                            style={{ backgroundColor: '#FAFAFA', textAlign: 'right', textAlignVertical: 'top', width: '100%', height:40,color:'#000'}}

                            />
                    </View>

                </View>

                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: 'flex-start', marginRight: 5, marginLeft: 10, paddingHorizontal: 10 }}>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start',height:'100%',justifyContent:'center' }}>

                        <Text style={styles.textTitle}>
                            {'Website'} </Text>
                    </View>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start' }}>
                        <TextInput
                            ref='TextInputComment'
                            {...this.props}
                            editable={true}
                            multiline={false}
                            numberOfLines={1}
                            underlineColorAndroid="transparent"
                            placeholder="Website"
                            onChangeText={website => this.setState({ website })}
                            value={this.state.website}

                            style={{ backgroundColor: '#FAFAFA', textAlign: 'right', textAlignVertical: 'top', width: '100%', height:40,color:'#000'}}

                            />
                    </View>

                </View>

                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: 'flex-start', marginTop: 20, marginRight: 5, marginLeft: 10, marginBottom: 10, paddingHorizontal: 10, paddingVertical: 5, }}>

                    <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
                        <Text style={[styles.textTitle, { color: '#404042', fontWeight: 'bold' }]}>
                            {'Private Information'} </Text>
                    </View>
                </View>
                {this.divider1dp(1)}

                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: 'flex-start', marginRight: 5, marginLeft: 10, paddingHorizontal: 10 }}>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start',height:'100%',justifyContent:'center' }}>

                        <Text style={styles.textTitle}>
                            {'Name'} </Text>
                    </View>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start' }}>
                        <TextInput
                            ref='TextInputComment'
                            {...this.props}
                            editable={true}
                            multiline={false}
                            numberOfLines={1}
                            underlineColorAndroid="transparent"
                            placeholder="Name"
                            onChangeText={name => this.setState({ name })}
                            value={this.state.name}

                            style={{ backgroundColor: '#FAFAFA', textAlign: 'right', textAlignVertical: 'top', width: '100%',height:40,color:'#000' }}

                            />
                    </View>

                </View>
                {this.divider1dp(1)}

                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: 'flex-start', marginRight: 5, marginLeft: 10, paddingHorizontal: 10 }}>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start' ,height:'100%',justifyContent:'center'}}>

                        <Text style={styles.textTitle}>
                            {'Surname'} </Text>
                    </View>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start' }}>
                        <TextInput
                            ref='TextInputComment'
                            {...this.props}
                            editable={true}
                            multiline={false}
                            numberOfLines={1}
                            underlineColorAndroid="transparent"
                            placeholder="Surname"
                            onChangeText={surName => this.setState({ surName })}
                            value={this.state.surName}

                            style={{ backgroundColor: '#FAFAFA', textAlign: 'right', textAlignVertical: 'top', width: '100%',height:40,color:'#000' }}

                            />
                    </View>
                </View>
                {this.divider1dp(1)}

                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: 'flex-start', marginRight: 5, marginLeft: 10, paddingHorizontal: 10}}>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start',height:'100%',justifyContent:'center' }}>

                        <Text style={styles.textTitle}>
                            {'Birthday'} </Text>
                    </View>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start' }}>
                        <TextInput
                            ref='TextInputComment'
                            {...this.props}
                            editable={true}
                            multiline={false}
                            numberOfLines={1}
                            underlineColorAndroid="transparent"
                            placeholder="YYYY-MM-DD"
                            // onChangeText={birthday => this.setState({ birthday })}
                            onFocus={this._datePicker}
                            value={this.state.birthday}

                            style={{ backgroundColor: '#FAFAFA', textAlign: 'right', textAlignVertical: 'top', width: '100%',height:40,color:'#000' }}

                            />
                    </View>

                </View>
                {this.divider1dp(1)}

                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: 'flex-start', marginRight: 5, marginLeft: 10, paddingHorizontal: 10 }}>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start',height:'100%',justifyContent:'center' }}>
                        <Text style={styles.textTitle}>
                            {'Gender'} </Text>
                    </View>
                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-end' ,height:40}}>


                        <ModalDropdown
                            options={['male', 'female']}
                            dropdownStyle={{ paddingVertical: 0, width: 120, paddingHorizontal: 0, marginRight: 0, maxHeight: 80 }}
                            style={{ paddingVertical: 5, paddingHorizontal: 0 }}

                            textStyle={{ color: 'black', fontSize: 14 }}
                            defaultIndex={this.state.genderIndex}
                            defaultValue={this.state.gender ? this.state.gender : 'male'}
                            dropdownTextStyle={{ fontSize: 14, color: '#474747', textAlign: 'left' }}

                            onSelect={(index, value) => this.changeGender(value)}
                            />
                    </View>

                </View>
                {this.divider1dp(1)}
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: 'flex-start', marginTop: 10, marginRight: 5, marginLeft: 10, paddingHorizontal: 10, paddingVertical: 5, }}>

                    <View style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-start',height:'100%',justifyContent:'center' }}>

                        <Text style={styles.textTitle}>
                            {'Nationality'} </Text>
                    </View>
                    <TouchableOpacity onPress={() => this.setState({ isCountryModalVisible: true })} style={{ flex: 0.5, flexDirection: 'column', alignItems: 'flex-end' }}>

                        <Text style={{color:'#000'}}>{this.state.nationality ? this.state.nationality : 'Tap here'}</Text>

                    </TouchableOpacity>
                </View>
            </View>

        )
    }

    render() {
        const { goBack } = this.props.navigation;
        if (this.state.loaded) {
            return (
                <View style={styles.container}>

                    <ScrollView >

                        {/* <View style={{ height: 50, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: 'flex-start', backgroundColor: '#ffffff' }}>
                            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-start', alignContent: 'flex-start', marginTop: 10, marginRight: 10, marginLeft: 10, }}>
                                <View style={{ flex: 0.2, flexDirection: 'column', alignItems: 'flex-start' }} onPress={() => this.props.navigation.dispatch(NavigationActions.back())}>
                                    <Image source={require('../../assets/p_ic-back.png')} style={styles.mainAccountIconList} resizeMode='contain' />
                                </View>
                                <View style={{ flex: 0.6, flexDirection: 'column', alignItems: 'center' }}>
                                    <Text style={styles.titleText}>Edit Profile</Text>
                                </View>
                                <View style={{ flex: 0.2, flexDirection: 'column', alignItems: 'center' }} onPress={this.saveUserData()}>
                                    <Text style={styles.textContent}>Save</Text>
                                </View>
                            </View>
                        </View> */}

                        {this.userInfoHeader()}

                    </ScrollView>
                    <Modal
                        animationType={'fade'}
                        transparent={true}
                        visible={this.state.isCountryModalVisible}
                        presentationStyle={'overFullScreen'}
                        onRequestClose={() => { this.setState({ isCountryModalVisible: false }) } }
                        >
                        <TouchableWithoutFeedback onPress={() => { this.setState({ isCountryModalVisible: false }) } }>
                            <View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>
                                <TouchableWithoutFeedback>
                                    <View style={{ backgroundColor: "#fff", position: 'absolute', left: '10%', right: '10%', height: '90%', top: '5%', padding: 10, }}>
                                        <Container>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3, borderBottomColor: 'black', borderBottomWidth: 2 }}>
                                                <TextInput underlineColorAndroid='transparent' style={{ height: 35, width: '100%', paddingHorizontal: 20 }} selectionColor={'black'} placeholder='Search'
                                                    onChangeText={val => this.searchInputHandle(val)}></TextInput>
                                            </View>
                                            <Content>
                                                {this.renderCoutryList()}
                                            </Content>
                                        </Container>
                                    </View>
                                </TouchableWithoutFeedback>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>
                    <DatePickerDialog ref="dobDialog" onDatePicked={this.onDOBDatePicked.bind(this)} />
                </View>

            );
        }


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

};
const styles = StyleSheet.create({
    tabContainer: {
        flex: 1,

    },


    header: {
        backgroundColor: "#fff",
        elevation: 0,
        height: 100,

    }, titleText: {
        textAlign: 'center',
        color: "#000",
        height: 48,
        fontSize: 20,
        fontWeight: '400',
    },

    container: {
        flex: 1,
        backgroundColor: '#FAFAFA'

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

    textTitle: {
        fontSize: 15,
        color: '#5E5E62',

    }, textContent: {
        fontSize: 15,
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

    },
    subHeadingList: {
        color: "#000",
        fontSize: 17,

    },
    changeProfileBtn: {
        backgroundColor: '#E0E0E0',
        paddingHorizontal: 10,
        paddingVertical: 5,
		elevation:3,
        flexDirection: 'column',
        width: '95%',
		marginLeft:30,
        marginRight: 20

    }
});