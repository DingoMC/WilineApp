import React, {useState, useEffect} from 'react';
import User, {user} from './components/user';
import axios from 'axios';
import './App.css';
import AddUserForm from './components/addUserForm';
import FilterUserForm from './components/filterUserForm';

function App() {

  // Store current user list 
  const [userList, setUserList] = useState<user[]>([])
  // Store information/success message
  const [infoMessage, setInfoMessage] = useState('')
  // Store error message from backend if exists
  const [errorMessage, setErrorMessage] = useState('')
  // Toggle addUser form
  const [toggleAdd, setToggleAdd] = useState(false)
  // Toggle filterUser form
  const [toggleFilter, setToggleFilter] = useState(true)

  // Get all users
  const handleUserGet = async () => {
    axios.get('http://localhost:3001/users')
    .then((response) => {
      const data : user[] = response.data
      setUserList(data)
      setInfoMessage('Loaded ' + data.length.toString() + ' users')
    })
    .catch((error) => {
      if (error.response) {
        const data : {message: string} = error.response.data
        setErrorMessage(data.message)
        setInfoMessage('')
      }
    })
  }

  // Load all users on first render or when new user has been added
  useEffect(() => {
    handleUserGet()
    setToggleFilter(!toggleAdd)
  }, [toggleAdd])

  // Create main table
  const generateRows = () => {
    let elems : JSX.Element[] = []
    // Filtering row
    if (toggleFilter) elems.push(
      <FilterUserForm
        key={"filterUser"}
        userList={userList}
        setUserList={setUserList}
        setInfoMessage={setInfoMessage}
        setErrorMessage={setErrorMessage}
        handleUserGet={handleUserGet}/>
    )
    // User add row
    if (toggleAdd) elems.push(
      <AddUserForm 
        key={"addUser"}
        userList={userList}
        setToggleAdd={setToggleAdd}
        setUserList={setUserList}
        setErrorMessage={setErrorMessage}
        setInfoMessage={setInfoMessage}/>
    )
    // User row
    for (let i = 0; i < userList.length; i++) {
      elems.push(<User 
        key={userList[i]._id}
        localKey={(i+1).toString()}
        UserData={userList[i]}
        setErrorMessage={setErrorMessage}
        setInfoMessage={setInfoMessage}
        handleUserGet={handleUserGet}/>)
    }
    return elems
  }

  return (
    <div className='main'>
      {infoMessage.length > 0 && 
        <div className='infobox'>
          <img src="svg/info.svg" alt="Info:" />
          <span>{infoMessage}</span>
        </div>
      }
      {errorMessage.length > 0 &&
        <div className='errorbox'>
          <img src="svg/error.svg" alt="Error:" />
          <span>Error: {errorMessage}</span>
        </div>
      }
      {!toggleAdd && <button className='adduser_btn' onClick={() => {
        setToggleAdd(true)
        setErrorMessage('')
        setInfoMessage('')
      }}>Add User</button>}
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>E-mail</th>
            <th>Phone Number</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {generateRows()}
        </tbody>
      </table>
    </div>
  );
}

export default App;
