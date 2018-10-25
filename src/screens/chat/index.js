import React, { Component } from 'react';
import { Container, Header } from 'native-base';
import { Image, Platform, Text, View } from 'react-native';
// import styles from './chatStyleCss';
import { TabNavigator } from 'react-navigation';
import NewRequest from './new_request';
import OpenChat from './open_chat';

const tabStyle = Platform.OS == "ios" ? { width: '100%', } : {}

export default TabNavigator({
	NewRequest: { screen: NewRequest },
	OpenChat: { screen: OpenChat },
},
	{

		navigationOptions: ({ navigation }) => ({
			tabBarIcon: ({ focused, tintColor }) => {

			}
		}),


		tabBarOptions: {
			upperCaseLabel:false,
			activeTintColor: 'white',
			inactiveTintColor: 'black',
			activeBackgroundColor: 'black',
			inactiveBackgroundColor: '#fafafa',
			labelStyle: {
				fontSize: 16,
				fontWeight: 'bold',
				marginTop:0,
				paddingTop:5,
				marginBottom: Platform.OS == "ios" ? 15 : null,
			},
			style: {
				backgroundColor: '#fafafa'
			},
			indicatorStyle: {
				height: null,
				top: 0,
				backgroundColor: 'black',

			},
			tabStyle: tabStyle

		},
		lazy: true,
		tabBarPosition: 'top',
		animationEnabled: false,
		swipeEnabled: Platform.OS == 'ios' ? false : true,
		initialRouteName: 'NewRequest'
	}
);
