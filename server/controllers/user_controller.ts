import User from '../models/user'
import fs from 'fs'

interface UDataName {
    email: string;
    firstName: string;
    lastName: string
}

interface UDataPhone {
    email: string;
    phoneNumbers: [
        {
            type: string;
            value: string
        }
    ]
}

interface UDataID {
    email: string;
    id: string;
}

const names_path = 'data/user_names.json'
const phones_path = 'data/user_phones.json'
const ids_path = 'data/user_ids.json'

function readUserNames () {
    let rawdata = fs.readFileSync(names_path, 'utf-8')
    let names : UDataName[] = JSON.parse(rawdata)
    return names
}

function readUserPhones () {
    let rawdata = fs.readFileSync(phones_path, 'utf-8')
    let phones : UDataPhone[] = JSON.parse(rawdata)
    return phones
}

function readUserIDs () {
    let rawdata = fs.readFileSync(ids_path, 'utf-8')
    let ids : UDataID[] = JSON.parse(rawdata)
    return ids
}

function appendUserName (data: UDataName) {
    let names = readUserNames()
    names.push(data)
    fs.writeFileSync(names_path, JSON.stringify(names, null, "\t"))
}

function appendUserPhone (data: UDataPhone) {
    let phones : UDataPhone[] = readUserPhones()
    phones.push(data)
    fs.writeFileSync(phones_path, JSON.stringify(phones, null, "\t"))
}

function appendUserID (data: UDataID) {
    let ids : UDataID[] = readUserIDs()
    ids.push(data)
    fs.writeFileSync(ids_path, JSON.stringify(ids, null, "\t"))
}

function deleteUserName (email: string) {
    let names : UDataName[] = readUserNames()
    for (let i = 0; i < names.length; i++) {
        if (names[i].email === email) {
            names.splice(i)
            break
        }
    }
    fs.writeFileSync(names_path, JSON.stringify(names, null, "\t"))
}

function deleteUserPhone (email: string) {
    let phones : UDataPhone[] = readUserPhones()
    for (let i = 0; i < phones.length; i++) {
        if (phones[i].email === email) {
            phones.splice(i)
            break
        }
    }
    fs.writeFileSync(phones_path, JSON.stringify(phones, null, "\t"))
}

function deleteUserID (email: string) {
    let ids : UDataID[] = readUserIDs()
    for (let i = 0; i < ids.length; i++) {
        if (ids[i].email === email) {
            ids.splice(i)
            break
        }
    }
    fs.writeFileSync(ids_path, JSON.stringify(ids, null, "\t"))
}

function primaryPhone (phones: UDataPhone) {
    for (let i = 0; i < phones.phoneNumbers.length; i++) {
        if (phones.phoneNumbers[i].type === "primary") return phones.phoneNumbers[i].value
    }
    return phones.phoneNumbers[0].value
}

function compose () {
    let names = readUserNames()
    let phones = readUserPhones()
    let ids = readUserIDs()
    let users : User[] = []
    for (let i = 0; i < ids.length; i++) {
        let first_name_found = '', last_name_found = '', phone_found = ''
        for (let j = 0; j < names.length; j++) {
            if (ids[i].email === names[j].email) {
                first_name_found = names[j].firstName
                last_name_found = names[j].lastName
                break
            }
        }
        for (let j = 0; j < phones.length; j++) {
            if (ids[i].email === phones[j].email) {
                phone_found = primaryPhone(phones[j])
                break
            }
        }
        users.push({
            _id: ids[i].id,
            email: ids[i].email,
            firstName: first_name_found,
            lastName: last_name_found,
            phoneNumber: phone_found
        })
    }
    return users
}

function decomposeAppend (user: User) {
    appendUserID({email: user.email, id: user._id})
    appendUserName({email: user.email, firstName: user.firstName, lastName: user.lastName})
    appendUserPhone({email: user.email, phoneNumbers: [{type: 'primary', value: user.phoneNumber}]})
}

function decomposeDelete (user: User) {
    deleteUserName(user.email)
    deleteUserPhone(user.email)
    deleteUserID(user.email)
}

function filterCompare (value : string, pattern: string) {
    // Only * means eveything which is always true
    if (pattern === '*') return true
    // No special pattern
    if (pattern.indexOf('*') === -1) return (value === pattern)
    // * in the beginning - Check suffix
    if (pattern.indexOf('*') === 0) return (value.endsWith(pattern.substring(1)))
    // * in the end - Check prefix
    if (pattern.indexOf('*') === pattern.length - 1) return (value.startsWith(pattern.substring(0, pattern.length - 1)))
    // * in the middle - Check both prefix and suffix
    return (value.startsWith(pattern.substring(0, pattern.indexOf('*'))) &&
        value.endsWith(pattern.substring(pattern.indexOf('*') + 1)));
}

