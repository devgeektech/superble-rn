const React = require("react-native");
const { Dimensions, Platform } = React;
import color from "color";
const deviceWidth  = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const headerHeight = (deviceWidth >= 375 ? 55 : 48 );
const widthEighty  = (deviceWidth*90/100);
export default {
	/* header */
	header: {
	      backgroundColor: "#fff",
	      elevation: 0,
	},
	backArrow:{
		zIndex: 100,
		top:10,
		left:5,
		right:5,
		backgroundColor:'transparent'
	},
	productImg:{
		position: 'absolute',
	},
	pageContainer:{
		// margin:3,
		width: deviceWidth,
		backgroundColor:"#f2f2f2",
		flex:1
	},
	belowWrap:{
		backgroundColor:"#fff",
	},
	backArrowImg:{
		
	},
	settingArrowImg:{
		width:50,
		height: 50,
		paddingBottom: 10,
	},
	backArrowWrap:{
		width:25
	},
	dotsWrap:{
		width:25,
		right:5,
		top: - 16,
		flexDirection: 'row',
		alignSelf: 'flex-end',  
		backgroundColor:'transparent'
	},
	flexWrapper:{
		flex: 1,
		flexDirection:'column',
		marginLeft:5,
		marginTop:30,
		height:20		
	},
	viewIcon:{
		flex: 1,
		flexDirection:'row',
		marginLeft:3,
		marginTop:13,
	},
	viewPro:{
		margin:7
	},
	viewProText:{
		marginTop:10,
		fontSize: 14,
		color:'#666666',
		
	},
	heartPro:{
		marginTop:7,
		marginLeft:15,

		marginRight:7,		
	},
	heartProText:{
		marginTop:10,
		fontSize: 14,
		color:'#666666',
	},
	proDetailWrap:{
		flexDirection:'row',
		marginLeft:0,
	},
	proTitle:{
		marginLeft:10,
		fontSize:20,
		color:'#000',
		fontWeight: '300'
	},
	askBtnWrap:{
		alignItems: 'center',
		justifyContent:'center',
		width:'100%',
		// backgroundColor: '#ffffff',
		marginTop: 10,
		marginBottom: 10		
	},
	askBtn:{		
		alignItems:'center',
		justifyContent:'center',
		borderWidth: 2,
		borderColor: '#B1BC44',
		width: '95%',
		height: 38,
		backgroundColor: '#fff',
		elevation   : 3,
	},
	askBtnText:{
		color:'#B1BC44',
		fontSize:13,
		fontWeight: 'bold',
	},
	commentWrap:{
		alignItems: 'center',
	},
	commentContainer:{
		width:"95%",
		backgroundColor: "#fff",
		elevation   : 3,
		
	
	},
	
	tagContainer:{
		width:"95%",
		// backgroundColor: "#fff",		
	
	},
	commentContentWrap:{
		padding:10
	},
	tags:{
		color:'#03a9f4',
		fontSize: 15,
		paddingRight: 5
	},
	searchInput:{
		height: 50,
		backgroundColor: '#ffffff',
		fontSize:15,
		padding:10,	
		borderColor: '#C7C9C8',
		borderWidth: 1,
		borderRadius:1
		// borderBottomWidth: 0.5,
		// borderLeftWidth: 0.5,
		// borderRightWidth: 0.5,
		// borderTopWidth: 0.5,
		// borderTopColor: '#996633',
		// borderBottomColor: '#996633',
		// borderLeftColor: '#996633',
		// borderRightColor: '#996633',
	},
	inputContainer:{
		height: 50,
	},
	
	imageCommentWrap:{
		flex: 1,
		flexDirection:'row',
		backgroundColor: '#ffffff',
		width: 'auto',
		marginTop: 10,
	},

	avatarContainer:{
		alignItems: 'flex-start',
		justifyContent:'flex-start',
		width:"26%",
		paddingLeft:10
		// top:8,

	},

	contentContainer:{
		
		alignItems:'flex-start',
		justifyContent:'flex-start'
	},

	likeImgContainer:{
		width: '20%',
		alignItems: 'center',
		top:8,
		
		justifyContent:'center'
	},

	writeCommentWrap:{
		width:"80%",
		borderColor:"black"
	},
	sendButtonWrap:{
		width:"20%",
	},

	avatarWrap1:{
		width: 70,
		height: 70,
		//borderRadius: 30,
		// borderBottomWidth: 1,
		// borderLeftWidth: 1,
		// borderRightWidth: 1,
		// borderTopWidth: 1,
		zIndex:99,
		overflow: 'hidden'
	},
	avatarWrap:{
		width: 50,
		height: 50,
		borderRadius:25,
		zIndex:0,
	},
	userLevelWrap:{
		top:-2,
		right :7,
		position:'absolute',
		width: 25,
		height: 25,
		zIndex:999,
	},
	name:{
		color: 'black',
		fontSize:16,
		// marginBottom:5
	},
	commentText:{
		color: '#666666',
		fontSize: 15,
		textAlign: 'justify',
		marginTop:2
    	//lineHeight: 0,
	},
	likeImage:{
		left:3,
		width: 30,
		height: 30,
	},
	
	likeText:{
		paddingLeft:10,
		fontSize:12,
		color: '#666666',
		marginTop:5,
	},
	commentInput:{
		height: 50,
		backgroundColor: '#ffffff',
		fontSize:15,
		padding:10,	
		borderColor:'#C7C9C8',

		borderWidth: 1
		// borderBottomWidth: 0.5,
		// borderLeftWidth: 0.5,
		// borderRightWidth: 0.5,
		// borderTopWidth: 0.5,
		// borderTopColor: '#996633',
		// borderBottomColor: '#996633',
		// borderLeftColor: '#996633',
		// borderRightColor: '#996633',
	},
	sendButton:{
		height: 50,
		backgroundColor: '#B1BC44',
		width:'100%',
		justifyContent:'center',
		borderRadius:0,
	},
	sendBtnText:{
		color: '#ffffff',
		fontSize:15,
	},
	countrySelectWrap:{
		padding:10,
		borderBottomWidth: 1,
		borderLeftWidth: 1,
		borderRightWidth: 1,
		borderTopColor: '#666666',
		borderBottomColor: '#666666',
		borderLeftColor: '#666666',
		borderRightColor: '#666666',
		
	},
	// Related article section
	relatedArticleSection:{
		alignItems: 'center',

	},

	relatedArticleWrap:{
		width:"90%",
		backgroundColor: "#fff",
		flex: 1,
		flexDirection:'row',
		backgroundColor: '#ffffff',
		top: 20,
	
	},
	relatedLeftTitle:{
		width: '70%',
	},
	relatedRightLink:{
		width: '30%',		
	},	
	relatedTitleLeft:{
		color: '#74bced',
	},
	relatedTitle:{
		fontSize:20,
		fontWeight:'500',
		color:'#666666',
		paddingLeft: 10,
	},
	articleList:{
		width: '100%'
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
	    height: '82%',
	    paddingLeft: 10,
	    paddingRight: 10,
	    borderRadius: 3
	  },
	  innerViewofModel:{
		  backgroundColor: "#fff", 
		  position: 'absolute', 
		  right: '4%', 
		  top: '2%', 
		  height: '28%', 
		  width:'50%',
		  paddingLeft: 15, 
		  paddingRight: 10,
		  borderRadius: 6,
		  borderColor: '#fff',
		  borderWidth: 1
	  },
	  dropdown_2_row: {
    flexDirection: 'row',
    height: 40,
    alignItems: 'center',
  },
  dropdown_2_image: {
	marginLeft:5,
    marginRight: 15,
    width: 30,
    height: 20,
  },
  dropdown_2_row_text: {
    marginHorizontal: 4,
    fontSize: 16,
    color: 'black',
	fontWeight:'bold',
    textAlignVertical: 'center',
  },
};