import React, { use, useEffect, useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from 'react-redux';
import { UiActions } from '../store/ui-slice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Loader from './Loader';

const UpdateElectionModal = () => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [isLoading,setIsLoading] =useState(false);


    const dispatch = useDispatch();
    const navigate = useNavigate();
    const idOfElectionToUpdate = useSelector(state => state?.vote?.idOfElectionToUpdate)
    const token = useSelector(state => state?.vote?.currentVoter?.token)

    //close update election modal
    const closeModal = () =>{
        dispatch(UiActions.closeUpdateElectionModal())
    }



    const fetchElection = async () =>{
        try{
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections/${idOfElectionToUpdate}`,
                {withCredentials:true,
                    headers:{
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            const election = await response.data;
            setTitle(election.title);
            setDescription(election.description);

        }catch(error){
            console.log(error);
        }
    }

    useEffect(()=>{
        fetchElection()
    },[])

    const updateElection = async (e) =>{
        setIsLoading(true);
        e.preventDefault();
        try{
            const electionData = new FormData();
            electionData.set('title',title);
            electionData.set('description',description);
            electionData.set('thumbnail',thumbnail);

            const response = await axios.patch(`${process.env.REACT_APP_API_URL}/elections/${idOfElectionToUpdate}`,electionData,
                {withCredentials:true,
                    headers:{
                        Authorization: `Bearer ${token}`
                    }
                }
            )
            closeModal();
            navigate(0);
        }
        catch(error){
            console.log(error);
        }
        finally{
            setIsLoading(false);
        }
    }

  return (
    <section className="modal">
        {isLoading ? <Loader/> 
        :
        (
            <div className="modal__content">
            <header className='modal__header'>
                <h4>Edit Election</h4>
                <button className='modal__close'onClick={closeModal}><IoMdClose/></button>
            </header>
            <form onSubmit={updateElection}>
                <div>
                    <h6>Election Title:</h6>
                    <input type="text" value={title} onChange={e => setTitle(e.target.value)} name="title" />
                </div>

                <div>
                    <h6>Election Description:</h6>
                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} name="description" />
                </div>

                <div>
                    <h6>Election Thumbnail:</h6>
                    <input type="file"  onChange={e => setThumbnail(e.target.files[0])} accept='png,jpg,jpeg,webp,avif' name="thumbnail" />
                </div>

                <button type='submit' className='btn primary'>Update Election</button>
            </form>
        </div>
        )
        }
    </section>
  )
}

export default UpdateElectionModal