"use strict";
/**
 * This file contains all operations on User objects
 * as well as DB handling
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.capitalizeFirst = exports.UpdateUserById = exports.DeleteUserById = exports.InsertUser = exports.GetUserById = exports.GetUsers = exports.generateUID = void 0;
const fs_1 = __importDefault(require("fs"));
// File paths
const names_path = 'data/user_names.json';
const phones_path = 'data/user_phones.json';
const ids_path = 'data/user_ids.json';
/**
 * Raed all user names from DB
 * @returns User Names
 */
function readUserNames() {
    let rawdata = fs_1.default.readFileSync(names_path, 'utf-8');
    let names = JSON.parse(rawdata);
    return names;
}
/**
 * Raed all user phones from DB
 * @returns User Phones
 */
function readUserPhones() {
    let rawdata = fs_1.default.readFileSync(phones_path, 'utf-8');
    let phones = JSON.parse(rawdata);
    return phones;
}
/**
 * Raed all user ids from DB
 * @returns User IDs
 */
function readUserIDs() {
    let rawdata = fs_1.default.readFileSync(ids_path, 'utf-8');
    let ids = JSON.parse(rawdata);
    return ids;
}
/**
 * Add new name entry to DB
 * @param data New User names entry
 */
function appendUserName(data) {
    let names = readUserNames();
    names.push(data);
    fs_1.default.writeFileSync(names_path, JSON.stringify(names, null, "\t"));
}
/**
 * Add new phone entry to DB
 * @param data New User phones entry
 */
function appendUserPhone(data) {
    let phones = readUserPhones();
    phones.push(data);
    fs_1.default.writeFileSync(phones_path, JSON.stringify(phones, null, "\t"));
}
/**
 * Add new ID entry to DB
 * @param data New User ID entry
 */
function appendUserID(data) {
    let ids = readUserIDs();
    ids.push(data);
    fs_1.default.writeFileSync(ids_path, JSON.stringify(ids, null, "\t"));
}
/**
 * Remove User name entry from DB
 * @param email User E-mail
 */
function deleteUserName(email) {
    let names = readUserNames();
    for (let i = 0; i < names.length; i++) {
        if (names[i].email === email) {
            names.splice(i);
            break;
        }
    }
    fs_1.default.writeFileSync(names_path, JSON.stringify(names, null, "\t"));
}
/**
 * Remove User phone entry from DB
 * @param email User E-mail
 */
function deleteUserPhone(email) {
    let phones = readUserPhones();
    for (let i = 0; i < phones.length; i++) {
        if (phones[i].email === email) {
            phones.splice(i);
            break;
        }
    }
    fs_1.default.writeFileSync(phones_path, JSON.stringify(phones, null, "\t"));
}
/**
 * Remove User ID entry from DB
 * @param email User E-mail
 */
function deleteUserID(email) {
    let ids = readUserIDs();
    for (let i = 0; i < ids.length; i++) {
        if (ids[i].email === email) {
            ids.splice(i);
            break;
        }
    }
    fs_1.default.writeFileSync(ids_path, JSON.stringify(ids, null, "\t"));
}
/**
 * Get primary phone from phones list
 * @param phones User phone list
 * @returns Primary phone
 */
function primaryPhone(phones) {
    for (let i = 0; i < phones.phoneNumbers.length; i++) {
        if (phones.phoneNumbers[i].type === "primary")
            return phones.phoneNumbers[i].value;
    }
    return phones.phoneNumbers[0].value;
}
/**
 * Compose all files and return all users
 * @returns User List
 */
function compose() {
    let names = readUserNames();
    let phones = readUserPhones();
    let ids = readUserIDs();
    let users = [];
    // Connect ID Document with other documents
    for (let i = 0; i < ids.length; i++) {
        let first_name_found = '', last_name_found = '', phone_found = '';
        // Find matching name by email
        for (let j = 0; j < names.length; j++) {
            if (ids[i].email === names[j].email) {
                first_name_found = names[j].firstName;
                last_name_found = names[j].lastName;
                break;
            }
        }
        // Find matching phone by email
        for (let j = 0; j < phones.length; j++) {
            if (ids[i].email === phones[j].email) {
                phone_found = primaryPhone(phones[j]);
                break;
            }
        }
        users.push({
            _id: ids[i].id,
            email: ids[i].email,
            firstName: first_name_found,
            lastName: last_name_found,
            phoneNumber: phone_found
        });
    }
    return users;
}
/**
 * Decompose user object into separate files and add new user data
 * @param user User to add
 */
