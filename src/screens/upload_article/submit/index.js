import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Image,
    FlatList,
    StyleSheet, Keyboard,
    AsyncStorage
} from 'react-native';
import { Content, Spinner, Container, Header, Icon, Left, Body, Right, Button, Title, Card, CardItem } from 'native-base';

import Constants from '../../../constants';
import axios from 'axios';

import HTMLView from 'react-native-htmlview';

const screenHeight = Dimensions.get('window').height
const screenWidth = Dimensions.get('window').width

export default class SubmitArticle extends Component {

    componentDidMount() {
        this.setState({ title: this.props.title, hashTagsArr: this.props.hashTagArr, })
        this.setState({ description: this.props.description })
        this.setState({ selectedArr: this.props.selectedArr })
    }

    constructor(props) {
        super(props)
        this.state = {
            selectedArr: [],
            title: '',
            hashTagsArr: [],
            description: 'No description Found'
        }
    }

    goBack() {
        Keyboard.dismiss()
        this.props.onClickClose()
    }

    _renderHashTags() {
        if (this.state.hashTagsArr.length > 0) {
            const lapsList = this.state.hashTagsArr.map((item, index) => {
                return (
                    <TouchableOpacity onPress={() => this.props.onClickarticle()} key={'hash' + index} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', margin: 5, backgroundColor: '#e6e6e6', paddingHorizontal: 10, height: 36, borderRadius: 18 }}>
                        <Text>{item}</Text>
                    </TouchableOpacity>
                )
            })
            return <View style={{ flexWrap: 'wrap', flexDirection: 'row', padding: 10, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                {lapsList}
            </View>
        } else {
            return <TouchableOpacity onPress={() => this.props.onClickarticle()} style={{ flexWrap: 'wrap', flexDirection: 'row', padding: 10, justifyContent: 'flex-start', alignItems: 'flex-start', borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, marginTop: 10 }}>
                <Text>No hashtag found.</Text>
            </TouchableOpacity>
        }
    }
    _renderProcucts() {
        if (this.state.selectedArr.length > 0) {
            const lapsList = this.state.selectedArr.map((item, index) => {
                const selectedIcon = require('../../../assets/minus-sign.png');
                return (
                    <TouchableOpacity onPress={() => this.props.onclickProductList()} style={{ height: 50, justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                        <View style={{ alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', width: '92%' }}>
                            <Image style={{ height: 30, width: 30, marginRight: 20 }} source={{ uri: item.image_url }} />
                            <Text style={{ color: '#666', width: '80%' }} >{item.brand_name + ' - ' + item.title}</Text>
                        </View>
                        <Image style={{ height: 15, width: 15, tintColor: '#666' }} source={selectedIcon} />
                    </TouchableOpacity>
                )
            })
            return <View style={{ flexWrap: 'wrap', flexDirection: 'row', padding: 10, justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                {lapsList}
            </View>
        } else {
            return <TouchableOpacity onPress={() => this.props.onclickProductList()} style={{ flexWrap: 'wrap', flexDirection: 'row', padding: 10, justifyContent: 'flex-start', alignItems: 'flex-start', borderColor: 'gray', borderWidth: 0.5, borderRadius: 5, marginTop: 10 }}>
                <Text>No products found.</Text>
            </TouchableOpacity>
        }
    }


    render() {
        return (
            <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#fff' }}>
                <Container>
                    <Header style={{
                        backgroundColor: 'white', backgroundColor: '#fff',
                        borderBottomWidth: 1,
                        borderTopColor: 'transparent',
                        borderBottomColor: '#BCBCBC'
                    }}>
                        <Left>
                            <Button transparent onPress={() => this.goBack()} >
                                <Icon name='arrow-back' style={{ color: 'black' }} />
                            </Button>
                        </Left>
                        <Body>
                            <Title>Submit Article</Title>
                        </Body>
                        <Right>
                            <Button transparent onPress={() => this.props.onSubmit()}>
                                <Text style={{color:'black'}}>{this.props.ifDraft ? 'Save as draft' : 'Submit'}</Text>
                                {/* <Icon name='md-checkmark' style={{color:'black'}}/> */}
                            </Button>
                        </Right>
                    </Header>
                    <Content style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                        <TouchableOpacity onPress={() => this.props.onClickarticle()}>
                            <Text style={styles.inputStyle}> {this.state.title ? this.state.title : 'No Title Found'} </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.onClickDesc()}>
                            {this.state.description ?
                                <HTMLView value={this.state.description} style={styles.htmlviewStyle} />
                                : (<Text style={styles.inputStyle}> {'No Description Found'} </Text>)
                            }
                        </TouchableOpacity>
                        {this.state.hashTagsArr ? this._renderHashTags() : this._renderHashTags()}
                        {this.state.selectedArr ? this._renderProcucts() : this._renderProcucts()}
                    </Content>
                </Container>
            </View>

        );
    }

}

const styles = StyleSheet.create({
    inputStyle: {
        borderColor: '#666', borderWidth: 0.5, borderRadius: 2, paddingLeft: 10, width: '100%', marginTop: 10, height: 40, paddingTop: 10
    },
    htmlviewStyle: {
        borderColor: '#666', borderWidth: 0.5, borderRadius: 2, paddingLeft: 10, width: '100%', marginTop: 10, paddingVertical: 10
    }
})