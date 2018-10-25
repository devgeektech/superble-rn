import React, { Component } from 'react';
import { Image, Keyboard, Dimensions, ActivityIndicator, Text, View, TextInput, TouchableOpacity, FlatList, AsyncStorage } from 'react-native';
import { Container, Button, Header, Icon, Left, Body, Right, Content, Card, CardItem } from 'native-base';
import FABExample from '../fab/index.js'
import styles from './searchStyleCss';
import RobotItemforsearch from './robotItemforsearch';
import Dataset from 'impagination';
import Constants from '../../constants';
import axios from 'axios';
class Search extends Component {

	static navigationOptions = ({ navigation }) => {
		return {
			header: null
		}
	};

	constructor(props) {
		super(props);
		this.state = {
			searchListArray: [],
			record: [],
			testClick: true,
			defValueOfInput: '',
			navigate: this.props.navigation.navigate,
			isDataAvailable: true,
			touched: false,
			dataset: null,
			datasetState: null,
		}
	}

	_deleteText = () => {
		this.setState({ defValueOfInput: '' })
	}

	setCurrentReadOffset = (event) => {
		let itemHeight = 402;
		let currentOffset = Math.floor(event.nativeEvent.contentOffset.y);
		let currentItemIndex = Math.ceil(currentOffset / itemHeight);
		this.state.dataset.setReadOffset(currentItemIndex);
	}

	async _getSearchList(text) {
		let { searchListArray, defValueOfInput, isDataAvailable, testClick } = this.state;
		this.setState({ defValueOfInput: text })
		searchListArray.length <= 0 ? this.setState({ isDataAvailable: false }) : this.setState({ isDataAvailable: true })
		const api = axios.create({
			baseURL: Constants.url.base,
			timeout: 0,
			responseType: 'json',
			params: {
				text: text,
				exclude_discovery: null
			}
		});
		try {
			let response = await api.get(Constants.url.get_search_products);
			var data = response.data.suggestions;
			data.length <= 0 ? this.setState({ isDataAvailable: false }) : this.setState({ isDataAvailable: true })
			this.setState({ searchListArray: data })
			this.setState({ testClick: true });
			this.setState({isShowData:true})
		}
		catch (error) {
			console.log("HERE IS PROBLEM", error)
		}
	}

	async _callProductsonTouch(item) {
		Keyboard.dismiss()
		let _this = this;
		_this.setState({ touched: true })
		let dataset = new Dataset({
			pageSize: 5,
			loadHorizon: 2,
			observe(datasetState) {
				_this.setState({ datasetState });
			},
			async fetch(pageOffset, pageSize, stats) {
				var reqParam = {
					data: item.id ? item.id : item.text,
					page: pageOffset + 1,
					per_page: pageSize,
				}
				_this.setState({ defValueOfInput: item.text })
				if (item.type != null) {
					reqParam.type = item.type
				} else {
					reqParam.source = item.type
				}
				try {
					let value = await AsyncStorage.getItem('isLoggedIn')
					if (value != null) {
						try {
							let did = await AsyncStorage.getItem('deviceID')
							if (did != null) {
								const api = axios.create({
									baseURL: Constants.url.base,
									timeout: 0,
									responseType: 'json',
									params: reqParam,
									headers: {
										'Authorization': 'Token token=' + value + ';device_id=' + did,
										'Content-Type': 'application/json'
									}
								});
								try {
									let response = await api.get('search');
									if (item.private_tag == true) {
										_this.props.navigation.navigate('PrivateTag', { item: item })
									} else {
										if (response.data.results.length == 1) {
											var productID = response.data.results[0].product_id
											if (response.data.results[0].type == 'product') {
												if (response.data.results[0].private_tag == true) {
													_this.props.navigation.navigate('PrivateTag', { item: productID })
												} else {
													_this.props.navigation.navigate('Product', { item: productID })
												}
											} else {
												var articleID = response.data.results[0].id
												if (response.data.results[0].private_tag == true) {
													_this.props.navigation.navigate('PrivateTag', { item: articleID })
												} else {
													_this.props.navigation.navigate('Article', { item: articleID })
												}
											}
										} else {
											console.log(response);
											// _this.setState({ record: response.data.results })
											_this.setState({ testClick: false })
											_this.setState({ touched: false })
											return await response.data.results
										}
									}
									_this.setState({ touched: false })
								}
								catch (error) {
									_this.setState({ touched: false })
									console.log("HERE IS PROBLEM", error)
								}
							}
						} catch (e) {
							_this.setState({ touched: false })
							console.log("HERE IS PROBLEM", e)
						}
					} else {
						const api = axios.create({
							baseURL: Constants.url.base,
							timeout: 0,
							responseType: 'json',
							params: reqParam
						});
						try {
							let response = await api.get('search');
							if (item.private_tag == true) {
								_this.props.navigation.navigate('PrivateTag', { item: item })
							} else {
								if (response.data.results.length == 1) {
									if (response.data.results[0].type == 'product') {
										var productID = response.data.results[0].product_id
										if (response.data.results[0].private_tag == true) {
											_this.props.navigation.navigate('PrivateTag', { item: productID })
										} else {
											_this.props.navigation.navigate('Product', { item: productID })
										}
									} else {
										var articleID = response.data.results[0].id
										if (response.data.results[0].private_tag == true) {
											_this.props.navigation.navigate('PrivateTag', { item: articleID })
										} else {
											_this.props.navigation.navigate('Article', { item: articleID })
										}
									}
								} else {
									console.log(response);
									// _this.setState({ record: response.data.results })
									_this.setState({ testClick: false })
									_this.setState({ touched: false })
									return await response.data.results
								}
							}
							_this.setState({ touched: false })
						}
						catch (error) {
							_this.setState({ touched: false })
							console.log("HERE IS PROBLEM", error)
						}
					}
				} catch (e) {
					_this.setState({ touched: false })
					console.log("HERE IS PROBLEM", e)
				}

			}
		});
		dataset.setReadOffset(0);
		this.setState({ dataset });
	}

