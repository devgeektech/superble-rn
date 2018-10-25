import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
  ImageBackground,
  TextInput,
  Image,TouchableWithoutFeedback, Modal, 
  StyleSheet,AsyncStorage,Platform
} from 'react-native';
import { Container, Header, Left, Body, Right, Button, Icon, Title, H1, Label, Content, Card, CardItem, Spinner } from 'native-base';
import PrivateTagRobotItem from './privateTagRobotItem';
import styles from './styles';
const screenHeight = Dimensions.get('window').height
const screenWidth = Dimensions.get('window').width
var ImagePicker = require('react-native-image-picker');
import axios from 'axios';
import Constants from '../../constants';
const backBtn = Platform.OS == "ios" ? {justifyContent:'center', alignItems:'center',height:20,padding:10, margin:10, width:20} : { margin: 10 }
let _this = null;
export default class PrivateTag extends Component{

    static navigationOptions = ({ navigation }) => {
       const { params = {} } = navigation.state;
        return {
        headerTitle:params.item.text,
        headerTintColor: 'white',
        headerStyle: {
			
			borderBottomWidth: 0,
			position: 'absolute', backgroundColor: 'transparent', zIndex: 100, top: 0, left: 0, right: 0 ,
            
        },
        headerTitleStyle :{ alignSelf: 'center',
		textAlign: 'center'},
		headerLeft: 	<TouchableOpacity style={backBtn} onPress={()=> navigation.goBack()} >
							 {/* <Image style={{height:20,padding:10, margin:10, width:20}}source ={require('../../assets/back.png')}/> */}
							 <Icon  name='arrow-back' style={{color:'#fff'}}/>
                               </TouchableOpacity>,
        headerRight:  <Button transparent onPress = {params.isOwner ? () => _this.showOwnerMenu() : () => params.handleSave && params.handleSave()}>
                         <Icon name={params.isOwner ? 'md-more' : 'ios-information-circle-outline'} style={{ marginTop:5,  color:"white"}} />
                      </Button>
     
        }
    };

    constructor(props){
        super(props);
        this.state ={
            isLoggedIn: null,
            record: [],
            navigate: this.props.navigation.navigate,
            isFollowing:'FOLLOW',
            isPopup: false,
            isFollowersClicked:true,
            isJoinersClicked:false,
            isRequestSent:'JOIN',
            isOwner:false,
            followerCount:0,
			name:'',
			isEditInfoPopup:false
			
   
        }
    }


    followTag=()=>{
      if (this.state.isFollowing == "FOLLOW"){

        AsyncStorage.getItem('isLoggedIn')
		.then( (value) => {
		if(value === null) {
	          return this.props.navigation.navigate('Account');
	     } else {
			AsyncStorage.getItem('deviceID').then((did)=>{
				if (did === null){
					return this.props.navigation.navigate('Account');
				}else{
					fetch(Constants.url.base + `user_tags/follow`, {
						method: 'POST',
						headers: {
							'Authorization': 'Token token='+value+';device_id=' + did,
						  // 'Authorization': 'Token token=bb6b2728-ceb4-4b19-b9ec-833b0e66a7d3;device_id='+device_id,
						  'Content-Type': 'application/json',
						},
                        body: JSON.stringify({
                            tag_name: this.state.name,
                          }),
					})
					.then(response => response.json())
					.then(responseData => {
                        this.setState({isFollowing:'FOLLOWING', followerCount: this.state.followerCount + 1})
					});
				}
  		
	    	})
	  	 }
	  });

      }else{
        AsyncStorage.getItem('isLoggedIn')
		.then( (value) => {
		if(value === null) {
	          return this.props.navigation.navigate('Account');
	     } else {
			AsyncStorage.getItem('deviceID').then((did)=>{
				if (did === null){
					return this.props.navigation.navigate('Account');
				}else{
					fetch(Constants.url.base + `user_tags/${this.state.name}`, {
						method: 'DELETE',
						headers: {
							'Authorization': 'Token token='+value+';device_id=' + did,
						  // 'Authorization': 'Token token=bb6b2728-ceb4-4b19-b9ec-833b0e66a7d3;device_id='+device_id,
						  'Content-Type': 'application/json',
						},
					})
					.then(response => response.json())
					.then(responseData => {
                        if (this.state.followerCount != 0){
                            this.setState({followerCount: this.state.followerCount - 1 })
                        }
                        this.setState({isFollowing:'FOLLOW'})
					});
				}
  		
	    	})
	  	 }
	  });

      }
    }


