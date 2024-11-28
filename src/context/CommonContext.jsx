import axios from 'axios';
import React, { createContext, useState } from 'react';
import { backendServer } from '../utils/info';

const AppContext = createContext();

const AppProvider = ({ children }) => {

    const [menuID, setMenuID] = useState(1);

    const handleMenuID = (id) => {
        setMenuID(id);
    }

    const [userReg, setUserReg] = useState('clt');

    const handleUserReg = (val) => {
        setUserReg(val);
    }

    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen((cur) => !cur);
    };

    const [loggedInUserName, setLoggedInUserName] = useState(null);
    const [loggedInUserPP, setLoggedInUserPP] = useState(null);
    const [nameLoader, setNameLoader] = useState(false);
    const [nameError, setNameError] = useState(null);

    const fetchName = async (userId) => {
        setNameLoader(true);
        try {
            const response = await axios.get(`${backendServer}/api/getLoggedInUser/${userId}`);
            setLoggedInUserName(response.data.name);
            setLoggedInUserPP(response.data.imageUrl);
            setNameLoader(false);
            setNameError(null);
        } catch (error) {
            setNameError(error.response.data.message);
            setNameLoader(false);
        }
    };

    return (
        <AppContext.Provider
            value={{ menuID, handleMenuID, userReg, handleUserReg, open, handleOpen, nameLoader, loggedInUserName, nameError, fetchName, loggedInUserPP }}
        >
            {children}
        </AppContext.Provider>
    );
};

export { AppContext, AppProvider };
