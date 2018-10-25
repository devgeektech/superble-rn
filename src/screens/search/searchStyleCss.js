const React = require("react-native");
const { Dimensions, Platform } = React;

const deviceWidth  = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

export default {
    /* header */
	header: {
        backgroundColor: "#fff",
        elevation: 0,
        height: 100,
  },
  menuIcon:{
      color: "#000",
      fontWeight:'bold'
  },
  homeMenu:{
      backgroundColor: "#fff",
      marginLeft: -15
  },
  searchBtn:{
      backgroundColor: "#fff",
      fontWeight:'bold',
      marginRight: -15
  },
  searchIcon:{
      color: "#000"
  },
  title:{
      textAlign: 'center',
  
  },
  titleText:{
      textAlign: 'center',
      color: "#000",
      fontSize: 24,
      fontWeight: '400',
  },
  subTitleText:{
      color: "#000",
      fontSize: 10,
      fontWeight: "normal",
  },
  titleBody:{
      width: "100%",
      alignItems: 'center'
  },
  /* body */
  container: {    
      backgroundColor: '#fff',
      flex: 1, 
  },
  containerPost:{
      flex: 1,

  },
  imgWrapper:{
      height:"100%",
      width:"100%",
  },
  /* Cards*/
  cardOuterContainer:{
      backgroundColor:"#efefef",

  },
  /* products and articles body */	
  cardContainer: {
      backgroundColor: 'white',
      width: '100%',
      borderTopWidth: 2.5,
      borderTopColor: '#000',
      marginTop:-5
  },
  cardImage:{
    height: 350,
    width: (deviceWidth),
    
  },
  discoverText: {
    top:' 10%',
    position: 'absolute',
    width: '100%',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent:'center'
  },
  discoverTextFormat:{
    color: "#ffffff",
    fontSize: 35,
    fontWeight: "bold",
  },
  socialSection:{
    marginBottom: -30,
      marginLeft: -20,
      marginTop:-30,
  },
  heartImg:{
    margin:20,
  },
  catName:{
      // alignContent: 'flex-end',
  },
  followLink:{    
      position: 'absolute',
      zIndex:999 
  },
  topWrap:{
    // width:'100%',
    // flex:1,
  },
  parentCat:{
    position:'absolute',
    top:'5%',
    width:'100%',
      backgroundColor:'transparent',
      zIndex:20
  },
  subTitleProduct:{
      color:'#000',
      fontSize: 17,
  },
  wrapper: {
     width:450,
     height:350
  },
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
    position:'absolute'
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
  },
  syncDatatMainView: { 
      backgroundColor: "rgba(0, 0, 0, 0.5)", 
      height: deviceHeight, 
      width:deviceWidth 
  },
  tags:{
      color:'#03a9f4',
      fontSize: 15,
      paddingRight: 6
  }
};