import { RouterProvider } from "react-router";
import router from "./routes/Router";
import { SystemProvider } from "./context/SystemContext";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./components/shared/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <SystemProvider>
        <RouterProvider router={router} />
        <Toaster theme="dark" position="bottom-right" richColors />
      </SystemProvider>
    </ErrorBoundary>
  );
}

export default App;
