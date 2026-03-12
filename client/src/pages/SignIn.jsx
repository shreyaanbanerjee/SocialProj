import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInAction, clearMessage } from "../redux/actions/authActions";
import { AiFillGithub } from "react-icons/ai";
import { RxCross1 } from "react-icons/rx";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import ButtonLoadingSpinner from "../components/loader/ButtonLoadingSpinner";
import Logo from "../assets/SocialEcho.png";

const SignIn = () => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setLoadingText("Signing in...");
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    const timeout = setTimeout(() => {
      setLoadingText(
        "This is taking longer than usual. Please wait while backend services are getting started."
      );
    }, 5000);
    await dispatch(signInAction(formData, navigate));
    setLoading(false);
    clearTimeout(timeout);
  };

  const signInError = useSelector((state) => state.auth?.signInError);
  const successMessage = useSelector((state) => state.auth?.successMessage);

  const handleClearMessage = () => {
    dispatch(clearMessage());
  };

  return (
    <section className="bg-white">
      <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-6">
        <form className="w-full max-w-md">
          <div className="mx-auto flex justify-center">
            <img className="h-7 w-auto sm:h-8" src={Logo} alt="" />
          </div>
          {signInError && (
            <div
              className="mt-6 flex items-center justify-between rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700"
              role="alert"
            >
              <div>
                <span className="block sm:inline">{signInError}</span>
              </div>
              <button
                className="font-bold text-red-700"
                onClick={handleClearMessage}
              >
                <RxCross1 className="h-3 w-3" />
              </button>
            </div>
          )}
          {successMessage && (
            <div
              className="mt-6 flex items-center justify-between rounded border border-green-400 bg-green-100 px-4 py-3 text-green-700"
              role="alert"
            >
              <div>
                <span className="block sm:inline">{successMessage}</span>
              </div>
              <button
                className="font-bold text-green-700"
                onClick={handleClearMessage}
              >
                <RxCross1 className="h-3 w-3" />
              </button>
            </div>
          )}
          <div className="mt-6 flex items-center justify-center">
            <Link
              to={"/signin"}
              className="w-1/3 border-b-2 border-blue-500 pb-4 text-center font-medium text-gray-800 "
            >
              Sign In
            </Link>
            <Link
              to={"/signup"}
              className="w-1/3 border-b border-gray-400 pb-4 text-center font-medium text-gray-500 "
            >
              Sign Up
            </Link>
          </div>

          <div className="relative mt-6 flex items-center">
            <span className="absolute">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-3 h-6 w-6 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </span>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-lg border bg-white px-11 py-3 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
              placeholder="Email address"
              required
              autoComplete="off"
            />
          </div>
          <div className="relative mt-4 flex items-center">
            <span className="absolute">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mx-3 h-6 w-6 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </span>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-lg border bg-white px-10 py-3 text-gray-700 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-40"
              placeholder="Password"
              required
              autoComplete="off"
            />
          </div>
          <div className="mt-6">
            <button
              disabled={loading}
              onClick={handleSubmit}
              className={`w-full transform rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium tracking-wide text-white transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 focus:ring-opacity-50 ${loading ? "cursor-not-allowed opacity-50" : ""
                }`}
            >
              {loading ? (
                <ButtonLoadingSpinner loadingText={loadingText} />
              ) : (
                "Sign in"
              )}
            </button>
          </div>

          {/* Google OAuth Button */}
          <div className="mt-6 flex items-center justify-center">
            <div className="flex w-full items-center gap-2 border-t pt-6">
              <span className="text-sm text-gray-600">Or continue with</span>
            </div>
          </div>
          <div className="mt-4">
            <a
              href={`${process.env.REACT_APP_API_URL || "http://localhost:4000"}/api/users/auth/google`}
              className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors duration-300 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-gray-300 focus:ring-opacity-50"
            >
              <svg
                className="h-5 w-5 mr-2"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </a>
          </div>
        </form>
        <span className="flex items-center justify-center py-4 text-sm text-gray-600 ">
          <a
            href="https://github.com/shreyaanbanerjee/SocialProj"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center hover:text-blue-500"
          >
            <AiFillGithub className="mr-2 h-5 w-5" />
            <span>GitHub</span>
          </a>
          <Link
            to="/admin"
            className="ml-8 flex items-center hover:text-blue-500"
          >
            <MdOutlineAdminPanelSettings className="mr-2 h-5 w-5" />
            <span>Admin</span>
          </Link>
        </span>
      </div>
    </section>
  );
};

export default SignIn;
