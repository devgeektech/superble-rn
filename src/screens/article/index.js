import React from 'react';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	FlatList,
	ActivityIndicator,
	TouchableOpacity,
	AsyncStorage,
	Platform,
	Dimensions,PixelRatio,
	Modal, Share, Image,
	TouchableWithoutFeedback
} from 'react-native';
import {
	Card,
	Left,
	Right,
	Fab,
	Icon,
	Button,
	Container,
	Content,
	Header
} from 'native-base';
import {
	DrawerNavigator,
	addNavigationHelpers,
	StackNavigator,
	navigation
} from 'react-navigation';
import HTMLView from 'react-native-htmlview';
import { TabNavigator } from 'react-navigation';
import RobotItem from './robotItem';
import FABExample from '../fab/index.js';

const { width } = Dimensions.get('window');
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

const tabStyle = Platform.OS == "ios" ? { width: '100%', } : {}
const backBtn = Platform.OS == "ios" ? { justifyContent: 'center', alignItems: 'center', height: 20, padding: 10, margin: 10, width: 20 } : { margin: 10 }
import Constants from '../../constants';

class Article extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			title: '',
			desc: '',
			descCss: '',
			tags: [],
			relatedArticles: [],
			active: 'false',
			datasetState: null,
			navigate: this.props.navigation.navigate,
			threedotsmodalVisible: false,
			loaded: false
		};
	}


	static navigationOptions = ({ navigation }) => {
		const { params = {} } = navigation.state;
		return {
			title: '',
			tabBarLabel: "Article",
			headerTintColor: 'black',
			headerStyle: {
				backgroundColor: 'white'
			},
			headerLeft: <TouchableOpacity style={backBtn} onPress={() => navigation.goBack(null)} >
				{/* <Image style={{height:20,padding:10, margin:10, width:20}}source ={require('../../assets/back.png')}/> */}
				<Icon name='arrow-back' style={{}} />
			</TouchableOpacity>,
			headerRight: <TouchableOpacity transparent onPress={() => params.handleSave && params.handleSave()}>
				<Icon name="md-more" style={{	width:22, color: "black" }} />
			</TouchableOpacity>
		}
	};
	componentDidMount() {
		const { params } = this.props.navigation.state;
		let articleID = params.item;
		this.props.navigation.setParams({ handleSave: () => this.setModalVisibleForThreeDots(true) });

		AsyncStorage.getItem('loggedinUserData').then((userData) => {
			if (userData != null) {
				userData = JSON.parse(userData);
				this.setState({ currentUserId: userData.profile_object.id })
			}
		})

		fetch(`${Constants.url.base}discoveries/${articleID}/products?page=1&per_page=999`, {
			method: 'GET'
		})
			.then((res) => res.json())
			.then(resData => {
				this.setState({ loaded: true })
				this.setState({ articleData: resData })
				this.setState({ title: resData.product_discovery.title })
				this.setState({ desc: resData.product_discovery.description.replace(/(\r\n|\n|\r)/gm, '') })
				this.setState({ descCss: resData.product_discovery.descriptionCss })
				this.setState({ tags: resData.product_discovery.tags_object })
				this.setState({ owner: resData.product_discovery.owner })
				console.log("this.state.owner", this.state.owner.image_url)
			})

		this.fetchRelatedArticles(articleID);
	}

	setModalVisibleForThreeDots(visible) {
		this.setState({ threedotsmodalVisible: visible });
	}

	articleClick(event) {
		alert(event)
		this.props.navigation.navigate('Article', { item: event });
	}


	shareFunction() {
		AsyncStorage.getItem('loggedinUserData').then((userData) => {
			if (userData != null) {
				userData = JSON.parse(userData)
				this.setState({ referal_code: userData.profile_object.referral_code })
				let content_share = {
					message: 'https://staging.superble.com/explore/' + this.state.articleData.product_discovery.seo_friendly_path + '/' + this.state.articleData.product_discovery.id + "?referral_code=" + this.state.referal_code,
					title: this.state.articleData.product_discovery.suggestable_title
				};
				let options_share = {};
				Share.share(content_share, options_share);

			}
		})

	}

	onShare = () => {
		Share.share({
			message: 'BAM: we\'re helping your business with awesome React Native apps',
			url: 'http://bam.tech',
			title: 'Wow, did you see that?'
		}, {
				// Android only:
				dialogTitle: 'Share BAM goodness',
				// iOS only:
				excludedActivityTypes: [
					// 'com.apple.UIKit.activity.PostToTwitter'
				]
			})
			.then(({action, activityType}) => {

				if (action === Share.dismissedAction) console.log('Share dismissed');
				else {
					console.log('Share successful');
				}
			});
	}

	fetchRelatedArticles = (articleID) => {
		fetch(`${Constants.url.base}discoveries/${articleID}/related_articles`, {
			method: 'GET'
		})
			.then((ress) => ress.json())
			.then(resDataa => {
				this.setState({ relatedArticles: resDataa.data })
			})
	}

	gotoProfile = (id) => {


		this.setState({ threedotsmodalVisible: false },
			() => this.props.navigation.navigate('Profile', { "userID": id }))

	}

	onTagClicked = (item) => {
		if (item.private_tag) {
			this.props.navigation.navigate('PrivateTag', { item: item.name })
		} else {
			this.props.navigation.navigate('Search', { item: item.name })
		}
	}

	onEdit() {
		const { params } = this.props.navigation.state;
		let articleID = params.item;
		// this.props.navigation.navigate('UploadArticleStep1')
		this.props.navigation.navigate('UploadArticleStep1', { articleID: articleID })
	}

	renderNode(node, index, siblings, parent, defaultRenderer) {
		if (node.name == 'img') {
			const { src, height } = node.attribs;
			const imageHeight = height || 300;
			return (
				<Image
					key={index}
					style={{ width: width * PixelRatio.get(), height: imageHeight * PixelRatio.get() }}
					source={{ uri: src }} />
			);
		}
	}

	render() {
		return (
			<Container>
				{this.state.loaded && <ScrollView style={{ paddingHorizontal: 20, backgroundColor: 'white' }} >
					<Text style={styles.title}>{this.state.title}</Text>
					<HTMLView
						value={this.state.desc}
						stylesheet={stylesHtml}
						renderNode={this.renderNode}
						addLineBreaks={false}
						
						// stylesheet={this.state.descCss}
						// renderNode={renderNode}
						/>
					<View style={{ flexWrap: 'wrap', flexDirection: 'row', marginTop: 10 }}>
						{this.state.tags.map((item) =>
							<TouchableOpacity key={item.name} style={{ flexDirection: 'row' }} onPress={() => this.onTagClicked(item)}>
								<Text style={{ color: '#40c4ff', paddingRight: 10, fontSize: 15, }}>{'#' + item.name}</Text>
							</TouchableOpacity>
						)}
					</View>

					<Card style={{ paddingBottom: 18, marginBottom: 30, marginTop: 20 }}>
						<View style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							paddingVertical: 20,
							paddingLeft: 7,
							paddingRight: 10
						}}>
							<Text style={{color:'#000'}}> Related Articles </Text>
							<TouchableOpacity onPress={() => this.props.navigation.goBack(null)}>
								<Text style={{ color: '#40c4ff' }}> View All </Text>
							</TouchableOpacity>
						</View>
						<FlatList
							data={this.state.relatedArticles}
							keyExtractor={(item, index) => index}
							renderItem={({item}) =>
								<TouchableOpacity onPress={() => this.props.navigation.navigate('Article', { item: item.id })}>
									<Text style={{ color: '#40c4ff', fontSize: 15, paddingBottom: 15, paddingHorizontal: 10 }}>{item.title}</Text>
								</TouchableOpacity>
							}
							/>
					</Card>
				</ScrollView>}

				{!this.state.loaded && <View style={{
					backgroundColor: '#fff',
					flex: 1,
					alignItems: 'center',
					justifyContent: 'center',
				}}>
					<ActivityIndicator size="large" />
				</View>}

				<Modal
					// animationType="slide"
					transparent={true}
					visible={this.state.threedotsmodalVisible}
					onRequestClose={() => {console.log("Model Closed")} }>

					<TouchableWithoutFeedback onPress={() => this.setModalVisibleForThreeDots(!this.state.threedotsmodalVisible)} >
						<View style={{ height: deviceHeight, width: deviceWidth }}>
							<TouchableWithoutFeedback>
								<View style={styles.innerViewofModel}>
									{this.state.owner && <TouchableOpacity onPress={() => this.gotoProfile(this.state.owner.id)} style={{ flexWrap: 'wrap', flexDirection: 'row', marginTop: 20, marginBottom: 15, justifyContent: 'flex-start', alignItems: 'center' }}>
										<Image style={{ width: 38, height: 38, borderRadius: 19 }} source={{ uri: this.state.owner.image_url ? this.state.owner.image_url : 'https://forums.iboats.com/user/avatar?userid=503684&type=large' }} />
										<Text style={{ color: 'black', fontSize: 15, fontWeight: 'normal', marginLeft: 10 }}>{this.state.owner.user_name}</Text>
									</TouchableOpacity>
									}
									{this.state.owner && <TouchableOpacity onPress={() => this.onEdit()} style={{ marginBottom: 10 }}>
										{this.state.owner.id == this.state.currentUserId && <Text style={{ color: 'black', fontSize: 15 }}> Edit </Text>}
									</TouchableOpacity>
									}
									<TouchableOpacity onPress={() => this.shareFunction()}>
										<Text style={{ color: 'black', fontSize: 15 }}> Share </Text>
									</TouchableOpacity>
								</View>
							</TouchableWithoutFeedback>
						</View>
					</TouchableWithoutFeedback>
				</Modal>
				<FABExample navigator={this.props.navigation} />
			</Container>
		);
	}
}

