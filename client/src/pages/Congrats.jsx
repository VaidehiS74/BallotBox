import React from 'react'
import {Link} from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const Congrats = () => {

  const token = useSelector(state => state?.vote?.currentVoter?.token)
  const navigate = useNavigate();

  //ACCESS CONTROL
  useEffect(()=>{
    if(!token){
      navigate('/')
    }
  },[])

  return (
    <section className="congrats">
      <div className="container congrats__container">
        <h2>Thank You For Your Vote</h2>
        <p>Your vote is now added to the candidate's vote count. You can go back to the result page to see the updated vote count.</p>

        <Link to ='/results' className='btn sm primary'>See Results</Link>
      </div>
    </section>
  )
}

export default Congrats