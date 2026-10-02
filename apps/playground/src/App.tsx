import { Navigate, Route, Routes } from 'react-router';
import { BasicPage } from './pages/BasicPage';
import { SortingPage } from './pages/SortingPage';
import { FilteringPage } from './pages/FilteringPage';
import { SearchingPage } from './pages/SearchingPage';
import { PaginationPage } from './pages/PaginationPage';
import { AdvancedPage } from './pages/AdvancedPage';
import { ServerPage } from './pages/ServerPage';

export function App() {
  return <Routes>
    <Route path='/basic' element={<BasicPage />} />
    <Route path='/sorting' element={<SortingPage />} />
    <Route path='/filtering' element={<FilteringPage />} />
    <Route path='/searching' element={<SearchingPage />} />
    <Route path='/pagination' element={<PaginationPage />} />
    <Route path='/advanced' element={<AdvancedPage />} />
    <Route path='/server' element={<ServerPage />} />
    <Route path='*' element={<Navigate to='/basic' replace />} />
  </Routes>;
}
