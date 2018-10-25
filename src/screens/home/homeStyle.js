 const React = require("react-native");

const { Dimensions, Platform } = React;
import color from "color";

const deviceWidth  = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

export default {
	/* header */
	header: {
	      backgroundColor: "#fff",
	      elevation: 0,
	      height: 60,

	},
	menuIcon:{
		color: "#000",
		fontWeight:'bold'
	},
	homeMenu:{
		backgroundColor: "#fff",
		marginLeft: -15,
		height:24,
		
	},
	searchBtn:{
		backgroundColor: "#fff",
		height:24,
		
		// fontWeight:'bold',
		// marginRight: -15,
	},
	searchIcon:{
		color: "#000"
	},
	title:{
		textAlign: 'center',
	
	},

slide:{	
	position: 'absolute',
	width:deviceWidth,
	flex:1,
  top: 0,
	left: 0,
	right:0,
	bottom:0, 
},

slideValue:{
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center',
	backgroundColor: '#9DD6EB',
	padding: 15,
},
	titleText:{
		textAlign: 'center',
		color: "#000",
		fontSize: 20,
		fontWeight: '400',
	},
	subTitleText:{
		color: "#000",
		fontSize: 12,
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
		backgroundColor:"#FAFAFA",
	},
	/* products and articles body */	
	cardContainer: {
		backgroundColor: '#fff',
		width: '100%',
		borderBottomWidth: 2.5,
		borderBottomColor: '#000',
		borderTopColor:'#EBEBEB',
		borderTopWidth:2,
		marginBottom: 10
	},
	cardImage:{
	  height: 350,
	  width: (deviceWidth),
	  
	},
	discoverText: {
	  top:'10%',
	  position: 'absolute',
	  width: '100%',
		paddingHorizontal: 20,
	  backgroundColor: 'transparent',
	  alignItems: 'center',
	  justifyContent:'center'
	},
	discoverTextFormat:{
	  color: "#ffffff",
	  fontSize: 35,
	  fontWeight: "normal",
	},
	socialSection:{
		flexDirection:'row',
		paddingHorizontal:15,
		paddingBottom: 5
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
		paddingHorizontal:20,
	  width:'100%',
		backgroundColor:'transparent',
		zIndex:20,
		flexDirection:'row'
	},
	subTitleProduct:{
		color:'#303030',
		fontSize: 15,
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
	  color: '#303030',
	  fontSize: 30,

	},
	syncDatatMainView: { 
	    backgroundColor: "rgba(0, 0, 0, 0.5)", 
	    height: deviceHeight, 
	    width:deviceWidth 
	},
	tags:{
		color:'#00a4cb',
		fontSize: 15,
		paddingRight: 5
	}
};