function decomposeAppend(user) {
    appendUserID({ email: user.email, id: user._id });
    appendUserName({ email: user.email, firstName: user.firstName, lastName: user.lastName });
    appendUserPhone({ email: user.email, phoneNumbers: [{ type: 'primary', value: user.phoneNumber }] });
}
/**
 * Delete user data by decomposing deletion into separate files
 * @param user User to remove
 */
function decomposeDelete(user) {
    deleteUserName(user.email);
    deleteUserPhone(user.email);
    deleteUserID(user.email);
}
/**
 * Compare value with filter
 * @param value Value to check
 * @param pattern Filter pattern (`*` Symbol is reserved for matching any character.
 * i.e. `dog` macthes exactly `dog`,
 * `d*` matches any string starting with `d`,
 * `*od` matches any string ending with `od`,
 * `ma*n` matches any string starting with `ma` and ending with `n`.
 * Only one `*` is allowed per pattern)
 * @returns `true` - match successful | `false` - no match
 */
function filterCompare(value, pattern) {
    // Only * means eveything which is always true
    if (pattern === '*')
        return true;
    // No special pattern
    if (pattern.indexOf('*') === -1)
        return (value === pattern);
    // * in the beginning - Check suffix
    if (pattern.indexOf('*') === 0)
        return (value.endsWith(pattern.substring(1)));
    // * in the end - Check prefix
    if (pattern.indexOf('*') === pattern.length - 1)
        return (value.startsWith(pattern.substring(0, pattern.length - 1)));
    // * in the middle - Check both prefix and suffix
    return (value.startsWith(pattern.substring(0, pattern.indexOf('*'))) &&
        value.endsWith(pattern.substring(pattern.indexOf('*') + 1)));
}
/**
 * Check all filter matches
 * @param value Value to check
 * @param filter_value Filter pattern(s)
 * @returns `true` - match successful | `false` - no match
 */
function filterMatches(value, filter_value) {
    if (typeof filter_value === 'string')
        return filterCompare(value, filter_value);
    for (let i = 0; i < filter_value.length; i++) {
        if (filterCompare(value, filter_value[i]))
            return true;
    }
    return false;
}
/**
 * Check if user satisfies filtering process
 * @param user User to check
 * @param filter Filter Array
 * @returns `true` - user matches the criteria | `false` - no match
 */
function filterUser(user, filter) {
    for (let i = 0; i < filter.length; i++) {
        if (filter[i].field === 'email' && !filterMatches(user.email, filter[i].value))
            return false;
        if (filter[i].field === 'phoneNumber' && !filterMatches(user.phoneNumber, filter[i].value))
            return false;
    }
    return true;
}
/**
 * Get random ID
 * @returns Hex string of length 24
 */
function getRandomUID() {
    let uid = '';
    for (let i = 0; i < 24; i++) {
        // Random <0,15>
        let v = Math.floor(Math.random() * 16);
        // ASCII codes (0 - 9) -> (48 - 57) | (10 - 15) -> (97 - 102)
        uid += (v < 10 ? String.fromCharCode(v + 48) : String.fromCharCode(v + 87));
    }
    return uid;
}
/**
 * Generate new UID
 * @returns New UID
 */
function generateUID() {
    let ids = readUserIDs();
    let exists = true;
    let uid = '';
    // Generate random IDs until it's unique
    while (exists) {
        exists = false;
        uid = getRandomUID();
        for (let i = 0; i < ids.length; i++) {
            if (ids[i].id === uid) {
                exists = true;
                break;
            }
        }
    }
    return uid;
}
exports.generateUID = generateUID;
/**
 * Check if given user email is already in DB
 * @param email User Email
 * @param id User ID
 * @returns `true` - duplicate found | `false` - duplicate not found
 */
function checkEmailDuplicate(email, id) {
    let ids = readUserIDs();
    for (let i = 0; i < ids.length; i++) {
        // The ID might be the same if User is being edited so this case should be ignored
        if (ids[i].email === email && id !== ids[i].id)
            return true;
    }
    return false;
}
/**
 * Get all users
 * @param filter If present, returns all users with given filters
 * @returns User List
 */
