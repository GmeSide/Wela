
import AsyncStorage from '@react-native-community/async-storage';
import GetLocation from 'react-native-get-location';
import Constants from './Constants'
import Geocoder from 'react-native-geocoder';

class Helper {
    static DEBUG = __DEV__
    static HARDCODED_LOCATION_SHOW = false
    static DISTANCE = 200
    static UNIT = "K" // "K"|"M" K->kilo meters , M->For miles
    // static HARDCODED_LATS = 10.8009
    // static HARDCODED_LONGTS = 106.6503763
    static HARDCODED_LATS = 43.6559534
    static HARDCODED_LONGTS = -79.3660584


    static user
    static userFavouritesVenue
    static userQueList = { data: [] }

    static VenueSignUp

    static venueQueueDataOfCustomers
    static venueUserObject
    static venueProfiles
    static locationAlert = false

    static DEVICE_TOKEN
    /**
     * Log only when app is in debug mode
     * @param {*} message
     */
    static DEBUG_LOG(message) {
        if (this.DEBUG) {
            console.log(message)
        }
    }

    /**
     * Email validation
     * @param {*} text
     */
    static isValidEmail(text) {
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(text) === false) {
            return false;
        }
        return true;
    }

    static updateFavoritesList(data) {
        this.userFavouritesVenue = data
    }
    static getFavouritesList() {
        return this.userFavouritesVenue
    }

    static updateUserQueList(data) {
        this.userQueList = data
    }
    static getUserQueList() {
        return this.userQueList
    }

    /////////////////////////////////////////////////////////////////////
    //                SAVE & RETRIVE CACHE DATA CUSTOM FUNCTIONS
    ////////////////////////////////////////////////////////////////////

    /**
     *
     * @param {*} data
     */
    static async saveUser(data) {
        this.storeData(Constants.KEY_USER, data)
    }

    /**
     * GET USER OBJECT
     */
    static async getUser() {
        // if (this.user && this.user != null && this.user.id) {
        //     return this.user
        // }
        this.user = await this.getSroedData(Constants.KEY_USER)
        return this.user
    }

    /**
     * GET USER FCM TOKEN
     */
    static async getDeviceFCMToken() {
        let token = await this.getSroedData(Constants.KEY_FCM_TOKEN)
        return token
    }

    static async saveDeviceFcmToken(token) {
        this.storeData(Constants.KEY_FCM_TOKEN, token)
    }

    static async getUserType() {
        let type = await this.getSroedData(Constants.KEY_USER_TYPE)
        return type
    }

    static async saveUserType(type) {
        this.storeData(Constants.KEY_USER_TYPE, type)
    }

    // }

    /**
     * GET CATEGORIES
     */
    static async getVenueCategories() {
        console.log('Helper getVenueCategories IN.');
        let user = await this.getUser()
        var types = user.venue_type.type
        var venues = user.venue_type.venues
        var icons = user.venue_type.icons
        var categories = []

        types.map((category, index) => {
            var data = {
                isVenue: false,
                id: index,
                name: category,
                url: icons[index]
            }
            categories.push(data)
        })
        return categories
    }

    static async getVenueCategoriesByLocation(nearestVenues) {
        // console.log('Helper getVenueCategoriesByLocation IN.');
        var categories = []
        if (nearestVenues) {
            // console.log('Helper getVenueCategoriesByLocation nearestVenues: ', nearestVenues);
            nearestVenues.map((venueItem, index) => {
                var data = {
                    isVenue: true,
                    id: venueItem.id,
                    name: venueItem.name,
                    url: "https://image.flaticon.com/icons/png/512/2702/2702342.png",
                    latitude: venueItem.latitude,
                    longitude: venueItem.longitude
                }
                categories.push(data)
            })
        }
        return categories
    }


    // static getUserType() {
    //     this.userType = this.getUser().type
    //     return this.userType

    // }


    static async isUserLoggedIn() {
        let user = await this.getUser()
        if (user) {
            if (user.email) {
                return true
            } else {
                return false
            }
        }
        return false
    }

    static async distance(lat1, lon1, lat2, lon2, unit) {
        if ((lat1 == lat2) && (lon1 == lon2)) {
            return 0;
        }
        else {
            var radlat1 = Math.PI * lat1 / 180;
            var radlat2 = Math.PI * lat2 / 180;
            var theta = lon1 - lon2;
            var radtheta = Math.PI * theta / 180;
            var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
            if (dist > 1) {
                dist = 1;
            }
            dist = Math.acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            if (unit == "K") { dist = dist * 1.609344 }
            if (unit == "N") { dist = dist * 0.8684 }
            return dist;
        }
    }

    static async getFilteredVenues(venue_type) {
        let location = await this.getUserCurrentLocation()
        let nearestVenues = await Helper.getNearestVenues(location)
        //this.DEBUG_LOG(nearestVenues)
        let filtered = await nearestVenues.filter(data => data.type.toUpperCase() === venue_type.toUpperCase());
        // this.DEBUG_LOG('---------')
        // this.DEBUG_LOG(nearestVenues)
        return filtered
    }

    // static async getNearestVenues(location) {
    //     let user = await this.getUser()
    //     let allVenues = user.venue_type.venues
    //     let nearestVenues = []

    //     if (allVenues && allVenues.length > 0) {
    //       nearestVenues = Promise.all(allVenues.map(venue => this.filterVenues(venue, location)))
    //     }

    //     return nearestVenues
    // }

    static async getNearestVenues(location) {
      let user = await this.getUser()
      let allVenues = user.venue_type.venues
      let nearestVenues = []

      if (allVenues && allVenues.length > 0) {
        for (const venue of allVenues) {
          const res = await this.filterVenues(venue, location)
          if (res == null) continue
          nearestVenues.push(res)
        }
      }

      return nearestVenues
    }

    static async filterVenues(venue, location) {
        var locDistance
        let latitude = 0
        let longitude = 0

        // update location base on address
        const address = `${venue.street_number} ${venue.street_name}, ${venue.city}, ${venue.country}`
        try {
          const res = await Geocoder.geocodeAddress(address);
          if (res && res.length > 0) {
            const { lat, lng } = res[0].position
            latitude = lat
            longitude = lng
          }
        }
        catch(err) {
            console.log(err);
        }

        if (this.HARDCODED_LOCATION_SHOW == true) {
            locDistance = await this.distance(this.HARDCODED_LATS, this.HARDCODED_LONGTS, latitude, longitude, this.UNIT)
        } else {
            locDistance = await this.distance(
                location.latitude,
                location.longitude,
                latitude,
                longitude,
                this.UNIT
            )
        }

        return {
          ...venue,
          latitude,
          longitude,
          locDistance
        }
    }

    static async getUserCurrentLocation() {
      console.log('getUserCurrentLocation');
        return GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 150000,
        })
            .then(location => {
                //Helper.DEBUG_LOG(`currentLocation ->`)
                //Helper.DEBUG_LOG(location)
                // if (this.DEBUG) {
                //   const _location = {
                //     latitude: 43.6559534,
                //     longitude: -79.3660584
                //   }
                //   return _location
                // }
                return location
            })
            .catch(ex => {
              console.log('Helper getUserCurrentLocation: ', ex);
                const { code, message } = ex;
                //Helper.DEBUG_LOG('currentLocation' + message)
                if (code === 'CANCELLED') {
                    //alert('Location cancelled by user or by another request');
                }
                if (code === 'UNAVAILABLE' || code === 'UNAUTHORIZED') {
                    if (!this.locationAlert) {
                      this.locationAlert = true
                      alert('Location service is disabled or unavailable');
                    }
                }
                if (code === 'TIMEOUT') {
                  if (!this.locationAlert) {
                    this.locationAlert = true
                      alert('Location request timed out');
                    }
                }
                // if (code === 'UNAUTHORIZED') {
                //     alert('Authorization denied');
                // }
                return null
            });
    }


    static async isVenueFavourited(venue_id) {
        //Helper.DEBUG_LOG(venue_id)

        if (Array.isArray(this.userFavouritesVenue)) {
            if (this.userFavouritesVenue.length < 1) {
                return false
            } else {
                var isFav = false
                this.userFavouritesVenue.forEach(async favourite => {
                    if (isFav == false) {
                        if (favourite.venue_id == venue_id) {
                            isFav = true
                        }
                    }
                })
                return isFav
            }
        } else {
            return false
        }
    }

    static async isAlreadyInQueue(venue_id) {
        if (this.userQueList) {
            if (this.userQueList.data) {

                if (Array.isArray(this.userQueList.data)) {
                    if (this.userQueList.data.length < 1) {
                        return false
                    } else {
                        var isAdded = false
                        this.userQueList.data.forEach(async queue => {
                            if (isAdded == false) {
                                if (queue.venue[0].id == venue_id) {
                                    isAdded = true
                                }
                            }

                        })
                        return isAdded
                    }
                } else {
                    return false
                }
            } else {
                return false
            }
        } else {
            return false
        }
    }

    static async calculateSingleVenueDistance(venue_latitude, venue_longitude) {
        let location = await this.getUserCurrentLocation()
        distance = await this.distance(
            location.latitude,
            location.longitude,
            venue_latitude,
            venue_longitude,
            this.UNIT
        )
        return distance
    }

    static async getFavSatutsesForWaitingList() {
        var favStatuses = []
        if (this.waitingsAvailable() == true) {

            let location = await this.getUserCurrentLocation()
            this.userQueList.data.forEach(async queue => {
                var isFav = false
                var distance = 0
                try {

                    distance = await this.distance(
                        location.latitude,
                        location.longitude,
                        queue.venue[0].latitude,
                        queue.venue[0].longitude,
                        this.UNIT
                    )

                    // this.DEBUG_LOG('<------------------>')
                    // this.DEBUG_LOG(location.latitude)
                    // this.DEBUG_LOG(location.longitude)
                    // this.DEBUG_LOG(queue.venue[0].latitude)
                    // this.DEBUG_LOG(queue.venue[0].longitude)
                    // this.DEBUG_LOG(distance)
                    // this.DEBUG_LOG('<-------------------->')
                } catch (error) {

                }


                if (this.favouritesAvailable() == true) {
                    this.userFavouritesVenue.forEach(async favourite => {
                        if (favourite.venue_id == queue.venue[0].id) {
                            isFav = true
                        }

                    })
                }

                var dataObj = {
                    isFav: isFav,
                    distance: distance
                }
                favStatuses.push(dataObj)
            })
        }
        return favStatuses
    }

    static totalInCurrentWaitingList() {
        if (this.userQueList) {
            if (this.userQueList.data) {
                if (Array.isArray(this.userQueList.data)) {
                    if (this.userQueList.data.length > 0) {
                        return this.userQueList.data.length

                    }
                }
            }
        }

        return 0
    }
    static waitingsAvailable() {
        if (this.userQueList) {
            if (this.userQueList.data) {
                if (Array.isArray(this.userQueList.data)) {
                    if (this.userQueList.data.length > 0) {
                        return true

                    }
                }
            }
        }

        return false
    }

    static waitingsHistoryAvailable() {
        if (this.userQueList) {
            if (this.userQueList.data_history) {
                if (Array.isArray(this.userQueList.data_history)) {
                    if (this.userQueList.data_history.length > 0) {
                        return true

                    }
                }
            }
        }

        return false
    }
    static waitingListEmpty() {
        if (this.waitingsAvailable() === true) {
            return false
        } else if (this.waitingsHistoryAvailable() === true) {
            return false
        } else {
            return true
        }

    }



    static favouritesAvailable() {

        if (this.userFavouritesVenue) {
            if (Array.isArray(this.userFavouritesVenue)) {
                if (this.userFavouritesVenue.length > 0) {
                    return true

                }
            }
        }


        return false
    }

    /////////////////////////////////////////////////////////////////////
    //                ASYN STORAGE
    ////////////////////////////////////////////////////////////////////

    /**
     * SAVING TO CACHE
     * @param {*} key
     * @param {*} value
     */
    static storeData = async (key, value) => {
        try {
            const jsonValue = JSON.stringify(value)
            await AsyncStorage.setItem(key, jsonValue)
        } catch (e) {
            DEBUG_LOG('saving error')
        }
    }

    /**
     * FETCHING DATA FROM CACHE
     * @param {*} key
     */
    static getSroedData = async (key) => {
        try {
            const jsonValue = await AsyncStorage.getItem(key)
            return JSON.parse(jsonValue);
        } catch (e) {
            // error reading value
        }
    }

    static clearAsyncStorage = async () => {
        try {

            try {
                this.user = {}
                this.userFavouritesVenue = []
                this.userQueList = []
                this.venueQueueDataOfCustomers = []
                this.venueUserObject = {}
                this.venueProfiles = []
                this.userFavouritesVenue = []

            } catch (error) {

            }
            await AsyncStorage.clear();

        } catch (error) {

        }
    }
}
export default Helper
