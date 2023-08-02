import {useEffect, useState} from 'react';
import { validateEmail, validateName, validatePhone } from '../../lib/validator';
import axios from 'axios'
import { user } from '../user';
import styles from './styles.module.css';

const AddUserForm = (props: {
    userList: user[]
    setToggleAdd : React.Dispatch<React.SetStateAction<boolean>>,
    setUserList: React.Dispatch<React.SetStateAction<user[]>>,
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
    setInfoMessage: React.Dispatch<React.SetStateAction<string>>
}) => {
    // New user data
    const [userData, setUserData] = useState({firstName: '', lastName: '', email: '', phoneNumber: ''})
    // New data validation
    const [isValid, setIsValid] = useState({firstName: false, lastName: false, email: false, phoneNumber: false})
    // True if every field has been validated
    const [valid, setValid] = useState(false)

    // AND operation on all fields validation
    useEffect(() => {
        setValid(isValid.email && isValid.firstName && isValid.lastName && isValid.phoneNumber)
    }, [isValid])

    // Send POST to Server
    const handleUserAdd = async () => {
        axios.post('http://localhost:3001/users', userData)
        .then((response) => {
            const data : user = response.data
            props.setUserList([...props.userList, data])
            props.setErrorMessage('')
            props.setInfoMessage('User added successfully!')
            props.setToggleAdd(false)
        })
        .catch((error) => {
            if (error.response) {
                const data : {message: string} = error.response.data
                props.setErrorMessage(data.message)
                props.setInfoMessage('')
            }
        })
    }

    // Add user row
    return (
        <tr className={styles.row}>
            <td><div className={styles.center}><img src="svg/add.svg" alt="+" /></div></td>
            <td><input className={isValid.firstName ? styles.valid : styles.invalid} type="text" onChange={(e) => {
                setUserData({...userData, firstName: e.target.value})
                setIsValid({...isValid, firstName: validateName(e.target.value)})
            }} /></td>
            <td><input className={isValid.lastName ? styles.valid : styles.invalid} type="text" onChange={(e) => {
                setUserData({...userData, lastName: e.target.value})
                setIsValid({...isValid, lastName: validateName(e.target.value)})
            }}/></td>
            <td><input className={isValid.email ? styles.valid : styles.invalid} type="text" onChange={(e) => {
                setUserData({...userData, email: e.target.value})
                setIsValid({...isValid, email: validateEmail(e.target.value)})
            }}/></td>
            <td><input className={isValid.phoneNumber ? styles.valid : styles.invalid} type="text" onChange={(e) => {
                setUserData({...userData, phoneNumber: e.target.value})
                setIsValid({...isValid, phoneNumber: validatePhone(e.target.value)})
            }}/></td>
            <td>
                <div className={styles.actions}>
                    {
                        valid && <button className={styles.btn_apply} onClick={handleUserAdd}>Apply</button>
                    }
                    <button className={styles.btn_cancel} onClick={() => {
                        props.setToggleAdd(false)
                        props.setErrorMessage('')
                        props.setInfoMessage('')
                    }}>Cancel</button>
                </div>
            </td>
        </tr>
    )
}

export default AddUserForm