let _this = null;
class Products extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			datasetState: null,
			navigate: this.props.navigation.navigate,
		};
	}

	static navigationOptions = ({ navigation, params }) => {


		return {
			title: '',
			tabBarLabel: "Products",
			headerTintColor: 'black',
			headerStyle: {
				backgroundColor: 'white'
			},
			headerLeft: <TouchableOpacity style={backBtn} onPress={() => _this.goBack()} >
				<Icon name='arrow-back' style={{}} />
			</TouchableOpacity>,
			// headerRight:  <Button transparent onPress = {() => alert('clicked')}>
			//           	    <Icon name="md-more" style={{ color:"black"}} />
			// 	          </Button>
		}
	};

	goBack() {

		const { navigation } = this.props;
		// const { params } = this.props.navigation.state;
		// if (params.isHomeVC) {
		// 	params.callback()
		// }

		navigation.popToTop();
		//	navigation.state.params.onUpdate('updated');
	}

	componentWillMount() {
		const { params } = this.props.navigation.state;
		let articleID = params.item;
		_this = this;
		AsyncStorage.getItem('isLoggedIn')
			.then((value) => {
				if (value != null) {
					AsyncStorage.getItem('deviceID').then((did) => {
						if (did != null) {
							fetch(`${Constants.url.base}discoveries/${articleID}/products?page=1&per_page=999`, {
								method: 'GET',
								headers: {
									'Authorization': 'Token token=' + value + ';device_id=' + did,
									'Content-Type': 'application/json'
								},
							})
								.then((res) => res.json())
								.then(resData => {
									this.setState({ datasetState: resData.products });
								})
						}
					})
				} else {
					fetch(`${Constants.url.base}discoveries/${articleID}/products?page=1&per_page=999`, {
						method: 'GET'
					})
						.then((res) => res.json())
						.then(resData => {
							this.setState({ datasetState: resData.products });
						})
				}
			})
	}

	renderItem = () => {
		var count = 0;
		if (this.state.datasetState != null) {
			return this.state.datasetState.map(record => {
				if (record.isPending && !record.isSettled) {
					//this.setState({isContent: true});
					return false;
				}
				record['type'] = 'product';
				count++;
				return (
					<RobotItem key={'row' + count} record={record} navigate={this.state.navigate} />
				);

			});
		}
	}
	setCurrentReadOffset = (event) => {
		let itemHeight = 402;
		let currentOffset = Math.floor(event.nativeEvent.contentOffset.y);
		let currentItemIndex = Math.ceil(currentOffset / itemHeight);
		// this.state.dataset.setReadOffset(currentItemIndex);
	}
	render() {
		return (
			<Container style={{ marginLeft: -3, marginTop: -6 }}>
				<Content style={styles.cardOuterContainer} scrollEventThrottle={3000} >
					{this.renderItem()}
				</Content>

			</Container>
		);
	}
}


