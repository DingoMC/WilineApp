import {useEffect, useState} from 'react';
import { validateEmail, validateName, validatePhone } from '../../lib/validator';
import axios from 'axios'
import { user } from '../user';

const AddUserForm = (props: {
    userList: user[]
    setToggleAdd : React.Dispatch<React.SetStateAction<boolean>>,
    setUserList: React.Dispatch<React.SetStateAction<user[]>>,
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
    setInfoMessage: React.Dispatch<React.SetStateAction<string>>
}) => {

    const [userData, setUserData] = useState({firstName: '', lastName: '', email: '', phoneNumber: ''})
    const [isValid, setIsValid] = useState({firstName: false, lastName: false, email: false, phoneNumber: false})
    const [valid, setValid] = useState(false)

    useEffect(() => {
        setValid(isValid.email && isValid.firstName && isValid.lastName && isValid.phoneNumber)
    }, [isValid])

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

    return (
        <tr>
            <td></td>
            <td><input type="text" onChange={(e) => {
                setUserData({...userData, firstName: e.target.value})
                setIsValid({...isValid, firstName: validateName(e.target.value)})
            }} /></td>
            <td><input type="text" onChange={(e) => {
                setUserData({...userData, lastName: e.target.value})
                setIsValid({...isValid, lastName: validateName(e.target.value)})
            }}/></td>
            <td><input type="text" onChange={(e) => {
                setUserData({...userData, email: e.target.value})
                setIsValid({...isValid, email: validateEmail(e.target.value)})
            }}/></td>
            <td><input type="text" onChange={(e) => {
                setUserData({...userData, phoneNumber: e.target.value})
                setIsValid({...isValid, phoneNumber: validatePhone(e.target.value)})
            }}/></td>
            <td>
                <div>
                    {
                        valid && <button onClick={handleUserAdd}>Apply</button>
                    }
                    <button onClick={() => {
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