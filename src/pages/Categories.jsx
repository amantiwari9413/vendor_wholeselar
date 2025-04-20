import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem('userData'));

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/category/getCategoryByVendorId?vendorId=${userData.user_id}`
      );
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/category/addCategory`,
        {
          categoryName: newCategory,
          vendorId: userData.user_id
        }
      );

      if (response.data.success) {
        setNewCategory('');
        setShowAddForm(false);
        fetchCategories(); // Refresh the list
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
      console.error('Error adding category:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/category/deletCategory`,
        {
          categoryid: categoryToDelete._id
        }
      );

      if (response.data.success) {
        setCategories(categories.filter(cat => cat._id !== categoryToDelete._id));
        setCategoryToDelete(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category');
      console.error('Error deleting category:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Categories</h1>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Category
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="mb-6 bg-gray-800 border border-gray-700 rounded-lg p-6">
            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-300 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter category name"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-400">Loading categories...</div>
          ) : categories.length > 0 ? (
            categories.map((category) => (
              <div
                key={category._id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition duration-200 relative"
              >
                <button
                  onClick={() => setCategoryToDelete(category)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition duration-200"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-medium text-white pr-8">{category.categoryName}</h3>
                <p className="text-gray-400 mt-2">Category ID: {category._id}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400">No categories found</div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {categoryToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-white mb-4">Delete Category</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete the category "{categoryToDelete.categoryName}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setCategoryToDelete(null)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories; 