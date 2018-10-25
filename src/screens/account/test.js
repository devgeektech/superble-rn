import React from 'react';
import {Dimensions, Image, Modal, StyleSheet, Text,Switch, TouchableWithoutFeedback, View, TouchableOpacity } from 'react-native';
import { Button, Container, Content, Form, H1, H2, Header, Item, Input, Label, Icon } from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
import styles from './accountStyle';
import {LoginManager} from 'react-native-fbsdk';
import {GoogleSignin} from 'react-native-google-signin';
// import { Switch } from 'react-native-switch';
import InstagramLogin from 'react-native-instagram-login';
import Ins from 'react-native-instagram-login';

var ImagePicker = require('react-native-image-picker');
// More info on all the options is below in the README...just some common use cases shown here
var options = {
  title: 'Select Avatar',
  customButtons: [
    {name: 'fb', title: 'Choose Photos from Facebook'},
  ],
  storageOptions: {
    skipBackup: true,
    path: 'images'
  }
};


const deviceWidth  = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const API = 'https://api-dev.superble.com/api/v1';

export default class Account extends React.Component {

  static navigationOptions = ({ navigation }) => {
    return {
      header: null
    }
  }
  getPhotos = () => {
    // Open Image Library:
    ImagePicker.launchImageLibrary(options, (response)  => {
      // Same code as in above section!
    });
  }

