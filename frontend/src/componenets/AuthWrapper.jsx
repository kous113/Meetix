import './AuthWrapper.css'

import headinglogo from'../assets/headinglogo.jpg'
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import { use } from 'react';
export default function AuthWrapper() {
    const navigate=useNavigate();
return(
    <>
        <div className="authwrapper">
            <img className="headinglogo" src={headinglogo} alt="logo" />
            <div className="sign">
                <Stack spacing={2} direction="row">
                <Button onClick={()=>{
                    localStorage.removeItem("token")
                    navigate("/")
                    }} 
                    className='log-out' variant="outlined">Log Out</Button>
                </Stack>
            </div>
        </div>
    </>
)
}