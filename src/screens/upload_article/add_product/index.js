import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Image,
    FlatList, Keyboard,
    AsyncStorage
} from 'react-native';
import { Content, Spinner, Container, Header, Icon, Left, Body, Right, Button, Title, Card, CardItem } from 'native-base';

import Constants from '../../../constants';
import axios from 'axios';

const screenHeight = Dimensions.get('window').height
const screenWidth = Dimensions.get('window').width

class MyListItem extends React.PureComponent {
    _onPress = () => {
        this.props.onPressItem(this.props.id);
    };

    render() {
        const selectedIcon = this.props.selected ? require('../../../assets/minus-sign.png') : require('../../../assets/add.png');
        return (
            <TouchableOpacity onPress={this._onPress} style={{ height: 50, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row', paddingHorizontal: 20 }}>
                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', width: '92%' }}>
                    <Image style={{ height: 30, width: 40, marginRight: 20 }} source={{ uri: this.props.image_url }} />
                    <Text style={{ color: '#666', width: '80%' }} >{this.props.title}</Text>
                </View>
                <Image style={{ height: 15, width: 15, tintColor: '#666' }} source={selectedIcon} />
            </TouchableOpacity>
        );
    }
}


export default class UploadArticleStep3 extends Component {

    componentDidMount() {
        this.setState({ selectedArr: this.props.selectedArr, selected: new Map() })
        for (let i in this.props.selectedArr) {
            this.setState((state) => {
                const selected = new Map(state.selected);
                selected.set(this.props.selectedArr[i].product_id, true);
                return { selected };
            });
        }

        this.getProducts('').then((data) => {
            this.setState({
                data: data.results,
                page: data.next_page
            })
        }).catch((error) => {
            console.log('something went wrong.', error)
        })
    }

    async getAutoSuggestion(text) {
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
                            params: {
                                text: text,
                                exclude_discovery: true
                            }
                        });
                        try {
                            let response = await api.get(Constants.url.get_search_products);
                            var data = response.data.suggestions;
                            return data
                        }
                        catch (error) {
                            console.log("HERE IS PROBLEM", JSON.stringify(error))
                        }
                    }
                } catch (error) {
                    alert('No device id found')
                }
            }
        } catch (error) {
            alert('No access token found')
        }
    }

    async getProducts(text) {
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
                            },
                            params: {
                                categories: 'all',
                                exclude_discovery: true,
                                page: this.state.page,
                                per_page: this.state.per_page,
                                source: 'product',
                                data: text == '' ? null : text
                            }
                        });
                        try {
                            let response = await api.get('search');
                            var data = response.data;
                            this.setState({ loading: false })
                            return data
                        }
                        catch (error) {
                            this.setState({ loading: false })
                            console.log("HERE IS PROBLEM", JSON.stringify(error))
                        }
                    }
                } catch (error) {
                    this.setState({ loading: false })
                    alert('No device id found')
                }
            }
        } catch (error) {
            this.setState({ loading: false })
            alert('No access token found')
        }
    }

    getMoreProducts() {
        this.getProducts(this.state.activeTextSearch).then((data) => {
            var arr = this.state.data
            if (data.results) {
                if (data.results.length > 0) {
                    arr = arr.concat(data.results)
                }
            }
            this.setState({
                data: arr,
                page: data.next_page
            })
        }).catch((error) => {
            console.log('something went wrong.', error)
        })
    }

    _keyExtractor = (item, index) => item.product_id;

    _onPressItem = (item) => {
        var arr = this.state.selectedArr;
        if (arr.indexOf(item) == -1) {
            arr.push(item)
        } else {
            arr.splice(arr.indexOf(item), 1)
        }
        this.setState({ selectedArr: arr });
        this.props.onItemClick(arr)
        this.setState((state) => {
            const selected = new Map(state.selected);
            selected.set(item.product_id, !selected.get(item.product_id));
            return { selected };
        });
    };

    _renderItem = ({item}) => (
        <MyListItem
            id={item.product_id}
            image_url={item.image_url}
            onPressItem={() => this._onPressItem(item)}
            selected={!!this.state.selected.get(item.product_id)}
            title={item.brand_name + ' - ' + item.title}
            />
    );

    searchInputHandle(value) {
        this.setState({ inputVal: value })
        if (value.length > 0) {
            this.setState({ searching: true })
            this.getAutoSuggestion(value).then((data) => {
                this.setState({ suggestionArr: data })
            }).catch((error) => {
                console.log('something went wrong.', error)
            })
        } else {
            this.setState({ searching: false, page: 1 })
            this.getProducts('').then((data) => {
                if (data.results) {
                    if (data.results.length > 0) {
                        this.setState({ data: data.results, page: data.next_page })
                    }
                }
            }).catch((error) => {
                console.log('something went wrong.', error)
            })
        }
    }


    constructor(props) {
        super(props);
        this.state = {
            selected: new Map(),
            data: [],
            selectedArr: [],
            activeTextSearch: '',
            suggestionArr: [],
            loading: true,
            page: 1,
            per_page: 50,
            searching: false,
            inputVal: ''
        }

    }
    itemclickedForRefresh = (item) => {
        this.setState({ searching: false, page: 1, activeTextSearch: item.text, inputVal: item.text })
        this.getProducts(item.text).then((data) => {
            if (data.results) {
                if (data.results.length > 0) {
                    this.setState({ data: data.results, page: data.next_page })
                }
            }
        }).catch((error) => {
            console.log('something went wrong.', error)
        })
    }

    goBack() {
        Keyboard.dismiss()
        this.props.onClickClose()
    }

    gotoNext() {
        Keyboard.dismiss()
        this.props.prodNext()
    }

    render() {
        return (
            <View style={{ flex: 1, paddingBottom: 20, flexDirection: 'column', backgroundColor: '#fff' }}>
                <Container>
                    <Header style={{
                        backgroundColor: 'white', backgroundColor: '#fff',
                        borderBottomWidth: 1,
                        borderTopColor: 'transparent',
                        borderBottomColor: '#BCBCBC'
                    }}>
                        <View style={{ width: '13%', alignItems: 'flex-start', justifyContent: 'center' }}>
                            <TouchableOpacity transparent onPress={() => this.goBack()} >
                                <Icon name='arrow-back' style={{ color: 'black' }} />
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: '74%', alignItems: 'center', justifyContent: 'center' }}>
                            <Title style={{ textAlign: 'center', color: '#888', fontSize: 16, fontWeight: '100' }}>Add Products</Title>
                        </View>
                        <View style={{ width: '13%', alignItems: 'flex-end', justifyContent: 'center' }}>
                            <TouchableOpacity transparent onPress={() => this.gotoNext()}>
                                <Icon name='arrow-forward' style={{ color: 'black' }} />
                            </TouchableOpacity>
                        </View>
                    </Header>
                    <View style={{ height: 40, flexWrap: 'wrap', alignItems: 'center', width: screenWidth - 40, marginHorizontal: 20, marginVertical: 20, borderColor: '#666', borderWidth: 0.5, borderRadius: 2, flexDirection: 'row' }}>
                        <TextInput style={{ paddingLeft: 10, width: screenWidth - 100, height: 40, margin: 5, left: 5, position: 'absolute' }} selectionColor={'black'} placeholder='Search inside the box'
                            value={this.state.inputVal} underlineColorAndroid='transparent' onChangeText={val => this.searchInputHandle(val)}></TextInput>
                        <Image style={{ right: 4, position: 'absolute', height: 20, width: 20, tintColor: '#666' }} source={require('../../../assets/ic-search-product.png')} />
                    </View>
                    {this.state.searching && <Card style={{ marginHorizontal: 10 }}>
                        <Content>
                            {this.state.suggestionArr.map((item, index) => {
                                return (<TouchableOpacity onPress={() => this.itemclickedForRefresh(item)} style={{ width: '100%', padding: 15, flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
                                    <Icon name="ios-search" style={{ width: '15%' }} />
                                    <Text style={{ width: '85%' }}>{item.text}</Text>
                                </TouchableOpacity>
                                )
                            })}

                            {this.state.loading == false && this.state.suggestionArr.length == 0 &&
                                <View style={{ flex: 1, flexDirection: 'column', position: 'relative', justifyContent: 'center', alignItems: 'center', }}>
                                    <Text>No product matching your search</Text>
                                </View>
                            }
                        </Content>
                    </Card>}
                    {this.state.loading == false && this.state.data.length > 0 && <FlatList
                        data={this.state.data}
                        keyExtractor={this._keyExtractor}
                        renderItem={this._renderItem}
                        onEndReached={() => this.getMoreProducts('')}
                        onEndReachedThreshold={1.5}
                        />
                    }
                    {this.state.loading == false && this.state.data.length == 0 &&
                        <View style={{ flex: 1, flexDirection: 'column', position: 'relative', justifyContent: 'center', alignItems: 'center', }}>
                            <Text>No product matching your search</Text>
                        </View>
                    }

                    {this.state.loading == true && <View style={{ flex: 1, flexDirection: 'column', position: 'relative', justifyContent: 'center', alignItems: 'center', }}>
                        <Spinner color="#00C497" key={Math.random()} />
                    </View>
                    }
                </Container>
            </View>

        );
    }

}