export default TabNavigator({
	Products: { screen: Products },
	Articles: { screen: Article },
},
	{
		tabBarOptions: {
			upperCaseLabel:false,
			activeTintColor: 'white',
			inactiveTintColor: 'black',
			activeBackgroundColor: 'black',
			inactiveBackgroundColor: '#fafafa',
			showIcon:false,
			labelStyle: {
				fontSize: 16,
				fontWeight: 'bold',
				marginTop:0,
				paddingTop:5,
				marginBottom: Platform.OS == "ios" ? 15 : null,
				// borderBottom: 4,
			},
			style: {
				backgroundColor: '#fafafa',
				padding:0
				// height:50
			},
			indicatorStyle: {
				height: null,
				top: 0,
				backgroundColor: 'black',

			},
			tabStyle: tabStyle,

		},
		lazy: false,
		tabBarPosition: 'top',
		animationEnabled: false,
		swipeEnabled: Platform.OS == 'ios' ? false : true,
		initialRouteName: 'Articles'
	}
);

const styles = StyleSheet.create({
	title: {
		fontSize: 30,
		paddingBottom: 0,
		fontWeight: '500',
		paddingTop: 15,
		color:'black'
	},
	desc: {
		fontSize: 25,
		paddingBottom: 18
	},
	innerViewofModel: {
		backgroundColor: "#fff",
		position: 'absolute',
		right: '4%',
		top: '2%',
		height: 120,
		width: '50%',
		paddingLeft: 15,
		paddingRight: 10,
		borderRadius: 6,
		borderColor: '#fff',
		borderWidth: 1
	}
})

const stylesHtml = StyleSheet.create({
	h3: {
		marginTop:10,
		marginBottom:10,
		fontStyle: 'normal',
		// margin: 0,
		// marginTop: 20,
		 lineHeight: 24,
		fontSize: 24,
		fontWeight:'500',
		color: '#000'
	},
	h4: {
		marginTop:10,
		marginBottom:10,
		fontStyle: 'normal',
		fontWeight: 'normal',
		fontSize: 23,
		// marginVertical: 10,
		// marginHorizontal: 0,
		// marginBottom: 0,
		lineHeight: 23,
		color: 'rgba(0,0,0,.60)'
	},
	p: {
		marginTop:5,
		marginBottom:5,
		paddingBottom:0,
		paddingTop:0,
		marginHorizontal: 0,
		// wordSpacing: 2,
		fontSize: 18,
		color: '#000'
		
	},
	a: {
		color: 'rgb(0, 164, 203)'
	},
	img:
	{
		// display: 'inline',
		// height: 100,
		// width: 100,
		// maxWidth: 100
	}
})