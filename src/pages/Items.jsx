import { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

const Items = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [categories, setCategories] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemName: '',
    itemPrice: '',
    vendorId: '',
    categoryId: '',
    itemImg: null
  });

  const userData = JSON.parse(localStorage.getItem('userData'));

  useEffect(() => {
    fetchItems();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/category/getCategoryByVendorId?vendorId=${userData.user_id}`
      );
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/item/allItembyVendorId?vendorId=${userData.user_id}`
      );
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    try {
      setDeleteLoading(true);
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/item/deletItem?itemId=${itemToDelete._id}`
      );

      if (response.data.success) {
        setItems(items.filter(item => item._id !== itemToDelete._id));
        setItemToDelete(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete item');
      console.error('Error deleting item:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      itemImg: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('itemName', formData.itemName);
      formDataToSend.append('itemPrice', formData.itemPrice);
      formDataToSend.append('vendorId', userData.user_id);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('itemImg', formData.itemImg);

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/item/addItem`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setShowAddForm(false);
        setFormData({
          itemName: '',
          itemPrice: '',
          vendorId: '',
          categoryId: '',
          itemImg: null
        });
        fetchItems(); // Refresh the items list
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add item');
      console.error('Error adding item:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Items</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Item
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-gray-400">Loading items...</div>
          ) : items.length > 0 ? (
            items.map((item) => (
              <div
                key={item._id}
                className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition duration-200 relative"
              >
                <button
                  onClick={() => setItemToDelete(item)}
                  className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition duration-200"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                
                <div className="mt-4">
                  <img 
                    src={item.itemImg} 
                    alt={item.itemName}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-medium text-white">{item.itemName}</h3>
                  <span className="text-purple-400 font-medium">₹{item.itemPrice}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400">No items found</div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {itemToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-white mb-4">Delete Item</h3>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete the item "{itemToDelete.itemName}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                  disabled={deleteLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteItem}
                  disabled={deleteLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-white mb-4">Add New Item</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="itemName" className="block text-sm font-medium text-gray-300 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    id="itemName"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="itemPrice" className="block text-sm font-medium text-gray-300 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    id="itemPrice"
                    name="itemPrice"
                    value={formData.itemPrice}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="itemImg" className="block text-sm font-medium text-gray-300 mb-1">
                    Item Image
                  </label>
                  <input
                    type="file"
                    id="itemImg"
                    name="itemImg"
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    accept="image/*"
                    required
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
                    {loading ? 'Adding...' : 'Add Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Items; 