function GetUsers(filter) {
    let u = compose();
    // No filter - return everything
    if (filter === undefined || filter.length === 0)
        return u;
    return u.filter(user => filterUser(user, filter));
}
exports.GetUsers = GetUsers;
/**
 * Get user by id
 * @param id user ID
 * @returns User
 */
function GetUserById(id) {
    let u = compose();
    // Filter returns Array so retrieve only 1st element
    return u.filter(user => user._id === id)[0];
}
exports.GetUserById = GetUserById;
/**
 * Insert new User
 * @param u User
 */
function InsertUser(u) {
    decomposeAppend(u);
}
exports.InsertUser = InsertUser;
/**
 * Delete User By ID
 * @param id User ID
 * @returns `true` - Success | `false` - User not found
 */
function DeleteUserById(id) {
    let u = GetUserById(id);
    if (u === undefined)
        return false;
    decomposeDelete(u);
    return true;
}
exports.DeleteUserById = DeleteUserById;
/**
 * Update User by ID
 * @param id User ID
 * @param newData New User Data
 */
function UpdateUserById(id, newData) {
    let old_email = GetUserById(id).email;
    let names = readUserNames();
    let phones = readUserPhones();
    let ids = readUserIDs();
    // Decomposing into separate files using old email (email might have been changed in newData)
    for (let i = 0; i < names.length; i++) {
        if (names[i].email === old_email) {
            names[i].email = newData.email;
            names[i].firstName = newData.firstName;
            names[i].lastName = newData.lastName;
            break;
        }
    }
    for (let i = 0; i < phones.length; i++) {
        if (phones[i].email === old_email) {
            phones[i].email = newData.email;
            phones[i].phoneNumbers = [{ type: 'primary', value: newData.phoneNumber }];
            break;
        }
    }
    for (let i = 0; i < ids.length; i++) {
        if (ids[i].id === id) {
            ids[i].email = newData.email;
            break;
        }
    }
    fs_1.default.writeFileSync(names_path, JSON.stringify(names, null, "\t"));
    fs_1.default.writeFileSync(phones_path, JSON.stringify(phones, null, "\t"));
    fs_1.default.writeFileSync(ids_path, JSON.stringify(ids, null, "\t"));
}
exports.UpdateUserById = UpdateUserById;
/**
 * Capitalize first letter for names
 * @param str String to modify
 * @returns Modified string (i.e mArtin -> Martin)
 */
function capitalizeFirst(str) {
    let f = '';
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        // First letter big (97 - 122) -> (65 - 90)
        if (i === 0)
            f += String.fromCharCode(code - (code >= 97 && code <= 122 ? 32 : 0));
        // Other letters small (65 - 90) -> (97 - 122)
        else
            f += String.fromCharCode(code + (code >= 65 && code <= 90 ? 32 : 0));
    }
    return f;
}
exports.capitalizeFirst = capitalizeFirst;
/**
 * Validate email
 * @param email E-mail
 * @returns `true` - OK | `false` - Wrong e-mail format
 */
function validateEmail(email) {
    return email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null;
}
/**
 * Validate name
 * @param name Name
 * @returns `true` - OK | `false` - Wrong name format
 */
function validateName(name) {
    return name.match(/^[A-Z][a-z]+$/) !== null;
}
/**
 * Validate phone
 * @param phone Phone
 * @returns `true` - OK | `false` - Wrong phone format
 */
function validatePhone(phone) {
    return phone.match(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/) !== null;
}
/**
 * Validate User
 * @param u User
 * @returns `null` - OK | `{message: string}` - Validation failed (with error message)
 */
function validate(u) {
    if (!validateEmail(u.email))
        return { message: "Invalid E-mail!" };
    if (checkEmailDuplicate(u.email, u._id))
        return { message: "User with given email already exists!" };
    if (!validateName(u.firstName))
        return { message: "Invalid First Name!" };
    if (!validateName(u.lastName))
        return { message: "Invalid Last Name!" };
    if (!validatePhone(u.phoneNumber))
        return { message: "Invalid Phone Number!" };
    return null;
}
exports.validate = validate;
