import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { voteAction } from '../store/vote-slice';
import { useNavigate } from 'react-router-dom';

const Logout = () => {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(()=>{
    dispatch(voteAction.changeCurrentVoter())
    localStorage.removeItem('currentUser')
    navigate('/');
  },[])

  return (
    <>
    
    </>
  )
}

export default Logout