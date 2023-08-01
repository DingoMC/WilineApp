import axios from 'axios'
import { useState, useEffect } from 'react';
import { validateEmail, validateName, validatePhone } from '../../lib/validator';

// User TS Model
export interface user {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

const User = (props: {
    UserData : user
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
    setInfoMessage: React.Dispatch<React.SetStateAction<string>>,
    handleUserGet: () => Promise<void>
}) => {

    const [editMode, setEditMode] = useState(false)
    const [newUserData, setNewUserData] = useState({
        firstName: props.UserData.firstName,
        lastName: props.UserData.lastName,
        email: props.UserData.email,
        phoneNumber: props.UserData.phoneNumber})
    const [isValid, setIsValid] = useState({
        firstName: validateName(props.UserData.firstName),
        lastName: validateName(props.UserData.lastName),
        email: validateEmail(props.UserData.email),
        phoneNumber: validatePhone(props.UserData.phoneNumber)})
    const [valid, setValid] = useState(false)

    useEffect(() => {
        setValid(isValid.email && isValid.firstName && isValid.lastName && isValid.phoneNumber)
    }, [isValid])

    const handleUserDelete = async () => {
        axios.delete('http://localhost:3001/users/' + props.UserData._id)
        .then((response) => {
            props.setErrorMessage('')
            props.setInfoMessage('User deleted successfully')
            props.handleUserGet()
        })
        .catch((error) => {
            if (error.response) {
                const data : {message: string} = error.response.data
                props.setErrorMessage(data.message)
                props.setInfoMessage('')
            }
        })
    }

    const handleUserUpdate = async () => {
        axios.put('http://localhost:3001/users/' + props.UserData._id, {
            firstName: newUserData.firstName,
            lastName: newUserData.lastName,
            email: newUserData.email,
            phoneNumber: newUserData.phoneNumber
        })
        .then((response) => {
            props.setErrorMessage('')
            props.setInfoMessage('User updated successfully')
            setEditMode(false)
            props.handleUserGet()
        })
        .catch((error) => {
            if (error.response) {
                const data : {message: string} = error.response.data
                props.setErrorMessage(data.message)
                props.setInfoMessage('')
            }
        })
    }

    if (editMode) {
        return (
            <tr>
                <td></td>
                <td><input type="text" defaultValue={props.UserData.firstName} onChange={(e) => {
                    setNewUserData({...newUserData, firstName: e.target.value})
                    setIsValid({...isValid, firstName: validateName(e.target.value)})
                }} /></td>
                <td><input type="text" defaultValue={props.UserData.lastName} onChange={(e) => {
                    setNewUserData({...newUserData, lastName: e.target.value})
                    setIsValid({...isValid, lastName: validateName(e.target.value)})
                }} /></td>
                <td><input type="text" defaultValue={props.UserData.email} onChange={(e) => {
                    setNewUserData({...newUserData, email: e.target.value})
                    setIsValid({...isValid, email: validateEmail(e.target.value)})
                }} /></td>
                <td><input type="text" defaultValue={props.UserData.phoneNumber} onChange={(e) => {
                    setNewUserData({...newUserData, phoneNumber: e.target.value})
                    setIsValid({...isValid, phoneNumber: validatePhone(e.target.value)})
                }} /></td>
                <td>
                    <div>
                        { valid &&
                            <button onClick={handleUserUpdate}>Apply</button>
                        }
                        <button onClick={() => {
                            setEditMode(false)
                        }}>Cancel</button>
                    </div>
                </td>
            </tr>
        )
    }
    return (
        <tr>
            <td></td>
            <td>{props.UserData.firstName}</td>
            <td>{props.UserData.lastName}</td>
            <td>{props.UserData.email}</td>
            <td>{props.UserData.phoneNumber}</td>
            <td>
                <div>
                    <button onClick={() => {
                        setEditMode(true)
                    }}>Edit</button>
                    <button onClick={() => {
                        if (window.confirm('Are You sure You want to delete this user?')) handleUserDelete()
                    }}>Delete</button>
                </div>
            </td>
        </tr>
    )
}

export default User