

export const BASE_URL = "https://admin.wela.app/api/v1/"
export function getFullUrl(api) { return BASE_URL + api }

export const LOGIN = `login`
export const REGISTER = `register`
export const SOCIAL_LOGIN = `social/login`
export const UPDATE_PROFILE = `register`
export const VERIFY_CODE = `verification`
export const RESEND_CODE = `resend/code`
export const ADD_TO_FAVOUITE = `favourite/add`
export const GET_FAVOURITE = `favourite/get`
export const GET_VENUES = `venue/get`
export const GET_VENUE_TYPES = `venue/type/get`
export const GET_CUSTOM_LOG = `customer/log`

export const ADD_RQUEST_TO_VENUE = `queue/add`
export const GET_USER_WAITING_LIST = `queue/user/get`
export const CANCEL_WAITING_LIST_BY_USER = `queue/update`


export const REGISTER_DEVICE = `register_device`



//----VENUE
export const GET_VENUE_WAITING_LIST = `queue/venue/get`
export const NOTIFY_TO_USER = `queue/update`
export const UPDATE_VENUE_PROFILE = `venue/update`
export const CREATE_VENUE_PROFILE = `venue/update`
export const TOGGLE_VENUE = `venue/toggle`
export const MANUAL_ADD = `queue/manual/add`
export const DELETE_QUEUE = `queue/remove`
export const CHANGE_PASSWORD = `change_password`
