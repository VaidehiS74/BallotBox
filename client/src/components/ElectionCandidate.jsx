import axios from 'axios'
import React from 'react'
import { IoMdTrash } from 'react-icons/io'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

const ElectionCandidate = (({ fullName, image, motto, _id: id }) => {

    const navigate = useNavigate()
    const token = useSelector(state => state?.vote?.currentVoter?.token)
    const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin)

    const deleteCandidate = async () => {
        try{
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/candidates/${id}`,{
            withCredentials: true,
            headers: {Authorization: `Bearer ${token}`}
            })
            navigate(0)
        }catch(error){
            console.error(error)
        }
    }


    return (
        <li className="electionCandidate">
            <div className="electionCandidate__image">
                <img src={image} alt={fullName} />
            </div>
            <div>
                <h5>{fullName}</h5>
                <small>{motto? motto.substring(0, 70) + "..." : motto}</small>


                {isAdmin && <button 
                onClick={deleteCandidate}
                className="electionCandidate__btn"><IoMdTrash /></button>}


            </div>
        </li>
    )
})

export default ElectionCandidate