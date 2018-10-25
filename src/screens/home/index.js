import React, { version } from 'react';
import { Dimensions, Platform, Image, Modal, StyleSheet, ScrollView, Text, TouchableWithoutFeedback, View, AsyncStorage, TouchableOpacity, Alert } from 'react-native';
import { Container, Header, Left, Body, Right, Button, Icon, Title, H1, Label, Content, Card, CardItem, Spinner } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
import { DrawerNavigator, addNavigationHelpers, StackNavigator } from 'react-navigation';
import styles from './homeStyle';
import RobotItem from './robotItem';
import Dataset from 'impagination';
import Constants from '../../constants';
import axios from 'axios';
console.disableYellowBox = true;
import FABExample from '../fab/index.js';
import SideMenu from '../Sidemenu/index.js';
import AppIntro from 'react-native-app-intro-v2';
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
import firebaseService from '../firebase/services/firebase';
import FCM, { NotificationActionType } from "react-native-fcm";
import { EventRegister } from 'react-native-event-listeners'
import SplashScreen from 'react-native-splash-screen';

import { registerKilledListener, registerAppListener } from "./../firebase/Listeners";
import firebaseClient from "./../firebase/FirebaseClient";

registerKilledListener();

export default class Home extends React.Component {

	constructor(props) {
		super(props);
		side = new SideMenu()
		this.state = {
			dataset: null,
			datasetState: null,
			navigate: this.props.navigation.navigate,
			navigateParams: this.props.navigation.state.params,
			isLoggedIn: null,
			isContent: false,
			isModalOpen: null,
			isEmailVerified: null,
			isClickedonEmailVerification: false,
			userData: {},
			deviceID: null
		};
	}
	static navigationOptions = ({ navigation }) => {
		return {
			header: null
		}
	};
	/**
	 * Create a new impagination dataset when the component mounts and
	 * set the intial readOffset to 0 to fetch data.
	 *
	 * @method setupImpagination
	 */
	setupImpagination() {
		let _this = this;
		let dataset = new Dataset({
			pageSize: 5,

			loadHorizon: 2,
			observe(datasetState) {
				_this.setState({ datasetState });
			},
			async fetch(pageOffset, pageSize, stats) {
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
								return api.get(`search?categories=all&page=${pageOffset + 1}&per_page=${pageSize}&source=product`).then((res) => {
									return (res.data.results);
								})
							}
						}
						catch (deviceID) {
							alert('something went wrong')
						}
					} else {
						return fetch(Constants.url.base + `search?categories=all&page=${pageOffset + 1}&per_page=${pageSize}&source=product`)
							.then(response => response.json())
							.then(responseData => {
								return (responseData.results);
							});
					}
				} catch (error) {
					alert('something went wrong');
				}
			}
		});
		dataset.setReadOffset(0);
		this.setState({ dataset });
	}

	componentWillMount() {

		this.listener = EventRegister.addEventListener('followUnfollow', (data) => {
			this.setupImpagination();
		})

		AsyncStorage.getItem('isFirstTime').then((value) => {

			if (value === null) {
				this.setState({ isModalOpen: true })
			} else {
				let userData = JSON.parse(value)
				this.setState({ isModalOpen: !userData.isFirstTime })
			}
		})
		this.setupImpagination();
		this.reSendEmailConfirmation()
		// this.setupTutorialView();
	}

	componentWillUnmount() {
		EventRegister.removeEventListener(this.listener)
	}


	/**
	 * Render each item in the impagination store. If the record is
	 * pending we should show a loading spinner.
	 *
	 * @method renderItem
	 */
	renderItem = () => {
		var count = 0;

		return this.state.datasetState.map(record => {
			if (record.content == null) {
				return false;
			}
			if (record.isPending && !record.isSettled) {
				//this.setState({isContent: true});
				return false;
			}
			count++;
			return (
				<RobotItem key={count} record={record} userData={this.state.userData} deviceID={this.state.deviceID} callback={this.setupImpagination.bind(this)} count={count} isLoggedIn={this.state.isLoggedIn} navigate={this.state.navigate} />
			);
		});
	}

	/**
	 * Based on scroll position determine which card is in the current
	 * viewport. From there you can set the impagination readOffset
	 * equal to the current visibile card.
	 *
	 * @method setCurrentReadOffset
	 */
	setCurrentReadOffset = (event) => {
		let itemHeight = 402;
		let currentOffset = Math.floor(event.nativeEvent.contentOffset.y);
		let currentItemIndex = Math.ceil(currentOffset / itemHeight);
		this.state.dataset.setReadOffset(currentItemIndex);
	}

	_renderItem({item, index}) {
		return (
			<View style={styles.slide}>
				<Text style={styles.title}>{item.title}</Text>
			</View>
		);
	}
	_closeModal = () => {

		let isFirst = {
			isFirstTime: true
		};

		AsyncStorage.setItem('isFirstTime', JSON.stringify(isFirst), () => {
			AsyncStorage.getItem('isFirstTime', (err, result) => {
			});

		});

		this.setState({ isModalOpen: false })
	}

	async componentDidMount() {
		SplashScreen.hide();
		AsyncStorage.getItem('vibrateIsOn').then((vibrate) => {
			if (vibrate === null) {
				this.setState({ isVibrateOn: true })
			} else {
				let userData = JSON.parse(vibrate)
				this.setState({ isVibrateOn: userData.vibrateIsOn })
			}
		})
		AsyncStorage.getItem('deviceID').then((did) => {
			this.setState({ deviceID: did })
		})
		AsyncStorage.getItem('loggedinUserData').then((userData) => {
			if(userData){
				userData = JSON.parse(userData);
				this.setState({userData: userData})
			}
		})

		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value === null) {
					this.setState({ isLoggedIn: null });
				} else {
					this.setState({ isLoggedIn: value });
				}
			});

		registerAppListener(this.props.navigation);
		FCM.getInitialNotification().then(notif => {
			this.setState({
				initNotif: notif
			})
			if (notif && notif.targetScreen === 'detail') {
				setTimeout(() => {
					this.props.navigation.navigate('Detail')
				}, 500)
			}
		});

		try {
			let result = await FCM.requestPermissions({ badge: false, sound: this.state.isVibrateOn, alert: true });
		} catch (e) {
			console.error(e);
		}

		FCM.getFCMToken().then(token => {
			AsyncStorage.getItem('loggedinUserData').then((userData) => {
				if (userData) {
					userData = JSON.parse(userData)
					var id = userData.profile_object.id + ''
					firebaseService.database().ref('fcmTokens').child(token).set(id, error => {
						if (error) {
							console.log('inside error', error)
						} else {
							console.log('inside success')
						}
					})
				}
			})
		});

		if (Platform.OS === 'ios') {
			FCM.getAPNSToken().then(token => {
			});
		}
	}

	resendEmailForConfirmation = () => {

		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value != null) {
					AsyncStorage.getItem('deviceID').then((did) => {
						if (did != null) {
							fetch(Constants.url.base + `sessions/resend_confirmation_mail`, {
								method: 'POST',
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									'Content-Type': 'application/json',
								},

							})
								.then(response => response.json())
								.then(responseData => {
									AsyncStorage.getItem('loggedinUserData').then((userData) => {
										if (userData != null) {
											userData = JSON.parse(userData)
											this.setState({ verificationEmail: userData.profile_object.email })
										}
									});
									this.setState({ isClickedonEmailVerification: true })
								}).catch((err) => {
									console.log(err)
								});
						}

					})
				}
			});
	}

	reSendEmailConfirmation() {
		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value != null) {
					AsyncStorage.getItem('deviceID').then((did) => {
						if (did != null) {
							fetch(Constants.url.base + `profiles/me`, {
								method: 'GET',
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									'Content-Type': 'application/json',
								},

							})
								.then(response => response.json())
								.then(responseData => {
									var confirmed_at = responseData.profile_object.confirmed_at
									if (confirmed_at === null) {
										this.setState({ isEmailVerified: true })
									} else {

										this.setState({ isEmailVerified: false })
									}
								}).catch((err) => {
									console.log(err)
								});
						}

					})
				}
			});
	}

	closeEmailVerficationModal() {

		this.setState({ isClickedonEmailVerification: false })
		this.props.navigation.navigate('Settings')
	}


	runFunc = (item) => {
		var random = Math.floor((Math.random() * 9999999) + 1000000);
		AsyncStorage.setItem('updateSideMenu', random.toString())
		this.props.navigation.navigate('DrawerToggle', { user: 20 })
	}

	render = () => {

		return (

			<Container style={{ marginLeft: -3, }}>

				<View style={{ flex: 1 }}>
					<Header style={styles.header}>
						<Button transparent style={styles.homeMenu}
							onPress={this.runFunc}
							>
							<Icon name='menu' style={styles.menuIcon} />
						</Button>
						<Body style={styles.titleBody}>
							<Title style={styles.title}>
								<Text style={styles.titleText}>SUPERBLE</Text>
							</Title>
							<Title style={styles.title}>
								<Text style={styles.subTitleText}>Discover the products you love</Text>
							</Title>
						</Body>

						<Button transparent
							style={styles.searchBtn}
							onPress={() => this.props.navigation.navigate('Search')}
							>

							<Image style={{ width: 25, height: 25}} source={require('../../assets/ic-search-t.png')} />
							{/*<Icon name="search" style={styles.searchIcon} />*/}
						</Button>

					</Header>

					{this.state.isEmailVerified &&
						<View style={{ width: deviceWidth - 30, marginLeft: 15, marginTop: 5, backgroundColor: '#fffaf3', height: 80, borderColor: '#c9ba9b', borderRadius: 3, borderWidth: 2 }}>
							<Text style={{ marginTop: 7, color: '#794b02', fontSize: 16, fontWeight: 'bold', marginLeft: 10 }}>Warning</Text>
							<Text style={{ marginTop: 7, marginLeft: 10 }}>
								<Text style={{ color: '#794b02' }} >{`If you haven't received our verification email, `}</Text>
								<Text
									style={{ color: '#794b02', textDecorationLine: 'underline' }}
									onPress={() => this.resendEmailForConfirmation()}>
									{`click here`}
								</Text>
								<Text style={{ color: '#794b02' }}>{` to send again`}</Text>
							</Text>
						</View>
					}

					<Modal
						animationType={'fade'}
						transparent={true}
						visible={this.state.isClickedonEmailVerification}
						presentationStyle={'overFullScreen'}
						onRequestClose={() => console.log('modal not to close')}
						>
						<TouchableWithoutFeedback>
							<TouchableOpacity onPress={() => this.closeEmailVerficationModal()} style={{
								backgroundColor: "rgba(0,0,0,0.6)", justifyContent: 'center', alignItems: 'center',
								width: '100%',
								height: '100%',
							}}>
								<TouchableWithoutFeedback>
									<View style={{
										backgroundColor: "#fff",
										position: 'absolute',
										left: '5%',
										right: '5%',
										height: 80,
										justifyContent: 'center', alignItems: 'center',
									}}>


										<Text style={{ marginTop: 7, marginLeft: 10 }}>
											<Text style={{ color: 'black' }} >{`We sent email to ${this.state.verificationEmail}. `}</Text> <Text
												style={{ color: 'blue' }}
												onPress={() => this.props.navigation.navigate('Settings')}>
												{`Click here`}
											</Text><Text style={{ color: 'black' }}>{` if you wish to change the email`}</Text>
										</Text>
									</View>

								</TouchableWithoutFeedback>
							</TouchableOpacity>
						</TouchableWithoutFeedback>
					</Modal>
					<Content style={styles.cardOuterContainer} scrollEventThrottle={3000} onScroll={this.setCurrentReadOffset} removeClippedSubviews={true}>
						{this.renderItem()}
					</Content>


					<FABExample navigator={this.props.navigation} />

					{this.state.isModalOpen &&
						<Modal
							visible={this.state.isModalOpen}
							animationType={'fade'}
							transparent={true}
							presentationStyle="overFullScreen"
							onRequestClose={this._closeModal}
							>

							<ScrollView style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
								horizontal={true}
								pagingEnabled={true}
								>
								<View style={styles.slide}>
									<Image style={{ height: 40, width: 40, marginTop: 38, left: Dimensions.get('window').width - 45, }} source={require('../../assets/ic-search.png')} />
									<Image style={{ marginTop: 95, left: Dimensions.get('window').width - 75, position: 'absolute' }} source={require('../../assets/arrow-search.png')} />

									<Text style={{ color: 'white', fontSize: 18, marginTop: 70, left: Dimensions.get('window').width - 140 }}>Search</Text>
									<View style={{ flexDirection: 'row', marginTop: 50, alignItems: 'center' }}>
										<Text style={{ color: 'white', fontSize: 18, textAlign: 'center', marginLeft: 30 }}>Click on the product {'\n'} if you want tot ask about it</Text>
										<Image style={{ height: 40, width: 30, left: Dimensions.get('window').width - 100, position: 'absolute' }} source={require('../../assets/ic-click.png')} />
									</View>
									<View style={{ flexDirection: 'row', bottom: 65, position: 'absolute', alignItems: 'center' }} >
										<Text style={{ color: 'white', marginLeft: 25, fontSize: 18, }}>Click here to upload products {'\n'} or see your chats</Text>
										<Image style={{ height: 25, width: 45, left: Dimensions.get('window').width - 95, position: 'absolute' }} source={require('../../assets/arrow-floating.png')} />
									</View>
								</View>

								<View style={{ width: deviceWidth * 2, flex: 1 }}>

									<Text style={{ color: 'white', fontSize: 20, marginTop: 10, fontWeight: 'bold', marginTop: 70, textAlign: 'center', marginLeft: deviceWidth }}>Tricks to get points FAST!</Text>
									<View style={{ flexDirection: 'row', marginTop: 80, marginLeft: deviceWidth, justifyContent: 'center', alignItems: 'center' }}>

										<Image style={{ height: 40, justifyContent: 'center', alignItems: 'center', width: 40, }} source={require('../../assets/oval.png')}>
											<Text style={{ color: 'white', fontSize: 20, textAlign: 'center' }}>1</Text>
										</Image>
										<Text style={{ color: 'white', marginLeft: 10, fontSize: 20, textAlign: 'center' }}>Upload 5 products you {'\n'} love and get 5 points</Text>
									</View>

									<View style={{ flexDirection: 'row', marginTop: 80, marginLeft: deviceWidth, justifyContent: 'center', alignItems: 'center' }} >
										<Image style={{ height: 40, width: 40, justifyContent: 'center', alignItems: 'center', }} source={require('../../assets/oval.png')}>
											<Text style={{ color: 'white', fontSize: 20, textAlign: 'center' }}>2</Text>
										</Image>
										<Text style={{ color: 'white', marginLeft: 10, fontSize: 20, }}>Swipe 20 products you {'\n'} want to talk about and {'\n'} get 10 points</Text>
									</View>
									<Text style={{ color: 'white', marginLeft: 25, marginTop: 80, textAlign: 'center', marginLeft: deviceWidth, fontSize: 20, }}>Win points to buy products {'\n'} and redeem for cash</Text>

									<TouchableOpacity onPress={this._closeModal} style={{ borderColor: 'white', borderWidth: 1, marginTop: 50, width: 100, height: 35, justifyContent: 'center', marginLeft: deviceWidth + 200, alignItems: 'center', borderRadius: 2 }}>
										<Text style={{ color: 'white', fontSize: 20, textAlign: 'center' }}>I got it</Text>
									</TouchableOpacity>
								</View>
							</ScrollView>

						</Modal>
					}
				</View>
			</Container>

		);
	}

}