function filterMatches (value : string, filter_value : string | string[]) {
    if (typeof filter_value === 'string') return filterCompare(value, filter_value)
    for (let i = 0; i < filter_value.length; i++) {
        if (filterCompare(value, filter_value[i])) return true
    }
    return false
}

function filterUser (user : User, filter: {field: string, value: string | string[]}[]) {
    for (let i = 0; i < filter.length; i++) {
        if (filter[i].field === 'email' && !filterMatches(user.email, filter[i].value)) return false
        if (filter[i].field === 'phoneNumber' && !filterMatches(user.phoneNumber, filter[i].value)) return false
    }
    return true
}

function getRandomUID() {
    let uid = ''
    for (let i = 0; i < 24; i++) {
        let v = Math.floor(Math.random() * 17)
        uid += (v < 10 ? String.fromCharCode(v + 48) : String.fromCharCode(v + 87))
    }
    return uid
}

export function generateUID () {
    let ids = readUserIDs()
    let exists = true
    let uid = ''
    while (exists) {
        exists = false
        uid = getRandomUID()
        for (let i = 0; i < ids.length; i++) {
            if (ids[i].id === uid) exists = true
        }
    }
    return uid
}

function checkEmailDuplicate (email : string, id: string) {
    let ids = readUserIDs()
    for (let i = 0; i < ids.length; i++) {
        if (ids[i].email === email && id !== ids[i].id) return true
    }
    return false
}

export function GetUsers (filter?: {field: string, value: string | string[]}[]) {
    if (filter === undefined || filter.length === 0) return compose()
    let u = compose()
    return u.filter(user => filterUser(user, filter))
}

export function GetUserById (id: string) {
    let u = compose()
    return u.filter(user => user._id === id)[0]
}

export function InsertUser (u: User) {
    decomposeAppend(u)
}

export function DeleteUserById (id: string) {
    let u = GetUserById(id)
    if (u === undefined) return false
    decomposeDelete(u)
    return true
}

export function UpdateUserById (id: string, newData: User) {
    let old_email = GetUserById(id).email
    let names = readUserNames()
    let phones = readUserPhones()
    let ids = readUserIDs()
    for (let i = 0; i < names.length; i++) {
        if (names[i].email === old_email) {
            names[i].email = newData.email
            names[i].firstName = newData.firstName
            names[i].lastName = newData.lastName
            break
        }
    }
    for (let i = 0; i < phones.length; i++) {
        if (phones[i].email === old_email) {
            phones[i].email = newData.email
            phones[i].phoneNumbers = [{type: 'primary', value: newData.phoneNumber}]
            break
        }
    }
    for (let i = 0; i < ids.length; i++) {
        if (ids[i].id === id) {
            ids[i].email = newData.email
            break
        }
    }
    fs.writeFileSync(names_path, JSON.stringify(names, null, "\t"))
    fs.writeFileSync(phones_path, JSON.stringify(phones, null, "\t"))
    fs.writeFileSync(ids_path, JSON.stringify(ids, null, "\t"))
}

export function capitalizeFirst (str: string) {
    let f = ''
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i)
        if (i === 0) f += String.fromCharCode(code - (code >= 97 && code <= 122 ? 32 : 0))
        else f += String.fromCharCode(code + (code >= 65 && code <= 90 ? 32 : 0))
    }
    return f
}

function validateEmail (email: string) {
    return email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/) !== null
}

function validateName (name: string) {
    return name.match(/^[A-Z][a-z]+$/) !== null
}

function validatePhone (phone: string) {
    return phone.match(/^[0-9]{3}-[0-9]{3}-[0-9]{4}$/) !== null
}

export function validate (u: User) {
    if (!validateEmail(u.email)) return {message: "Invalid E-mail!"}
    if (checkEmailDuplicate(u.email, u._id)) return {message: "User with given email already exists!"}
    if (!validateName(u.firstName)) return {message: "Invalid First Name!"}
    if (!validateName(u.lastName)) return {message: "Invalid Last Name!"}
    if (!validatePhone(u.phoneNumber)) return {message: "Invalid Phone Number!"}
    return null
}