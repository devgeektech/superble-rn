import React, { Component } from 'react';
import {
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  AsyncStorage
} from 'react-native';
import { Container, Header, Left, View, Body, Right, Button, Icon, Title, H1, H2, H3, Label, Content, Card, CardItem, Spinner } from 'native-base';
//import Hyperlink from 'react-native-hyperlink';
import Swiper from 'react-native-swiper';
import styles from '../home/homeStyle';
import axios from 'axios';
import Constants from '../../constants';
const { width } = Dimensions.get('window');

import { EventRegister } from 'react-native-event-listeners'

export default class PrivateTagRobotItem extends React.Component {
  scrollX = new Animated.Value(0);
  constructor(props) {
    super(props);
    this.recordContent = this.props.record;
    var count = this.props.count;
    var isLoggedIn = this.props.isLoggedIn;
    this.state = {
      status: true,
      likedHeart: false,
      isLoggedIn: isLoggedIn,
      isFallowing: false,
    };
  }

  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    }
  }

  likePost = (itemID) => {
    AsyncStorage.getItem('isLoggedIn')
      .then((value) => {
        if (value === null) {
          return this.props.navigate('Account');
        } else {
          AsyncStorage.getItem('deviceID').then((did) => {
            AsyncStorage.getItem('loggedinUserData').then((user_data) => {
              if (user_data !== null) {
                var dataJson = JSON.parse(user_data);

                var userId = (dataJson.profile_object.id);
                if (this.recordContent.user_id != userId) {
                  let { likedHeart } = this.state
                  this.setState({ likedHeart: !likedHeart })
                  var statusData
                  if (likedHeart == false) {
                    statusData = { status: 'like' };
                  } else {
                    statusData = { status: 'nolike' };
                  }

                  const api = axios.create({
                    baseURL: Constants.url.base,
                    timeout: 0,
                    responseType: 'json',
                    headers: {
                      'Authorization': 'Token ' + value + ';device_id=' + did
                    }
                  });

                  api.post('products/' + itemID + '/likes', statusData).then((res) => {
                    if (res.ok) {

                    }
                  }).catch((error) => {
                    console.log("HERE IS PROBLEM", JSON.stringify(error))
                  })
                } else {
                  alert("You can't like your own product");
                }
              }
            })
          })
        }
      });


  }

  articleClick(event) {
    this.props.navigate('Article', { item: event });
  }

  RemovePost(itemID) {
    AsyncStorage.getItem('isLoggedIn')
      .then((value) => {
        if (value === null) {
          return this.props.navigate('Account');
        } else {
          AsyncStorage.getItem('deviceID').then((did) => {

            let statusData = { status: 'unlike' };

            const api = axios.create({
              baseURL: Constants.url.base,
              timeout: 0,
              responseType: 'json',
              headers: {
                'Authorization': 'Token ' + value + ';device_id=' + did
              }
            });

            api.post('products/' + itemID + '/likes', statusData).then((res) => {
              this.setState({ status: false });

            }).catch((error) => {
              console.log("HERE IS PROBLEM", error.response)
            })
          })
        }
      });
  }
  followLink(event) {
    AsyncStorage.getItem('isLoggedIn')
      .then((value) => {
        if (value === null) {
          return this.props.navigate('Account');
        } else {
          AsyncStorage.getItem('deviceID').then((did) => {
            if (this.state.isFallowing) {
              AsyncStorage.getItem('loggedinUserData').then((userData) => {
                if (userData != null) {
                  userData = JSON.parse(userData)
                  var arr = userData.profile_object.user_topics
                  if (arr.length > 3) {
                    fetch(Constants.url.base + "categories/" + event + "/unfollow", {
                      method: 'DELETE',
                      headers: {
                        'Authorization': 'Token token=' + value + ';device_id=' + did,
                        'Content-Type': 'application/json'
                      },
                    }).then((res) => {
                      if (res.ok) {
                        AsyncStorage.getItem('loggedinUserData').then((userData) => {
                          if (userData != null) {
                            userData = JSON.parse(userData)
                            var arr = userData.profile_object.user_topics
                            for (let i in arr) {
                              if (arr[i].id == event) {
                                arr.splice(i, 1)
                                userData.profile_object.user_topics = arr
                                AsyncStorage.setItem('loggedinUserData', JSON.stringify(userData))
                                this.setState({ isFallowing: !this.state.isFallowing })
                                EventRegister.emit('followUnfollow', 'data')
                              }
                            }

                          }
                        })
                      }
                    }).catch((e) => {
                      console.log('error is here', e)
                    })
                  } else {
                    alert('You need to follow atleast 3 topics')
                  }
                }
              })


            } else {
              fetch(Constants.url.base + "categories/" + event + "/follow", {
                method: 'POST',
                headers: {
                  'Authorization': 'Token token=' + value + ';device_id=' + did,
                  'Content-Type': 'application/json'
                },
              }).then((res) => {
                if (res.ok) {
                  AsyncStorage.getItem('loggedinUserData').then((userData) => {
                    if (userData != null) {
                      userData = JSON.parse(userData)
                      var arr = userData.profile_object.user_topics
                      arr.push({ id: event })
                      userData.profile_object.user_topics = arr
                      AsyncStorage.setItem('loggedinUserData', JSON.stringify(userData))
                      this.setState({ isFallowing: !this.state.isFallowing })
                      EventRegister.emit('followUnfollow', 'data')
                    }
                  })
                }
              }).catch((e) => {
                console.log('error is here', e)
              })
            }

          })
        }
      });
  }


  productClick(event) {
    this.props.navigate('Product', { item: event, screenName: 'private_tag' });
  }

  componentDidMount() {
    this.setState({ likedHeart: this.recordContent.is_liked })
    this.setState({ status: !this.recordContent.is_disliked })
    AsyncStorage.getItem('loggedinUserData')
      .then((userdata) => {
        userdata = JSON.parse(userdata)
        var topicArr = []
        for (var i of userdata.profile_object.user_topics) {
          topicArr.push(i.id)
        }
        if (topicArr.indexOf(this.recordContent.parent_category_id) != -1) {
          this.setState({ isFallowing: true })
        } else {
          this.setState({ isFallowing: false })
        }
      });
  }
  onTagClicked = (item) => {
    if (item.private_tag) {
      this.props.navigate('PrivateTag', { item: item.name })
    } else {
      this.props.navigate('Search', { item: item.name })
    }
  }
  render() {
    let title = desc = img = singleImg = tags = fallowVar = '';
    let temparr = [];
    let imgArr = [];
    if (this.state.isFallowing) {
      fallowVar = 'Following';
    } else {
      fallowVar = 'Follow';
    }

    let heart, heartIconColor;
    if (this.state.likedHeart == true) {

      heart = <Image style={{ width: 25, marginRight: 10, height: 25 }} source={require('../../assets/ic-like-red.png')} />
      heartIconColor = 'red';
    } else {
      heart = <Image style={{width: 25, marginRight: 10, height: 25 }} source={require('../../assets/ic-like.png')} />
      heartIconColor = 'black';
    }

    /* Render titles */
    if (this.recordContent.type == 'product') {
      title = this.recordContent.title;
      desc = this.recordContent.description;
      tags = (this.recordContent.tags_object);
      for (let i in tags) {
        temparr.push(tags[i])
        // alert(tags[i])
      }

      brand_name = this.recordContent.brand_name;
      // this.recordContent.likes_count ? likes_count = this.recordContent.likes_count : likes_count=0
    } else {
      title = this.recordContent.title;
    }

    /* Render images */
    var showDots = false;
    singleImg = this.recordContent.first_image_url;
    if (this.recordContent.image_urls !== undefined) {
      imgArr.push(this.recordContent.image_urls);
      showDots = true;
    } else {
      // img = this.recordContent.image_url;
      imgArr.push(this.recordContent.image_url);
    }
    // Duplicate product images
    var duplicateData = this.recordContent.duplicate_products;
    if (duplicateData !== undefined) {
      duplicateData.map((item, i) => {
        showDots = true;
        imgArr.push(item.image_url);
      });
    }
    let position = Animated.divide(this.scrollX, width);

    return (

      <View style={[styles.cardContainer]}>
      <View style={{ alignItems: 'center' }}>
        {/* Product top text */}
        {(this.recordContent.type != null && this.recordContent.type == 'product' && this.state.status !== false) &&
             <View style={{ flex: 1, paddingBottom: 15, flexDirection: 'row' }}>
             <View style={{ width, borderTopWidth:0, borderTopColor: '#E2e2e2', elevation: 4, shadowColor: '#ccc', shadowOffset: { height: 4 }, shadowOpacity: 0.8, shadowRadius: 5, }}>
               <ScrollView horizontal={true} pagingEnabled={true} showsHorizontalScrollIndicator={false}
                 onScroll={Animated.event(
                   [{ nativeEvent: { contentOffset: { x: this.scrollX } } }]
                 )}
                 scrollEventThrottle={16}
                 >
                 {
                   imgArr.map((item, index) => (
                     <TouchableOpacity key={item} style={{}} onPress={() => this.productClick(this.recordContent.product_id)}>
                       <Image style={[styles.cardImage, { marginTop: 5 }]} source={{ uri: item }} />
                       <Image style={{ position: 'absolute', height: '100%', width: '100%' }} source={require('../../assets/overlayimg.png')} />
                     </TouchableOpacity>
                   ))
                 }
               </ScrollView>

               {/* Product top text follow/unfollow */}
               {/* // */}
               {(this.recordContent.type != null && this.recordContent.type == 'product' && this.state.status !== false) &&
                 <View style={styles.parentCat}>
                   <Left>
                     <Text
                       style={{ color: 'black', marginLeft: 0, fontSize: 16 }}>
                       {this.recordContent.parent_category_name}
                     </Text>
                   </Left>
                   <Right>
                     <Text
                       style={[styles.followLink, { color: 'black', fontSize: 16, paddingRight: 0, marginTop: -11 }]}
                       onPress={() => this.followLink(this.recordContent.parent_category_id)}>
                       {fallowVar}
                     </Text>
                   </Right>
                 </View>
               }

               {showDots == true &&
                 <View style={{ width: '100%', flexDirection: 'row', position: 'absolute', alignItems: 'center', justifyContent: 'center', zIndex: 999, bottom: 18 }}>

                   {imgArr.map((_, i) => {
                     let opacity = position.interpolate({
                       inputRange: [i - 1, i, i + 1],
                       outputRange: [0.3, 1, 0.3],
                       extrapolate: 'clamp'
                     });
                     return (
                       <Animated.View
                         key={i}
                         style={{ opacity, height: 11, width: 10, backgroundColor: '#ffffff', marginLeft: 4, marginBottom: 10, borderRadius: 5 }}
                         />
                     );
                   })}

                 </View>
               }
             </View>
           </View>
          }

          {this.recordContent.type != 'product' &&
           <ScrollView>
           <TouchableOpacity onPress={() => this.articleClick(this.recordContent.discovery_id)}>
             <Image style={[styles.cardImage]} source={{ uri: singleImg }} />
             <Image style={{ position: 'absolute', height: '100%', width: '100%' }} source={require('../../assets/overlayimg.png')} />
           </TouchableOpacity>
         </ScrollView>
          }
        </View>
        {/* Product content */}
        {(this.recordContent.type == 'product' && this.state.status !== false) &&
                  <View style={styles.socialSection}>

                  <TouchableOpacity style={{}} activeOpacity={.5} onPress={() => this.likePost(this.recordContent.product_id)}>
                    {heart}
                  </TouchableOpacity>
      
                  <TouchableOpacity activeOpacity={.5} onPress={() => this.RemovePost(this.recordContent.product_id)}>
                    <Image style={{ width: 25, height: 25 }} source={require('../../assets/ic-dislike.png')} />
                  </TouchableOpacity>
                </View>
        }
        {this.recordContent.type != null && this.recordContent.type == 'product' && this.state.status !== false ?
          <View style={{ paddingHorizontal: 15 }}>
            <Text style={{ fontSize: 18, color: '#303030', padding: 0 }}>
              {title.length > 40 && (brand_name + ' - ' + title.slice(0, 40) + "...")}
              {title.length <= 40 && (brand_name + ' - ' + title)}
            </Text>
          </View>
          :
          <View style={styles.discoverText}>
            {title.length <= 50 &&
              <TouchableOpacity onPress={() => this.articleClick(this.recordContent.discovery_id)}>
                <Text style={styles.discoverTextFormat}>
                  {title}
                </Text>
              </TouchableOpacity>
            }

            {title.length > 50 &&
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>
                {title}
              </Text>
            }

          </View>}
          
          {(this.recordContent.type != null && this.recordContent.type == 'product' && this.state.status !== false) &&
          <View style={{ paddingHorizontal: 15, paddingBottom: 10 }} >
            <Text style={styles.subTitleProduct}>
              {desc.length > 92 && (desc.slice(0, 92) + "...")}
              {desc.length <= 92 && (desc)}
            </Text>
          </View>
        }
        {/* Product tags */}
        {(this.recordContent.type != null && this.recordContent.type == 'product' && this.state.status !== false) &&
          <View style={{ marginLeft: 2, paddingHorizontal: 15, paddingBottom: 20 }}>
            <View style={{ flexWrap: 'wrap', flexDirection: 'row' }}>
              {temparr.map((i, v) =>
                <TouchableOpacity key={'hashtag' + v} onPress={() => this.onTagClicked(i)}>
                  <Text style={styles.tags}>{'#' + i.name} </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        }

        
        {/* End */}
      </View>
    );
  }
}
