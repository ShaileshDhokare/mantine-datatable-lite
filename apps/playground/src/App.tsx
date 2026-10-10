import { Navigate, Route, Routes, useLocation } from 'react-router';
import { BasicPage } from './pages/BasicPage';
import { SortingPage } from './pages/SortingPage';
import { FilteringPage } from './pages/FilteringPage';
import { SearchingPage } from './pages/SearchingPage';
import { PaginationPage } from './pages/PaginationPage';
import { AdvancedPage } from './pages/AdvancedPage';
import { ServerPage } from './pages/ServerPage';
import { PinningPage } from './pages/PinningPage';
import { ExpandablePage } from './pages/ExpandablePage';
import { SelectionPage } from './pages/SelectionPage';
import { GuidePage, InstallationPage } from './pages/GuidePage';
import { ApiPage } from './pages/ApiPage';

export function App() {
  const { pathname, search } = useLocation();
  return <Routes key={`${pathname}${search}`}>
    <Route path='/getting-started' element={<GuidePage guide='getting-started' />} />
    <Route path='/installation' element={<InstallationPage />} />
    <Route path='/row-actions' element={<GuidePage guide='row-actions' />} />
    <Route path='/toolbar' element={<GuidePage guide='toolbar' />} />
    <Route path='/theming' element={<GuidePage guide='theming' />} />
    <Route path='/api' element={<ApiPage />} />
    <Route path='/basic' element={<BasicPage />} />
    <Route path='/sorting' element={<SortingPage />} />
    <Route path='/filtering' element={<FilteringPage />} />
    <Route path='/searching' element={<SearchingPage />} />
    <Route path='/pagination' element={<PaginationPage />} />
    <Route path='/advanced' element={<AdvancedPage />} />
    <Route path='/server' element={<ServerPage />} />
    <Route path='/pinning' element={<PinningPage />} />
    <Route path='/expandable' element={<ExpandablePage />} />
    <Route path='/selection' element={<SelectionPage />} />
    <Route path='*' element={<Navigate to='/getting-started' replace />} />
  </Routes>;
}
