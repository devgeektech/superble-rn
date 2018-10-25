import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  AsyncStorage
} from 'react-native';

import Constants from '../../../constants';
import axios from 'axios';

import {Content, Spinner, Container, Header, Icon, Left, Body, Right, Button, Title,  Card, CardItem} from 'native-base';

const screenHeight = Dimensions.get('window').height
const screenWidth = Dimensions.get('window').width

export default class searchCategory extends Component{

    constructor(props){
        super(props)

        this.state = {
            categoryName: '',
            categoryList: []
        }
        this.goBack = this.goBack.bind(this)
    }

    goBack() {
        this.props.onClickClose()
    }

    async catSuggestions(text){
        this.setState({categoryName: text})

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
  
                  return api.get(`categories/search?text=${text}`).then((response)=> {
                      this.setState({categoryList: response.data.categories})
                  }).catch((error)=> {
                      alert(error.response.data.message)
                      console.log('got error', error.response)
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
      


render(){
    return(
        <View style={{flex:1, flexDirection:'row', backgroundColor: '#fff'}}>
        <Container>
                    <Header style={{backgroundColor:'#A9BC4C'}}>
                        <View style={{width:'13%',alignItems:'flex-start', justifyContent:'center'}}>
                            <TouchableOpacity onPress={()=> this.goBack()}>
                            <Icon name='arrow-back' style={{color:'black'}}/>
                            </TouchableOpacity>
                        </View>
                        <View style={{width:'74%',alignItems:'center', justifyContent:'center'}}>
                            <TextInput
                                style={{width:'100%',backgroundColor:'#fff', height:40,paddingLeft:10}}
                                placeholder='Category'
                                autoFocus={true}
                                value={this.state.categoryName}
                                onChangeText={(text)=> this.catSuggestions(text)}
                                underlineColorAndroid='transparent'
                            />
                        </View>
                        <View style={{width:'13%',alignItems:'flex-end', justifyContent:'center'}}>
                            <TouchableOpacity >
                            <Icon name='md-checkmark' style={{color:'black'}}/>
                            </TouchableOpacity>
                        </View>
                    </Header>
                    <Content>
	                {
                        this.state.categoryList.map((v,i) =>{
                            return(
                            <TouchableOpacity key={v.id} style={{width: '100%',borderBottomColor:'#ccc', borderBottomWidth: 0.5, paddingVertical:20, paddingHorizontal:10}} 
                            onPress={()=> this.props.onSelectText(v)} > 
                                <Text style={{color:'black',fontWeight:'bold'}}>{v.name}</Text>
                            </TouchableOpacity>	)
                        })
                        
                    }
                    { this.state.categoryList.length == 0 && this.state.categoryName != '' &&
                        <View style={{flex:1, flexDirection: 'column',position:'relative',justifyContent: 'center',alignItems: 'center',}}>
                            <Text>No Category matching your search</Text>
                        </View>
                    }
                    </Content>
	            </Container>
        </View>
    );  
}

}

