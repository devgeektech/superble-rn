import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
  ImageBackground,
  TextInput,
  ScrollView,
  Image,TouchableWithoutFeedback, Modal, 
  StyleSheet,AsyncStorage,Platform
} from 'react-native';
import { Container, Header, Left, Body, Right, Button, Icon, Title, H1, Label, Content, Card, CardItem, Spinner } from 'native-base';


const screenHeight = Dimensions.get('window').height
const screenWidth = Dimensions.get('window').width

import axios from 'axios';
import Constants from '../../constants';
const backBtn = Platform.OS == "ios" ? {justifyContent:'center', alignItems:'center',height:20,padding:10, margin:10, width:20} : { margin: 10 }

export default class PrivateTagRequest extends Component{

    static navigationOptions = ({ navigation }) => {
       const { params = {} } = navigation.state;
        return {
        headerTitle:'New Requests',
        headerTintColor: 'black',
        headerStyle: {
			
			backgroundColor:'white'
            
        },
        headerTitleStyle :{ alignSelf: 'center',
		textAlign: 'center'},
		headerLeft: 	<TouchableOpacity style={backBtn} onPress={()=> navigation.goBack()} >
							<Image style={{height:20,padding:10, margin:10, width:20}}source ={require('../../assets/cross3.png')}/>
                        </TouchableOpacity>,
        
     
        }
    };

    constructor(props){
        super(props);
        this.state ={
            requestData: [],
              tagId:''
			
   
        }
    }

    componentWillMount(){
        this.fetchTagRequest()
    }


  fetchTagRequest(){
	AsyncStorage.getItem('isLoggedIn')
    .then( (value) => {
    if(value === null) {
          return this.props.navigation.navigate('Account');
     } else {
        AsyncStorage.getItem('deviceID').then((did)=>{
            if (did === null){
                return this.props.navigation.navigate('Account');
            }else{
                fetch(Constants.url.base + `user_tags/owned_tags?status=1`, {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Token token='+value+';device_id=' + did,
                      // 'Authorization': 'Token token=bb6b2728-ceb4-4b19-b9ec-833b0e66a7d3;device_id='+device_id,
                      'Content-Type': 'application/json',
                    },
                   
                })
                .then(response => response.json())
                .then(responseData => {
                    this.setState({requestData:responseData.tags, isDataGet:true})
                });
            }
      
        })
       }
  });
  }

  acceptOrRejectRequestWith(id, requestType){
	AsyncStorage.getItem('isLoggedIn')
    .then( (value) => {
    if(value === null) {
          return this.props.navigation.navigate('Account');
     } else {
        AsyncStorage.getItem('deviceID').then((did)=>{
            if (did === null){
                return this.props.navigation.navigate('Account');
            }else{
                const { params } = this.props.navigation.state
                fetch(Constants.url.base + `user_tags/${id}/${requestType}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': 'Token token='+value+';device_id=' + did,
                      // 'Authorization': 'Token token=bb6b2728-ceb4-4b19-b9ec-833b0e66a7d3;device_id='+device_id,
                      'Content-Type': 'application/json',
                    },
                    
                })
                .then(response => response.json())
                .then(responseData => {
                    this.fetchTagRequest()
                   
                });
            }
      
        })
       }
  });
  }






    render(){
		const { params } = this.props.navigation.state
        return(
            <ScrollView style={{flex:1}}>
            {
            this.state.requestData.map((value,index)=>{
                return(
                    <View style={{height:80,flexDirection:'row', alignItems:'center', justifyContent:'space-around'}}>
                        <Image style={{height:70, width:70, borderRadius:35}}source={{uri: value.user_image}}/>
                        <Text style={{color:'black', width:180}}>{value.user_name}</Text>
                        <View style={{width:50,flexDirection:'row', alignItems:'center', justifyContent:'space-around'}}>
                           <TouchableOpacity onPress={()=> this.acceptOrRejectRequestWith(value.id, 'accept')}>
                               <Image style={{height:22, width:22,}}source={require('../../assets/ic-selected.png')}/>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={()=> this.acceptOrRejectRequestWith(value.id, 'reject')}>
                              <Image style={{height:15, marginLeft:6, width:15,}}source={require('../../assets/cross3.png')}/>
                            </TouchableOpacity>
                        </View>
                        </View>
                       
                );
            })}
              </ScrollView>
        )
    

    }
}