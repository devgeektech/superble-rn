import FirebaseConstants from "./FirebaseConstants";
import { Alert } from "react-native";

const API_URL = "https://fcm.googleapis.com/fcm/send";

class FirebaseClient {

  async send(body, type) {
		if(FirebaseClient.KEY === 'AIzaSyBf-0ZFhh3A1xgWakIOQcG40rKOly2xyJI'){
			Alert.alert('Set your AIzaSyBf-0ZFhh3A1xgWakIOQcG40rKOly2xyJI in app/FirebaseConstants.js')
			return;
		}
  	let headers = new Headers({
  		"Content-Type": "application/json",
      "Authorization": "key=" + FirebaseConstants.KEY
  	});

		try {
			let response =  await fetch(API_URL, { method: "POST", headers, body });
		} catch (err) {
			Alert.alert(err && err.message)
		}
  }

}

let firebaseClient = new FirebaseClient();
export default firebaseClient;