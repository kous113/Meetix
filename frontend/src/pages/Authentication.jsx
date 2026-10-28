import * as React from 'react';
import "./Authentication.css";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import Snackbar from '@mui/material/Snackbar';

const defaultTheme = createTheme();

export default function Authentication() {
    const [name, setName] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [email,setEmail]=React.useState("");
    const [formstate, setFormstate] = React.useState(0);
    const [message, setMessage] = React.useState();
    const [error, setError] = React.useState();
    const [open, setOpen] = React.useState();


    const {handleLogin,handleRegister}=React.useContext(AuthContext);

    let handleAuthentication=async()=>{
        try{
            if(formstate===0){
                //login called
                let result=await handleLogin(email,password);
                console.log(formstate);

            }
            if(formstate===1){
                //register calles
                let result=await handleRegister(name,email,password);
                setMessage(result);
                setName("");
                setEmail("");
                setError("");
                setMessage(result);
                setPassword("");
                setFormstate(0);
                setOpen(true);
            }
        }catch(err){
            let message=(err.response.data.message);
            setError(message);
        }
    }

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />

                <Grid
                    size={{ xs: false, sm: 4, md: 7 }}
                    sx={{
                        backgroundImage:
                            'url(https://source.unsplash.com/random?wallpapers)',
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) =>
                            t.palette.mode === 'light'
                                ? t.palette.grey[50]
                                : t.palette.grey[900],
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }}
                />

                <Grid
                    size={{ xs: 12, sm: 8, md: 5 }}
                    component={Paper}
                    elevation={6}
                    square
                >
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LockOutlinedIcon />
                        </Avatar>

                        <div>
                            <Button
                                className={formstate === 0 ? "auth-btn active" : "auth-btn"}
                                variant={formstate === 0 ? 'contained' : ''}
                                onClick={() => setFormstate(0)}
                            >
                                SIGN IN
                            </Button>

                            <Button
                                className={formstate === 1 ? "auth-btn active" : "auth-btn"}
                                variant={formstate === 1 ? 'contained' : ''}
                                onClick={() => setFormstate(1)}
                            >
                                SIGN UP
                            </Button>
                        </div>

                        <Box component="form" noValidate sx={{ mt: 1 }}>
                            {formstate===1?                            <TextField
                                className="auth-input"
                                margin="normal"
                                required
                                fullWidth
                                id="name"
                                label="Name"
                                name="name"
                                autoFocus
                                onChange={(e)=>setName(e.target.value)}

                            />:<></>
                            }

                            <TextField
                                className="auth-input"
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email"
                                name="email"
                                autoFocus
                                onChange={(e)=>setEmail(e.target.value)}
                                value={email}
                            />

                            <TextField
                                className="auth-input"
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e)=>setPassword(e.target.value)}
                            />
                            <p style={{color:"red"}}>{error}</p>
                            <Button
                            className="auth-btn active"
                                type="button"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                                onClick={handleAuthentication}
                            >
                                {formstate===0?"Log In":"Register"}
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
            <Snackbar
            open={open}
            autoHideDuration={4000}
            message={message}
            />
        </ThemeProvider>
    );
}