    async _getTagsData(tagName){
	AsyncStorage.getItem('isLoggedIn')
		.then( (value) => {
		if(value === null) {
	          return this.props.navigation.navigate('Account');
	     } else {
			AsyncStorage.getItem('deviceID').then((did)=>{
				if (did === null){
					return this.props.navigation.navigate('Account');
				}else{
					fetch(Constants.url.base + `tags/${tagName}`, {
						method: 'GET',
						headers: {
							'Authorization': 'Token token='+value+';device_id=' + did,
						  // 'Authorization': 'Token token=bb6b2728-ceb4-4b19-b9ec-833b0e66a7d3;device_id='+device_id,
						  'Content-Type': 'application/json',
						},
		
					})
					.then(response => response.json())
					.then(responseData => {
						this.setState({
							followerCount :responseData.tag_data.followers_count,
							follow_msg: responseData.tag_data.follow_msg,
							join_msg: responseData.tag_data.join_msg,
							backgroundImage:responseData.tag_data.image_url,
						})

						if (responseData.data.length == 1){
								var productID = responseData.data[0].product_id
								  if (responseData.data[0].type == 'product'){
										this.props.navigation.navigate('Product',{ item: productID })
								  }else{
									var articleID = responseData.data[0].article_id
									
										this.props.navigation.navigate('Article',{ item: articleID })
								  }
							  }else{
								var arr = this.alternateArray(responseData.data)
							  	this.setState({record: arr})
							}

                     if (responseData.tag_data.owner){
                        this.setState({isFollowing:'FOLLOWING', isRequestSent:'JOINED'})
						this.props.navigation.setParams({isOwner: true});

                     }else{
						this.props.navigation.setParams({isOwner: false});
                        if (responseData.tag_data.followed){
                            this.setState({isFollowing:'FOLLOWING'})
                        }else{
                            this.setState({isFollowing:'FOLLOW'})
                        }
                        if (responseData.tag_data.join_status == "NOT_VERIFIED" ){
                            this.setState({isRequestSent:'PENDING'})
                        }else if (responseData.tag_data.join_status == "VERIFIED"){
                            this.setState({isRequestSent:'JOINED'})
                        }else{
                            this.setState({isRequestSent:'JOIN'})
                        }
                     }
					});
				}
  		
		})
	  	  }
	      });
    }


