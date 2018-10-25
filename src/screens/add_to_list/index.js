import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Image,
  FlatList,
  StyleSheet,AsyncStorage
} from 'react-native';
import { Content } from 'native-base';
import Constants from '../../constants/index'

const screenHeight = Dimensions.get('window').height
const screenWidth = Dimensions.get('window').width

class MyListItem extends React.PureComponent {
    _onPress = () => {
      this.props.onPressItem(this.props.id);
    };
  
    render() {
      const selectedIcon = this.props.selected ? require('../../assets/minus-sign.png') : require('../../assets/add.png');
      return (
        <TouchableOpacity onPress={this._onPress} style={{height:60, justifyContent:'space-between',alignItems:'center',flexDirection:'row'}}>
            <View style={{alignItems:'center',flexDirection:'row', flexWrap:'wrap', width:'92%'}}>
                <Image style={{height:50, width:50, borderRadius:25,marginRight:20}} source={this.props.image_url == null ? require('../../assets/like-superble.png') : {uri: this.props.image_url}}/>
                <Text style={{color:'black', width:'65%'}} >{this.props.title}</Text>
            </View>
            <Image style={{height:15, width:15}} source={selectedIcon}/>
        </TouchableOpacity>
      );
    }
  }

export default class AddToList extends Component{

    static navigationOptions = ({ navigation }) => {
       // const { params = {} } = navigation.state;
        return {
        title: 'Add to list',
        headerTintColor: 'gray',
        // headerLeft: <TouchableOpacity onPress ={()=> navigation.goBack()} style={{marginLeft:10}}>
        // <Image style={{height:20, width:30}}source={require('../../assest/icons/icon_left_arrow.png')} />
        // </TouchableOpacity>,
        headerLeft: <TouchableOpacity onPress = {() => navigation.goBack()} style={{marginLeft:10}}>
                        <Image style={{height:30, width:30}} source={require('../../assets/ic-cross.png')} />
                       
                    </TouchableOpacity>
        }
    };

    constructor(props){
        super(props);
        this.state={
            respone:[],
            isEmpty:false,
            selected: new Map(),

        }
    }

componentDidMount()
{

    const { params } = this.props.navigation.state;
        const productId = params ? params.item : null;
        this.setState({productId: productId})
      this.getProductList(productId)
}


getProductList(productId){

    AsyncStorage.getItem('isLoggedIn')
        .then( (value) => {
      AsyncStorage.getItem('deviceID').then((did)=>{
            if (did != null){
                fetch(Constants.url.base+`products/${productId}/product_discovery_list/`,{
                    method:'GET',
                    headers:{
                      'Authorization':'Token token='+value+';device_id='+did,
                      'Content-Type':'application/json'
                    },
                  }).then(response => response.json())
                  .then(responseData => {
                      this.setState({respone:responseData.product_discoveries})
                      if (responseData.product_discoveries.length < 1){
                          this.setState({isEmpty:true})
                      }else{
                        this.setState({isEmpty:false})
                      }
                  }).catch((err)=>
                {
                    console.log(err)
                });
            }

        })
    })
           
  
}
_onPressItem(discoveryid){
    AsyncStorage.getItem('isLoggedIn')
        .then( (value) => {
      AsyncStorage.getItem('deviceID').then((did)=>{
            if (did != null){
                fetch(Constants.url.base +`discoveries/${discoveryid}/add_products`,{
                    method:'PUT',
                    headers:{
                      'Authorization':'Token token='+value+';device_id='+did,
                      'Content-Type':'application/json'
                    },
                    body: JSON.stringify({
                        product_id: this.state.productId,
                        
                      })
                  }).then(response => response.json())
                  .then(responseData => {
                      this.getProductList(this.state.productId)
                      
                  }).catch((err)=>
                {
                    console.log(err)
                });
            }

        })
    })
}

_renderItem = ({item}) => (
    <MyListItem
      id={item.product_id}
      image_url={item.first_image_url}
       onPressItem={()=>this._onPressItem(item.discovery_id)}
      selected={!!this.state.selected.get(item.product_id)}
      title={item.title}
    />
  );


_keyExtractor = (item, index) => item.product_id;


goToArticleUpload=()=>{
   this.props.navigation.navigate('UploadArticleStep1') 
}

    render(){
        return(
            <View style={{flex:1}}>
            

       {this.state.isEmpty ? <View style={{flex:1,justifyContent:'center', width:screenWidth, alignItems:'center'}}> <Text style={{color:'gray', fontSize:22}}>No List Found !</Text>
              </View>
              : <FlatList style={{padding:20, backgroundColor:'white'}}
                    data={this.state.respone}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                />
        
       }    

            <TouchableOpacity onPress={this.goToArticleUpload} style={{height:50, bottom:0, position:'absolute', backgroundColor:'black', justifyContent:'center', alignItems:'center', width:screenWidth}}>
              <Text style={{color:'white', fontSize:25, fontWeight:'300'}}>ADD NEW LIST</Text>
                  </TouchableOpacity>
              </View>
        )
    

}
}