import React, { useState, useEffect } from 'react'
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { auth, database } from '../../config/firebase.js'
import { useNavigate, Link } from 'react-router-dom';
const Welcome = () => {
    const [username, setUserName]=useState('')
    const [selectedOption, setSelectedOption]=useState('')
    const navigate = useNavigate()
    const handleOption = (e) =>{
        setSelectedOption(e)
    }
    const handleNavigation = async ()=>{
        const docRef = doc(database, "Users", auth.currentUser?.uid, "businessInfo", "data");
        const docSnap = await getDoc(docRef)
        if(!docSnap.exists()){
            await setDoc(docRef, {
                isBusiness: selectedOption
            })
        }
        if(selectedOption==true){
            navigate('/businessInfo')
        }else{
            navigate('/generalUsersInfo')
        }
    }
    useEffect(() => {
        const fetchProfile = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
            const docRef = doc(database, "Users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                setUserName(userData.username || "");
            }
            } catch (error) {
            console.error("Error fetching user profile:", error);
            }
        }
        };
        fetchProfile();
    }, []);
  return (
    <div>
      Welcome to Seedlink, {username}
      <label>What is your purpose of visiting our website</label>
      <div>
        <label>
          <input type="radio" onChange={()=>handleOption(false)} checked={selectedOption===false} />
          To explore small scale businesses
        </label>
      </div>
      <div>
        <label>
          <input type="radio" onChange={()=>handleOption(true)} checked={selectedOption===true} />
          to publish my business to more people
        </label>
      </div>
      <button onClick={()=>handleNavigation()}>Continue</button>
    </div>
  )
}

export default Welcome
