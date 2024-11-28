import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AutoLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = tokenData.exp * 1000;
      const currentTime = Date.now();

      if (expirationTime < currentTime) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        const timeout = expirationTime - currentTime;
        setTimeout(() => {
          localStorage.clear();
          navigate('/');
          toast(
            "Your session has expired. Please log in again to continue.",
            {
              duration: 3000,
            }
          );
        }, timeout);
      }
    }
  }, [navigate]);

  return null;
};

export default AutoLogout;
