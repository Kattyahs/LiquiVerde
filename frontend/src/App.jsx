import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductSearch from '@/pages/ProductSearch';
import ProductDetail from '@/pages/ProductDetail';
import ShoppingListPage from './pages/ShoppingListPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductSearch />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path= "/shopping-list" element={<ShoppingListPage />}/>
      </Routes>
    </Router>
  );
}

export default App;