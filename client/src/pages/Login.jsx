import React, { useState } from 'react'
import {Link} from 'react-router-dom'
import axios from 'axios'
import {useDispatch} from 'react-redux'
import { voteAction } from '../store/vote-slice'
import { useNavigate } from 'react-router-dom'

const Login = () => {

  const[userData,setUserData] = useState({fullName: "", aadharNumber:"", email :"", password: "", password2: ""})

  const [error,setError] = useState("")

  const dispatch = useDispatch()
  const navigate = useNavigate()


  //function to control input fields
  const chnageInputHandler =(e) =>{
    setUserData(prevState => {
      return {...prevState, [e.target.name]: e.target.value}
    })
  }


  const loginVoter =async (e) =>{
    e.preventDefault();
    try{
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/voters/login`,userData)

      const newVoter = await response.data;

      //save new voter to local storage & update in redux store
      localStorage.setItem("currentUser", JSON.stringify(newVoter))
      dispatch(voteAction.changeCurrentVoter(newVoter))
      navigate("/results")
    }
    catch(err){
      setError(err.response.data.message)
    }
  }

  return (
    <section className='register'>
      <div className="container register__container">
        <h2>Sign In</h2>
        <form onSubmit={loginVoter}>
          {error && <p className='form__error-message'>{error}</p>}

          <input type="email" name='email' placeholder='Email Address' autoComplete='true' autoFocus='true' onChange={chnageInputHandler} />

          
          <input type="password" name='password' placeholder='Password' autoComplete='true' onChange={chnageInputHandler} />

          <p>Don't have an account? <Link to ='/register'>Sign up</Link></p>
          <button type='submit' className='btn primary'>Login</button>
        </form>
      </div>
    </section>
  )
}

export default Login