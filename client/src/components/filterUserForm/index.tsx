import { user } from '../user';
import {useEffect, useState} from 'react';
import axios from 'axios'
import styles from './styles.module.css';

const FilterUserForm = (props : {
    userList: user[],
    setUserList: React.Dispatch<React.SetStateAction<user[]>>,
    setErrorMessage: React.Dispatch<React.SetStateAction<string>>,
    setInfoMessage: React.Dispatch<React.SetStateAction<string>>,
    handleUserGet: () => Promise<void>
}) => {

    // Filters
    const [filters, setFilters] = useState({email: '', phoneNumber: ''})
    // True if any of the filters has been filled
    const [notEmpty, setNotEmpty] = useState(false)

    // Check if email or phone filter is set
    useEffect(() => {
        setNotEmpty(filters.email.length > 0 || filters.phoneNumber.length > 0)
    }, [filters])

    // Get all users with filtering
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

    // Filter row
    return (
        <tr className={styles.row}>
            <td><div className={styles.center}><img src="svg/filter.svg" alt="F" /></div></td>
            <td></td>
            <td></td>
            <td><input className={filters.email.length > 0 ? styles.filled : ''} type="text" value={filters.email} onChange={(e) => 
                setFilters({...filters, email: e.target.value})
            }/></td>
            <td><input className={filters.phoneNumber.length > 0 ? styles.filled : ''} type="text" value={filters.phoneNumber} onChange={(e) => {
                setFilters({...filters, phoneNumber: e.target.value})
            }}/></td>
            <td>
                <div className={styles.actions}>
                    { notEmpty &&
                        <button className={styles.btn_apply} onClick={handleUserFilter}>Apply</button>
                    }
                    <button className={styles.btn_reset} onClick={() => {
                        props.handleUserGet() // On reset load all users
                        setFilters({email: '', phoneNumber: ''})
                    }}>Reset</button>
                </div>
            </td>
        </tr>
    )
}

export default FilterUserForm