	_renderRobotItem = () => {
		var count = 0;
		return this.state.datasetState.map(record => {
			if (record.content == null) {
				return false;
			}
			if (record.isPending && !record.isSettled) {
				return false;
			}
			count++;
			return (<RobotItemforsearch key={'suggested' + count} record={record.content} navigate={this.state.navigate} isLoggedIn={true} count={count} />);
		});
	}

	componentDidMount() {
		const { params } = this.props.navigation.state;
		const value = params ? params.item : null;
		if (value != null) {
			if (value.indexOf('#') != -1) {
				var withoutHashtag = value.substring(1);
				var item = {
					type: 'tag',
					id: withoutHashtag,

				}
				if (item != null) {
					this._callProductsonTouch(item)
					this.setState({ defValueOfInput: value })

				}
			} else {
				var item = {
					text: value,
				}
				if (item != null) {
					this._callProductsonTouch(item)
					this.setState({ defValueOfInput: value })

				}
			}
		}

	}

	keybordButtonClick = () => {
		if (this.state.defValueOfInput != '') {
			var item = {
				text: this.state.defValueOfInput,
			}

			this._callProductsonTouch(item)
		}
	}

	render() {

		let { searchListArray, testClick, record, defValueOfInput, isDataAvailable } = this.state;

		return (
			<Container>
				<Header style={{ backgroundColor: '#fff' }}>
					<Left>
						<Button transparent onPress={() => this.props.navigation.goBack()} >
							<Icon name='arrow-back' style={{ color: 'black' }} />
						</Button>
					</Left>
					<View style={{ width: '70%' }}>
						<TextInput
							style={{ width: '100%', marginTop: 10, backgroundColor: '#fff', height: 35, paddingLeft: 10, }}
							placeholder='Search'
							returnKeyType="search"
							onSubmitEditing={this.keybordButtonClick}
							value={defValueOfInput}
							onChangeText={(text) => this._getSearchList(text)}
							underlineColorAndroid='transparent'
							autoFocus={true}
							/>
					</View>


					<Right style={{ width: '20%', marginRight: 15 }}>

						<TouchableOpacity onPress={() => this._deleteText()}>
							<Image style={{ width: 20, height: 20 }} source={require('../../assets/ic-dislike.png')} />
						</TouchableOpacity>
					</Right>
				</Header>

				{testClick &&
					<Content style={{display:this.state.isShowData ? 'flex' : 'none'}}>
						<Card>
							{isDataAvailable == true &&
								searchListArray.map((item, index) => {
									return (
										<CardItem key={'ssuggestion' + index}>
											<Left style={{ width: '10%' }} ><Icon name="ios-search" /></Left>
											<TouchableOpacity style={{ width: '80%' }} onPress={() => this._callProductsonTouch(item)} >
												<Body >
													<Text style={{ textAlign: 'left' }} > {item.text} </Text>
												</Body>
											</TouchableOpacity>

											<Right style={{ width: '10%' }}><Icon name="md-arrow-round-up" /></Right>
										</CardItem>
									)
								})
							}

							{isDataAvailable == false &&
								<CardItem style={{ flexDirection: 'column' }}>
									<Text>No product found :( </Text>
									<Text> Upload it yourself and win points! </Text>
								</CardItem>
							}

						</Card>
					</Content>
				}

				{testClick == false &&
					<Content scrollEventThrottle={3000} onScroll={this.setCurrentReadOffset} removeClippedSubviews={true}>
						{this._renderRobotItem()}
					</Content>
				}
				{this.state.touched == true &&
					<View style={{ backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', height: Dimensions.get('window').height }}>
						<ActivityIndicator size="large" />
					</View>
				}

				<FABExample navigator={this.props.navigation} />
			</Container>
		);
	}
};

export default Search;