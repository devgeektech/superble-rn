
import React, { Component } from 'react';
import {
    StyleSheet,
    View,Modal,CameraRoll,
    Image, Alert, ActivityIndicator,AsyncStorage,PermissionsAndroid,
    Text, Dimensions, TouchableOpacity, FlatList, TouchableHighlight, Linking, TouchableWithoutFeedback,Platform
} from 'react-native';
import { Container, Header, Left, Body, Right, Button, Icon, Title, H1, Label, Content, Card, CardItem, Spinner } from 'native-base';
const FBSDK = require('react-native-fbsdk');
const {
  GraphRequest,
  GraphRequestManager,
} = FBSDK;
import axios from 'axios';
import Constants from '../../constants';
import styles from './draftStyle';
import styles2 from './../account/accountStyle';
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
import GridView from 'react-native-super-grid';

export default class Draft extends Component {
    constructor(props) {
        super(props);
        this.state = {
            topics: [],
            routes: [],
            fbImages:[],
            glImages: [],
            pnImages: [],
            inImages: [],
            isFb: false,
            isIn: false,
            isPn: false,
            loadGalleryImages: [],
            modalMediaTypeVisible:false,
            modalChooseMediaVisible: false,
            
        }
        this.onEditClick = this.onEditClick.bind(this)
        this.onDeleteClick = this.onDeleteClick.bind(this)
        this._responseInfoCallback = this._responseInfoCallback.bind(this)
        this.fetchMediafromLibrary = this.fetchMediafromLibrary.bind(this)
        this.fetchSocialMediaforAll = this.fetchSocialMediaforAll.bind(this)
    }

    componentDidMount() {
        this.setState({topics:this.props.topics, loaded:true})
        if(Platform.OS == 'ios'){
            this.fetchMediafromLibrary()
        }else{
            this.requestCameraPermission().then(()=>{
                this.fetchMediafromLibrary()
            })
        }
    }

    fetchSocialMediaforAll=()=>{
        AsyncStorage.getItem('isFbSynced').then((data)=>{
            if(data != null){
                data = JSON.parse(data)
                this.setState({isFb: true, fb_token: data.token})
                this.getFBMedia(data.token)
            }else {
                this.setState({isFb: false})
            }
        })
        AsyncStorage.getItem('isInstaSynced').then((data)=>{
            if(data != null){
                data = JSON.parse(data)
                this.setState({isIn: true, in_token: data.token})
                this.getInstaMedia(data.token)
            }else {
                this.setState({isIn: false})
            }
        })
        AsyncStorage.getItem('isPinstaSynced').then((data)=>{
            if(data != null){
                data = JSON.parse(data)
                this.setState({isPn: true, pn_token: data.token})
                this.getPinterestMedia(data.token)
            }else {
                this.setState({isPn: false})
            }
        })
    }

    openUpdateProfile = data =>{
        this.props.onUpdate(true)
    }

