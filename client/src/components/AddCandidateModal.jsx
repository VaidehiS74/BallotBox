import React, { useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { useDispatch } from 'react-redux';
import { UiActions } from '../store/ui-slice';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';

const AddCandidateModal = () => {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector(state => state?.vote?.currentVoter?.token)
    const electionId = useSelector(state => state?.vote?.addCandidateElectionId)

    const [error,setError] = useState("")
    const [isLoading,setIsLoading] = useState(false);
    const [fullName, setFullName] = useState("");
    const [motto, setMotto] = useState("");
    const [image, setImage] = useState("");

    const closeModal = () =>{
        dispatch(UiActions.closeAddCandidateModal())
    }

    const addCandidate = async (e) => {
        try{
            setIsLoading(true);
            e.preventDefault();
            const candidateInfo = new FormData();
            candidateInfo.set('fullName',fullName);
            candidateInfo.set('motto',motto);
            candidateInfo.set('image',image);
            candidateInfo.set('currentElection',electionId);

                for (let [key, value] of candidateInfo.entries()) {
                console.log(`${key}:`, value);
                }

            await axios.post(`${process.env.REACT_APP_API_URL}/candidates`,candidateInfo,{
                withCredentials:true,
                headers:{
                    Authorization:  `Bearer ${token}`
                }
            })
            navigate(0);
            
        }catch(error){
            setError(error.response.data.message || "Something went wrong")
            console.error(error);
        }
        finally{
            setIsLoading(false);
        }
    }

  return (
    <section className='modal'>

        {isLoading?  (<Loader/>) :
        (
            <div className="modal__content">
            <header className="modal__header">
                <h4>Add Candidate</h4>
                <button className='modal__close' onClick={closeModal}><IoMdClose/></button>
            </header>

            <form onSubmit={addCandidate}>

                {error && <p className='form__error-message'>{error}</p>}

                <div>
                    <h6>Candidate Name: </h6>
                    <input type="text" value={fullName} name="fullName" onChange={e=> setFullName(e.target.value)} />
                </div>

                <div>
                    <h6>Candidate Motto: </h6>
                    <input type="text" value={motto} name="motto" onChange={e=> setMotto(e.target.value)} />
                </div>

                <div>
                    <h6>Candidate Image: </h6>
                    <input type="file" name="image" onChange={e=> setImage(e.target.files[0])} accept='png, jpg, jpeg , webp , avif' />
                </div>

                <button type='submit' className='btn primary'>Add Candidate</button>
            </form>
        </div>
        )
        }


    </section>
  )
}

export default AddCandidateModal