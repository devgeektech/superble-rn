
import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Image, Alert, ActivityIndicator,AsyncStorage,
    Text,ScrollView, Dimensions, TouchableOpacity, FlatList, TouchableHighlight, Linking, TouchableWithoutFeedback
} from 'react-native';
import axios from 'axios';
import Constants from '../../constants';
import { api } from '../../helpers';
import styles from './topicStyle';
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

import GridView from 'react-native-super-grid';
export default class Topic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: this.props.loaded,
            topics: [],
            routes: [],
            categoryId:this.props.categoryId,
        }
    }

    componentDidMount() {
        this.setState({topics:this.props.topics})
    }

    openUpdateProfile = data =>{
        this.props.onUpdate()
    }

    showDetails = (topic) => {
        if(topic.is_discovery_list){
            this.props.navigator.navigate('Article',{ item: topic.id });
        }else{
            this.props.navigator.navigate('Product',{ item: topic.product_id, screenName:'profile',"onUpdate": this.openUpdateProfile})   
        }
    }

    render() {
        if (this.state.loaded) {
            if (this.props.topics != undefined){ 
                 if (this.props.topics.length > 0) {
                return (
                <View style={{ flex:1,backgroundColor:'#fff'}}>
                    <GridView
                        itemDimension={130}
                        items={this.props.topics}
                        style={gridStyles.gridView}
                        renderItem={topic => (
                            <TouchableOpacity onPress={()=> this.showDetails(topic)} style={[gridStyles.itemContainer, { backgroundColor: '#FFFFFF' }]}>
                                {topic.is_discovery_list && <Image style={gridStyles.imageStyle2} source={{ uri: topic.first_image_url }} />}
                                {!topic.is_discovery_list && <Image style={gridStyles.imageStyle} source={{ uri: topic.image_url }} />}
                                {!topic.is_discovery_list && <Text style={gridStyles.itemName} numberOfLines={1}>{(topic.brand_name ? topic.brand_name : topic.brand.name) + ' - ' + (topic.title ? topic.title : topic.product.title)}</Text>}
                                {topic.is_discovery_list && 
                                    <View style={{backgroundColor:'color: rgba(0, 0, 0, 0.5);',position: 'absolute', top:0, left:0,right:0, bottom:0,width:'100%', height:'100%', justifyContent:'center', alignItems:'center', flexWrap:'wrap', flexDirection:'row' }}>
                                        <Text style={gridStyles.itemName2}>{topic.title}</Text>
                                    </View>
                                }
                            </TouchableOpacity>
                        )}
                    />
                    </View>
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
        // marginTop: 10,
        paddingBottom: 0,
    },
    itemContainer: {
         flex:1,
        borderRadius: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: 185,
		elevation:4
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
        paddingHorizontal: 4,
        paddingTop:3,
        paddingBottom:5,
        fontSize: 16,
        color: '#303030',
        textAlign:'left',
        width:'100%'
    },
    itemName2: {
        padding: 10,
        fontSize: 18,
        color: '#fff',
		marginTop:5
    },
    itemCode: {
        fontWeight: '600',
        fontSize: 12,
        color: '#000',
    },
});