    async _callProductsonTouch(item){
		var reqParam =  {
			data : item.id ? item.id : item.text,
			exclude_discovery: false,	
			page:1,
			per_page:999,
		   }
		   
		if(item.type != null){
			reqParam.type = item.type	
		}else{
			reqParam.source = item.type
		}
		
		try{	
		let value = await AsyncStorage.getItem('isLoggedIn')
		if(value != null) {
			try{
			let did = await AsyncStorage.getItem('deviceID')
				if (did != null){
					const api = axios.create({
						baseURL: Constants.url.base,
						timeout: 0,
						responseType: 'json',
						// params: reqParam,
						headers:{
							'Authorization':'Token token='+value+';device_id=' + did,
							'Content-Type':'application/json'
						}
					  });
					  try {
						  let response = await api.get(`tags/${reqParam.data}?page=1&per_page=999`);
							if (response.data.data.length == 1){
								var productID = response.data.data[0].product_id
								  if (response.data.data[0].type == 'product'){
										this.props.navigation.navigate('Product',{ item: productID })
								  }else{
									var articleID = response.data.data[0].article_id
									
										this.props.navigation.navigate('Article',{ item: articleID })
								  }
							  }else{
								var arr = this.alternateArray(response.data.data)
							  	this.setState({record: arr})
								
							}
					  }
					  catch (error) {
						  console.log("HERE IS PROBLEM", error)
					  }
				}
			}catch(e){
				console.log("HERE IS PROBLEM", e)
			}
		}else{
			const api = axios.create({
				baseURL: Constants.url.base,
				timeout: 0,
				responseType: 'json',
				// params: reqParam
			  });
			  try {
				  let response = await api.get(`tags/${reqParam.data}?page=1&per_page=999`);
			
					if (response.data.data.length == 1){
						if (response.data.data[0].type == 'product'){
						  var productID = response.data.data[0].product_id
							  this.props.navigation.navigate('Product',{ item: productID })
						}else{
						  var articleID = response.data.data[0].article_id
							  this.props.navigation.navigate('Article',{ item: articleID })
						}
					}else{
						var arr = this.alternateArray(response.data.data)
						this.setState({record: arr})
				  }
		
			  }
			  catch (error) {
				  console.log("HERE IS PROBLEM", error)
			  }
		}
	}catch(e){
		console.log("HERE IS PROBLEM", e)
	}
}

alternateArray(arr){
								var tempArr1 = []
								var tempArr2 = []
								var tempArr3 = []
								for(var i=0; i<arr.length; i++){
									if(arr[i].type == "discovery"){
										tempArr1.push(arr[i])
									}else if(arr[i].type == "product"){
										tempArr2.push(arr[i])
									}
								}
								var artLen = tempArr1.length;
								var proLen = tempArr2.length;

								if(artLen > proLen){
									var newArtArr = tempArr1.slice(0, tempArr2.length)
									tempArr3 = newArtArr.reduce(function(arr, v, i) {
										return arr.concat(v, tempArr2[i]); 
									 }, []);
									 tempArr3 = tempArr3.concat(tempArr1.slice(proLen, artLen))
								}else{
									tempArr3 = tempArr1.reduce(function(arr, v, i) {
										return arr.concat(v, tempArr2[i]); 
									 }, []);
									 tempArr3 = tempArr3.concat(tempArr2.slice(artLen, proLen))
								}

								return tempArr3
}

joinHashTag(){
	AsyncStorage.getItem('isLoggedIn')
    .then( (value) => {
    if(value === null) {
          return this.props.navigation.navigate('Account');
     } else {
        AsyncStorage.getItem('deviceID').then((did)=>{
            if (did === null){
                return this.props.navigation.navigate('Account');
            }else{
                fetch(Constants.url.base + `user_tags`, {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Token token='+value+';device_id=' + did,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
						tag_name: this.state.name,
						member_type:1
                      }),
                })
                .then(response => response.json())
                .then(responseData => {
					this.setState({isRequestSent:'PENDING'})
                });
            }
        })
       }
  });
}

deleteHashTag(){
	AsyncStorage.getItem('isLoggedIn').then((value) => {
    if(value === null) {
          return this.props.navigation.navigate('Account');
     } else {
        AsyncStorage.getItem('deviceID').then((did)=>{
            if (did === null){
                return this.props.navigation.navigate('Account');
            }else{
                fetch(Constants.url.base + `user_tags/`+this.state.name, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Token token='+value+';device_id=' + did,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
						member_type:1
                      }),
                })
                .then(response => response.json())
                .then(responseData => {
					this.setState({isRequestSent:'JOIN'})
                });
            }
        })
       }
  });
}

sendRequest=()=>{
	var status = 1
	if (this.state.isRequestSent == "JOIN"){
		this.joinHashTag()
	}else{
		Alert.alert("Alert", "Do you want to cancel join request", [
			{ text: "OK", onPress: () => { this.deleteHashTag() }}   
		])
	} 
}

showFollowers= ()=>{
    this.setState({isFollowersClicked : true , isJoinersClicked:false})
}
showJoiners=()=>{
    this.setState({isJoinersClicked : true, isFollowersClicked:false})
}

showOwnerMenu(){
	
	if (this.state.isOwnerMenu){
		this.setState({isOwnerMenu:false})
	}else{
		this.setState({isOwnerMenu:true})
	}
	
}

