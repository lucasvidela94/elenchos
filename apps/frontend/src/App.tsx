import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Explorer from './pages/Explorer';
import MunicipalityDashboard from './pages/MunicipalityDashboard';
import ValidatorDashboard from './pages/ValidatorDashboard';
import RegistryDetail from './pages/RegistryDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="explorer" element={<Explorer />} />
        <Route path="municipality" element={<MunicipalityDashboard />} />
        <Route path="validator" element={<ValidatorDashboard />} />
        <Route path="registry/:id" element={<RegistryDetail />} />
      </Route>
    </Routes>
  );
}

export default App;