    async requestCameraPermission() {
    try {
        const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
            'title': 'Superble App Gallery Permission',
            'message': 'Superble App needs access to your Gallery '
        }
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log("You can use the camera")
        } else {
            console.log("Camera permission denied")
        }
    } catch (err) {
        console.warn(err)
    }
    }

   async onEditClick(topic){
        if (topic.is_discovery_list) {
            this.props.navigator.navigate('UploadArticleStep1',{ articleID: topic.id, "onUpdate": this.openUpdateProfile})
        } else {
            this.props.navigator.navigate('UploadProductStep1',{ existinData: topic, "onUpdate": this.openUpdateProfile})
        }
    }

    async onDeleteClick(topic) {
        var url = ''
        if (topic.is_discovery_list) {
           url = "/discoveries/" + topic.id + "/delete_draft";
        } else {
           url =  "/products/" + topic.id + "/delete_draft";
        }

        try {
            const atoken = await AsyncStorage.getItem('isLoggedIn');
            if (atoken !== null){
              try {
                const deviceID = await AsyncStorage.getItem('deviceID');
                if(deviceID != null){
                    try {
                        const api = axios.create({
                            baseURL: Constants.url.base,
                            timeout: 0,
                            responseType: 'json',
                            headers: {
                                'Authorization': 'Token '+atoken+';device_id='+deviceID
                            }
                        });
                        let response = await api.post(url);
                        if(response.data.status){
                            this.props.onUpdate(true)
                        }
                    }
                    catch (error) {
                        console.log("HERE IS PROBLEM", error.response)
                    }
                }
            }catch (error) {
                console.log("HERE IS PROBLEM", error)
                this.setState({loaded: true});
            }
        }
    }catch (error) {
        console.log("HERE IS PROBLEM", error)
        this.setState({loaded: true});
    }
    }

    showMediaPicker(type){
        this.setState({modalMediaTypeVisible: false})
        this.setState({modalChooseMediaVisible: true})
        if(type == 'facebook'){
          this.setState({loadGalleryImages: this.state.fbImages, isGallery: false})
        } else if(type == 'instagram') {
          this.setState({loadGalleryImages: this.state.inImages, isGallery: false})
        } else if(type == 'pinterest'){
          this.setState({loadGalleryImages: this.state.pnImages, isGallery: false})
        }
        else{
          this.setState({loadGalleryImages: this.state.glImages, isGallery: true})
        }
      }

    // Facebook media sync
    getFBMedia = (token) => {
        fetch('https://graph.facebook.com/v2.12/me/albums?access_token=' + token)
        .then((response) => response.json())
        .then((json) => {
          var len = 0;
          var albumArr = []
          if(json.data){
            len = json.data.length;
            albumArr = json.data;
          }
          for(var i=0; i<len; i++){
            const infoRequest = new GraphRequest(
              '/'+albumArr[i].id+'/photos',
              {
                accessToken: token,
                parameters: {
                  fields: {
                    string: 'id,name,source'
                  }
                }
              },
              this._responseInfoCallback,
            );
            new GraphRequestManager().addRequest(infoRequest).start();
          }
        })
      }
    
      _responseInfoCallback(error, result) {
        if (error) {
          this.setState({isFb: false})
          console.log('facebook error',error)
        } else {
          var data = this.state.fbImages
          data = data.concat(result.data)
          this.setState({fbImages: data})
          this.setState({isFb: true})
        }
      }

      getInstaMedia(token){
        fetch('https://api.instagram.com/v1/users/self/media/recent/?access_token='+token)
        .then((response) => response.json())
        .then((json) => {
          if(json.data){
            var arr = [];
            var cArr = json.data;
            for(var i=0; i<cArr.length; i++){
              if(cArr[i].type == "image"){
                arr.push({source: cArr[i].images.standard_resolution.url})
              } else if(cArr[i].type == "carousel"){
                for(var j=0; j<cArr[i].carousel_media.length; j++){
                  arr.push({source: cArr[i].carousel_media[j].images.standard_resolution.url})
                }
              }
            }
            this.setState({isIn: true})
            this.setState({inImages: arr})
          }
          
        });
      }

      async getPinterestMedia(token){
        try {
          const atoken = await AsyncStorage.getItem('isLoggedIn');
          if (atoken !== null){
            try {
              const deviceID = await AsyncStorage.getItem('deviceID');
              if(deviceID != null){
                const api = axios.create({
                  baseURL: Constants.url.base,
                  timeout: 0,
                  responseType: 'json',
                  headers: {
                    'Authorization': 'Token '+atoken+';device_id='+deviceID
                  },
                  params: {
                    access_token: token
                  }
                });
            
                try {
                    let response = await api.get(Constants.url.pinterest_images);
                    var data = response.data.data;
                    var arr = []
                    if(arr){
                      for(var i=0; i<data.length; i++){
                        arr.push({source: data[i]})
                      }
                    }
                    this.setState({isPn: true})
                    this.setState({pnImages: arr})
                }
                catch (error) {
                    console.log("HERE IS PROBLEM", JSON.stringify(error))
                }
              }
            }catch(error){
              alert('No device id found')
            }
           }
          }catch(error){
            alert('No access token found')
          }
      }

      fetchMediafromLibrary=()=>{
        CameraRoll.getPhotos({
          first: 50,
        })
        .then(r => {
          var arr = []
          var data = r.edges
          for (var i=0;i<data.length; i++){
            arr.push({source :data[i].node.image.uri})
          }
          this.setState({glImages: arr})
        })
        .catch((err) => {
           console.log("error in loadin image", err)
        });
      }
 
      chooseImages = (index) => {
        var arr = this.state.loadGalleryImages
        var sArr = []
        if(this.state.selectedImages){
          var sArr = this.state.selectedImages
        }
        var i = sArr.indexOf(arr[index])
        if(i != -1){
          sArr.splice(i,1)
        }else {
          sArr.push(arr[index].source)
        }
        arr[index].selected = !arr[index].selected
        this.setState({
                      loadGalleryImages: arr,
                      selectedImages: sArr
                    })
      }


      async addImages(){
        var imgArr = []
        if(this.state.selectedImages){
          if(this.state.selectedImages.length > 0) {
            if(!this.state.isGallery){
              this.createDraft(this.state.selectedImages)
            }else{
              for(var i=0;i<this.state.selectedImages.length;i++){
                this.uploadImage(this.state.selectedImages[i]).then((res)=>{
                  imgArr.push(res.url)
                  if(imgArr.length == this.state.selectedImages.length){
                    this.createDraft(imgArr)
                  }
                }).catch((error)=>{
                  console.log(error)
                })
              }
            }
            
          }else {
            this.cancelImagePickerModal()
          }
        }else {
          this.cancelImagePickerModal()
        }
      }

      async cancelImagePickerModal(){
        this.setState({selectedImages: []})
        this.setState({loadGalleryImages: []})
        this.setState({modalChooseMediaVisible:  false})
        this.setState({modalMediaTypeVisible: false})
    }

    async uploadImage(image){
        let formdata = new FormData();
        if(Platform.OS == "ios"){
            formdata.append("file", {uri: image, name: 'image.jpg', type: 'multipart/form-data'})
        }else{
            formdata.append("file", {uri: image, name: 'image.jpg', type: 'image/jpeg'})
        }
        
        let response = await fetch(Constants.url.base + 'images', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'multipart/form-data',
            },
            body: formdata
        })
        let data = await response.json();
        return data
      }


     createDraft(imgArr){
       
          AsyncStorage.getItem('isLoggedIn').then((atoken) => {
            if (atoken !== null){
                AsyncStorage.getItem('deviceID').then((deviceID) =>{
                    if(deviceID !== null){
                        var reqDAta = {
                        image_urls: imgArr
                        }
                    
                        fetch(Constants.url.base + `products/create_draft_with_images`, {
                            method: 'POST',
                            headers: {
                                    'Authorization': 'Token token='+atoken+';device_id=' + deviceID,
                                    'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(reqDAta),
                        })
                        .then(response => response.json())
                        .then(responseData => {
                            if(responseData.message == "Drafts Created"){
                                this.cancelImagePickerModal()
                                this.props.onUpdate(true)
                            }else{
                                alert("Something went wrong")
                            }
                        }).catch((err)=>{
                        this.setState({isAddWalletModalShow: false})
                            console.log(err)
                        });
                    }
                }).catch((error)=>{
                    console.log("Device id not found", error)
                })
            }
        }).catch((error)=>{
            console.log("Access Token not found", error)
        })
        
      }


    renderGalleryImages(){
        if(this.state.loadGalleryImages){
          const lapsList = this.state.loadGalleryImages.map((item, index) => {
            return (
              <TouchableOpacity key = {'image'+index} onPress = {() => this.chooseImages(index)} style={[{width:'30%',height: 80, margin:'1.6%'}]} >
                <Image source={{uri : item.source}} style={{width: '100%', height: 80}}/>
                {this.state.loadGalleryImages[index].selected &&
                  <View style={{justifyContent:'flex-end',flexDirection:'row', width: '100%', height: 80, position:'absolute', left:0, right:0, top:0, bottom:0, backgroundColor: 'rgba(238, 238, 238, 0.35)'}}>
                    <Image source={require('../../assets/ic-selected.png')} style={{width: 20, height: 20}}/>
                  </View>
                }
              </TouchableOpacity>
            )
          })
          return <View style={{flexWrap: 'wrap', flexDirection: 'row', paddingVertical: 10}}>
                    {lapsList}
                </View>
        }else {
          return <View style={{flexWrap: 'wrap', flexDirection: 'row', justifyContent: 'center', alignItems:'center'}}>
                    <Text>No Images Found.</Text>
                </View>
        }
        
      }

      _openMediatypeModal() {
        this.fetchSocialMediaforAll()
        this.setState({modalMediaTypeVisible: true})
      }

    render() {

        if (this.state.loaded) {
            if (this.props.topics != undefined){
            if (this.props.topics.length > 0) {
                return (
                    <GridView
                        itemDimension={130}
                        items={this.props.topics}
                        style={gridStyles.gridView}
                        renderItem={topic => (
                            <View style={[gridStyles.itemContainer, { backgroundColor: '#FFFFFF' }]}>
                                {!topic.isFirst && <Image style={topic.is_discovery_list ? gridStyles.imageStyle2 : gridStyles.imageStyle} source={{ uri: topic.is_discovery_list ? topic.first_image_url : topic.image_url }} />}
                                {!topic.isFirst && !topic.is_discovery_list && <Text style={gridStyles.itemName}>{topic.title ? topic.title : ''}</Text>}
                                {!topic.isFirst && topic.is_discovery_list && 
                                    <View style={{backgroundColor:'color: rgba(0, 0, 0, 0.5);',position: 'absolute', top:0, left:0,right:0, bottom:0,width:'100%', height:'100%', justifyContent:'flex-start', alignItems:'flex-start', flexWrap:'wrap', flexDirection:'row' }}>
                                        <Text style={gridStyles.itemName2}>{topic.title ? topic.title : 'Pending Draft'}</Text>
                                    </View>
                                }
                                {!topic.isFirst && <View style={{backgroundColor:'color: rgba(0, 0, 0, 0.5);',position: 'absolute', top:0, left:0,right:0, bottom:0,width:'100%', height:'100%', justifyContent:'center', alignItems:'center', flexWrap:'wrap', flexDirection:'row' }}>
                                    <TouchableOpacity onPress={()=> this.onEditClick(topic)}>
                                        {/* <Icon name="ios-man" style={{ color:"white", fontSize:50, marginRight:15}} /> */}
                                        <Image source={require('../../assets/ic-edit-drafts-o.png')} style={{width:50,height:50, marginRight:15}}/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={()=> this.onDeleteClick(topic)}>
                                        {/* <Icon name="ios-lock" style={{ color:"white", fontSize:50}} /> */}
                                        <Image source={require('../../assets/ic-delete.png')} style={{width:50, height:50,}}/>
                                    </TouchableOpacity>
                                </View>}
                                {topic.isFirst && <TouchableOpacity onPress={()=> this._openMediatypeModal()} style={{backgroundColor:'#ccc',width:'100%', height:'100%', justifyContent:'center', alignItems:'center' }}>
                                    {/* <Icon name="ios-arrow-dropleft-circle" style={{ color:"white", fontSize:50}} /> */}
                                    <Image source={require('../../assets/ic-upload-pictures.png')} style={{width:50, height:50,}}/>
                                </TouchableOpacity>}

                                <Modal
                                animationType={'fade'}
                                transparent={true}
                                visible={this.state.modalMediaTypeVisible}
                                presentationStyle={'overFullScreen'}
                                onRequestClose={()=> console.log('do nothing')}
                                >
                                <TouchableWithoutFeedback>
                                    <View style={styles2.selecetTopics}>
                                    <TouchableWithoutFeedback>
                                        <View style={styles2.selecetTopicsStyle}>
                                        <Container>
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                            <Text style={{color:'#383636', textAlign:'center',fontSize:18, width:'90%', paddingHorizontal: 20}}>Select the pictures with the products you want to recommend</Text>
                                        <TouchableOpacity onPress={()=> this.setState({modalMediaTypeVisible: false})}>
                                            <Image source={require('../../assets/cross2.png')} style={{width:20, height: 20}}/>
                                        </TouchableOpacity>
                                        </View>
                                        <Content>
                                            {this.state.glImages.length > 0 &&
                                            <View style={{flexWrap: 'wrap', flexDirection: 'row', alignItems:'center', padding:15}}>
                                            <TouchableOpacity onPress={()=> this.showMediaPicker('gallery')}>
                                                <Image source={{uri : this.state.glImages[0].source}} style={{width:70, height: 70}}/> 
                                            </TouchableOpacity>
                                            <Text style={styles2.selectMediaProfileDivText}>Gallery</Text>
                                            </View>
                                            }
                                            {this.state.isFb == true &&
                                            <View style={{flexWrap: 'wrap', flexDirection: 'row', alignItems:'center', padding:15}}>  
                                                <TouchableOpacity onPress={()=> this.showMediaPicker('facebook')}>
                                                {this.state.fbImages.length > 0 &&  
                                                    <Image source={{uri : this.state.fbImages[0].source}} style={{width:70, height: 70}}/> 
                                                }
                                                    </TouchableOpacity>
                                                <Text style={styles2.selectMediaProfileDivText}>Facebook</Text>
                                            </View>
                                            }
                                            {this.state.isIn == true &&
                                            <View style={{flexWrap: 'wrap', flexDirection: 'row', alignItems:'center', padding:15}}>
                                                <TouchableOpacity onPress={()=> this.showMediaPicker('instagram')}>
                                                {this.state.inImages.length > 0 && 
                                                <Image source={{uri : this.state.inImages[0].source}} style={{width:70, height: 70}}/> 
                                                }
                                                </TouchableOpacity>
                                                <Text style={styles2.selectMediaProfileDivText}>Instagram</Text>
                                            </View>
                                            }
                                            {this.state.isPn == true &&
                                            <View style={{flexWrap: 'wrap', flexDirection: 'row', alignItems:'center', padding:15}}>  
                                                <TouchableOpacity onPress={()=> this.showMediaPicker('pinterest')}>  
                                                {this.state.pnImages.length > 0 && 
                                                <Image source={{uri : this.state.pnImages[0].source}} style={{width:70, height: 70}}/> 
                                                }
                                                </TouchableOpacity>
                                                <Text style={styles2.selectMediaProfileDivText}>Pinterest</Text>
                                            </View>
                                            }
                                            </Content>
                                        </Container>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    </View>
                                </TouchableWithoutFeedback>
                                </Modal>

                            <Modal
                                animationType={'fade'}
                                transparent={true}
                                visible={this.state.modalChooseMediaVisible}
                                presentationStyle={'overFullScreen'}
                                onRequestClose={()=> console.log('do nothing')}
                                >
                                <TouchableWithoutFeedback>
                                    <View style={styles2.selecetTopics}>
                                    <TouchableWithoutFeedback>
                                        <View style={styles2.selecetTopicsStyle}>
                                        <Container>
                                        <View style={{flexDirection: 'row', justifyContent: 'space-between',paddingVertical: 15,borderBottomColor:'#ccc', borderBottomWidth:1}}>
                                        <TouchableOpacity onPress={()=> this.setState({modalChooseMediaVisible: false, modalMediaTypeVisible: true})}>
                                            <Text style={{color:'#383636', textAlign:'center',fontSize:18,paddingHorizontal: 20}}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={()=> this.addImages()}>
                                        <Text style={{color:'#383636', textAlign:'center',fontSize:18,paddingHorizontal: 20}}>Done</Text>
                                        </TouchableOpacity>
                                        </View>
                                        <Content>
                                            {this.state.loadGalleryImages ? this.renderGalleryImages() : this.renderGalleryImages()}
                                            </Content>
                                        </Container>
                                        </View>
                                    </TouchableWithoutFeedback>
                                    </View>
                                </TouchableWithoutFeedback>
                                </Modal>
                            </View>
                            // onPress={()=> this.props.navigator.navigate('Product',{ item: topic.product_id})}
                        )}
                    />

                );
            }
            return (
                <View style={{
                    flex: 1,
                    padding: 25,
                    backgroundColor: 'white',
                    alignItems: 'center',
                    justifyContent: 'flex-start', height: Dimensions.get('window').height / 2
                }}>
                    <Text style={gridStyles.itemCode}>{"No data availale"}</Text>
                </View>

            )
        }
        }

            

        return (
            <View style={{
                flex: 1,
                padding: 25,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'flex-start', height: Dimensions.get('window').height / 2
            }}>
                <ActivityIndicator size="large" />
            </View>

        )

    }



}


const gridStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gridView: {
        
        marginTop: 10,
        paddingBottom: 200,
       
    },
    itemContainer: {
         flex:1,
        borderRadius: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 180,
    },
    imageStyle: {
        width: '100%',
        height: 160,
    },
    imageStyle2: {
        width: '100%',
        height: 180,
    },
    itemName: {
        paddingTop: 5,
        fontSize: 14,
        color: '#303030',
    },
    itemName2: {
        padding: 10,
        fontSize: 18,
        color: '#fff',
    },
    itemCode: {
        fontWeight: '600',
        fontSize: 12,
        color: '#000',
    },
});