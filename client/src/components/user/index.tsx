import axios from 'axios'
import { useState, useEffect } from 'react';
import { validateEmail, validateName, validatePhone } from '../../lib/validator';
import styles from './styles.module.css';

// User TS Model
export interface user {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
}

const User = (props: {
    UserData : user,
    localKey : string,
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
    setInfoMessage: React.Dispatch<React.SetStateAction<string>>,
    handleUserGet: () => Promise<void>
}) => {

    // Edit Mode Toggle
    const [editMode, setEditMode] = useState(false)
    // New User Data from Edit Mode
    const [newUserData, setNewUserData] = useState({
        firstName: props.UserData.firstName,
        lastName: props.UserData.lastName,
        email: props.UserData.email,
        phoneNumber: props.UserData.phoneNumber})
    // Booleans for checking User Data
    const [isValid, setIsValid] = useState({
        firstName: validateName(props.UserData.firstName),
        lastName: validateName(props.UserData.lastName),
        email: validateEmail(props.UserData.email),
        phoneNumber: validatePhone(props.UserData.phoneNumber)})
    // True if every field in edit mode has been validated
    const [valid, setValid] = useState(false)
    // AND operation on all fields validation
    useEffect(() => {
        setValid(isValid.email && isValid.firstName && isValid.lastName && isValid.phoneNumber)
    }, [isValid])

    // Send DELETE to Server
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

    // Send PUT to Server
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

    // User row in edit mode
    if (editMode) {
        return (
            <tr className={styles.edit_row}>
                <td>
                    <div className={styles.editing}>
                        <span>{props.localKey}</span>
                        <img src="svg/edit.svg" alt="E" />
                    </div>
                </td>
                <td><input className={isValid.firstName ? styles.valid : styles.invalid} type="text" defaultValue={props.UserData.firstName} onChange={(e) => {
                    setNewUserData({...newUserData, firstName: e.target.value})
                    setIsValid({...isValid, firstName: validateName(e.target.value)})
                }} /></td>
                <td><input className={isValid.lastName ? styles.valid : styles.invalid} type="text" defaultValue={props.UserData.lastName} onChange={(e) => {
                    setNewUserData({...newUserData, lastName: e.target.value})
                    setIsValid({...isValid, lastName: validateName(e.target.value)})
                }} /></td>
                <td><input className={isValid.email ? styles.valid : styles.invalid} type="text" defaultValue={props.UserData.email} onChange={(e) => {
                    setNewUserData({...newUserData, email: e.target.value})
                    setIsValid({...isValid, email: validateEmail(e.target.value)})
                }} /></td>
                <td><input className={isValid.phoneNumber ? styles.valid : styles.invalid} type="text" defaultValue={props.UserData.phoneNumber} onChange={(e) => {
                    setNewUserData({...newUserData, phoneNumber: e.target.value})
                    setIsValid({...isValid, phoneNumber: validatePhone(e.target.value)})
                }} /></td>
                <td>
                    <div className={styles.actions}>
                        { valid &&
                            <button className={styles.btn_apply} onClick={handleUserUpdate}>Apply</button>
                        }
                        <button className={styles.btn_cancel} onClick={() => {
                            setEditMode(false)
                        }}>Cancel</button>
                    </div>
                </td>
            </tr>
        )
    }

    // Display data (if blank it blinks with `Not Set`)
    const displayData = (data : string) => {
        if (data.length > 0) return <span>{data}</span>
        else return <span className={styles.empty}>Not Set</span>
    }

    // User row (normal)
    return (
        <tr className={styles.row}>
            <td>{displayData(props.localKey)}</td>
            <td>{displayData(props.UserData.firstName)}</td>
            <td>{displayData(props.UserData.lastName)}</td>
            <td>{displayData(props.UserData.email)}</td>
            <td>{displayData(props.UserData.phoneNumber)}</td>
            <td>
                <div className={styles.actions}>
                    <button className={styles.btn_edit} onClick={() => {
                        setEditMode(true)
                    }}>Edit</button>
                    <button className={styles.btn_delete} onClick={() => {
                        // Confirm before delete
                        if (window.confirm('Are You sure You want to delete this user?')) handleUserDelete()
                    }}>Delete</button>
                </div>
            </td>
        </tr>
    )
}

export default User