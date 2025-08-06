import React, { use, useEffect } from 'react'
import { useState } from 'react'
import Election from '../components/Election'
import AddElectionModal from '../components/AddElectionModal'
import { useDispatch, useSelector } from 'react-redux'
import { UiActions } from '../store/ui-slice'
import UpdateElectionModal from '../components/UpdateElectionModal'
import axios from 'axios'
import Loader from "../components/Loader"
import { useNavigate } from 'react-router-dom'

const Elections = () => {
  const token = useSelector(state => state?.vote?.currentVoter?.token)
  const navigate = useNavigate();

  //ACCESS CONTROL
  useEffect(()=>{
    if(!token){
      navigate('/')
    }
  },[])

  const [elections, setElections] = useState([])
  const [isLoading,setIsLoading] = useState(false)

  const dispatch = useDispatch();
  //open election modal

  const openModal = () => {
    dispatch(UiActions.openElectionModal())
  }


  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin)

  const electionModalShowing = useSelector(state => state.ui.electionModalShowing)

  const updateElectionModalShowing = useSelector(state => state.ui.updateElectionModalShowing)


  const getElections = async() => {
    setIsLoading(true)
    try{
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})

      setElections(await response.data)

    }
    catch(error){
      console.log(error)
    }
    setIsLoading(false)
  }

  useEffect(()=>{
    getElections()
  },[])


  return (
    <>
      <section className="elections">
        <div className="container elections__container">
          <header className="elections__header">
            <h1>Ongoing elections</h1>
            {isAdmin && <button className='btn primary' onClick={openModal}>Create New Elections</button>}
          </header>

          {isLoading ? <Loader/> : <menu className="elections__menu">
            {
              elections.map((election => <Election key={election._id} {...election}/>))
            }
          </menu> }
        </div>
      </section>

      {electionModalShowing && <AddElectionModal/>}
      {updateElectionModalShowing && <UpdateElectionModal/>}
    </>
  )
}

export default Elections