"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.capitalizeFirst = exports.UpdateUserById = exports.DeleteUserById = exports.InsertUser = exports.GetUserById = exports.GetUsers = exports.generateUID = void 0;
const fs_1 = __importDefault(require("fs"));
const names_path = 'data/user_names.json';
const phones_path = 'data/user_phones.json';
const ids_path = 'data/user_ids.json';
function readUserNames() {
    let rawdata = fs_1.default.readFileSync(names_path, 'utf-8');
    let names = JSON.parse(rawdata);
    return names;
}
function readUserPhones() {
    let rawdata = fs_1.default.readFileSync(phones_path, 'utf-8');
    let phones = JSON.parse(rawdata);
    return phones;
}
function readUserIDs() {
    let rawdata = fs_1.default.readFileSync(ids_path, 'utf-8');
    let ids = JSON.parse(rawdata);
    return ids;
}
function appendUserName(data) {
    let names = readUserNames();
    names.push(data);
    fs_1.default.writeFileSync(names_path, JSON.stringify(names, null, "\t"));
}
function appendUserPhone(data) {
    let phones = readUserPhones();
    phones.push(data);
    fs_1.default.writeFileSync(phones_path, JSON.stringify(phones, null, "\t"));
}
function appendUserID(data) {
    let ids = readUserIDs();
    ids.push(data);
    fs_1.default.writeFileSync(ids_path, JSON.stringify(ids, null, "\t"));
}
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
function primaryPhone(phones) {
    for (let i = 0; i < phones.phoneNumbers.length; i++) {
        if (phones.phoneNumbers[i].type === "primary")
            return phones.phoneNumbers[i].value;
    }
    return phones.phoneNumbers[0].value;
}
function compose() {
    let names = readUserNames();
    let phones = readUserPhones();
    let ids = readUserIDs();
    let users = [];
    for (let i = 0; i < ids.length; i++) {
        let first_name_found = '', last_name_found = '', phone_found = '';
        for (let j = 0; j < names.length; j++) {
            if (ids[i].email === names[j].email) {
                first_name_found = names[j].firstName;
                last_name_found = names[j].lastName;
                break;
            }
        }
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
function decomposeAppend(user) {
    appendUserID({ email: user.email, id: user._id });
    appendUserName({ email: user.email, firstName: user.firstName, lastName: user.lastName });
    appendUserPhone({ email: user.email, phoneNumbers: [{ type: 'primary', value: user.phoneNumber }] });
}
function decomposeDelete(user) {
    deleteUserName(user.email);
    deleteUserPhone(user.email);
    deleteUserID(user.email);
}
function filterMatches(value, filter_value) {
    if (typeof filter_value === 'string')
        return (filter_value === value);
    for (let i = 0; i < filter_value.length; i++) {
        if (value === filter_value[i])
            return true;
    }
    return false;
}
function filterUser(user, filter) {
    for (let i = 0; i < filter.length; i++) {
        if (filter[i].field === 'email' && !filterMatches(user.email, filter[i].value))
            return false;
        if (filter[i].field === 'phoneNumber' && !filterMatches(user.phoneNumber, filter[i].value))
            return false;
    }
    return true;
}
function getRandomUID() {
    let uid = '';
    for (let i = 0; i < 24; i++) {
        let v = Math.floor(Math.random() * 17);
        uid += (v < 10 ? String.fromCharCode(v + 48) : String.fromCharCode(v + 87));
    }
    return uid;
}
function generateUID() {
    let ids = readUserIDs();
    let exists = true;
    let uid = '';
    while (exists) {
        exists = false;
        uid = getRandomUID();
        for (let i = 0; i < ids.length; i++) {
            if (ids[i].id === uid)
                exists = true;
        }
    }
    return uid;
}
exports.generateUID = generateUID;
function checkEmailDuplicate(email, id) {
    let ids = readUserIDs();
    for (let i = 0; i < ids.length; i++) {
        if (ids[i].email === email && id !== ids[i].id)
            return true;
    }
    return false;
}
function GetUsers(filter) {
    if (filter === undefined || filter.length === 0)
        return compose();
    let u = compose();
    return u.filter(user => filterUser(user, filter));
}
exports.GetUsers = GetUsers;
function GetUserById(id) {
    let u = compose();
    return u.filter(user => user._id === id)[0];
}
exports.GetUserById = GetUserById;
function InsertUser(u) {
    decomposeAppend(u);
}
exports.InsertUser = InsertUser;
function DeleteUserById(id) {
    let u = GetUserById(id);
    if (u === undefined)
        return false;
    decomposeDelete(u);
    return true;
}
exports.DeleteUserById = DeleteUserById;
function UpdateUserById(id, newData) {
    let old_email = GetUserById(id).email;
    let names = readUserNames();
    let phones = readUserPhones();
    let ids = readUserIDs();
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
function capitalizeFirst(str) {
    let f = '';
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (i === 0)
            f += String.fromCharCode(code - (code >= 97 && code <= 122 ? 32 : 0));
        else
            f += String.fromCharCode(code + (code >= 65 && code <= 90 ? 32 : 0));
    }
    return f;
}
exports.capitalizeFirst = capitalizeFirst;
function validateEmail(email) {
    return email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null;
}
function validateName(name) {
    return name.match(/^[A-Z][a-z]+$/) !== null;
}
function validatePhone(phone) {
    return phone.match(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/) !== null;
}
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
