import React from 'react';
import {Dimensions, Image, Modal, StyleSheet, Text, TouchableWithoutFeedback, View, AsyncStorage } from 'react-native';
import { Container, Header, Left, Body, Right, Button, Icon, Title, H1, Label, Content,  Card, CardItem, Spinner} from 'native-base';
import { Col, Row, Grid } from 'react-native-easy-grid';
import {DrawerNavigator, addNavigationHelpers, StackNavigator} from 'react-navigation';
import styles from './homeStyle';
import RobotItem from './robotItem';
import Dataset from 'impagination';
import Constants from '../../constants';
console.disableYellowBox = true;

//import FABExample from '../fab/index.js'


export default class Home extends React.Component {

	constructor(props) {
	    super(props);

	    this.state = {
	      dataset: null,
	      datasetState: null,
		  navigate: this.props.navigation.navigate,
		  navigateParams: this.props.navigation.state.params,
		  isLoggedIn: null,
		  isContent: false,
	    };
	}
  	static navigationOptions = ({ navigation }) => {
		return {
			header: null
		}
	};
	  /**
	   * Create a new impagination dataset when the component mounts and
	   * set the intial readOffset to 0 to fetch data.
	   *
	   * @method setupImpagination
	   */
	  setupImpagination() {
	    let _this = this;
	    let dataset = new Dataset({
	      pageSize: 5,
	      loadHorizon: 2,
	      // Anytime there's a new state emitted, we want to set that on
	      // the componets local state.
	      observe(datasetState) {
	        _this.setState({datasetState});
	      },
	      // Where to fetch the data from.
	      fetch(pageOffset, pageSize, stats) {
	      	//https://api-dev.superble.com/api/v1/search?categories=all&page=1&per_page=5&source=product
	          /*return fetch(`https://serene-beach-38011.herokuapp.com/api/faker?page=${pageOffset + 1}&per_page=${pageSize}`)
	          .then(response => response.json())
	          .catch((error) => {
	            console.error(error);
	          });*/
	          return fetch(Constants.url.base + `search?categories=all&page=${pageOffset + 1}&per_page=${pageSize}&source=product`)
	          .then(response => response.json())
	          .then(responseData => {
			      return (responseData.results);
			   });
	      }
	    });
	    dataset.setReadOffset(0);
	    this.setState({dataset});

	  }

	  componentWillMount() {
	    this.setupImpagination();
	  }

	  /**
	   * Render each item in the impagination store. If the record is
	   * pending we should show a loading spinner.
	   *
	   * @method renderItem
	   */
	  renderItem = () => {
	  	var count = 0;

	    return this.state.datasetState.map(record => {
	      if(record.isPending && !record.isSettled) {
	      	//this.setState({isContent: true});
	        return false;
	      }
	       count++;
	      return (
	        <RobotItem record={record} count={count} isLoggedIn={this.state.isLoggedIn} navigate={this.state.navigate} />
	      );
	     
	    });
	  }

	  /**
	   * Based on scroll position determine which card is in the current
	   * viewport. From there you can set the impagination readOffset
	   * equal to the current visibile card.
	   *
	   * @method setCurrentReadOffset
	   */
	setCurrentReadOffset = (event) => {
	    let itemHeight = 402;
	    let currentOffset = Math.floor(event.nativeEvent.contentOffset.y);
	    let currentItemIndex = Math.ceil(currentOffset / itemHeight);
	    this.state.dataset.setReadOffset(currentItemIndex);
	}

	componentDidMount(){
    	AsyncStorage.getItem('isLoggedIn')
	        .then( (value) => {
	            if(value === null) {
	              this.setState({isLoggedIn: null});
	            } else {
	              this.setState({isLoggedIn: value});
	            }
	    });
  	}
	
	render =() => {

	    return ( 
	    	<Container style={{marginLeft:-3,}}>
	    	

		    	<Header style={styles.header}>
		            <Button style={styles.homeMenu}
		            	onPress={()=>this.props.navigation.navigate('DrawerToggle')}
		            >
		              <Icon name='menu' style={styles.menuIcon}/>
		            </Button>
		          <Body style={styles.titleBody}>
		            <Title style={styles.title}>
		            	<Text style={styles.titleText}>SUPERBLE</Text>
		            </Title>
		            <Title style={styles.title}>
		            	<Text style={styles.subTitleText}>Chat about the products you love</Text>
		            </Title>
		          </Body>
		         
		          <Button 
								style={styles.searchBtn}
									onPress={()=> this.props.navigation.navigate('Search')}
								>
		              <Icon name="search" style={styles.searchIcon} />
		            </Button>
		        
		        </Header>
		       
		        <Content style={styles.cardOuterContainer} scrollEventThrottle={3000} onScroll={this.setCurrentReadOffset} removeClippedSubviews={true}>
		          {this.renderItem()} 			       
		        </Content>
		       

		        
		    </Container>
	         
		);
	}

}