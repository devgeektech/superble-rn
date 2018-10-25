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

import {Content, Spinner, Container, Header, Icon, Left, Body, Right, Button, Title,  Card, CardItem} from 'native-base';

import Constants from '../../../constants';
import axios from 'axios';

const screenHeight = Dimensions.get('window').height
const screenWidth = Dimensions.get('window').width

export default class searchBrand extends Component{

    constructor(props){
        super(props)

        this.state = {
            brandName: '',
            brandList: []
        }
        this.goBack = this.goBack.bind(this)
    }

    goBack() {
        this.props.onClickClose()
    }

    async brandSuggestions(text){
        this.setState({brandName: text})

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
  
                  return api.get(`brands/search?query=${text}`).then((response)=> {
                      this.setState({brandList: response.data.brands})
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
      


render(){
    return(
        <View style={{flex:1, flexDirection:'row', backgroundColor: '#fff'}}>
        <Container>
                    <Header style={{backgroundColor:'#A9BC4C'}}>
                        <View style={{width:'13%',alignItems:'flex-start', justifyContent:'center'}}>
                            <TouchableOpacity transparent onPress={()=> this.goBack()} >
                            <Icon name='arrow-back' style={{color:'black'}}/>
                            </TouchableOpacity>
                        </View>
                        <View style={{width:'74%',alignItems:'center', justifyContent:'center'}}>
                            <TextInput
                                style={{width:'100%',backgroundColor:'#fff', height:40,paddingLeft:10}}
                                placeholder='Brand'
                                autoFocus={true}
                                value={this.state.brandName}
                                onChangeText={(text)=> this.brandSuggestions(text)}
                                underlineColorAndroid='transparent'
                            />
                        </View>
                        <View style={{width:'13%',alignItems:'flex-end', justifyContent:'center'}}>
                            <TouchableOpacity transparent  onPress ={()=>this.props.onSelectText(this.state.brandName) } >
                            <Icon name='md-checkmark' style={{color:'black'}}/>
                            </TouchableOpacity>
                        </View>
                    </Header>

                    <Content>
	                {
                        this.state.brandList.map((v,i) =>{
                            return(
                            <TouchableOpacity key={v.id} style={{width: '100%',borderBottomColor:'#ccc', borderBottomWidth: 0.5, paddingVertical:20, paddingHorizontal:10}} 
                            onPress={()=> this.props.onSelectText(v.name)} > 
                                <Text style={{color:'black',fontWeight:'bold'}}>{v.name}</Text>
                            </TouchableOpacity>	)
                        })
                        
                    }

                    { this.state.brandList.length == 0 && this.state.brandName != '' &&
                        <View style={{flex:1, flexDirection: 'column',position:'relative',justifyContent: 'center',alignItems: 'center',}}>
                            <Text>No Brand matching your search</Text>
                        </View>
                    }
                    </Content>
	                
                    {/* <FlatList
							data={this.state.brandList}
							keyExtractor={(item, index) => index}
							renderItem={({item}) =>
							<TouchableOpacity style={{width: '100%',borderBottomColor:'#ccc', borderWidth: 0.5}} onPress={()=> this.props.onSelectText(item.name)} > 
							    <View style={{paddingVertical:20, paddingHorizontal:10}}>
                                    <Text>{item.name}</Text>
                                </View>
                            </TouchableOpacity>	
							}
						/> */}
	            </Container>
        </View>
    );  
}

}