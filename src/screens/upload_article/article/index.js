import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Image,
  Modal,Keyboard,
  TouchableWithoutFeedback,
  StyleSheet,AsyncStorage,Platform
} from 'react-native';
import { Content, Icon } from 'native-base';

import Constants from '../../../constants';
import axios from 'axios';

const screenHeight = Dimensions.get('window').height
const screenWidth = Dimensions.get('window').width

const backBtn = Platform.OS == "ios" ? { justifyContent: 'center', alignItems: 'center', height: 20, padding: 10, margin: 10, width: 20 } : { margin: 10 }

import UploadArticleStep2 from '../description'
import UploadArticleStep3 from '../add_product'
import SubmitArticle from '../submit'

export default class UploadArticleStep1 extends Component{
    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
        title: 'Article',
        headerTintColor: 'black',
        headerTitleStyle: { flex: 1,textAlign: 'center',color: '#888', fontSize:18,fontWeight:'200'},
        headerLeft: <TouchableOpacity style={backBtn} onPress={() => navigation.goBack()} >
                <Icon name='arrow-back' style={{ color: 'black' }} />
            </TouchableOpacity>,
        headerRight: <TouchableOpacity onPress = {() => params.gotoDesc && params.gotoDesc()} style={{marginRight:10}}>
                        <Icon name='arrow-forward' style={{ color: 'black' }} />
                    </TouchableOpacity>
        }
    };

    gotoDescription = () => {
        this.gotoDesc()
    }

    gotoDesc(){
        Keyboard.dismiss()
        setTimeout(() => { 
            this.setState({step2ModalVisible: true})
        },100)
    }
    
    gotoProduct(){
        this.setState({step3ModalVisible: true})
    }

    gotoSubmit(){
        this.setState({submitModalVisible: true})
    }

    closeStep2Modal(text){
        Keyboard.dismiss()
        setTimeout(() => { 
            this.setState({isDraft: false});
            this.setState({step2ModalVisible: false, description: text})
        },100)
    }
    closeStep3Modal(){
        this.setState({step2ModalVisible: true, step3ModalVisible: false}) 
    }
    closeSubmitModal(text){
        this.setState({step3ModalVisible: true, submitModalVisible: false}) 
    }
    onDescNext(text){
        Keyboard.dismiss()
        setTimeout(() => { 
            this.setState({step3ModalVisible: true,step2ModalVisible: false, description: text, isDraft: false})
        },100)
    }
    onProductNext(){
        Keyboard.dismiss()
        setTimeout(() => { 
            this.setState({submitModalVisible: true,step3ModalVisible: false})
        },100)
    }
    itemClickProduct(data){
        this.setState({isDraft: false});
        this.setState({selectedArr: data})
    }
    onClickArticle(){
        this.setState({step2ModalVisible: false, step3ModalVisible: false, submitModalVisible: false}) 
    }
    onClickDesc(){
        this.setState({step2ModalVisible: true, step3ModalVisible: false, submitModalVisible: false}) 
    }
    onclickProductList(){
        this.setState({step2ModalVisible: false, step3ModalVisible: true, submitModalVisible: false}) 
    }

    componentDidMount () {
        this.props.navigation.setParams({gotoDesc: () => this.gotoDescription()});
        const { params } = this.props.navigation.state;
        const articleID = params ? params.articleID : null;
        if(articleID){
            fetch(`${Constants.url.base}discoveries/${articleID}/products?status=true`,{
                method:'GET'
            })
            .then((res)=>res.json())
            .then(resData =>{
                var existinData = resData.product_discovery
                this.setState({title: existinData.title})
                this.setState({id: existinData.id})
                var tagsArr = [];
                for(let i of existinData.tags_object){
                    tagsArr.push(i.name)
                }
                this.setState({hashTagsArr: tagsArr})
                this.setState({description: existinData.description })
                this.setState({selectedArr :resData.products})
            })
            
        }
        AsyncStorage.getItem('loggedinUserData')
        .then((value) => {
            if (value != null) {
                var dataJson = JSON.parse(value);
                this.setState({userID: dataJson.profile_object.id})
            }
        });

        
    }

    componentWillUnmount(){
        if(!this.state.isSubmitted){
            this.submitArticle(2)
        }
        clearInterval(this.timer)
    }

    constructor(props){
        super(props)
        this.state = {
            id: null,
            isDraft: false,
            title: '',
            hashTag: '',
            description: '',
            hashTagsArr: [],
            selectedArr:[],
            step2ModalVisible: false,
            step3ModalVisible: false,
            submitModalVisible: false,
            userID:'',
            isSubmitted: false
        }
        this.submitArticle = this.submitArticle.bind(this)
        this.timer = setInterval(()=> this.submitArticle(2), 20000)
    }

    _removeHashTag(index){
       var arr = this.state.hashTagsArr
       arr.splice(index, 1)
       this.setState({hashTagsArr: arr})

    }

    hashInputHandle(value){
        var lastCharacter = value[value.length - 1];
        var removeWhiteSpace = value.replace(/\s/g, '')
        if(lastCharacter == ' ' && removeWhiteSpace.length > 0){
            var arr = this.state.hashTagsArr
            if(arr.indexOf(value.replace(/\s/g, '')) == -1){
                arr.push(value.replace(/\s/g, ''))
            }
            this.setState({hashTag: '', isDraft: false})
        }else {
            this.setState({hashTag: value, isDraft: false})
        }
    }

    submit(){
        const { params } = this.props.navigation.state;
        if(this.state.isDraft){
            this.submitArticle(2).then((data)=>{
                if(data){
                    clearInterval(this.timer)
                    this.setState({step2ModalVisible: false, step3ModalVisible: false, submitModalVisible: false})
                    if(params.articleID){
                        this.props.navigation.goBack()
                        this.props.navigation.state.params.onUpdate('updated');
                    }else{
                        this.props.navigation.navigate('Profile', {"userID": this.state.userID});
                    }
                }
            })
        }else {
        if(this.state.title == null || this.state.title == ''){
            alert('Title must not be empty')
            this.setState({isDraft: true});
            return
        }else {
            if(this.state.title.length < 20){
                alert('Your title must be atleast 20 characters long.')
                this.setState({isDraft: true});
                return
            }
        }

        if(this.state.description == null || this.state.description == '' ){
            alert('Description must not be empty')
            this.setState({isDraft: true});
            return
        }else {
            var length = this.state.description.split(' ').length;
            if(length < 200){
                alert('Your description must be atleast 200 words long.')
                this.setState({isDraft: true});
                return
            }else{
                console.log('greater than 200')
            }
        }

        if(this.state.selectedArr == null || this.state.selectedArr.length < 4 ){
            alert('You must add atleast 4 products.')
            this.setState({isDraft: true});
            return
        }

        if(this.state.hashTagsArr == null || this.state.hashTagsArr.length == 0 ){
            alert('You must provide a hashtag.')
            this.setState({isDraft: true});
            return
        }
        this.submitArticle(1).then((data)=>{
            if(data){
                this.setState({step2ModalVisible: false, step3ModalVisible: false, submitModalVisible: false})
                setTimeout(() => { 
                    clearInterval(this.timer)
                    this.setState({ isSubmitted: true })
                    if(params.articleID){
                        this.props.navigation.goBack()
                        this.props.navigation.state.params.onUpdate('updated');
                    }else{
                        this.props.navigation.navigate('Profile', {"userID": this.state.userID});
                    }
                    alert("Your Article is under review. You will get a response ASAP! Don't forgot to check your email")
                }, 1000);
            }
            
        })
    } 
    }

    async submitArticle(status){
        var pidArr = []
        var tagArr = []
        for(var i=0;i<this.state.selectedArr.length; i++){
            pidArr.push(this.state.selectedArr[i].product_id)
        }
        for(var i=0;i<this.state.hashTagsArr.length; i++){
            tagArr.push(this.state.hashTagsArr[i])
        }
        var reqData = {
            id :this.state.id,
            status: status,
            title: this.state.title,
            description: this.state.description,
            product_ids: pidArr.toString(),
            tags: tagArr.toString(),
        }
        try {
          const atoken = await AsyncStorage.getItem('isLoggedIn');
          if (atoken !== null){
            try {
              const deviceID = await AsyncStorage.getItem('deviceID');
              if(deviceID != null){
                const api = axios.create({
                  baseURL: Constants.url.base,
                  timeout: 200000,
                  responseType: 'json',
                  headers: {
                    'Authorization': 'Token '+atoken+';device_id='+deviceID
                  }
                });

                return api.post('discoveries/create_draft', reqData).then((response)=> {
                    this.setState({id: response.data.product_discovery.id})
                    return response.data.product_discovery;
                }).catch((error)=> {
                    alert(error.response.data.message)
                })
              }
            }catch(error){
              alert('No device id found')
            }
           }
          }catch(error){
            alert('No access token found')
          }

    }

    _renderHashTags(){
        if(this.state.hashTagsArr.length > 0){
            const lapsList = this.state.hashTagsArr.map((item, index) => {
              return (
                  <View key={'hash'+index} style={{flexDirection:'row', justifyContent:'center',alignItems:'center', margin: 5, backgroundColor:'#e6e6e6', paddingHorizontal:10, height:36, borderRadius:18}}>
                    <Text>{item}</Text>
                    <TouchableOpacity onPress={()=> this._removeHashTag(index)}>
                        <Image source={require('../../../assets/cross2.png')} style={{width: 15, height: 15, marginLeft:5}}/>
                    </TouchableOpacity>
                  </View>
              )
            })
            return <View style={{flexWrap: 'wrap', flexDirection: 'row', padding: 20, justifyContent:'flex-start', alignItems:'flex-start'}}>
                      {lapsList}
                  </View>
          }else {
            return <View style={{flexWrap: 'wrap', flexDirection: 'row', padding: 20, justifyContent:'flex-start', alignItems:'flex-start'}}>
                      {/* <Text>No hashtag added yet.</Text> */}
                  </View>
          }
    }

