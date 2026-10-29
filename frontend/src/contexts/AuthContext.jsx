import axios from "axios";
import { createContext, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import httpStatus from "http-status";

export const AuthContext = createContext({});

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/users",
});

export const Authprovider = ({ children }) => {
  const authContext = useContext(AuthContext);
  const [userdata, setUsetdata] = useState(authContext);

  const router = useNavigate();
  //Regsistering function
  const handleRegister = async (name, email, password) => {
    try {
      let request = await client.post("/register", {
        name: name,
        email: email,
        password: password,
      });

      if (request.status === httpStatus.CREATED) {
        return request.data.message;
      }
    } catch (err) {
      throw err;
    }
  };
  //Log in function
  const handleLogin = async (email, password) => {
    try {
      let request = await client.post("/login", {
        email: email,
        password: password,
      });

      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token);
        localStorage.setItem("username", request.data.name);
        router("/dashboard");
      }
    } catch (err) {
      throw err;
    }
  };

  const getHistoryOfUser = async () => {
    try {
      let request = await client.get("/get-all-activity", {
        params: {
          token: localStorage.getItem("token"),
        },
      });
      return request.data;
    } catch (err) {
      throw err;
    }
  };

  const addToUserHistory = async (meetingCode) => {
    try {
      let request = await client.post("/add_to_activity", {
        token: localStorage.getItem("token"),
        meeting_code: meetingCode,
      });
      return request;
    } catch (e) {
      throw e;
    }
  };

  const data = {
    userdata,
    setUsetdata,
    handleRegister,
    handleLogin,
    addToUserHistory,
    getHistoryOfUser
  };

  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
