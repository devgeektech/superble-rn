const React = require("react-native");
const { Dimensions, Platform } = React;
import color from "color";

const deviceWidth  = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

export default {
  buttonFbLogin: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  container: {    
    backgroundColor: '#fff',
    flex: 1,    
  },
  createAccountHeader: {
    color: '#A9A9A9',
    paddingLeft: 15,
    paddingTop: 30,
  },
  createAccountMainView: { 
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    height: deviceHeight, 
    width:deviceWidth 
  },
  createAccountStyle: {
    backgroundColor: "#fff",
    position: 'absolute',
    left: '5%',
    right: '5%',
    top: '10%',
    height: '73%',
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 3
  },
  createAccountStyleError: {
    backgroundColor: "#fff",
    position: 'absolute',
    left: '5%',
    right: '5%',
    top: '10%',
    height: '82%',
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 3
  },
  createAccountButton: {
    backgroundColor: "#acbc4e",
    marginLeft: 10,
    marginRight: 6,
    marginTop: 15,
    height:60,
    borderRadius:0
  },
  createAccountButtonText: {
    color: "#fff",
    fontSize: 17,
  },
  createAccountLable: {
    paddingTop: 0,
    color: "#A9A9A9",

  },
 

  createAccountStyle1: {
    backgroundColor: "#323232",
    position: 'absolute',
    left: '5%',
    right: '5%',
    bottom: '15%',
    top: '0%',
    height: deviceHeight/3,
    zIndex: 999,
  }, 
  forgotPswdAccountMainView: { 
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    height: deviceHeight, 
    width:deviceWidth 
  },
  forgotPswdAccountStyle: {
    backgroundColor: "#fff",
    position: 'absolute',
    left: '5%',
    right: '5%',
    top: '20%',
    height: '35%',
    paddingLeft: 10,
    paddingRight: 10,
  },
  forgotPswdAccountHeader: {
    color: '#A9A9A9',
    paddingLeft: 15,
    paddingTop: 30,
  },
  forgotPswdAccountLable: {
    paddingTop: 0,
  },
  forgotPswdAccountButton: {
    backgroundColor: "#acbc4e",
    marginLeft: 10,
    marginRight: 10,
    marginTop: 15,
    height:60,
    borderRadius:0
  },
  forgotPswdAccountButtonText: {
    color: "#fff",
    fontSize: 17,
  },
  selecetTopics: {
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    height: deviceHeight, 
    width:deviceWidth 
  },
    selecetTopicsStyle:{
    backgroundColor: "#fff",
    position: 'absolute',
    left: '5%',
    right: '5%',
    height: '80%',
    top:'10%',
    padding: 10,
  },
  selecetTopicsButton: {
    backgroundColor: "#acbc4e",
    marginLeft: 10,
    marginRight: 10,
    marginTop: 15,
    height:60,
    borderRadius:0
  },
  selecetTopicsButtonText: {
    color: "#000",
    fontSize: 17,
  },
  selectMediaProfileDiv: {
    // flexWrap: 'wrap',
    flexDirection: 'row',
    paddingHorizontal:25,
    paddingVertical:10,
    alignItems:'center',
    justifyContent: 'space-between'
  },
  selectMediaProfileDivText:{fontSize: 18, marginLeft:15},
  header: {
      backgroundColor: "#fff",
      elevation: 0,
      height: 150,
      borderBottomColor: 'transparent',
  },
  headingH1: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  heading: {
    margin: 10,
    textAlign: 'center',
  },
  imgItem: {
      height: 130,
      paddingLeft:20,
      paddingRight:20,
      paddingTop: 15,
      borderBottomColor: 'transparent',
  },
  imgStyle: {
      height:100,
      width: deviceWidth-100
  },
  lcAccount: {
    width: "50%",
  },
  lcAccountA: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  lcAccountText: {
    color: '#000',
    fontSize: 15,
    paddingLeft: 20,
  },
  lcAccountAText: {
    color: '#000',
    fontSize: 15,
    paddingRight: 20,
  },
  logincreateAccount: {
    flexDirection: 'row',
    marginTop: 20,
    position: 'relative',
    width: '80%',
  }, 
  loginAccountHeader: {
    color: '#A9A9A9',
    paddingLeft: 15,
    paddingTop: 24,
  },
  loginAccountMainView: { 
    backgroundColor: "rgba(0, 0, 0, 0.5)", 
    height: deviceHeight, 
    width:deviceWidth 
  },
  loginAccountButton: {
    backgroundColor: "#acbc4e",
    marginLeft: 10,
    marginRight: 10,
    marginTop: 15,
    height:60,
    borderRadius:0
  },
  loginAccountButtonText: {
    color: "#fff",
    fontSize: 17,
  },
  forgotPasswordButton: {
    backgroundColor: "#acbc4e",
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
    height:60,
    borderRadius:0
  },
  forgotPasswordButtonText: {
    color: "#fff",
    fontSize: 17,
  },
  forgotPasswordView: {
    alignItems: 'flex-end',
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    paddingRight: 10,
    paddingTop: 10,
  },
  forgotButtonText: {
    textDecorationLine: 'underline'
  },
  loginAccountLable: {
    paddingTop: 0,
    color: '#A9A9A9'
  },
  loginAccountStyle: {
    backgroundColor: "#fff",
    position: 'absolute',
    left: '5%',
    right: '5%',
    top: '20%',
    height: '50%',
    paddingLeft: 10,
    paddingRight: 10,
  },
  loginButtonFB:{
    backgroundColor: "#4a578f",
    color: '#fff',
    fontSize: 15,
    paddingTop: 18,
    paddingBottom: 18,
    textAlign: 'center',
    width: "100%",
  },
  loginButtonG:{
    backgroundColor: "#D94A35",
    color: '#fff',
    fontSize: 15,
    paddingTop: 18,
    paddingBottom: 18,
    textAlign: 'center',
    width: "100%",
  },
  buttonGLogin:{
    marginTop:10, 
  },  
  mainAccountView: {
    flexDirection: 'column',
  },
  mainAccountSubView: {
    flexDirection: 'row',
  },
  mainAccountIconList: {
    width: 30, 
    height: 30, 
    marginLeft: "10%", 
    marginRight: "5%", 
  },
  subHeadingList: {
    color: "#000",
    fontSize: 17,
    marginBottom: 20,
  },
  secondryViewFb: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  viewFbLogin: {
    alignItems: 'center',
    justifyContent: 'center',
    width: "80%",
  },

  // sync tab css
  syncDatatMainView: { 
      backgroundColor: "rgba(0, 0, 0, 0.5)", 
      height: deviceHeight, 
      width:deviceWidth 
  },
  syncDataStyle: {
    backgroundColor: "#fff",
    position: 'absolute',
    left: '5%',
    right: '5%',
    top: '10%',
    height: '80%',
    paddingLeft: 10,
    paddingRight: 10,
  },
  syncDataHeader:{
    color: '#666666',
    paddingLeft: 7,
    paddingTop: 24,
    textAlign: 'center'
  },
  imageCommentWrap:{
    flex: 1,
    flexDirection:'row',
    marginLeft:35,
    marginTop:30,
    paddingTop:30
  },
  avatarContainer:{
    width:"30%",
    alignItems: 'center',
    justifyContent:'center',

  },
  contentContainer:{
    width:"40%",
    paddingTop:10
  },
  likeImgContainer:{
    paddingTop:20
  },
  facebookIcon:{
    width:40,
    height:40
  },
  buttonStyleNext: {
    borderRadius:0,
    alignItems: 'center',
    justifyContent:'center',    
    backgroundColor: 'black',
    width: '100%'
  },
  buttonStyleText:{
    color:'#ffffff',
    justifyContent:'center',
    alignItems: 'center',     
  },
  buttonContainer:{

  },
  nextButtonWrap:{
    marginTop:30,
    paddingTop:30,
    width:'100%',
    alignItems: 'center',
  },
  imageCommentWrapScreen2:{
    minHeight:500
  },
  nextButtonWrapBottom:{
     marginTop:30,
    paddingTop:30,
  }
  // sync tab css end 
};