import keyMirror from "key-mirror";

const actionTypes = keyMirror({
    /* notification */
    TOGGLE_NOTIFICATION: null,
    /* dimension */
    RESET_DIMENSIONS: null,
    GET_DIMENSIONS: null,
    GET_CONFIGURABLE_DIMENSIONS: null,
    GET_EDITOR_DIMENSIONS: null,
    GET_ALL_DIMENSIONS: null,
    /* dimensionMember */
    RESET_DIMENSION_MEMBERS: null,
    GET_MEMBERS: null,
    GET_ORIGIN_MEMBERS: null,
    GET_APPROVAL_MEMBERS: null,
    GET_PERIOD_MEMBERS: null,
    GET_MANAGE_MEMBERS: null,
    RESET_MANAGE_MEMBERS: null,
    GET_UNUSED_MEMBERS: null,
    GET_CALCULATED_MEMBERS: null,
    NEW_CALCULATED_MEMBER_ADDED: null,
    CALCULATED_MEMBER_DELETED: null,
    CALCULATED_MEMBER_UPDATED: null,
    UPDATE_UNUSED_MEMBER: null,
    NEW_MEMBER_ADDED: null,
    UPDATE_UNUSED_ATTRIBUTES: null,
    /* groups */
    GET_GROUPS: null,
    GET_NEW_HIERARCHY_GROUPS: null,
    GET_MANAGE_GROUPS: null,
    RESET_MANAGE_GROUPS: null,
    SAVE_CREATED_GROUP: null,
    /* case */
    RESET_CASES: null,
    ADD_NEW_CASE: null,
    GET_BALANCE_SEQUENCES: null,
    CASE_FEEDS_RESPONSE: null,
    CREATE_CASE_RESPONSE: null,
    GET_CASE_TYPES: null,
    GET_CASE_YEARS: null,
    GET_CASE_DATES: null,
    GET_SOURCE_CASES: null,
    /* views */
    RESET_VIEWS: null,
    GET_VIEWS: null,
    GET_CASE_VIEWS: null,
    GET_ASSIGNED_VIEWS: null,
    GET_EDITOR_AFFECTED_VIEWS: null,
    VIEW_ADDED: null,
    UPDATE_VIEW: null,
    /* hierarchy */
    RESET_HIERARCHY: null,
    GET_LOCK_STATUS: null,
    GET_CHANGES: null,
    UPDATE_HIERARCHY_ATTRIBUTES: null,
    /* auth */
    RESET_GROUPS: null,
    GET_USER_INFO: null,
    /* attribute */
    RESET_ATTRS: null,
    GET_ATTRIBUTES: null,
    SAVE_ATTRIBUTES: null,
    NEW_ATTRIBUTE: null,
    /*approval*/
    SAVE_PENDING: null,
    REMOVE_PENDING: null,
    /*home*/
    ADD_QUEUE: null
});

export default actionTypes;