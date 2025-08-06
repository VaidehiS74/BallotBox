import React, { useState } from 'react'
import { IoMdClose } from "react-icons/io";
import { useDispatch } from 'react-redux';
import { UiActions } from '../store/ui-slice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from './Loader';

const AddElectionModal = () => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const token = useSelector(state => state?.vote?.currentVoter?.token)
    const [isLoading, setIsLoading] = useState(false);



    const dispatch = useDispatch();

    const navigate = useNavigate();

    //close election modal
    const closeModal = () =>{
        dispatch(UiActions.closeElectionModal())
    }

    const createElection = async (e)=>{
        e.preventDefault();
        setIsLoading(true);
        try{
            const electionData = new FormData();
            electionData.set('title',title)
            electionData.set('description',description)
            electionData.set('thumbnail',thumbnail)

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/elections`,electionData , {
                withCredentials:true,
                headers:{
                    Authorization: `Bearer ${token}`
                }
            });
            closeModal()
            navigate(0);
        }catch(error){
            console.log(error);
        }
        finally {
        setIsLoading(false); // hide loader
        }
    }


  return (

    // <section className="modal">
    //     <div className="modal__content">
    //         <header className='modal__header'>
    //             <h4>Create New Election</h4>
    //             <button className='modal__close'onClick={closeModal}><IoMdClose/></button>
    //         </header>
    //         {isLoading? (<Loader/>) :
    //         (
    //             <form onSubmit={createElection}>
                
    //                 <div>
    //                 <h6>Election Title:</h6>
    //                 <input type="text" value={title} onChange={e => setTitle(e.target.value)} name="title" />
    //             </div>

    //             <div>
    //                 <h6>Election Description:</h6>
    //                 <input type="text" value={description} onChange={e => setDescription(e.target.value)} name="description" />
    //             </div>

    //             <div>
    //                 <h6>Election Thumbnail:</h6>
    //                 <input type="file"  
    //                 onChange={e => setThumbnail(e.target.files[0])} accept='png,jpg,jpeg,webp,avif' name="thumbnail" />
    //             </div>

    //             <button type='submit' className='btn primary'>Add Election</button>
                    

    //         </form>
    //         )}
    //     </div>
    // </section>

    <section className="modal">
    {isLoading ? (

            <Loader />

    ) : (
        <div className="modal__content">
            <header className='modal__header'>
                <h4>Create New Election</h4>
                <button className='modal__close'onClick={closeModal}><IoMdClose/></button>
            </header>
            <form onSubmit={createElection}>
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
                    <input type="file"  
                    onChange={e => setThumbnail(e.target.files[0])} accept='png,jpg,jpeg,webp,avif' name="thumbnail" />
                </div>

                <button type='submit' className='btn primary'>Add Election</button>
            </form>
        </div>
    )}
</section>


  )
}

export default AddElectionModal