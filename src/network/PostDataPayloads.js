import Helper from '../utils/Helper'



///--------------------------------------------------------------------------------------
//                      POST PARAS OBJECTS
//--------------------------------------------------------------------------------------
/**
 * LOGIN & REGISTER SCREENS 
 */

export async function login(email, password, type) {
    return JSON.stringify({
        email: email,
        password: password,
        type: type
    })
}
export function register(name, email, password, phone) {
    return JSON.stringify({
        name: name,
        email: email,
        password: password,
        phone: phone
    })
}


export async function socialLogin(email, social_type, id, name, phone) {
    
    return JSON.stringify({
        email: email,
        type: 2,
        social_type: social_type,
        id: id,
        name: name,
        phone: phone,
        latitude: "",
        longitude: ""
    })
}



export async function updateProfile(name, phone) {
    let user = await Helper.getUser()
    return JSON.stringify({
        name: name,
        email: user.email,
        password: user.password,
        phone: phone,
        id: user.id,
        dob: user.id ? user.id : '',
        gender: user.id ? user.id : '',
        occupation: user.occupation ? user.occupation : '',
        location: user.location ? user.location : '',
        latitude: user.latitude ? user.latitude : '',
        longitude: user.longitude ? user.longitude : ''
    })
}

export function verifyCode(email, code) {
    return JSON.stringify({
        email: email,
        access_code: code
    })
}

export function resendCode(userEmail) {
    return JSON.stringify({
        email: userEmail
    })

}



/**
 * Favourite
 * 
 */


export async function addToFavourite(venuID) {
    let user = await Helper.getUser()
    return JSON.stringify({
        user_id: user.id,
        venue_id: venuID
    })
}

export async function removeFavourite(venuID) {
    let user = await Helper.getUser()
    return JSON.stringify({
        user_id: user.id,
        venue_id: venuID,
        is_remove: 1
    })

}


export async function getAllFavourite(_id) {
    let user = await Helper.getUser()
    var userID = _id
    if (!_id) {
        userID = user.id
    }
    return JSON.stringify({
        user_id: userID
    })

}

export async function getVenuesByCategory(category) {
    return JSON.stringify({
        type: category
    })

}



//---Waiting List Queue....
export async function addVenueToQueueList(venue_id, persons) {
    let user = await Helper.getUser()
    let location = await Helper.getUserCurrentLocation()
    var locationLatLng = ""
    if (location) {
        locationLatLng = `${location.latitude},${location.longitude}`
    }
    return JSON.stringify({
        user_id: user.id,
        venue_id: venue_id,
        persons: persons,
        location: locationLatLng
    })

}

export async function getUserWaitingListWithHistory(id) {
    //let user = await Helper.getUser()
    return JSON.stringify({
        user_id: id
    })

}

export async function updateVenueQueListByUser(queueID, status, venue_id) {
    let user = await Helper.getUser()
    return JSON.stringify({
        user_id: user.id,
        id: queueID,
        status: status,
        venue_id: venue_id
    })

}



//----------VENUE
export async function getVenueWaitingListWithHistory(venue_id) {
    //let user = await Helper.getUser()
    return JSON.stringify({
        venue_id: venue_id
    })

}

export async function updateQueueByVenue(waitingID, status, user_id, venue_id) {
    return JSON.stringify({
        id: waitingID,
        status: status,
        user_id: user_id,
        venue_id: venue_id
    })
}

export async function addUserToQueueManually(persons, person_details) {
    let venue = await Helper.venueUserObject
    return JSON.stringify({
        persons: persons,
        person_details: person_details,
        id: venue.id
    })

}



export async function updateVenueProfile(id, location, latitude, longitude, zip_code, total_capacity, limit_group, ids, open_time, close_time, day) {

    // latitude: latitude,
    // longitude: longitude,
    return JSON.stringify({
        id: id,
        location: location,
        zip_code: zip_code,
        total_capacity: total_capacity,
        limit_group: limit_group,
        ids: ids,
        open_time: open_time,
        close_time: close_time,
        day: day,
    })

}

export async function toggleVenue(venue_id, toggle) {
    return JSON.stringify({
        id: venue_id,
        toggle: toggle
    })
}


export async function registerDeviceToken(user_id, fcm_token, platform, type) {
    return JSON.stringify({
        user_id: user_id,
        fcm_token: fcm_token,
        platform: platform,
        type: type
    })
}



