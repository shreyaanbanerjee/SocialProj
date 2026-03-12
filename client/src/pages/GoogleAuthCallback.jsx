import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { handleGoogleCallback } from "../redux/actions/authActions";
import ButtonLoadingSpinner from "../components/loader/ButtonLoadingSpinner";

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const refreshToken = searchParams.get("refreshToken");
    const email = searchParams.get("email");
    const error = searchParams.get("error");

    if (error) {
      // Handle error
      navigate("/signin", { state: { error } });
      return;
    }

    if (accessToken && refreshToken && email) {
      // Dispatch action to save tokens and redirect
      dispatch(handleGoogleCallback(accessToken, refreshToken, email, navigate));
    } else {
      navigate("/signin");
    }
  }, [searchParams, navigate, dispatch]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <ButtonLoadingSpinner />
      <p className="mt-4">Completing sign-in...</p>
    </div>
  );
};

export default GoogleAuthCallback;
