import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import createAppStore from "./redux/store";
import axios from "axios";
import CommonLoading from "./components/loader/CommonLoading";
import App from "./App";
import { getTitleFromRoute } from "./utils/docTitle";
import { Helmet } from "react-helmet";
import { useLocation } from "react-router-dom";

const ErrorComponent = ({ errorMessage }) => (
  <div className="text-red-500 font-bold text-center">{errorMessage}</div>
);

const AppContainer = () => {
  const location = useLocation();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check server status first
        await axios.get("/server-status");
        
        // Then initialize store
        const appStore = await createAppStore();
        setStore(appStore);
      } catch (err) {
        console.error("Initialization error:", err);
        setError("Server is down or app failed to initialize. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (loading || error) {
    return (
      <div className="flex items-center justify-center h-screen">
        {loading ? <CommonLoading /> : <ErrorComponent errorMessage={error} />}
      </div>
    );
  }

  return (
    <Provider store={store}>
      <Helmet>
        <title>{getTitleFromRoute(location.pathname)}</title>
      </Helmet>
      <App />
    </Provider>
  );
};

export default AppContainer;
