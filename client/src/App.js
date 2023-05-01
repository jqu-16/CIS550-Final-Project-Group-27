import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from '@mui/material'
import { indigo, amber } from '@mui/material/colors'
import { createTheme } from "@mui/material/styles";

import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import AlbumsPage from './pages/AlbumsPage';
import SongsPage from './pages/SongsPage';
import AlbumInfoPage from './pages/AlbumInfoPage';
import BusinessesPage from './pages/BusinessesPage';
import BusinessInfoPage from './pages/BusinessInfoPage';
import RestaurantsPage from "./pages/RestaurantsPage";
import AttractionPage from "./pages/AttractionPage";
import ToDoPage from "./pages/ToDoPage";
import ExpertPage from "./pages/ExpertPage";

// createTheme enables you to customize the look and feel of your app past the default
// in this case, we only change the color scheme
export const theme = createTheme({
  palette: {
    primary: indigo,
    secondary: amber,
  },
});

// App is the root component of our application and as children contain all our pages
// We use React Router's BrowserRouter and Routes components to define the pages for
// our application, with each Route component representing a page and the common
// NavBar component allowing us to navigate between pages (with hyperlinks)
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<RestaurantsPage />} />
          <Route path="/restaurants" element={<RestaurantsPage />} />
          <Route path="/businesses" element={<BusinessesPage />} />
          <Route path="/todo" element={<ToDoPage />} />
          <Route path="/expert" element={<ExpertPage />} />
          <Route path="/attractions" element={<AttractionPage />} />
          <Route path="/business/:business_id" element={<BusinessInfoPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}