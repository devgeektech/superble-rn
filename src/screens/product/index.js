import React from 'react';
import PropTypes from 'prop-types';
import {
	Dimensions,
	Image,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableWithoutFeedback,
	TouchableHighlight,
	TouchableOpacity,
	View,
	ScrollView,
	Picker,
	FlatList,
	Linking,
	Animated,
	Share,
	AsyncStorage,
	Alert,
	ActivityIndicator
} from 'react-native';

import {
	Container,
	Header,
	Left,
	Body,
	Right,
	Button,
	Icon,
	Title,
	H1,
	H3,
	H2,
	Item,
	Input,
	Thumbnail,
	Label,
	Content,
	Card,
	CardItem,
	Toast,
	Spinner,
	CheckBox
} from 'native-base';
import Avatar from '../../components/avatar'
import GridView from "react-native-super-grid";
import { Col, Row, Grid } from 'react-native-easy-grid';
import { DrawerNavigator, addNavigationHelpers, StackNavigator } from 'react-navigation';
import styles from './productStyle';
import { Select, Option } from "react-native-chooser";
import ModalDropdown from 'react-native-modal-dropdown';
import FABExample from '../fab/index.js'
import Constants from '../../constants';
import email from 'react-native-email'
const { width } = Dimensions.get('window');
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

const avatarImage = 'https://forums.iboats.com/user/avatar?userid=503684&type=large';
import CountryList from '../../constants/countries';
const device_id = 'Y2QzZjJjNjU5N2YxNzM=';
let selectedFriendsList = [];
let selectAllFriendsList = [];

function abbrNum(number, decPlaces) {
	decPlaces = Math.pow(10, decPlaces);
	var abbrev = ["k", "m", "b", "t"];
	for (var i = abbrev.length - 1; i >= 0; i--) {
		var size = Math.pow(10, (i + 1) * 3);
		if (size <= number) {
			number = Math.round(number * decPlaces / size) / decPlaces;
			if ((number == 1000) && (i < abbrev.length - 1)) {
				number = 1;
				i++;
			}
			number += abbrev[i];
			break;
		}
	}
	return number;
}
export default class Product extends React.Component {

	scrollX = new Animated.Value(0);

	constructor(props) {
		super(props);
		this.state = {

			enabled: true,
			dataShow: false,
			record: null,
			commentData: null,
			productId: null,
			searchText: '',
			commentHtml: '',
			saveCommentText: '',
			relatedArticles: [],
			similerProductsCategories: [],
			similerProductsUser: [],
			similerProductsBrands: [],
			contry: "US",
			modalVisible: false,
			friendsData: [],
			selectAllCheckBoxes: false,
			threedotsmodalVisible: false,
			showToast: false,
			likedHeart: false,
			productFirstDes: null,
			isTabbedCommentLike: false,
			isCountryModalVisible: false,
			isEnoughPoints: false,
			affillateViewVisible:false,
			contentType: '',
			nationality: '',
			thanksForOrderModal: false,
			countryArr: CountryList,
			firstComment: null,
			isNotEnoughPoints: false,
			isModalOpen: null,
			currentUser: 0,
			isCommentOptionModal: false,
			isCommentEditModal: false
		};
		this.onEdit = this.onEdit.bind(this)
	}
	static navigationOptions = ({ navigation, screenProps }) => ({
		header: null
	});

	articleClick(event) {
		this.props.navigation.navigate('Article', { item: event });
	}

	componentDidMount() {
		const { params } = this.props.navigation.state;
		let productId = params.item;
		this.setState({ contentType: params.screenName })
		// let productId = 5346;
		this.setState({ productId: productId });
		AsyncStorage.getItem('isFirstTimeProductDetail').then((value) => {

			if (value === null) {
				this.setState({ isModalOpen: true })
			} else {
				let userData = JSON.parse(value)
				this.setState({ isModalOpen: !userData.isFirstTime })
			}
		})

		this.getProductDetail(productId)
		AsyncStorage.getItem('loggedinUserData').then((userData) => {
			userData = JSON.parse(userData)
			if (userData) {
				this.setState({ currentUser: userData.profile_object.id })
			}
		})

		this.fetchRelatedArticles(productId);
		this.getSimilerProductsCategories(productId);
		this.getSimilerProductsUser(productId);
		this.getSimilerProductsBrands(productId);
	}

