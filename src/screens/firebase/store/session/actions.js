import * as types from './actionTypes'
import firebaseService from '../../services/firebase'
import {AsyncStorage} from 'react-native';
import Constants from '../../../../constants';
import axios from 'axios';
import FCM, {NotificationActionType} from "react-native-fcm";

export const restoreSession = () => {
  return (dispatch) => {
    dispatch(sessionRestoring())

    let unsubscribe = firebaseService.auth()
      .onAuthStateChanged(user => {
        if (user) {
          dispatch(sessionSuccess(user))
          unsubscribe()
        } else {
          dispatch(sessionLogout())
          unsubscribe()
        }
      })
  }
}


export const adminToken = (id) => {
  return (dispatch) => {
    dispatch(sessionRestoring())
    firebaseService.auth().createCustomToken(id)
    .then(function(customToken) {
    })
    .catch(function(error) {
      console.log("Error creating custom token:", error);
    });
    let unsubscribe = firebaseService.auth()
      .onAuthStateChanged(user => {
        if (user) {
          dispatch(sessionSuccess(user))
          unsubscribe()
        } else {
          dispatch(sessionLogout())
          unsubscribe()
        }
      })
  }
}


export const loginUser = (email, password) => {
  return (dispatch) => {
    dispatch(sessionLoading())

    firebaseService.auth()
      .signInWithEmailAndPassword(email, password)
      .catch(error => {
        dispatch(sessionError(error.message))
      })

    let unsubscribe = firebaseService.auth()
      .onAuthStateChanged(user => {
        if (user) {
          dispatch(sessionSuccess(user))
          unsubscribe()
        }
      })
  }
}

export const loginUserWithToken = (token) => {
  return (dispatch) => {
    dispatch(sessionLoading())

    firebaseService.auth().signInWithCustomToken(token)
      .catch(error => {
        dispatch(sessionError(error.message))
      })

    let unsubscribe = firebaseService.auth()
      .onAuthStateChanged(user => {
        if (user) {
          firebaseService.auth().currentUser.getIdToken(true).then((refToken)=>{
            updateToken(refToken)
            FCM.getFCMToken().then(token => {
              firebaseService.database().ref('fcmTokens').child(token).set(user.uid, error => {
                if(error) {
                  console.log('inside error', error)
                }else {
                  console.log('inside success')
                }
              })
            })
          })
          dispatch(sessionSuccess(user))
          unsubscribe()
        }
      })
  }

}

export const signupUser = (email, password) => {
  return (dispatch) => {
    dispatch(sessionLoading())

    firebaseService.auth()
      .createUserWithEmailAndPassword(email, password)
      .catch(error => {
        dispatch(sessionError(error.message));
      })

    let unsubscribe = firebaseService.auth()
      .onAuthStateChanged(user => {
        if (user) {
          dispatch(sessionSuccess(user))
          unsubscribe()
        }
      })
  }
}

export const logoutUser = () => {
  return (dispatch) => {
    dispatch(sessionLoading())

    firebaseService.auth()
      .signOut()
      .then(() => {
        dispatch(sessionLogout())
      })
      .catch(error => {
        dispatch(sessionError(error.message))
      })
  }
}

const updateToken = (token) => {
  AsyncStorage.getItem('isLoggedIn').then((atoken)=>{
    if (atoken !== null){
      AsyncStorage.getItem('deviceID').then((deviceID)=>{
        if(deviceID != null){
          const api = axios.create({
            baseURL: Constants.url.base,
            timeout: 0,
            responseType: 'json',
            headers: {
                'Authorization': 'Token '+atoken+';device_id='+deviceID
            }
          });
          api.put('profiles/update_firebase_token_id', JSON.stringify({firebase_token_id : token})).then((data)=>{
          }).catch(error =>{
            console.log(error)
          })   
        }
      })
    }
  })
}

const sessionRestoring = () => ({
  type: types.SESSION_RESTORING
})

const sessionLoading = () => ({
  type: types.SESSION_LOADING
})

const sessionSuccess = user => ({
  type: types.SESSION_SUCCESS,
  user
})

const sessionError = error => ({
  type: types.SESSION_ERROR,
  error
})

const sessionLogout = () => ({
  type: types.SESSION_LOGOUT
})
