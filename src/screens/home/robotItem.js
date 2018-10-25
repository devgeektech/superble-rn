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
import styles from './homeStyle';
const { width } = Dimensions.get('window');
import axios from 'axios';
import Constants from '../../constants';
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const isFirstProduct = null
export default class RobotItem extends React.Component {
  scrollX = new Animated.Value(0);
  constructor(props) {
    super(props);
    this.recordContent = this.props.record.content;
    var count = this.props.count;
    var isLoggedIn = this.props.isLoggedIn;

    this.state = {
      status: true,
      likedHeart: false,
      isLoggedIn: isLoggedIn,
      isFallowing: false,
      reloadData: this.props.callback,
      isDislike: false,
      productArr: [],
      arraCount: count,
      isFirstProduct: null,
      userData: this.props.userData,
      deviceID: this.props.deviceID
    };
  }

  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    }
  }

  likePost = (itemID) => {
    if (this.state.isLoggedIn === null) {
      return this.props.navigate('Account');
    } else {
      if (this.state.userData) {
        var userId = (this.state.userData.profile_object.id);
        if (this.recordContent.user_id != userId) {
          let { likedHeart } = this.state
          this.setState({ likedHeart: !likedHeart })
          var statusData = likedHeart ? { status: 'nolike' } : { status: 'like' };
          const api = axios.create({
            baseURL: Constants.url.base,
            timeout: 0,
            responseType: 'json',
            headers: {
              'Authorization': 'Token ' + this.state.isLoggedIn + ';device_id=' + this.state.deviceID
            }
          });

          api.post('products/' + itemID + '/likes', statusData).then((res) => {
            if (res.ok) {

            }
          }).catch((error) => {


          })
        } else {
          alert("You can't like your own product");
        }
      }
    }


  }

  articleClick(event) {
    this.props.navigate('Article', { item: event, isHomeVC: true, callback: this.state.reloadData });
  }

  RemovePost(itemID) {
    this.setState({ status: false });
    if (this.state.isLoggedIn === null) {
      return this.props.navigate('Account');
    } else {
      let statusData = { status: 'unlike' };
      const api = axios.create({
        baseURL: Constants.url.base,
        timeout: 0,
        responseType: 'json',
        headers: {
          'Authorization': 'Token ' + this.state.isLoggedIn + ';device_id=' + this.state.deviceID
        }
      });

      api.post('products/' + itemID + '/likes', statusData).then((res) => {
      }).catch((error) => {
        console.log("HERE IS PROBLEM", error.response)
      })
    }
  }

  followLink(event) {
    if (this.state.isLoggedIn === null) {
      return this.props.navigate('Account');
    } else {
      if (this.state.isFallowing) {
        if (this.state.userData) {
          var arr = this.state.userData.profile_object.user_topics
          if (arr.length > 3) {
            fetch(Constants.url.base + "categories/" + event + "/unfollow", {
              method: 'DELETE',
              headers: {
                'Authorization': 'Token token=' + this.state.isLoggedIn + ';device_id=' + this.state.deviceID,
                'Content-Type': 'application/json'
              },
            }).then((res) => {
              if (res.ok) {
                if (this.state.userData) {
                  var userData = this.state.userData
                  var arr = userData.profile_object.user_topics
                  for (let i in arr) {
                    if (arr[i].id == event) {
                      arr.splice(i, 1)
                      userData.profile_object.user_topics = arr
                      AsyncStorage.setItem('loggedinUserData', JSON.stringify(userData))
                      this.setState({ isFallowing: !this.state.isFallowing })
                      this.state.reloadData()
                    }
                  }
                }
              }
            }).catch((e) => {
              console.log('error is here', e)
            })
          } else {
            alert('You need to follow atleast 3 topics')
          }
        }
      } else {
        fetch(Constants.url.base + "categories/" + event + "/follow", {
          method: 'POST',
          headers: {
            'Authorization': 'Token token=' + this.state.isLoggedIn + ';device_id=' + this.state.deviceID,
            'Content-Type': 'application/json'
          },
        }).then((res) => {
          if (res.ok) {
            if (this.state.userData) {
              var userData = this.state.userData
              var arr = userData.profile_object.user_topics
              arr.push({ id: event })
              userData.profile_object.user_topics = arr
              AsyncStorage.setItem('loggedinUserData', JSON.stringify(userData))
              this.setState({ isFallowing: !this.state.isFallowing })
              this.state.reloadData()
            }
          }
        }).catch((e) => {
          console.log('error is here', e)
        })
      }
    }
  }



  onTagClicked = (item) => {
    if (item.private_tag) {
      this.props.navigate('PrivateTag', { item: item })
    } else {
      this.props.navigate('Search', { item: item.name })
    }
  }

  productClick(event) {

    this.props.navigate('Product', { item: event, isHomeVC: true, screenName: 'home', callback: this.state.reloadData });
  }


  _closeModal = () => {

    let isFirst = {
      isFirstTime: true
    };

    AsyncStorage.setItem('isFirstTimeProduct', JSON.stringify(isFirst), () => {
      AsyncStorage.getItem('isFirstTimeProduct', (err, result) => {
      });

    });

    this.setState({ isModalOpen: false })
  }
  componentDidMount() {
    AsyncStorage.getItem('isFirstTimeProduct').then((value) => {

      if (value === null) {
        this.setState({ isModalOpen: true })
      } else {
        let userData = JSON.parse(value)
        this.setState({ isModalOpen: !userData.isFirstTime })
      }
    })

    if (this.recordContent.type != null) {
      if (this.recordContent.type === 'product') {
        var arr = []
        if (isFirstProduct === true) {

        } else {
          this.state.productArr.push(this.recordContent)
          isFirstProduct = true
        }


      }

      this.setState({ likedHeart: this.recordContent.is_liked })
      this.setState({ status: !this.recordContent.is_disliked })
      AsyncStorage.getItem('loggedinUserData')
        .then((userdata) => {
          userdata = JSON.parse(userdata)
          var topicArr = []
          if (userdata) {
            for (var i of userdata.profile_object.user_topics) {
              topicArr.push(i.id)
            }
            if (topicArr.indexOf(this.recordContent.parent_category_id) != -1) {
              this.setState({ isFallowing: true })
            } else {
              this.setState({ isFallowing: false })
            }
          }
        });
    }



  }

  render() {
    let title = desc = img = singleImg = tags = fallowVar = '';
    let temparr = [];
    let imgArr = [];

    if (this.state.isFallowing) {
      fallowVar = 'following';
    } else {
      fallowVar = 'follow';
    }

    let heart, heartIconColor;
    if (this.state.likedHeart == true) {

      heart = <Image style={{ width: 25, marginRight: 10, height: 25 }} source={require('../../assets/ic-like-red.png')} />
      heartIconColor = 'red';
    } else {
      heart = <Image style={{ width: 25, marginRight: 10, height: 25 }} source={require('../../assets/ic-like.png')} />
      heartIconColor = 'black';
    }

    /* Render titles */
    if (this.recordContent.type != null) {
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
        // title = this.recordContent.product_titles[0];
        title = this.recordContent.title;
      }
    }


    /* Render images */
    var showDots = false;
    singleImg = this.recordContent.first_image_url;
    if (this.recordContent.image_urls !== undefined) {
      imgArr.push(this.recordContent.image_urls);
      showDots = true;
    } else {
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

    // AsyncStorage.getItem('loggedinUserData')
    //   .then((value) => {
    //     if (value !== null) {
    //       var dataJson = JSON.parse(value);

    //       var userId = (dataJson.profile_object.id);

    //       var likeArr = this.recordContent.likes;
    //       if (likeArr != undefined && likeArr != null && userId != '') {
    //         //alert(likeArr);
    //         //alert(userId);
    //         if (likeArr.includes(3014)) {
    //           this.setState({ likedHeart: true })
    //         }
    //       }
    //     }
    //   });


    return (
      <View style={[styles.cardContainer]}>

        <View style={{ alignItems: 'center' }}>

          {/* Product images */}
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

          {this.recordContent.type != null && this.recordContent.type != 'product' &&
            <ScrollView>
              <TouchableOpacity onPress={() => this.articleClick(this.recordContent.discovery_id)}>
                <Image style={[styles.cardImage]} source={{ uri: singleImg }} />
                <Image style={{ position: 'absolute', height: '100%', width: '100%' }} source={require('../../assets/overlayimg.png')} />
              </TouchableOpacity>
            </ScrollView>
          }
        </View>
        {/* Product content */}
        {(this.recordContent.type != null && this.recordContent.type == 'product' && this.state.status !== false) &&
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

        {this.state.isModalOpen && this.state.productArr.length == 1 && this.state.status !== false &&
          <TouchableOpacity onPress={() => this._closeModal()} style={{ top: 0, bottom: 0, left: 0, zIndex: 999, right: 0, height: 600, width: deviceWidth, position: 'absolute', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <View style={{ flexDirection: 'row', marginLeft: 50, margin: 25 }}>
              <Text style={{ color: 'white', fontSize: 16 }}>Follow to see more {'\n'}product like this</Text>
              <Image source={require('../../assets/arrow-notification.png')} />
              <View style={{ backgroundColor: 'white', height: 35, width: 90, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: 'black' }}>Following
            </Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Image style={{ width: 60, height: 60, marginLeft: 25 }} source={require('../../assets/tap-left.png')} />
              <Image style={{ width: 7, height: 200 }} source={require('../../assets/line.png')} />
              <Image style={{ width: 60, height: 60, marginRight: 25 }} source={require('../../assets/tap-right.png')} />
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Image style={{ marginTop: 15, width: 200, height: 7 }} source={require('../../assets/line2.png')} />
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'white', marginTop: 10, fontSize: 16, }}>TAP TO SEE MORE</Text>
              <Image style={{ width: 59, marginTop: 20, height: 73 }} source={require('../../assets/tap-more.png')} />
            </View>
          </TouchableOpacity>
        }
      </View>
    );
  }
}
