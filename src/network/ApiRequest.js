/* @flow */
import { getFullUrl } from './EndPoints';
import Toast from 'react-native-simple-toast';
import NetInfo from "@react-native-community/netinfo";
import Helper from '../utils/Helper.js'
import axios from 'axios'
import {BASE_URL, GET_VENUE_TYPES, GET_CUSTOM_LOG} from './EndPoints'

// const ApiRequest = {

//     onPostApiRequest(api, payLoad) {

//         //console.log(getFullUrl(api))
//         return fetch(getFullUrl(api), {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Accept': 'application/json'
//             },
//             body: payLoad
//         })
//             .then((response) => response.json())
//             .catch((error) => {
//                 console.error(error);
//                 //this.setState({ isLoading: false })
//
//                 //return responseData(0, response.response)
//             });

//     },
//     async PostRequest(api, payLoad) {
//         var apiResponse = await ApiRequest.onPostApiRequest(api, payLoad)
//         if (apiResponse.success == true) {
//             return responseData(true, apiResponse)
//         } else {
//             return responseData(false, apiResponse.message)
//         }
//     }



// }
export const showToastMessage = (title,message) => {
    if (message) {
        setTimeout(()=>{Toast.showWithGravity(message, Toast.LONG, Toast.CENTER)}, 50);


        // Toast.show({
        //     type: 'error',// 'success | error | info'
        //     position: 'bottom', //top | bottom
        //     text1: title,
        //     text2: message,
        //     visibilityTime: 4000,
        //     autoHide: true,
        //     bottomOffset: 40,//topOffset: 30,
        //     onShow: () => { },
        //     onHide: () => { }
        // })
    }

}
async function isNetworkAvailable() {
    const response = await NetInfo.fetch();
    return response.isConnected;
}
export const showToast = (message) => {
    if (message) {
        Toast.showWithGravity(message, Toast.LONG, Toast.CENTER);
    }
}

export const PostRequest = async (api, payLoad, showToast) => {
    // if(!NetInfo.fetch().isConnected){
    //     showToastMessage("Network","Internet not connected!")
    //     return
    // }
    var finalData = payLoad.replace(/\\"/g, '')
    Helper.DEBUG_LOG(`api-> ${getFullUrl(api)}`)
    Helper.DEBUG_LOG(`payload-> ${finalData}`)

    return fetch(getFullUrl(api), {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: finalData
    })
        .then((response) => response.json())
        .then((apiResponse) => {
            Helper.DEBUG_LOG(apiResponse)
            if (apiResponse.success == true) {
                return responseData(true, apiResponse)
            } else {
                if(showToast){
                    showToastMessage("Request Failed",apiResponse.message)
                }

                return responseData(false, apiResponse)
            }
        }).catch((error) => {
            console.error(error);
            showToastMessage("Request Failed",error.response)
            return responseData(false, error.response)
        });
}
function responseData(status, response) {
    return { "success": status, "apiResponse": response }

}
//export default ApiRequest;

export const getVenueTypes = async () => {
  console.log('getVenueTypes API');
  const headersconfig = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }
  var res = {};
  await axios.get(BASE_URL + GET_CUSTOM_LOG, headersconfig)
  .then(function (response) {
    // console.log("response recieved in getVenueTypes : " , response);
    res.data = response.data;
    res.status = response.status;
  })
  .catch(function (error) {
	// console.log("ERROR in getVenueTypes : " , error);
    if(error.response){
      res = error.response;
      res.status = error.response.status;
    }
	  else{res.status = false;}
  });
  // console.log("RETURN getVenueTypes res: ", res);
  return res;
}

export const getCustomerLog = async (venue_id, time_range) => {
  console.log('getCustomerLog API');
  const bodyconfig = {
    venue_id: venue_id,
    time_range: time_range
  }
  const headersconfig = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }
  var res = {};
  await axios.post(BASE_URL + GET_CUSTOM_LOG, bodyconfig, headersconfig)
  .then(function (response) {
    // console.log("response recieved in getCustomerLog : " , response);
    res.data = response.data;
    res.status = response.status;
  })
  .catch(function (error) {
	console.log("ERROR in getCustomerLog : ");
    if(error.response){
      res = error.response;
      res.status = error.response.status;
    }
	  else{res.status = false;}
  });
  // console.log("RETURN getCustomerLog res: ", res);
  return res;
}

export const getVenues = async (userId) => {
  console.log('getVenues API');
  const bodyconfig = {
    user_id: userId,
  }
  const headersconfig = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }
  var res = {};
  await axios.post(BASE_URL + 'venue/getall', bodyconfig, headersconfig)
  .then(function (response) {
    // console.log("response recieved in getVenues : " , response);
    res = response;
  })
  .catch(function (error) {
	// console.log("ERROR in getVenues : ");
    if(error.response){
      res = error.response;
      res.status = error.response.status;
    }
	  else{res.status = false;}
  });
  // console.log("RETURN getVenues res: ", res);
  return res;
}