 fbAuth = () => {
    LoginManager.logInWithReadPermissions(['public_profile','email','user_birthday']).then(
      (result) => {
        if (result.isCancelled) {
          console.log('Login was cancelled');
        } else {
             this.setState({isLoggedIn: true});
        }
      },
      function (error) {
        console.log('Login failed with error: ' + error);
      }
    );
  }
  constructor(props){
    super(props);
    this.state = {
      syncData: false,
      token: null,
      syncDataScreen2: false,
      syncDataScreen3: true,
       photos: [],
     
    }
  }
  loggedOutUser = () => {
   alert(LoginManager.logOut());
    alert('logoutUser');
  }
  setModalVisibleSyncData(visible) {
    this.setState({syncData: visible});
  } 
  setModalVisibleSyncDataScreen(visible) {
    this.setState({syncData: false});
    this.setState({syncDataScreen2: visible});
  } 
   setModalVisibleSyncDataScreen3(visible) {
    this.setState({syncData: false});
    this.setState({syncDataScreen3: visible});
  } 
  render() {
 
    return (
    <Container>
        <View style={{flex:1,flexDirection: 'column'}}>
            <Modal
              animationType={'fade'}
              transparent={true}
              visible={this.state.syncData}
              presentationStyle={'overFullScreen'}
              onRequestClose={() => {this.setModalVisibleSyncData(!this.state.syncData)}}
            >
              <TouchableWithoutFeedback onPress={() => { this.setModalVisibleSyncData(!this.state.syncData) }}>
                <View style={styles.syncDatatMainView}>
                  <TouchableWithoutFeedback>
                    <View style={styles.syncDataStyle}>
                      <Container>
                      <H2 style={styles.syncDataHeader}>Sync your accounts and start earning now</H2>
                        <Content >
                          <View style={styles.imageCommentWrap}>                          
                              <View style={styles.avatarContainer}>
                                <Image style={styles.facebookIcon} source={require('../../assets/facebook1.png')} />
                              </View>                         
                              <View style={styles.contentContainer}>
                                <Text>Facebook</Text>
                              </View>
                              <View style={styles.likeImgContainer}>
                                   <Switch
                                      value={false}
                                      onValueChange={(val) => this.fbAuth(val)}
                                    />
                              </View> 

                          </View>
                          <View style={styles.imageCommentWrap}>                          
                              <View style={styles.avatarContainer}>
                                <Image style={styles.facebookIcon} source={require('../../assets/instagram1.png')} />
                              </View>                         
                              <View style={styles.contentContainer}>
                                <Text>Instagram</Text>
                              </View>
                              <View style={styles.likeImgContainer}>
                                  
                                  <Switch
                                      value={false}
                                      onValueChange={(val) => this.refs.ins.show()}
                                    />
                                    <Ins
                                      ref='ins'
                                      clientId='0656207d48c64a98b6dcdaac4fa8b8b1'
                                      scopes={['public_content+follower_list']}
                                      onLoginSuccess={(token) => {alert(token);}}
                                      onLoginFailure={(data)  => {alert('fail-'+data);}}
                                    />
                                    
                              </View> 

                          </View>
                          <View style={styles.imageCommentWrap}>                          
                              <View style={styles.avatarContainer}>
                               <Image style={styles.facebookIcon} source={require('../../assets/pinterest1.png')} />
                              </View>                         
                              <View style={styles.contentContainer}>
                                <Text>Pinterest</Text>
                              </View>
                              <View style={styles.likeImgContainer}>
                                  <Switch
                                      value={false}
                                      onValueChange={(val) => console.log(val)}
                                    />
                              </View> 

                          </View>

                          <View style={styles.nextButtonWrap}>    
                            <View style={styles.buttonContainer}>     
                              <Button
                                  style={styles.buttonStyleNext}
                                  onPress={() => { this.setModalVisibleSyncDataScreen2(!this.state.syncDataScreen2) }}
                                ><Text style={styles.buttonStyleText}>Next</Text>
                              </Button>
                            </View>
                          </View>
                            
                        </Content>
                      </Container>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>

            <Modal
              transparent={true}
              visible={this.state.syncDataScreen2}
              presentationStyle={'overFullScreen'}
              onRequestClose={() => {this.setModalVisibleSyncDataScreen2(!this.state.syncDataScreen2)}}
            >
              <TouchableWithoutFeedback onPress={() => { this.setModalVisibleSyncDataScreen2(!this.state.syncDataScreen2) }}>
                <View style={styles.syncDatatMainView}>
                  <TouchableWithoutFeedback>
                    <View style={styles.syncDataStyle}>
                      <Container>
                        <View style={{height:'70%',width:'100%'}}>  
                          <H2 style={styles.syncDataHeader}>Screen 2</H2>
                          <View style={{width: '100%',}}>
                            <Button
                                style={{padding:20,alignItems: 'center',justifyContent: 'center'}}
                                onPress={() => { this.getPhotos() }}
                              ><Text style={styles.buttonStyleText}>Gallery</Text>
                            </Button>
                          </View>
                        </View>

                          <View style={styles.nextButtonWrapBottom}>    
                            <View style={styles.buttonContainer}>     
                              <Button
                                  style={styles.buttonStyleNext}
                                  onPress={() => { this.setModalVisibleSyncDataScreen2(!this.state.syncDataScreen2) }}
                                ><Text style={styles.buttonStyleText}>Next</Text>
                              </Button>
                            </View>
                          </View>
                      </Container>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>


            <Modal
              transparent={true}
              visible={this.state.syncDataScreen3}
              presentationStyle={'overFullScreen'}
              onRequestClose={() => {this.setModalVisibleSyncDataScreen3(!this.state.syncDataScreen3)}}
            >
              <TouchableWithoutFeedback onPress={() => { this.setModalVisibleSyncDataScreen3(!this.state.syncDataScreen3) }}>
                <View style={styles.syncDatatMainView}>
                  <TouchableWithoutFeedback>
                    <View style={styles.syncDataStyle}>
                      <Container>
                        <View style={{height:'10%',width:'100%'}}>  
                          <View style={{alignItems: 'center',}}><Text style={{paddingTop:10,paddingBottom:10,fontSize:18,fontWeight:'600',color:'#666666'}}>Pick 3 topics to follow</Text></View>
                        </View>
                        <View style={{height:'67%',width:'100%',flexDirection: 'row', flexWrap: 'wrap',alignItems: 'center'}}>  
                            <View style={{width: '50%', alignItems: 'center'}}>
                              <View style={{backgroundColor: '#666666',margin:10,alignItems:'center',top:10,minWidth:130,minHeight:80,}}>
                                <Text style={{top:5,fontSize:20,color:'white'}}>one</Text>
                              </View>
                            </View>
                            <View style={{width: '50%', alignItems: 'center'}}>
                              <View style={{backgroundColor: '#666666',margin:10,alignItems:'center',top:10,minWidth:130,minHeight:80,}}>
                                <Text style={{top:5,fontSize:20,color:'white'}}>one</Text>
                              </View>
                            </View>
                            <View style={{width: '50%', alignItems: 'center'}}>
                              <View style={{backgroundColor: '#666666',margin:10,alignItems:'center',top:10,minWidth:130,minHeight:80,}}>
                                <Text style={{top:5,fontSize:20,color:'white'}}>one</Text>
                              </View>
                            </View>
                            <View style={{width: '50%', alignItems: 'center'}}>
                              <View style={{backgroundColor: '#666666',margin:10,alignItems:'center',top:10,minWidth:130,minHeight:80,}}>
                                <Text style={{top:5,fontSize:20,color:'white'}}>one</Text>
                              </View>
                            </View>
                          
                        </View>
                        <View style={styles.nextButtonWrapBottom}>    
                          <View style={styles.buttonContainer}>     
                            <Button
                                style={styles.buttonStyleNext}
                                onPress={() => { this.setModalVisibleSyncDataScreen2(!this.state.syncDataScreen2) }}
                              ><Text style={styles.buttonStyleText}>Next</Text>
                            </Button>
                          </View>
                        </View>
                      </Container>
                    </View>
                  </TouchableWithoutFeedback>
                </View>
              </TouchableWithoutFeedback>
            </Modal>




        </View>
    </Container>
    );
  }

}
