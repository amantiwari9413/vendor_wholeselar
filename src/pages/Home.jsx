import { useNavigate } from 'react-router-dom';
import { 
  ChartBarIcon, 
  ShoppingCartIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon,
  FolderIcon,
  CubeIcon,
  TagIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const Home = () => {
  const navigate = useNavigate();
  const userData = JSON.parse(localStorage.getItem('userData'));

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/signin');
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const stats = [
    { name: 'Total Sales', value: '$45,231', change: '+20.1%', icon: CurrencyDollarIcon },
    { name: 'Active Orders', value: '12', change: '+4.5%', icon: ShoppingCartIcon },
    { name: 'Total Customers', value: '2,345', change: '+12.3%', icon: UserGroupIcon },
    { name: 'Revenue Growth', value: '24.5%', change: '+8.2%', icon: ChartBarIcon },
  ];

  const menuItems = [
    { name: 'Orders', icon: ShoppingCartIcon, path: '/orders' },
    { name: 'Items', icon: CubeIcon, path: '/items' },
    { name: 'Categories', icon: FolderIcon, path: '/categories' },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 text-transparent bg-clip-text">
                Vendor Wholesaler
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <UserIcon className="h-5 w-5" />
                <span className="text-sm font-medium">{userData?.name || 'Vendor'}</span>
              </div>
              <button className="text-gray-400 hover:text-gray-300">
                <span className="relative inline-flex items-center p-2 text-sm font-medium rounded-full">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">View notifications</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                </span>
              </button>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-purple-500 transition duration-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <stat.icon className="h-8 w-8 text-purple-400" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">{stat.name}</h3>
                  <p className="text-2xl font-semibold text-white">{stat.value}</p>
                  <p className="text-sm text-green-400">{stat.change}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <div
              key={item.name}
              onClick={() => handleNavigation(item.path)}
              className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6 cursor-pointer hover:border-purple-500 transition duration-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <item.icon className="h-8 w-8 text-purple-400" aria-hidden="true" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-white">{item.name}</h3>
                  <p className="text-gray-400">Manage your {item.name.toLowerCase()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home; 