import React from 'react';
import { Dimensions, StyleSheet, Platform, View, AsyncStorage } from 'react-native';
import { Provider } from 'react-redux'

import { configureStore } from './src/screens/firebase/store'
import ChatApp from './src/screens/firebase/ChatScreen'
import { StackNavigator, DrawerNavigator } from 'react-navigation';
import ChatScreen from './src/screens/firebase/ChatScreen/index';;
import Account from './src/screens/account/index';
import Home from './src/screens/home/index';
import Product from './src/screens/product/index';
import Article from './src/screens/article/index';
import Test from './src/screens/account/test';
import Profile from './src/screens/profile'
import EditProfile from './src/screens/editprofile'
import FABExample from './src/screens/fab/index.js'
import Chat from './src/screens/chat/index.js'
import Search from './src/screens/search/index.js'
import { Root, Fab } from "native-base";
import Settings from './src/screens/settings/index.js';
import Terms from './src/screens/terms/index.js';
import Notifications from './src/screens/notifications/index.js';
import Mybadges from './src/screens/mybadges/index.js';
import SideMenu from './src/screens/Sidemenu/index.js';
import MainPage from './src/screens/firebase';
import PrivateTagRequest from './src/screens/private_manage_request';
import UploadArticleStep1 from './src/screens/upload_article/article'
import UploadArticleStep2 from './src/screens/upload_article/description'
import UploadArticleStep3 from './src/screens/upload_article/add_product'
import SubmitArticle from './src/screens/upload_article/submit'

import UploadProductStep1 from './src/screens/upload_product/product_details_form'
import searchBrand from './src/screens/upload_product/searchBrand'
import searchName from './src/screens/upload_product/searchName'
import searchCategory from './src/screens/upload_product/searchCategory'
import AddToList from './src/screens/add_to_list/index'
import InviteFriends from './src/screens/invite_friends'
import PrivateTag from './src/screens/private_tag'
import AddWallet from './src/screens/add_wallet'
import NotificationAlert from './src/screens/notification_count'

import firebaseService from './src/screens/firebase/services/firebase'

import FCM, { NotificationActionType } from "react-native-fcm";
import { registerKilledListener, registerAppListener } from "./src/screens/firebase/Listeners";
import firebaseClient from "./src/screens/firebase/FirebaseClient";

const store = configureStore()
const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;
const headerHeight = (deviceWidth >= 375 ? 55 : 48);

const ElementsDesign = StackNavigator(
    {
        Home: {
            screen: Home,
        },
        Account: {
            screen: Account
        },
        Product: {
            screen: Product
        },
        Article: {
            screen: Article
        },
        Chat: {
            screen: Chat
        },
        Search: {
            screen: Search
        },
        Settings: {
            screen: Settings
        },
        Terms: {
            screen: Terms
        },
        Notifications: {
            screen: Notifications
        },
        Mybadges: {
            screen: Mybadges
        },
        Test: {
            screen: Home
        },
        Profile: {
            screen: Profile
        },
        EditProfile: {
            screen: EditProfile
        },
        UploadArticleStep1: {
            screen: UploadArticleStep1
        },
        UploadArticleStep2: {
            screen: UploadArticleStep2
        },
        UploadArticleStep3: {
            screen: UploadArticleStep3
        },
        SubmitArticle: {
            screen: SubmitArticle
        },
        UploadProductStep1: {
            screen: UploadProductStep1
        },
        searchName: {
            screen: searchName
        },
        searchBrand: {
            screen: searchBrand
        },
        searchCategory: {
            screen: searchCategory
        },
        AddToList: {
            screen: AddToList
        },
        InviteFriends: {
            screen: InviteFriends
        },
        PrivateTag: {
            screen: PrivateTag
        },
        AddWallet: {
            screen: AddWallet
        },
        MainPage: {
            screen: MainPage,
        },
        ChatScreen: {
            screen: ChatScreen,
        },
        NotificationAlert: {
            screen: NotificationAlert
        },
        PrivateTagRequest: {
            screen: PrivateTagRequest
        }
    }
);

const MyDrawerNavigator = DrawerNavigator({
    ElementsDesign: {
        screen: ElementsDesign,
    }
}, {
        contentComponent: SideMenu,
        drawerWidth: 300,
    });

const AppNavigator = StackNavigator({
    Drawer: { screen: MyDrawerNavigator },
}, {
        headerMode: 'none',
    });

export default () =>

    <Root>
        <Provider store={store}>
            <AppNavigator />
        </Provider>
    </Root>;


