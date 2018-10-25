import React, { Component } from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    Dimensions,
    TextInput,
    Image, Keyboard, KeyboardAvoidingView,
    StyleSheet, Platform, AsyncStorage
} from 'react-native';
import { Content, Spinner, Container, Header, Icon, Left, Body, Right, Button, Title, Card, CardItem } from 'native-base';

import { RichTextEditor, RichTextToolbar, actions } from 'react-native-zss-rich-text-editor';
import KeyboardSpacer from 'react-native-keyboard-spacer';

const screenHeight = Dimensions.get('window').height
const screenWidth = Dimensions.get('window').width

const defaultActions = [
    actions.setBold,
    actions.setItalic,
    actions.heading3,
    actions.heading4,
    actions.insertLink,
];

export default class UploadArticleStep2 extends Component {
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            title: 'Description',
            headerTintColor: 'black',
            headerRight: <TouchableOpacity onPress={() => params.gotoSearch && params.gotoSearch()} style={{ marginRight: 10 }}>
                <Text>Next</Text>
            </TouchableOpacity>
        }
    };

    next = () => {
        this.getHTML().then((content) => {
            var data = {
                description: content,

            }
            AsyncStorage.setItem('ArticleDraft2', JSON.stringify(data));
            this.props.navigation.navigate('UploadArticleStep3');
        })

    }

    componentDidMount() {
    }

    onEditorInitialized() {

    }

    constructor(props) {
        super(props);
        this.getHTML = this.getHTML.bind(this);
        this.state = {
            isToolShow: false,
        }
    }
    changeState = () => {
        this.setState({ isToolShow: !this.state.isToolShow })
    }
    componentWillReceiveProps() {
        this.setState({ content: this.richtext._selectedTextChangeListeners })
    }
    async getHTML() {
        const contentHtml = await this.richtext.getContentHtml();
        return contentHtml;

    }

    gotoNext() {
        Keyboard.dismiss()
        this.getHTML().then((content) => {
            this.props.descNext(content)
        })
    }

    goBack() {
        Keyboard.dismiss()
        this.getHTML().then((content) => {
            this.props.onClickClose(content)
        })
    }

    renderTextEditor() {
        return (
            <Container style={Platform.OS == 'ios' ? {} : styles.container}>
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
                        <Title style={{ textAlign: 'center', color: '#888', fontSize: 16, fontWeight: '100' }}>Description</Title>
                    </View>
                    <View style={{ width: '13%', alignItems: 'flex-end', justifyContent: 'center' }}>
                        <TouchableOpacity transparent onPress={() => this.gotoNext()}>
                            <Icon name='arrow-forward' style={{ color: 'black' }} />
                        </TouchableOpacity>
                    </View>
                </Header>
                <View style={{ width: screenWidth - 20, marginHorizontal: 10, marginVertical: 10, height: screenHeight - 200, borderColor: '#666', borderWidth: 0.5, borderRadius: 2 }}>
                    <RichTextEditor
                        ref={(r) => this.richtext = r}
                        hiddenTitle={true}
                        style={styles.richText}
                        footerHeight={screenHeight * 0.25}
                        initialContentHTML={this.props.descValue}
                        contentPlaceholder='Write a description'
                        editorInitializedCallback={() => this.onEditorInitialized()}
                        />
                </View>
                {this.showHideToolbar()}
                <TouchableOpacity onPress={this.changeState} style={{ left: 10, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', bottom: 22, position: 'absolute' }}>
                    <Image source={require('../../../assets/ic-edit-text.png')} style={{ height: 35, width: 35 }} />
                </TouchableOpacity>
            </Container>)
    }

    showHideToolbar() {
        if (this.state.isToolShow) {
            return (
                <View style={{ left: 60, zIndex: 999, justifyContent: 'center', width: 225, position: 'absolute', height: 53, bottom: 15, borderColor: '#999', borderWidth: 1, borderRadius: 2, alignItems: 'center', paddingTop: 4 }}>
                    <RichTextToolbar
                        iconTint='black'
                        selectedButtonStyle={{
                            flex: 1,
                            backgroundColor: 'transparent',
                            // borderColor: '#ccc',
                            // borderWidth: 2,
                            borderRadius: 2,
                            overflow: 'hidden',
                            shadowColor: 'black',
                            shadowRadius: 20,
                            shadowOpacity: 1,
                            elevation: 2
                        }}
                        getEditor={() => this.richtext}
                        style={{ height: 46, width: 220, justifyContent: 'center', alignItems: 'center' }}
                        unselectedButtonStyle={{ backgroundColor: 'white' }}
                        actions={defaultActions} />
                </View>)
        } else {
            return null
        }
    }

    render() {
        if (Platform.OS == 'ios') {
            return (<KeyboardAvoidingView behavior='padding' style={styles.container}>
                {this.renderTextEditor()}
            </KeyboardAvoidingView>)
        } else {
            return (this.renderTextEditor())
        }
    }

}

const style = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column'

    },

    textInput: {
        marginTop: 20,
        paddingLeft: 10,
        borderWidth: 0.5,
        borderColor: 'gray',
        borderRadius: 5,

        height: screenHeight - 150
    },

});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        zIndex: -3
        //   paddingTop: 40
    },
    richText: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        marginTop: 20,
    },
});