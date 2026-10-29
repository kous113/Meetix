import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const router = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const validateToken = async () => {
        const token = localStorage.getItem("token");

        if (!token) {
          router("/auth", { replace: true });
          return;
        }

        try {
          await axios.get(
            `${import.meta.env.VITE_API_URL}/validate-user`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          setLoading(false);
        } catch (error) {
          localStorage.removeItem("token");
          router("/auth", { replace: true });
        }
      };

      validateToken();
    }, [router]);

    if (loading) {
      return <div>Validating authentication...</div>;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
