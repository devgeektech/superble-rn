const React = require("react-native");
const { Dimensions, Platform } = React;
import color from "color";

const deviceWidth  = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

export default {
 
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
  headerTxt: {
    color: '#484848',
    fontSize: 15,
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontFamily: 'Lato-Regular'
  },
	headerTitle: {
		height: 50,
	  width: 100,
    color: '#484848',
    fontSize: 15,
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontFamily: 'Lato-Regular'
  }
};