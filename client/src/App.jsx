import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Publishers from './pages/Publishers.jsx';
import PublisherForm from './pages/PublisherForm.jsx';
import PublisherDetails from './pages/PublisherDetails.jsx';
import Authors from './pages/Authors.jsx';
import AuthorForm from './pages/AuthorForm.jsx';
import AuthorDetails from './pages/AuthorDetails.jsx';
import Books from './pages/Books.jsx';
import BookForm from './pages/BookForm.jsx';
import BookDetails from './pages/BookDetails.jsx';
import Inventory from './pages/Inventory.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />

        <Route path="publishers" element={<Publishers />} />
        <Route path="publishers/new" element={<PublisherForm />} />
        <Route path="publishers/:id" element={<PublisherDetails />} />
        <Route path="publishers/:id/edit" element={<PublisherForm />} />

        <Route path="authors" element={<Authors />} />
        <Route path="authors/new" element={<AuthorForm />} />
        <Route path="authors/:id" element={<AuthorDetails />} />
        <Route path="authors/:id/edit" element={<AuthorForm />} />

        <Route path="books" element={<Books />} />
        <Route path="books/new" element={<BookForm />} />
        <Route path="books/:id" element={<BookDetails />} />
        <Route path="books/:id/edit" element={<BookForm />} />

        <Route path="inventory" element={<Inventory />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
