import { user } from '../user';
import {useEffect, useState} from 'react';
import axios from 'axios'

const FilterUserForm = (props : {
    userList: user[],
    setUserList: React.Dispatch<React.SetStateAction<user[]>>,
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
    setInfoMessage: React.Dispatch<React.SetStateAction<string>>,
    handleUserGet: () => Promise<void>
}) => {

    const [filters, setFilters] = useState({email: '', phoneNumber: ''})
    const [notEmpty, setNotEmpty] = useState(false)

    useEffect(() => {
        setNotEmpty(filters.email.length > 0 || filters.phoneNumber.length > 0)
    }, [filters])

    const handleUserFilter = async () => {
        axios.get('http://localhost:3001/users', {params: filters})
        .then((response) => {
            const data : user[] = response.data
            props.setUserList(data)
            props.setInfoMessage('Loaded and filtered ' + data.length.toString() + ' users')
            props.setErrorMessage('')
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
            <td></td>
            <td></td>
            <td><input type="text" value={filters.email} onChange={(e) => 
                setFilters({...filters, email: e.target.value})
            }/></td>
            <td><input type="text" value={filters.phoneNumber} onChange={(e) => {
                setFilters({...filters, phoneNumber: e.target.value})
            }}/></td>
            <td>
                <div>
                    { notEmpty &&
                        <button onClick={handleUserFilter}>Apply</button>
                    }
                    <button onClick={() => {
                        props.handleUserGet()
                        setFilters({email: '', phoneNumber: ''})
                    }}>Reset</button>
                </div>
            </td>
        </tr>
    )
}

export default FilterUserForm