	_closeModal = () => {
		let isFirst = {
			isFirstTime: true
		};

		AsyncStorage.setItem('isFirstTimeProductDetail', JSON.stringify(isFirst), () => {
			AsyncStorage.getItem('isFirstTimeProductDetail', (err, result) => {
			});

		});

		this.setState({ isModalOpen: false })
	}
	getProductDetail(productId) {
		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value != null) {
					AsyncStorage.getItem('deviceID').then((did) => {
						if (did != null) {
							fetch(Constants.url.base + "products/" + productId, {
								method: 'GET',
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									// 'Authorization':'Token token=bb6b2728-ceb4-4b19-b9ec-833b0e66a7d3;device_id='+deviceId,
									'Content-Type': 'application/json',
									'COUNTRY-CODE': this.state.contry
								}
							})
								.then(response => response.json())
								.then(record => {

									var firstComment = {
										question_text: record.product.description,
										likes: 0,
										is_liked: false,
										id: 23,
										is_owner: true,
										user: {
											user_name: record.product.product_owner,
											badge_image_url: record.product.owner_badge_image,
											id: record.product.owner_id,
											image_url: record.product.owner_image
										}
									}
									
									this.setState({ record, likedHeart: record.is_liked ? record.is_liked : false, firstComment: firstComment });
									
									this.syncComment()
								});

						}
					})
				} else {
					fetch(Constants.url.base + "products/" + productId)
						.then(response => response.json())
						.then(record => {

							this.setState({ record });
							this.syncComment()
						});
				}
			})
	}

	getProductDetailWith = (productId) => {

		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value === null) {
					return this.props.navigation.navigate('Account');
				} else {

					AsyncStorage.getItem('deviceID').then((did) => {
						if (did === null) {
							return this.props.navigation.navigate('Account');
						} else {
							let mainArray = []
							let productId = this.state.productId;
							selectedFriendsList.length >= 1 ? mainArray = selectedFriendsList : null;
							selectAllFriendsList.length >= 1 ? mainArray = selectAllFriendsList : null;

							selectedFriendsList = []
							selectAllFriendsList = []

							var arrString = mainArray.join('&user_ids[]=');
							arrString = '&user_ids[]=' + arrString;

							fetch(Constants.url.base + `requests?product_id=${productId}${arrString}`, {
								method: 'POST',
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									// 'Authorization':'Token token=bb6b2728-ceb4-4b19-b9ec-833b0e66a7d3;device_id='+deviceId,
									'Content-Type': 'application/json'
								}
							}).then(function (responce) {
								if (responce.ok) {
									//alert('Invited successfully !')
									// this.closeModal();
								}
							}).catch(function () {
								alert('Some error occured!')
								// this.closeModal();
							});

							mainArray = []
						}
					});

				}
			});
	}

	// likeProduct = (itemID)=>{
	// 	AsyncStorage.getItem('isLoggedIn')
	// 	.then( (value) => {

	// 	})


	// }	

	getSimilerProductsUser = (productId) => {

		fetch(Constants.url.base + "products/" + productId + "/related_products?type=user_id", {
			method: "GET"
		})
			.then((res) => res.json())
			.then(resdata => {
				resdata.data.splice(resdata.data.length, 0, { "image_url": "../../assets/viewalll.png" });
				this.setState({ similerProductsUser: resdata.data })
			})
	}

	getSimilerProductsCategories = (productId) => {

		fetch(Constants.url.base + "products/" + productId + "/related_products?type=category_id", {
			method: "GET"
		})
			.then((res) => res.json())
			.then(resdata => {
				resdata.data.splice(resdata.data.length, 0, { "image_url": "../../assets/viewalll.png" });
				this.setState({ similerProductsCategories: resdata.data })
			})
	}

	getSimilerProductsBrands = (productId) => {
		fetch(Constants.url.base + "products/" + productId + "/related_products?type=brand_id", {
			method: "GET"
		})
			.then((responce) => responce.json())
			.then(responcedata => {
				responcedata.data.splice(responcedata.data.length, 0, { "image_url": "../../assets/viewalll.png" });
				this.setState({ similerProductsBrands: responcedata.data })
			})
	}

	fetchRelatedArticles = (productId) => {
		fetch(Constants.url.base + "products/" + productId + "/related_articles", {
			method: 'GET'
		})
			.then((ress) => ress.json())
			.then(resDataa => {
				this.setState({ relatedArticles: resDataa.data })
			})
	}

	commentOptions(article, index) {
		AsyncStorage.getItem('loggedinUserData').then((userData) => {
			userData = JSON.parse(userData)
			if (userData) {
				if (article.user_id == userData.profile_object.id) {
					this._showCommentOptionModal(article)
				}
			}
		})

	}

	_showCommentOptionModal(article) {
		this.setState({ isCommentOptionModal: true, editCommentObject: article })
	}

	_closeCommentOptionModal() {
		this.setState({ isCommentOptionModal: false })
	}

	_closeNotEnoughPoints() {
		this.setState({ isNotEnoughPoints: false })
	}
	_closeThanksForOrder() {
		this.setState({ thanksForOrderModal: false })
	}
	_closeEnoughPoints() {
		this.setState({ isEnoughPoints: false, })
	}

	_showEditCommentModal() {
		this.setState({ isCommentOptionModal: false, isCommentEditModal: true, editcommentText: this.state.editCommentObject.question_text })
	}

	_closeEditCommentModal() {
		this.setState({ isCommentEditModal: false })
	}

	_deleteComment() {
		Alert.alert(
			'',
			'Are you sure you want to delete this comment?',
			[
				{ text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
				{ text: 'OK', onPress: () => this._deleteCommentService() },
			],
			{ cancelable: false }
		)
	}
	searchInputHandle(value) {
		var filteredArray = CountryList.filter((item) => {
			var title = item.name.toLowerCase()
			return title.indexOf(value.toLowerCase()) != -1;
		});
		this.setState({ countryArr: filteredArray })
	}
	_editCommentService() {
		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value !== null) {
					AsyncStorage.getItem('deviceID').then((did) => {
						if (did !== null) {
							fetch(Constants.url.base + `products/${this.state.productId}/questions/${this.state.editCommentObject.id}`, {
								method: 'PUT',
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({ text: this.state.editcommentText })
							}).then((responce) => {
								if (responce.ok) {
									this.syncComment()
									this.setState({ isCommentEditModal: false })
								}
							}).catch((error) => {
								alert('Some error occured!')
								// this.closeModal();
							});
						}
					})
				}
			})
	}

	_deleteCommentService() {
		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value !== null) {
					AsyncStorage.getItem('deviceID').then((did) => {
						if (did !== null) {
							fetch(Constants.url.base + `products/${this.state.productId}/questions/${this.state.editCommentObject.id}`, {
								method: 'DELETE',
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									'Content-Type': 'application/json'
								}
							}).then((responce) => {
								if (responce.ok) {
									this.syncComment()
									this.setState({ isCommentOptionModal: false })
								}
							}).catch((error) => {
								alert('Some error occured!')
								// this.closeModal();
							});
						}
					})
				}
			})
	}

	commentLaps = (commentDataNew = null) => {

		var commentData = this.state.commentData;
		if (commentDataNew != null) {
			var commentData = commentDataNew;
		}

		let articles = null;
		if (commentData != null) {
			var comments = []

			if (this.state.firstComment != null) {
				comments.push(this.state.firstComment);

			}

			for (let i in commentData.questions) {
				comments.push(commentData.questions[i])

			}


			if (comments != undefined) {

				var count = 0;
				articles = comments.map((articleData, index) => {

					if (count > 15) {
						return false;
					}
					console.log("articleData.id", index)
					count++;
					return (

						<View key={articleData.id} style={styles.imageCommentWrap}>

							<View style={styles.avatarContainer}>
								<View style={styles.avatarWrap1}>
									<TouchableOpacity onPress={() => this.props.navigation.navigate('Profile', { "userID": articleData.user.id })}>
										<Image style={styles.avatarWrap} resizeMode='cover' source={{ uri: articleData.user.image_url != null ? articleData.user.image_url : avatarImage }} />
									</TouchableOpacity>
									<Image style={styles.userLevelWrap} resizeMode='cover' source={{ uri: articleData.user.badge_image_url }} />
								</View>
							</View>
							<View style={[styles.contentContainer,  index == 0 ? {width:'70%'} : {width :'55%'}]}>
								{articleData.user.user_name != null &&
									<Text style={[styles.name]}>{articleData.user.user_name}</Text>
								}
								{articleData.question_text != null &&
									<TouchableOpacity  onLongPress={() => this.commentOptions(articleData, index)}>
										<Text style={styles.commentText}>{articleData.question_text}</Text>
									</TouchableOpacity>
								}
							</View>

							{!articleData.is_owner && <View style={styles.likeImgContainer}>
								<TouchableOpacity onPress={() => this.commentLike(articleData.id, index)}>
									<Image
										style={styles.likeImage}
										resizeMode='contain'
										source={articleData.is_liked ? require('../../assets/like-superble.png') : require('../../assets/ic-superble-00.png')}
										/>
								</TouchableOpacity>
								{articleData.likes != null &&
									<Text style={styles.likeText}>{articleData.likes} like</Text>}
							</View>}
						</View>
					)
				})
			}
		}
		this.setState({ commentHtml: articles });
	}

	goToAddToList = () => {
		this.setModalVisibleForThreeDots(!this.state.threedotsmodalVisible)
		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value != null) {
					this.props.navigation.navigate('AddToList', { item: this.state.productId })
				} else {
					return this.props.navigation.navigate('Account');
				}
			})
	}


	likeComment = (value) => {
		//	alert(value);
	}

	searchComment = (text) => {
		this.setState({ searchText: text });
		let productId = this.state.productId;
		fetch(Constants.url.base + `search/question_search?product_id=${productId}&text=${text}`)
			.then(response => response.json())
			.then(responseData => {
				if (responseData.message) {
					this.commentLaps(null);
				} else {
					this.commentLaps(responseData);
				}
			});
	}


	syncComment = () => {
		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value != null) {
					AsyncStorage.getItem('deviceID').then((did) => {
						if (did != null) {
							fetch(Constants.url.base + "products/" + this.state.productId + "/questions", {
								method: 'GET',
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									'Content-Type': 'application/json',
								},
							})
								.then(response => response.json())
								.then(record => {
									this.setState({ commentData: record });
									this.commentLaps();
								});
						}
					})
				} else {
					fetch(Constants.url.base + "products/" + this.state.productId + "/questions")
						.then(response => response.json())
						.then(record => {
							this.setState({ commentData: record });
							this.commentLaps();
						});
				}
			})

	}

	redeemPointToBuyProduct(points) {
		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {

				if (value === null) {
					return this.props.navigation.navigate('Account');
				} else {
					AsyncStorage.getItem('deviceID').then((did) => {
						if (did === null) {
							return this.props.navigation.navigate('Account');
						} else {
							AsyncStorage.getItem('loggedinUserData').then((userData) => {
								if (userData != null) {
									userData = JSON.parse(userData)
									fetch(Constants.url.base + 'profiles/' + userData.profile_object.id + '/info?pageviews=true').then((response) => response.json()).then((responseJson) => {
										let userPoints = responseJson.profile_object.points
										if (userPoints >= points) {
											this.setState({ isEnoughPoints: true })
										} else {
											this.setState({ isNotEnoughPoints: true })
										}
									}).catch((err) => {
										console.log(err)
									})
								}
							}
							)
						}
					})
				}
			});
	}

	saveComment = () => {
		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {

				if (value === null) {
					return this.props.navigation.navigate('Account');
				} else {
					AsyncStorage.getItem('deviceID').then((did) => {
						if (did === null) {
							return this.props.navigation.navigate('Account');
						} else {
							let text = this.state.saveCommentText;
							let productId = this.state.productId;
							var data = JSON.stringify({
								text: text,
							});

							fetch(Constants.url.base + "products/" + productId + "/questions/comment", {
								method: 'POST',
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									'Content-Type': 'application/json',
								},
								body: data
							})
								.then(response => response.json())
								.then(responseData => {
									this.syncComment();
									this.setState({ saveCommentText: '' });
								});
						}

					})
				}
			});
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

	onClickCountry(country) {
		this.setState({ nationality: country, isEnoughPoints: true, isCountryModalVisible: false, countryArr: CountryList })
	}

	commentLike = (questionId, index) => {

		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value === null) {
					return this.props.navigation.navigate('Account');
				} else {

					AsyncStorage.getItem('deviceID').then((did) => {
						if (did === null) {
							return this.props.navigation.navigate('Account');
						} else {
							let productId = this.state.productId;
							let body = JSON.stringify({ question_id: questionId, product_id: productId });
							fetch(Constants.url.base + 'superbles/superble_question', {
								method: 'POST',
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									'Content-Type': 'application/json'
								},
								body: body
							})
								.then((responce) => responce.json())
								.then((resData) => {
									var userdata = this.state.commentData;
									this.syncComment();
								})
						}
					});
				}


			});
	}

	openModal() {
		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value === null) {
					return this.props.navigation.navigate('Account');
				} else {

					AsyncStorage.getItem('deviceID').then((did) => {
						if (did === null) {
							return this.props.navigation.navigate('Account');
						} else {
							let productId = this.state.productId;
							this.setState({ modalVisible: true, invityLoaded: false });
							fetch(Constants.url.base + "friends?product_id=" + productId, {
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									'Content-Type': 'application/json'
								}
							})
								.then((responce) => responce.json())
								.then((resData) => {
									this.setState({ invityLoaded: true })
									let modifiedData = [];
									for (i = 0; i < resData.friends.length; i++) {
										let item = resData.friends[i];
										item.index = i;
										item.isSelect = false;
										modifiedData.push(item);
									}
									this.setState({ friendsData: modifiedData });
								}).catch(error => {
									this.setState({ invityLoaded: true })
								})
						}
					});
				}


			});
	}

	closeModal = () => {
		this.setState({ modalVisible: false });
	}

	setModalVisibleForThreeDots(visible) {
		this.setState({ threedotsmodalVisible: visible });
	}

	checkAllBoxes = () => {
		const { friendsData, selectAllCheckBoxes } = this.state;
		friendsData.map(i => {
			selectAllFriendsList.push(i.user.id)
			i.isSelect = !selectAllCheckBoxes;
		})
		this.setState(friendsData);
		this.setState({ selectAllCheckBoxes: !selectAllCheckBoxes })
	}

	clickOnSingleCheckbox = (item) => {
		const { friendsData } = this.state;
		selectedFriendsList.push(item.user.id);
		friendsData[item.index]['isSelect'] = !friendsData[item.index]['isSelect'];
		this.setState(friendsData);
	}

	sendAPItoPostFriendsList = () => {
		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value === null) {
					return this.props.navigation.navigate('Account');
				} else {
					AsyncStorage.getItem('deviceID').then((did) => {
						if (did === null) {
							return this.props.navigation.navigate('Account');
						} else {
							let mainArray = []
							let productId = this.state.productId;
							selectedFriendsList.length >= 1 ? mainArray = selectedFriendsList : null;
							selectAllFriendsList.length >= 1 ? mainArray = selectAllFriendsList : null;

							selectedFriendsList = []
							selectAllFriendsList = []

							var arrString = mainArray.join('&user_ids[]=');
							arrString = '&user_ids[]=' + arrString;

							fetch(Constants.url.base + `requests?product_id=${productId}${arrString}`, {
								method: 'POST',
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									'Content-Type': 'application/json'
								}
							}).then((responce) => {
								if (responce.ok) {
									this.setState({ modalVisible: false });
									setTimeout(function () {
										alert('Invited successfully !')
									}, 2000);


								}
							}).catch((error) => {
								this.closeModal();
								setTimeout(function () {
									alert('Some error occured!', )
								}, 2000);


							});

							mainArray = []
						}


					});

				}
			});
	}

	likeProduct = (itemID) => {
		const { params } = this.props.navigation.state;
		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value === null) {
					return this.props.navigation.navigate('Account');
				} else {
					AsyncStorage.getItem('deviceID').then((did) => {
						if (did === null) {
							return this.props.navigation.navigate('Account');
						} else {
							AsyncStorage.getItem('loggedinUserData').then((user_data) => {
								if (user_data !== null) {
									var dataJson = JSON.parse(user_data);

									var userId = (dataJson.profile_object.id);

									if (this.state.record.product.owner_id != userId) {
										let that = this;
										let { record, likedHeart } = this.state


										if (likedHeart == false) {
											that.setState({ likedHeart: true })
											let statusData = JSON.stringify({ status: 'like' });
											fetch(Constants.url.base + 'products/' + itemID + '/likes', {
												method: 'POST',
												headers: {
													'Authorization': 'Token token=' + value + ';device_id=' + did,
													'Content-Type': 'application/json'
												},
												body: statusData
											}).then(function (res) {
												if (res.ok) {

													let arrayD = record
													arrayD.product.like_count = record.product.like_count + 1
													that.setState({ record: arrayD });
													params.callback()
												}
											}).catch(function (e) {
												alert(e)
											})

										} else {
											that.setState({ likedHeart: false })
											let statusData = JSON.stringify({ status: 'nolike' });
											fetch(Constants.url.base + 'products/' + itemID + '/likes', {
												method: 'POST',
												headers: {
													'Authorization': 'Token token=' + value + ';device_id=' + did,
													'Content-Type': 'application/json'
												},
												body: statusData
											}).then(function (res) {
												if (res.ok) {

													let arrayD = record
													arrayD.product.like_count = record.product.like_count - 1
													that.setState({ record: arrayD });
													params.callback();
												}
											}).catch(function (e) {
												alert(e)
											})

										}
									} else {
										alert("You can't like your own product");
									}

								}
							})
						}
					});
				}

			});
	}
	removeDuplicates = (arr) => {
		let unique_array = []
		for (let i = 0; i < arr.length; i++) {
			if (unique_array.indexOf(arr[i]) == -1) {
				unique_array.push(arr[i])
			}
		}
		return unique_array
	}

	shareFunction() {
		AsyncStorage.getItem('loggedinUserData').then((userData) => {
			if (userData != null) {
				userData = JSON.parse(userData)
				this.setState({ referal_code: userData.profile_object.referral_code })
				let content_share = {
					message: 'https://staging.superble.com/product/' + this.state.record.product.seo_friendly_path + '/' + this.state.record.product.id + "?referral_code=" + this.state.referal_code,
					title: this.state.record.product.brand.name + ' - ' + this.state.record.product.title
				};
				let options_share = {};
				Share.share(content_share, options_share);

			}
		})

	}

	setTrackingIDWithBuyNow = (affillate) => {
		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value === null) {
					return this.props.navigation.navigate('Account');
				} else {
					AsyncStorage.getItem('deviceID').then((did) => {
						if (did === null) {
							return this.props.navigation.navigate('Account');
						} else {

							fetch(Constants.url.base + `affiliate_trackings/update_tracking`, {
								method: 'POST',
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									'Content-Type': 'application/json'
								},
								body: JSON.stringify({
									product_id: this.state.productId,
									url: affillate.url,
									options: this.state.contentType,
									status: 5,
									tracking_id: affillate.tracking_id
								})

							}).then((responce) => {
								Linking.openURL(affillate.url)

							}).catch((error) => {
								console.error(error)

							});


						}


					});

				}
			});

	}
	setModalAffilateVisible(visible){
		this.setState({affillateViewVisible:visible});
	}
	openMail() {
		const to = "supportcrew@superble.com"
		email(to, {
			subject: 'Report product:' + this.state.record.product.title,
			body: `DESCRIBE THE PROBLEM BELOW\n\n-------------------------------\n\nProduct id: ${this.state.record.product.product_id} \n\nCategory: ${this.state.record.product.category.name} \n\nBrand Name: ${this.state.record.product.brand.name} \n\nName:${this.state.record.product.title} \n\nDescription: ${this.state.record.product.description} \n\nAffiliate Link:`
		}).catch(console.error)

	}

	redeemPoints() {
		const { record } = this.state;
		if (this.state.nationality != '') {
			AsyncStorage.getItem('isLoggedIn').then((value) => {
				if (value === null) {
					return this.props.navigation.navigate('Account');
				} else {
					AsyncStorage.getItem('deviceID').then((did) => {
						if (did === null) {
							return this.props.navigation.navigate('Account');
						} else {
							var data = JSON.stringify({
								nationality: this.state.nationality,
								product_id: this.state.productId,
								price: record.product.point
							});
							fetch(Constants.url.base + "orders", {
								method: 'POST',
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									'Content-Type': 'application/json',
									'User-Agent': 'HTTP_USER_AGENT'
								},
								body: data
							})
								.then(response => response.json())
								.then(responseData => {
									if (responseData.message == "Order Placed") {
										this.setState({ isEnoughPoints: false, thanksForOrderModal: true })
									} else {
										alert("Something went wrong");
									}
								});
						}

					})
				}
			});

		} else {
			alert('Please Select Country!')
		}
	}

	renderSeparator(sectionID, rowID, adjacentRowHighlighted) {
		return (null);
	}

	renderRow(rowData, rowID, highlighted) {
		var icon
		if (rowData == "United States") {
			icon = require('../../assets/usa.png')
		} else {
			icon = require('../../assets/sg.png')
		}
		return (
			<TouchableHighlight underlayColor='cornflowerblue'>
				<View style={[styles.dropdown_2_row]}>
					<Image style={styles.dropdown_2_image}
						mode='stretch'
						source={icon}
						/>
					<Text style={[styles.dropdown_2_row_text]}>
						{`${rowData}`}
					</Text>
				</View>
			</TouchableHighlight>
		);
	}

	changeContry(index, contryName) {
		if (contryName == "Singapore") {
			this.setState({ contry: "SG" })
			this.getProductDetail(this.state.productId)
		} else if (contryName == "United States") {
			this.setState({ contry: "US" })
			this.getProductDetail(this.state.productId)
		} else {

		}
	}

	openCountryList = () => {
		this.setState({ isEnoughPoints: false, isCountryModalVisible: true })
	}

	onTagClicked = (item) => {
		if (item.private_tag) {
			this.props.navigation.navigate('PrivateTag', { item: item })
		} else {
			this.props.navigation.navigate('Search', { item: item.name })
		}
	}
	goBack = () => {
		const backFrom = this.props.navigation.state.params.dontBackToMe
		const { navigation } = this.props;
		const { params } = this.props.navigation.state;
		if (params.isHomeVC) {
			navigation.goBack();
		} else if (params.screenName == 'uploadProduct') {
			this.props.navigation.goBack(backFrom)
		} else {
			navigation.goBack();
		}


		//	navigation.state.params.onUpdate('updated');
	}

	viewAllClick = (categoryName) => {
		this.props.navigation.navigate('Search', { item: categoryName })
	}

	viewAllUserClick = (userID) => {
		this.props.navigation.navigate('Profile', { "userID": userID });
	}

	productClick(event) {
		this.props.navigation.navigate('Product', { item: event, screenName: 'product' });
	}

	openUpdateProfile = data => {
		this.componentDidMount()
	}

	onEdit() {
		this.setState({ modalVisible: false });
		const { record } = this.state;
		var product = record.product
		this.props.navigation.navigate('UploadProductStep1', { existinData: product, "onUpdate": this.openUpdateProfile })
	}

	deleteProduct() {
		const { params } = this.props.navigation.state;
		AsyncStorage.getItem('isLoggedIn').then((value) => {
			if (value != null) {
				AsyncStorage.getItem('deviceID').then((did) => {
					if (did !== null) {
						fetch(Constants.url.base + "products/" + this.state.productId, {
							method: 'DELETE',
							headers: {
								'Authorization': 'Token token=' + value + ';device_id=' + did,
								'Content-Type': 'application/json'
							}
						})
							.then(response => response.json())
							.then(responseData => {
								if (responseData.message == "Product deleted") {
									if (params.screenName == 'uploadProduct') {
										this.goBack()
									} else {
										this.props.navigation.goBack()
										this.props.navigation.state.params.onUpdate('updated');
									}
								}
							});
					}
				})
			}
		})
	}


	onDelete() {
		Alert.alert(
			'',
			"Wait! Are you sure? ;) Once you delete, you can't go back :)",
			[
				{ text: 'Cancel', style: 'cancel' },
				{ text: 'Ok', onPress: () => this.deleteProduct() },
			],
			{ cancelable: true }
		)
	}

	ifCommentData(commentData, commentHtml) {
		if (commentHtml) {
			return (commentHtml)
		} else {
			return null
		}
	}

	ifInvite() {
		if (this.state.invityLoaded) {
			if (this.state.friendsData.length > 0) {
				return (
					<ScrollView>
						<Card style={{ maxHeight: 470, marginTop: 70, marginLeft: 15, marginRight: 15 }}>
							<CardItem>
								<Left>
									<Text style={{ color: '#000',fontWeight:'bold' }}>Select All</Text>
								</Left>
								<Right>
									<CheckBox style={{ marginRight: 3 }} color={'grey'} checked={this.state.selectAllCheckBoxes} onPress={() => { this.checkAllBoxes() } } />
								</Right>
							</CardItem>
							<View style={{ marginTop: 5, marginBottom: 5, backgroundColor: 'gray', height: 1, width: '100%' }} />
							<FlatList
								data={this.state.friendsData}
								extraData={this.state}
								keyExtractor={(item, index) => index}
								renderItem={({item}) =>
									<CardItem>
										<Left>
											<Thumbnail small source={{ uri: item.user.profile_pic_url }} />
											<View style={{ flexDirection: 'column', marginLeft: 17 }}>
												<Text style={{ color: '#666666', fontSize: 15 }}>{item.user.name}</Text>
												<View style={{ flexDirection: 'row', paddingTop: 4 }}>
													<Image source={require('../../assets/diamond.png')} style={{ height: 22, width: 22 }} />
													<Text style={{ paddingLeft:5,color: '#666666' }}>{item.points}</Text>
												</View>
											</View>
										</Left>

										<Right style={{ flexDirection: 'row', marginRight: 5, alignItems:'center',justifyContent:'flex-end' }}>
											<Avatar img={{ uri: item.badge.image_url }} size={27} />
											<View>
												<CheckBox style={{ }} color={'grey'} checked={item.isSelect} onPress={() => this.clickOnSingleCheckbox(item)} />
											</View>
										</Right>
									</CardItem>
								}
								/>
							<View>
								<Button
									transparent
									block
									style={{ borderRadius: 2, borderWidth: 1, borderColor: 'black', marginBottom: 10, marginHorizontal: 12 }}
									onPress={() => this.sendAPItoPostFriendsList()} >
									<Text>INVITE TO CHAT</Text>
								</Button>
							</View>
						</Card>
					</ScrollView>
				)
			} else {
				return (
					<Card style={{ maxHeight: 360, marginTop: 85, marginLeft: 17, marginRight: 17 }}>
						<CardItem style={{ flexDirection: 'column', marginTop: '35%' }}>
							<Text> Hold on! </Text>
							<Text> You already invited everyone </Text>
							<Text> who's interested in this product </Text>
						</CardItem>
					</Card>
				);
			}
		} else {
			return (
				<View style={{ backgroundColor: '#fff', height: 360, alignItems: 'center', justifyContent: 'center', marginTop: 85, marginLeft: 17, marginRight: 17 }}>
					<ActivityIndicator size="large" />
				</View>
			)
		}
	}

	_renderProductView(record, commentHtml, heart, heartIconColor, imgArr, dotsFlag, temparr, position) {
		if (record !== null && commentHtml !== null) {
			return (

				<View style={{ flex: 1 }}>
					<ScrollView scrollEnabled={this.state.enabled}>
						<Modal
							visible={this.state.modalVisible}
							animationType={'fade'}
							transparent={true}
							presentationStyle="overFullScreen"
							onRequestClose={() => this.closeModal()}
							>
							<TouchableWithoutFeedback onPress={() => { this.closeModal() } }>
								<View style={styles.createAccountMainView}>
									{this.ifInvite()}
								</View>
							</TouchableWithoutFeedback>
						</Modal>

						<Content style={{ height: 301, elevation:4, borderBottomWidth:2, borderBottomColor:'#ccc', backgroundColor:'#ccc' }}>
							<View style={{ height: 300 }}>
								<View style={styles.productImg}>
									<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
										<View style={{ width, height: width }}>
											<ScrollView horizontal={true} pagingEnabled={true} showsHorizontalScrollIndicator={false}
												onScroll={Animated.event(
													[{ nativeEvent: { contentOffset: { x: this.scrollX } } }]
												)}
												scrollEventThrottle={16}
												>
												{imgArr.map((item, index) => (
													<TouchableOpacity key={item}>
														<Image style={{ height: 300, width: width }} source={{ uri: item }} />
														<Image style={{ position: 'absolute', height: '100%', width: '100%' }} source={require('../../assets/overlayimg.png')} />
													</TouchableOpacity>
												))
												}
											</ScrollView>
										</View>
										{imgArr.length >= 2 &&
											<View style={{ flexDirection: 'row', position: 'absolute', zIndex: 99999, bottom: 80 }}>
												{imgArr.map((_, i) => {
													let opacity = position.interpolate({
														inputRange: [i - 1, i, i + 1],
														outputRange: [0.3, 1, 0.3],
														extrapolate: 'clamp'
													})
													return (
														<Animated.View
															key={i}
															style={{ opacity, height: 10, width: 10, backgroundColor: '#ffffff', marginLeft: 4, marginBottom: 6, borderRadius: 5 }}
															/>
													)
												})}
											</View>
										}
									</View>
								</View>
								<View style={styles.backArrow}>
									<View style={styles.backArrowWrap}>
										<TouchableOpacity style={styles.backArrow} onPress={() => { this.goBack() } }>
											<Icon name='arrow-back' />
										</TouchableOpacity>
									</View>
									<View style={styles.dotsWrap}>
										<TouchableOpacity
											onPress={() => this.setModalVisibleForThreeDots(true)}
											>
											<Icon name='md-more' style={styles.settingArrowImg} />
										</TouchableOpacity>
									</View>
								</View>
							</View>
						</Content>
						<View style={styles.viewIcon}>
							<View style={styles.viewPro}>
								<Image

									style={{ width: 25, height: 25 }}
									resizeMode='cover'
									source={require('../../assets/ic-eye.png')}
									/>
							</View>
							<Text style={styles.viewProText}> {abbrNum(record.product.view_count, 2)} </Text>
							<View style={styles.heartPro}>
								<TouchableOpacity onPress={() => this.likeProduct(record.product.product_id)}>
									{heart}
								</TouchableOpacity>
							</View>
							<Text style={styles.heartProText}> {record.product.like_count} </Text>
						</View>

						<View style={styles.proDetailWrap}>
							<View>
								<Text style={styles.proTitle}>{record.product.brand.name + ' - ' + record.product.title}</Text>
							</View>
						</View>
						<View style={styles.commentWrap}>
							<View style={styles.tagContainer}>

								<View style={{ flexWrap: 'wrap', flexDirection: 'row', marginTop: 10 }}>
									{temparr.map((i, v) =>
										<TouchableOpacity key={'hashtag' + i.name} onPress={() => this.onTagClicked(i)}>
											<Text style={styles.tags}>{'#' + i.name} </Text>
										</TouchableOpacity>
									)}
								</View>
							</View>
						</View>

						<View style={styles.askBtnWrap}>
							<View style={styles.askBtn}>
								<Button block transparent onPress={() => this.openModal()} >
									<Text style={styles.askBtnText}>ASK HERE!</Text>
								</Button>
							</View>
							<View style={{ marginTop: 17, marginBottom: 10, backgroundColor: '#C7C9C8', height: 1, width: '97%' }} />
						</View>

						<View style={styles.commentWrap}>
							<View style={styles.commentContainer}>
								<View style={styles.inputContainer}>
									<TextInput underlineColorAndroid='transparent' placeholder="Search" style={styles.searchInput} onChangeText={(searchText) => { this.searchComment(searchText) } } value={this.state.searchText} />
								</View>
								{commentHtml != null && <View style={{ maxHeight: 500, overflow: 'hidden' }}>

									<ScrollView onTouchStart={(ev) => { this.setState({ enabled: false }); } }
										onMomentumScrollEnd={(e) => { this.setState({ enabled: true }); } }
										onScrollEndDrag={(e) => { this.setState({ enabled: true }); } }
										onTouchEnd={(e) => { this.setState({ enabled: true }); } }>
										{this.ifCommentData(this.state.commentData, commentHtml)}
									</ScrollView>
								</View>}

								<View style={styles.imageCommentWrap}>
									<View style={styles.writeCommentWrap}>
										<TextInput placeholder="Write a comment" style={styles.commentInput} underlineColorAndroid='transparent' onChangeText={(saveCommentText) => { this.setState({ saveCommentText }); } } value={this.state.saveCommentText} />
									</View>
									<View style={styles.sendButtonWrap}>
										<Button style={styles.sendButton} onPress={() => { this.saveComment() } }><Text style={styles.sendBtnText}>SEND</Text></Button>
									</View>
								</View>

							</View>

						</View>

						<View style={{ alignItems: 'center' }}>
							<Card style={{ width: '95%', marginTop: 20 }}>
								<CardItem
									style={{ borderBottomWidth: 2, borderBottomColor: '#C7C9C8', borderRadius: 1, paddingBottom: 8, paddingTop: 8 }}
									>
									<Image style={styles.dropdown_2_image}	mode='stretch'	source={this.state.contry == 'US' ?  require('../../assets/usa.png') : require('../../assets/sg.png')}/>
									<ModalDropdown

										options={['United States', 'Singapore']}
										dropdownStyle={{ paddingVertical: 10, paddingHorizontal: 10, height: 110 }}
										style={{ paddingVertical: 5, paddingHorizontal:0 }}
										textStyle={{ color: 'black', fontSize: 16 }}
										defaultIndex={1}
										defaultValue='United States'
										dropdownTextStyle={{ fontSize: 14, color: 'black', }}
										onSelect={(index, value) => this.changeContry(index, value)}
										renderRow={this.renderRow.bind(this)}
										renderSeparator={(sectionID, rowID, adjacentRowHighlighted) => this.renderSeparator(sectionID, rowID, adjacentRowHighlighted)}
										/>
										<Image style={[styles.dropdown_2_image,{width:10, height:10, marginLeft:30}]}	mode='stretch'	source={require('../../assets/dropd.png')}/>
								{record.product.multi_url.length >= 3 &&	<TouchableOpacity onPress={()=> this.setModalAffilateVisible(true)} style={{right:15, position:'absolute'}}><Text style={{ color: '#40c4ff', fontSize: 15 }}>{'View All'}</Text></TouchableOpacity> }
								</CardItem >
								<View style={{ borderBottomWidth: 1, borderBottomColor: '#C7C9C8'}}>
								<CardItem
									style={{ borderBottomWidth: 2, borderBottomColor: '#C7C9C8', borderRadius: 1, paddingBottom: 30, paddingTop: 20 }}
									>
									<Left>
										<Image
											source={require('../../assets/logo-superble2.png')}
											resizeMode="contain"
											style={{ width: 100, height: 50 }} />
									</Left>
									<View style={{alignItems:'center', justifyContent:'center'}}>
										<Text style={{ fontSize: 15,/* paddingLeft: 20,*/ fontWeight: 'bold', alignItems: 'center', color: 'black' }}> {record.product.points} POINTS</Text>
									</View>
									<Right>
										<Text style={{ color: '#40c4ff', fontSize: 15 }}
											onPress={() => this.redeemPointToBuyProduct(record.product.points)}>
											BUY NOW
												</Text>
									</Right>
								</CardItem>
								</View>
								{record.product.multi_url.map((e, i) => (
									e.country_code == this.state.contry && i < 3 &&
									<View key={e.url} style={{borderBottomColor:'#BCBCBC', borderBottomWidth:1}}>
										<CardItem style={{ paddingTop: 27, paddingBottom: 27 }}>
											<Left>
												<Image
													source={{ uri: e.url_img }}
													resizeMode="contain"
													style={{ width: 100, height: 50 }} />
											</Left>

											{e.lowest_price !== null &&
												<View style={{alignItems:'center', justifyContent:'center'}}>
													<Text style={{ fontSize: 15, /*paddingLeft: 20, paddingTop: 15,*/ fontWeight: '400', alignItems: 'center', color: 'black' }}> USD {e.lowest_price != 0 ? e.lowest_price : e.price}   </Text>
												</View>
											}

											<Right>
												<Text style={{ color: '#40c4ff', fontSize: 15 }}
													onPress={() => this.setTrackingIDWithBuyNow(e)}>
													BUY NOW
												</Text>
											</Right>
										</CardItem>
									</View>

								))}
							</Card>
							<View style={{ marginTop: 17, marginBottom: 10, backgroundColor: '#C7C9C8', height: 1, width: '97%' }} />
						</View>


						{this.state.similerProductsCategories.length > 3 &&
							<View style={{ alignItems: 'center' }}>

								<Card style={{ width: '95%', paddingBottom: 10, paddingTop: 10 }} >
									<Text style={{ color: 'black', fontSize: 16, paddingBottom: 10, paddingTop: 10, paddingLeft: 10 }}>
										Others from {record.product.category.name}
									</Text>
									<GridView
										itemDimension={1000}
										horizontal={true}
										showsHorizontalScrollIndicator={false}

										items={this.state.similerProductsCategories}
										renderItem={item => (
											<View style={{ flexDirection: 'row' }}>
												{item.image_url !== '../../assets/viewalll.png' &&
													<TouchableOpacity onPress={() => this.productClick(item.product_id)}>
														<Image resizeMode="contain" source={{ uri: item.image_url }} style={{ height: 120, width: 120, marginLeft: -10, marginRight: 5 }} />

													</TouchableOpacity>
												}
												{item.image_url == '../../assets/viewalll.png' &&
													<TouchableOpacity style={{right:10}} onPress={() => this.viewAllClick(record.product.category.name)}>
														<Card style={{justifyContent:'center', alignItems:'center'}}>
															<Image resizeMode="contain" source={require('../../assets/viewalll.png')} style={{ height: 120, width: 120 }} />
														</Card>
													</TouchableOpacity>
												}
											</View>
										)}
										/>
								</Card>
							</View>
						}
						{this.state.similerProductsBrands.length > 3 &&
							<View style={{ alignItems: 'center' }}>

								<Card style={{ width: '95%' }}>
									<Text style={{ color: 'black', fontSize: 16, paddingBottom: 10, paddingTop: 10, paddingLeft: 10 }}>

										Others from {record.product.brand.name}
									</Text>

									<GridView
										itemDimension={1000}
										horizontal={true}
										showsHorizontalScrollIndicator={false}

										items={this.state.similerProductsBrands}
										renderItem={item => (
											<View style={{ flexDirection: 'row' }}>
												{item.image_url != '../../assets/viewalll.png' &&
													<TouchableOpacity onPress={() => this.productClick(item.product_id)}>
														<Image
															resizeMode="contain"
															source={{ uri: item.image_url }}
															style={{ height: 120, width: 120, marginLeft: -10, marginRight: 5 }} />

													</TouchableOpacity>
												}
												{item.image_url == '../../assets/viewalll.png' &&
													<TouchableOpacity style={{right:10}} onPress={() => this.viewAllClick(record.product.brand.name)}>
														<Card>
															<Image
																resizeMode="contain"
																source={require('../../assets/viewalll.png')}
																style={{ height: 120, width: 120,  }} />

														</Card>
													</TouchableOpacity>
												}
											</View>
										)} />
								</Card>
							</View>
						}

						{this.state.similerProductsUser.length > 3 &&
							<View style={{ alignItems: 'center' }}>
								<Card style={{ width: '95%', paddingBottom: 15, paddingTop: 15 }} >
									<Text style={{ color: 'black', fontSize: 16, paddingBottom: 10, paddingTop: 10, paddingLeft: 10 }}>

										Others from {record.product.product_owner}
									</Text>
									<GridView
										itemDimension={1000}
										horizontal={true}
										showsHorizontalScrollIndicator={false}
										items={this.state.similerProductsUser}
										renderItem={item => (
											<View style={{ flexDirection: 'row' }}>
												{item.image_url != '../../assets/viewalll.png' &&
													<TouchableOpacity onPress={() => this.productClick(item.product_id)}>
														<Image resizeMode="contain" source={{ uri: item.image_url }} style={{ height: 120, width: 120, marginLeft: -10, marginRight: 5 }} />

													</TouchableOpacity>
												}
												{item.image_url == '../../assets/viewalll.png' &&
													<TouchableOpacity style={{right:10}} onPress={() => this.viewAllUserClick(record.product.owner_id)}>
														<Card>
															<Image resizeMode="contain" source={require('../../assets/viewalll.png')} style={{ height: 120, width: 120,  }} />

														</Card>
													</TouchableOpacity>
												}
											</View>)}
										/>
								</Card>
							</View>
						}

						<View style={{ alignItems: 'center' }}>
							<Card style={{ width: '95%', paddingBottom: 18, marginBottom: 30 }}>
								<View style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
									paddingVertical: 20,
									paddingLeft: 5,
									paddingRight: 10
								}}>
									<Text style={{ color: '#000', fontSize: 16 }}> Related Articles </Text>
									<TouchableOpacity onPress={() => this.props.navigation.goBack()}>
										<Text style={{ color: '#40c4ff', fontSize: 16 }}> View All </Text>

									</TouchableOpacity>
								</View>

								<FlatList
									data={this.state.relatedArticles}
									keyExtractor={(item, index) => index}
									renderItem={({item}) =>
										<Text style={{ color: '#40c4ff', fontSize: 15, paddingBottom: 15, paddingHorizontal: 10 }} nonPress={() => this.articleClick(item.id)}>
											{item.title}
										</Text>
									}
									/>
							</Card>
						</View>

						<Modal
							transparent={true}
							visible={this.state.threedotsmodalVisible}
							onRequestClose={() => { alert('Modal has been closed.') } }>

							<TouchableWithoutFeedback onPress={() => this.setModalVisibleForThreeDots(!this.state.threedotsmodalVisible)} >
								<View style={{ height: deviceHeight, width: deviceWidth }}>
									<TouchableWithoutFeedback>
										<View style={styles.innerViewofModel}>

											<TouchableOpacity onPress={() => this.shareFunction()}>
												<Text style={{ color: 'black', marginTop: '15%', marginBottom: '8%', fontSize: 15 }}> Share </Text>
											</TouchableOpacity>

											<TouchableOpacity onPress={() => this.onEdit()} >
												{this.state.currentUser == record.product.owner_id && <Text style={{ color: 'black', fontSize: 15, marginTop: '8%', marginBottom: '8%' }}> Edit </Text>}
											</TouchableOpacity>

											<TouchableOpacity onPress={() => this.onDelete()} >
												{this.state.currentUser == record.product.owner_id && <Text style={{ color: 'black', fontSize: 15, marginTop: '8%', marginBottom: '8%' }}> Delete </Text>}
											</TouchableOpacity>

											<TouchableOpacity onPress={this.goToAddToList}>
												<Text style={{ color: 'black', marginTop: '8%', marginBottom: '8%', fontSize: 15 }}> Add to list </Text>
											</TouchableOpacity>

											<TouchableOpacity onPress={() => this.openMail()}>
												{this.state.currentUser != record.product.owner_id && <Text style={{ color: 'black', marginTop: '8%', marginBottom: '8%', fontSize: 15 }}> Report </Text>}
											</TouchableOpacity>

										</View>
									</TouchableWithoutFeedback>
								</View>
							</TouchableWithoutFeedback>
						</Modal>

						{this.state.affillateViewVisible && 
					  <Modal
					  animationType="slide"
					  transparent={false}
					  visible={this.state.affillateViewVisible}
					  onRequestClose={() => {
						console.log("model closed")
					  }}>
					  <TouchableWithoutFeedback>
							<TouchableOpacity onPress={() => this.setModalAffilateVisible(false)} style={{
								backgroundColor: "rgba(255,255,255,0.6)", justifyContent: 'center', alignItems: 'center',
								width: '100%',
								height: '100%',
							}}>
								<TouchableWithoutFeedback>
									<Card style={{
										backgroundColor: "#fff",
										position: 'absolute',
										left: '3%',
										right: '3%',
										height: '90%',
										justifyContent: 'center', alignItems: 'center'
										
									}}>
								<TouchableOpacity style={{right:5, top:5, zIndex:999, position:'absolute'}} onPress={() => this.setModalAffilateVisible(false)}>
                                <Image source={require('../../assets/cross2.png')} style={{ width: 20, height: 20 }} />
                              </TouchableOpacity>
								<View style= {{ width: '95%'}}>
								
									<Text  style={{justifyContent: 'center', textAlign: 'center', paddingTop:10, paddingBottom:10, fontSize:16, }}>{'PRICE COMPARISON'}</Text>
								<ScrollView style={{height:'90%'}}>
								<View style={{ borderBottomWidth: 1, borderBottomColor: '#C7C9C8'}}>
								<CardItem
									style={{ borderBottomWidth: 2, borderBottomColor: '#C7C9C8', borderRadius: 1, paddingBottom: 30, paddingTop: 20 }}
									>
									<Left>
										<Image
											source={require('../../assets/logo-superble2.png')}
											resizeMode="contain"
											style={{ width: 100, height: 50 }} />
									</Left>
									<View style={{alignItems:'center', justifyContent:'center'}}>
										<Text style={{ fontSize: 15,/* paddingLeft: 20,*/ fontWeight: 'bold', alignItems: 'center', color: 'black' }}> {record.product.points} POINTS</Text>
									</View>
									<Right>
										<Text style={{ color: '#40c4ff', fontSize: 15 }}
											onPress={() => this.redeemPointToBuyProduct(record.product.points)}>
											BUY NOW
												</Text>
									</Right>
								</CardItem>
								</View>
								{record.product.multi_url.map((e) => (
									e.country_code == this.state.contry &&
									<View key={e.url} style={{borderBottomColor:'#BCBCBC', borderBottomWidth:1}}>
										<CardItem style={{ paddingTop: 27, paddingBottom: 27 }}>
											<Left>
												<Image
													source={{ uri: e.url_img }}
													resizeMode="contain"
													style={{ width: 100, height: 50 }} />
											</Left>

											{e.lowest_price !== null &&
												<View style={{alignItems:'center', justifyContent:'center'}}>
													<Text style={{ fontSize: 15, /*paddingLeft: 20, paddingTop: 15,*/ fontWeight: '400', alignItems: 'center', color: 'black' }}> USD {e.lowest_price != 0 ? e.lowest_price : e.price}   </Text>
												</View>
											}

											<Right>
												<Text style={{ color: '#40c4ff', fontSize: 15 }}
													onPress={() => this.setTrackingIDWithBuyNow(e)}>
													BUY NOW
												</Text>
											</Right>
										</CardItem>
									</View>

								))}
								</ScrollView>
								</View>
									</Card>
									

								</TouchableWithoutFeedback>
							</TouchableOpacity>
						</TouchableWithoutFeedback>
					</Modal>	
					}


					</ScrollView>
					<FABExample navigator={this.props.navigation} />
				</View>
			)
		} else {
			return (
				<View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', }}>
					<Spinner color="#00C497" key={Math.random()} />
				</View>
			)
		}

	}

	render() {
		const { record } = this.state;
		const { commentHtml } = this.state;
		let heart, heartIconColor;
		let imgArr = null;
		let dotsFlag = 0;
		var temparr = [];
		if (this.state.likedHeart == true) {

			heart = <Image style={{ width: 25, marginLeft: 5, height: 25 }} source={require('../../assets/ic-like-red.png')} />
			heartIconColor = 'red';
		} else {
			heart = <Image style={{ width: 25, marginLeft: 5, height: 25 }} source={require('../../assets/ic-like.png')} />
			heartIconColor = 'black';
		}

		if (record != null) {
			imgArr = record.product.image_urls;
		} else {
			imgArr = null;
		}

		if (record != null) {
			var duplicateData = record.product.duplicate_products;
			if (duplicateData !== undefined || duplicateData !== null) {
				duplicateData.map((item, i) => {
					imgArr.push(item.image_url);
				});
			}
			imgArr = this.removeDuplicates(imgArr);
		}
		if (record != null) {
			tags = (record.product.tags_object);
			for (let i in tags) {
				temparr.push(tags[i])
			}
		}

		let position = Animated.divide(this.scrollX, width);

		return (
			<View style={styles.pageContainer}>
				{this._renderProductView(record, commentHtml, heart, heartIconColor, imgArr, dotsFlag, temparr, position)}

				{!!this.state.isModalOpen && <Modal
					visible={this.state.isModalOpen}
					animationType={'fade'}
					transparent={true}
					presentationStyle="overFullScreen"
					onRequestClose={this._closeModal}
					>

					<View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" }}

						>
						<View style={styles.slide}>

							<Image style={{ marginTop: 30, left: Dimensions.get('window').width - 90, position: 'absolute' }} source={require('../../assets/arrow-Viewmore.png')} />
							<View style={{ justifyContent: 'center', alignItems: 'center' }}>
								<Text style={{ color: 'white', fontSize: 18, marginTop: 70, marginLeft: 60 }}>View More</Text>
							</View>
							<View style={{ flexDirection: 'row', marginTop: 10, width: deviceWidth, alignItems: 'center', justifyContent: 'space-between' }}>
								<View style={{ flexDirection: 'column', alignItems: 'center', marginLeft: 25 }}>
									<Image style={{ width: 60, height: 60, }} source={require('../../assets/tap-left.png')} />
									<Text style={{ color: 'white', fontSize: 20, }}>LAST PHOTO</Text>
								</View>
								<Image style={{ width: 7, height: 200 }} source={require('../../assets/line.png')} />
								<View style={{ flexDirection: 'column', alignItems: 'center', marginRight: 25 }}>
									<Image style={{ width: 60, height: 60, marginRight: 25 }} source={require('../../assets/tap-right.png')} />
									<Text style={{ color: 'white', fontSize: 20, }}>NEXT PHOTO</Text>
								</View>
							</View>
							<View style={{ flexDirection: 'row', marginTop: 25, alignItems: 'center' }} >
								<Image style={{ width: 60, height: 70, marginTop: 20, marginLeft: 30 }} source={require('../../assets/new-arrow.png')} />
								<Text style={{ color: 'white', fontSize: 18, }}>Invite someone {'\n'} to chat or ask in the {'\n'} comments</Text>

							</View>
							<TouchableOpacity onPress={this._closeModal} style={{ borderColor: 'white', borderWidth: 1, marginTop: 50, width: 100, height: 35, justifyContent: 'center', marginLeft: deviceWidth - 150, alignItems: 'center', borderRadius: 2 }}>
								<Text style={{ color: 'white', fontSize: 20, textAlign: 'center' }}>Got It!</Text>
							</TouchableOpacity>
						</View>


					</View>

				</Modal>}


				<Modal
					visible={this.state.isCommentOptionModal}
					animationType={'fade'}
					transparent={true}
					presentationStyle="overFullScreen"
					onRequestClose={() => this._closeCommentOptionModal()}
					>
					<TouchableWithoutFeedback onPress={() => { this._closeCommentOptionModal() } }>
						<View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>

							<TouchableWithoutFeedback>
								<View style={{ backgroundColor: "#fff", height: 130, marginTop: (deviceHeight / 2) - 60, width: 350, marginLeft: (deviceWidth / 2) - 180, padding: 15, marginBottom: 15 }}>
									<Text style={{ fontWeight: '400', fontSize: 18, color: 'black' }}>Choose an option</Text>
									<View style={{ marginTop: 15, marginBottom: 15 }}>
										<TouchableOpacity onPress={() => this._showEditCommentModal()} style={{ width: '100%', paddingBottom: 15 }}>
											<Text style={{ color: 'black', fontSize: 16 }}> Edit Comment </Text>
										</TouchableOpacity>

										<TouchableOpacity onPress={() => this._deleteComment()} style={{ width: '100%', paddingBottom: 15, marginBottom: 15 }}>
											<Text style={{ color: 'black', fontSize: 16 }}> Delete Comment </Text>

										</TouchableOpacity>
									</View>
								</View>
							</TouchableWithoutFeedback>
						</View>

					</TouchableWithoutFeedback>
				</Modal>

				<Modal
					visible={this.state.isCommentEditModal}
					animationType={'fade'}
					transparent={true}
					presentationStyle="overFullScreen"
					onRequestClose={() => this._closeEditCommentModal()}
					>
					<TouchableWithoutFeedback onPress={() => { this._closeEditCommentModal() } }>
						<View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>

							<TouchableWithoutFeedback>
								<View style={{ backgroundColor: "#fff", height: 200, marginTop: (deviceHeight / 2) - 60, width: 350, marginLeft: (deviceWidth / 2) - 180, padding: 15 }}>
									<Text style={{ fontWeight: 'bold', fontSize: 18 }}>EDIT COMMENT</Text>
									<View style={{ marginTop: 15 }}>
										<TextInput multiline={true} style={{ fontSize: 16, height: 90, borderWidth: 1, borderColor: '#ccc' }} value={this.state.editcommentText} onChangeText={(editcommentText) => this.setState({ editcommentText })}></TextInput>
										<TouchableOpacity onPress={() => this._editCommentService()} style={{ backgroundColor: 'black', height: 35, justifyContent: 'center', alignItems: 'center', marginTop: 10 }}>
											<Text style={{ color: 'white', fontSize: 15, textAlign: 'center' }}> SAVE </Text>
										</TouchableOpacity>
									</View>
								</View>
							</TouchableWithoutFeedback>
						</View>

					</TouchableWithoutFeedback>
				</Modal>

				<Modal
					visible={this.state.isNotEnoughPoints}
					animationType={'fade'}
					transparent={true}
					presentationStyle="overFullScreen"
					onRequestClose={() => this._closeNotEnoughPoints()}
					>
					<TouchableWithoutFeedback onPress={() => { this._closeNotEnoughPoints() } }>
						<View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>

							<TouchableWithoutFeedback>
								<View style={{ backgroundColor: "#fff", marginTop: 25, alignItems: 'center', flexDirection: 'column', height: 170, marginTop: (deviceHeight / 2) - 60, width: '80%', marginLeft: (deviceWidth / 2) - 140, padding: 15 }}>
									<Text style={{ textAlign: 'center', color: 'black', fontSize: 16 }}>SORRY, NOT ENOUGH POINTS</Text>
									<Text style={{ textAlign: 'center', marginVertical: 20, color: 'black', fontSize: 14 }} >Recommend more products and share your experience to collect more points</Text>
									<TouchableOpacity onPress={() => { this._closeNotEnoughPoints() } } style={{ backgroundColor: 'black', height: 50, width: 100, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: 'white', fontSize: 16 }}>I GOT IT</Text></TouchableOpacity>
								</View>
							</TouchableWithoutFeedback>
						</View>

					</TouchableWithoutFeedback>
				</Modal>

				<Modal
					visible={this.state.isEnoughPoints}
					animationType={'fade'}
					transparent={true}
					presentationStyle="overFullScreen"
					onRequestClose={() => this._closeEnoughPoints()}
					>
					<TouchableWithoutFeedback onPress={() => { this._closeEnoughPoints() } }>
						<View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>

							<TouchableWithoutFeedback>
								<View style={{ backgroundColor: "#fff", marginTop: 25, alignItems: 'center', flexDirection: 'column', height: 170, marginTop: (deviceHeight / 2) - 60, width: '80%', marginLeft: (deviceWidth / 2) - 140, padding: 15 }}>
									<Text style={{ textAlign: 'center', color: 'black', fontSize: 16 }}>WOULD YOU LIKE TO CONFIRM YOUR ORDER</Text>
									<TouchableOpacity onPress={() => this.openCountryList()}>
										<Text style={{ textAlign: 'center', marginVertical: 20, color: 'black', fontSize: 14 }} >{this.state.nationality != '' ? this.state.nationality : 'Select your country'}</Text>
									</TouchableOpacity>
									<TouchableOpacity onPress={() => { this.redeemPoints() } } style={{ backgroundColor: 'black', height: 50, width: 150, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: 'white', fontSize: 16 }}>SEND THE LINK</Text></TouchableOpacity>
								</View>
							</TouchableWithoutFeedback>
						</View>

					</TouchableWithoutFeedback>
				</Modal>

				<Modal
					visible={this.state.thanksForOrderModal}
					animationType={'fade'}
					transparent={true}
					presentationStyle="overFullScreen"
					onRequestClose={() => this._closeThanksForOrder()}
					>
					<TouchableWithoutFeedback onPress={() => { this._closeThanksForOrder() } }>
						<View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>

							<TouchableWithoutFeedback>
								<View style={{ backgroundColor: "#fff", marginTop: 25, alignItems: 'center', flexDirection: 'column', height: 260, marginTop: (deviceHeight / 2) - 150, width: '80%', marginLeft: (deviceWidth / 2) - 140, padding: 15 }}>
									<Text style={{ textAlign: 'center', color: 'black', fontSize: 16 }}>THANKS FOR YOUR ORDER</Text>
									<Image style={{ height: 70, marginVertical: 20, width: 70 }} source={require('../../assets/ic-selected.png')} />
									<Text style={{ textAlign: 'center', color: 'black', fontSize: 14 }} >{'We are hunting your order! \n Check your email for news'}</Text>
									<TouchableOpacity onPress={() => { this._closeThanksForOrder() } } style={{ backgroundColor: 'black', marginTop: 10, height: 50, width: 100, justifyContent: 'center', alignItems: 'center' }}><Text style={{ color: 'white', fontSize: 16 }}>GOT IT</Text></TouchableOpacity>
								</View>
							</TouchableWithoutFeedback>
						</View>

					</TouchableWithoutFeedback>
				</Modal>


				<Modal
					animationType={'fade'}
					transparent={true}
					visible={this.state.isCountryModalVisible}
					presentationStyle={'overFullScreen'}
					onRequestClose={() => { this.setState({ isCountryModalVisible: false, isEnoughPoints: true }) } }
					>
					<TouchableWithoutFeedback onPress={() => { this.setState({ isCountryModalVisible: false, isEnoughPoints: true }) } }>
						<View style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", height: deviceHeight, width: deviceWidth }}>
							<TouchableWithoutFeedback>
								<View style={{ backgroundColor: "#fff", position: 'absolute', left: '10%', right: '10%', height: '90%', top: '5%', padding: 10, }}>
									<Container>
										<View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomColor: 'black', borderBottomWidth: 2 }}>
											<TextInput style={{ height: 35, width: '100%', paddingHorizontal: 20 }} selectionColor={'black'} placeholder='Search'
												onChangeText={(val) => this.searchInputHandle(val)}></TextInput>
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

			</View>

		)
	}

}
