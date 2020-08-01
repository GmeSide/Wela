
import { getFullUrl } from './EndPoints';
import Toast from 'react-native-simple-toast';
import NetInfo from "@react-native-community/netinfo";
import Helper from '../utils/Helper.js'

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
                
                return responseData(false, apiResponse.message)
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