render(){
    return(
        <View style={styles.container}>
            <TextInput style={styles.textInput} underlineColorAndroid='transparent' selectionColor ={'black'} placeholderTextColor={'#777'} placeholder='Title' onChangeText={title => this.setState({ title, isDraft: false })} value={this.state.title}></TextInput>
            <TextInput style={styles.textInput} underlineColorAndroid='transparent' selectionColor ={'black'} placeholderTextColor={'#777'} placeholder='#Hastags' onChangeText={hashTag => this.hashInputHandle(hashTag)} value={this.state.hashTag}></TextInput>
            <Content>
                {this.state.hashTagsArr ? this._renderHashTags() : this._renderHashTags()}
            </Content>
            <Modal
	          animationType={'fade'}
	          transparent={true}
	          visible={this.state.step2ModalVisible}
	          presentationStyle={'overFullScreen'}
              onRequestClose={() => console.log('do nothing')}
	        >
	            <TouchableWithoutFeedback>
                    <UploadArticleStep2 onClickClose={(text)=>this.closeStep2Modal(text)} 
                                        descValue={this.state.description}
                                        descNext={(text)=>this.onDescNext(text)}/>
	            </TouchableWithoutFeedback>
	        </Modal>
            <Modal
	          animationType={'fade'}
	          transparent={true}
	          visible={this.state.step3ModalVisible}
	          presentationStyle={'overFullScreen'}
              onRequestClose={() => console.log('do nothing')}
	        >
                <TouchableWithoutFeedback>
                    <UploadArticleStep3 onClickClose={()=>this.closeStep3Modal()} 
                                        prodNext={()=>this.onProductNext()}
                                        selectedArr={this.state.selectedArr}
                                        onItemClick={(data)=> this.itemClickProduct(data)}/>
                </TouchableWithoutFeedback>
	        </Modal>
            <Modal
                animationType={'fade'}
                transparent={true}
                visible={this.state.submitModalVisible}
                presentationStyle={'overFullScreen'}
                onRequestClose={() => console.log('do nothing')}
                >
                <TouchableWithoutFeedback>
                    <SubmitArticle onClickClose={(text)=>this.closeSubmitModal()} 
                                   selectedArr={this.state.selectedArr}
                                   title={this.state.title}
                                   hashTagArr={this.state.hashTagsArr}
                                   description={this.state.description}
                                   ifDraft={this.state.isDraft}
                                   onSubmit={()=> this.submit()}
                                   onClickarticle={()=>this.onClickArticle()}
                                   onClickDesc={()=>this.onClickDesc()}
                                   onclickProductList={()=>this.onclickProductList()}
                                   />
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
}

}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    //   alignItems:'center',
      flexDirection:'column',
      backgroundColor: '#fff'
      
    },

      textInput:{
        paddingLeft: 10,
        marginTop:30,
        borderWidth:0.5,
        borderRadius:2,
        borderColor:'#666',
        width: screenWidth-40,
        marginHorizontal: 20,
        height: 40
      },
  });