componentDidMount(){
	_this = this;
    const { params } = this.props.navigation.state;
	const value = params ? params.item : null;
	this.props.navigation.setParams({isOwner: false});
	if(value.type == "tag"){
		this._getTagsData(value.id)
		this.setState({name:value.id})
	}else{
		this._getTagsData(value.name)
		this.setState({name:value.name})
	}
    
    // this._callProductsonTouch(value)
	this.setState({tagID:value.id})
   // this.setState({record:value.data.results})
	this.props.navigation.setParams({handleSave: () => this.openModal()});
}

_ImgPicker = () =>{
    const options = {
      quality: 1.0,
      maxWidth: 500,
      maxHeight: 500,
      allowsEditing: true,
      storageOptions: {
        skipBackup: true
      }
    };
	
        ImagePicker.launchImageLibrary(options, (response)  => {
            if (response.didCancel) {
            
            }
            else if (response.error) {
            alert(response.error)
            }
            else {
			let source = { uri: response.uri };
			this.setState({backgroundImage:response.uri})
			this.uploadImage(response.uri)
			this.showOwnerMenu()
            }
        });
    
    
  }

  uploadImage(image){
    let formdata = new FormData();
	if(Platform.OS == "ios"){
		formdata.append("file", {uri: image, name: 'image.jpg', type: 'multipart/form-data'})
	}else{
		formdata.append("file", {uri: image, name: 'image.jpg', type: 'image/jpeg'})
	}
    
    fetch(Constants.url.base + 'images', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
        },
        body: formdata
    })
    .then(response => response.json())
    .then(responseData => {
     this.updateCoverImage(responseData.id)
    }).catch((error)=>{
        console.log(error)
    })
  }


  updateCoverImage(image_id){
	AsyncStorage.getItem('isLoggedIn')
    .then( (value) => {
    if(value === null) {
          return this.props.navigation.navigate('Account');
     } else {
        AsyncStorage.getItem('deviceID').then((did)=>{
            if (did === null){
                return this.props.navigation.navigate('Account');
            }else{
                fetch(Constants.url.base + `tags/${this.state.tagID}`, {
                    method: 'PATCH',
                    headers: {
                        'Authorization': 'Token token='+value+';device_id=' + did,
                      // 'Authorization': 'Token token=bb6b2728-ceb4-4b19-b9ec-833b0e66a7d3;device_id='+device_id,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
						image_id: image_id,
                      }),
                })
                .then(response => response.json())
                .then(responseData => {
					this.showOwnerMenu()
                });
            }
      
        })
       }
  });
  }

goToRequest(){
	this.props.navigation.navigate('PrivateTagRequest', {item:this.state.tagID})
	this.showOwnerMenu()
}

renderItem = () => {
    let { record } = this.state;
    let count = 3;
    return record.map((i, x)=>{
        return( <PrivateTagRobotItem key={'pslist'+x} record={i} navigate={this.state.navigate} isLoggedIn={true} count={count} /> );
    });
}

openEditInfoModal(){
	this.setState({isEditInfoPopup:true})
	this.showOwnerMenu()
}
openModal(){
	const { params } = this.props.navigation.state;
	if(params.isOwner){
		// this.setState({isPopup:!this.state.isPopup})
	}else{
		this.setState({isPopup:!this.state.isPopup})
	}

}

