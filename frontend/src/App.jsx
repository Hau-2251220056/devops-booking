import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Service from "./pages/Services";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Service />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