updateinfoText() {
	if(this.state.follow_msg == ''|| this.state.join_msg == ''){
		alert("Please add the message");
	}else{
	AsyncStorage.getItem('isLoggedIn')
    .then( (value) => {
    if(value !== null) {
        AsyncStorage.getItem('deviceID').then((did)=>{
            if (did !== null){
				var reqData = {
					follow_msg: this.state.follow_msg,
    				join_msg: this.state.join_msg
				}
                fetch(Constants.url.base + `tags/${this.state.name}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Token token='+value+';device_id=' + did,
                      // 'Authorization': 'Token token=bb6b2728-ceb4-4b19-b9ec-833b0e66a7d3;device_id='+device_id,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(reqData),
                })
                .then(response => response.json())
                .then(responseData => {
					if(responseData.data == "Tag Updated"){
						Alert.alert("Alert", "Tag Updated", [
							{ text: "OK", onPress: () => { this.setState({ isEditInfoPopup: false }) }}   
						  ])
					}else{
						Alert.alert("Alert", "Something went wrong, Try Again..", [
							{ text: "OK", onPress: () => { this.setState({ isEditInfoPopup: false }) }}   
						  ])
					}
                });
            }
      
        })
       }
  });
}
}

    render(){
		const { params } = this.props.navigation.state
        return(
            <View style={{flex:1}}>
            <View style={{height:144, backgroundColor:'black', alignItems:'center', flexDirection:'column'}}>
               <ImageBackground style={{height:144,  alignItems:'center', flexDirection:'column'}}source ={{uri: this.state.backgroundImage}}>
			   <Text style={{color:'white',backgroundColor: 'transparent', marginTop:60, fontSize:16}}>{this.state.followerCount} followers</Text>
                <View style={{width:screenWidth, height:45, marginTop:10,flexDirection:'row', justifyContent:'space-around'}}>
                    <TouchableOpacity disabled={params.isOwner ? true : false} onPress ={this.followTag}style={{borderColor:'white', justifyContent:'center', alignItems:'center', borderWidth:2, height:35, width:150}}>
                        <Text style={{color:'white',backgroundColor: 'transparent',fontWeight:'bold', fontSize:15}}>{this.state.isFollowing}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity disabled={params.isOwner ? true : false} onPress={this.sendRequest} style={{borderColor:'white',justifyContent:'center', alignItems:'center', borderWidth:2, height:35, width:150}}>
                        <Text style={{color:'white',backgroundColor: 'transparent', fontWeight:'bold', fontSize:15}}>{this.state.isRequestSent}</Text>
                    </TouchableOpacity>
                </View>
				</ImageBackground>
                </View>
                <Content scrollEventThrottle={3000} removeClippedSubviews={true}>
					{this.renderItem()}
				</Content>

               <Modal
	          animationType={'fade'}
	          transparent={true}
	          visible={this.state.isPopup}
	          presentationStyle={'overFullScreen'}
			  onRequestClose={()=> console.log('do nothing')}
	        >
	          <TouchableWithoutFeedback>
	            <TouchableOpacity onPress={() => this.setState({isPopup:false})} style={{	backgroundColor: "rgba(0,0,0,0.6)",
																							position: 'absolute',
																							width:'100%',
																							height: '100%',
																						}}>
	              <TouchableWithoutFeedback>
                  <View style={{	backgroundColor: "#fff",
									position: 'absolute',
									left: '5%',
									right: '5%',
									height: '75%',
									top:'15%',
									padding: 10,
									}}>
                  <TouchableWithoutFeedback>
	              <View style={{height:50, flexDirection:'row'}}>
                         <TouchableOpacity onPress={this.showFollowers}style={{width:'50%',bordeColor:'gray', borderWidth:1, backgroundColor: this.state.isFollowersClicked ? 'black' : 'white', justifyContent:'center', alignItems:'center'}}>
                         <Text style={{color:this.state.isFollowersClicked ? 'white' : 'black', fontSize:15, fontWeight:'bold'}}>Followers</Text>
                         </TouchableOpacity>
                         <TouchableOpacity  onPress={this.showJoiners} style={{width:'50%', bordeColor:'gray', borderWidth:1, backgroundColor: this.state.isJoinersClicked ? 'black' : 'white', justifyContent:'center', alignItems:'center'}}>
                         <Text style={{color:this.state.isJoinersClicked ? 'white' : 'black', fontSize:15, fontWeight:'bold'}}>Joiners</Text>
                         </TouchableOpacity>
                    </View>
                      </TouchableWithoutFeedback>
					  <Content style={{padding:20}}>
							{ this.state.isFollowersClicked == true && 
								<Text style={{fontSize:20}}>{this.state.follow_msg}</Text>
							}
							{ this.state.isJoinersClicked == true && 
								<Text style={{fontSize:20}}>{this.state.join_msg}</Text>
							}
						</Content>
                      </View>
	              </TouchableWithoutFeedback>
	            </TouchableOpacity>
	          </TouchableWithoutFeedback>
	        </Modal>


			{/* edit user info */}
			<Modal
	          animationType={'fade'}
	          transparent={true}
	          visible={this.state.isEditInfoPopup}
	          presentationStyle={'overFullScreen'}
			  onRequestClose={()=> console.log('do nothing')}
	        >
	          <TouchableWithoutFeedback>
	            <TouchableOpacity onPress={() => this.setState({isEditInfoPopup:false})} style={{	backgroundColor: "rgba(0,0,0,0.6)",
																								 	position: 'absolute',
																								 	width:'100%',
																									height: '100%',}}>
	              <TouchableWithoutFeedback>
                  <View style={{ backgroundColor: "#fff",
       							 position: 'absolute',
								left: '5%',
								right: '5%',
								height: '75%',
								top:'15%',
								padding: 10,
							}}>
                  <TouchableWithoutFeedback>
	              <View style={{height:50, flexDirection:'row'}}>
                         <TouchableOpacity onPress={this.showFollowers}style={{width:'50%',bordeColor:'gray', borderWidth:1, backgroundColor: this.state.isFollowersClicked ? 'black' : 'white', justifyContent:'center', alignItems:'center'}}>
                         <Text style={{color:this.state.isFollowersClicked ? 'white' : 'black', fontSize:15, fontWeight:'bold'}}>Followers</Text>
                         </TouchableOpacity>
                         <TouchableOpacity  onPress={this.showJoiners} style={{width:'50%', bordeColor:'gray', borderWidth:1, backgroundColor: this.state.isJoinersClicked ? 'black' : 'white', justifyContent:'center', alignItems:'center'}}>
                         <Text style={{color:this.state.isJoinersClicked ? 'white' : 'black', fontSize:15, fontWeight:'bold'}}>Joiners</Text>
                         </TouchableOpacity>
                    </View>
                      </TouchableWithoutFeedback>
					  <Content style={{paddingHorizontal: 20, paddingVertical: 40}}>
							{ this.state.isFollowersClicked == true && 
								<TextInput multiline ={true} style={{fontSize:20}} value={this.state.follow_msg} onChangeText={(follow_msg) => this.setState({follow_msg})}></TextInput>
							}
							{ this.state.isJoinersClicked == true && 
								<TextInput  multiline ={true} style={{fontSize:20}} value={this.state.join_msg} onChangeText={(join_msg) => this.setState({join_msg})}></TextInput>
							}
						</Content>
						<TouchableOpacity onPress={()=> this.updateinfoText()} style={{justifyContent:'center', backgroundColor:'black', height:60,alignItems:'center'}}>
							<Text style={{color:'white', fontSize:20, fontWeight:'bold'}}>Submit</Text>
							</TouchableOpacity>
                      </View>
	              </TouchableWithoutFeedback>
	            </TouchableOpacity>
	          </TouchableWithoutFeedback>
	        </Modal>

							{this.state.isOwnerMenu && <TouchableOpacity onPress={()=> this.showOwnerMenu()}style={{top:0, right:0, left:0, bottom:0, position:'absolute', backgroundColor:'rgba(5, 4, 4, 0.45)'} }>
								<View style={{height:150, width:140, top:40, right:20,  position:'absolute',backgroundColor:'white'}}>
								<TouchableOpacity onPress={() => this._ImgPicker()} style={{justifyContent:'center', alignItems:'center', height:50}}>
									<Text style={{color:'black'}}>Change Cover</Text>
								</TouchableOpacity>
								<TouchableOpacity onPress={()=> this.goToRequest()}style={{justifyContent:'center', alignItems:'center', height:50}}>
									<Text style={{color:'black'}}>Manage Request</Text>
								</TouchableOpacity>
								<TouchableOpacity onPress={() => this.openEditInfoModal()} style={{justifyContent:'center', alignItems:'center', height:50}}>
									<Text style={{color:'black'}}>Edit Info</Text>
								</TouchableOpacity>
								</View>
								</TouchableOpacity>}
                
              </View>
        )
    

    }
}