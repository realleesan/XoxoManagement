import { createBrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Leads from './pages/Leads.jsx';
import LeadDetail from './pages/LeadDetail.jsx';
import Customers from './pages/Customers.jsx';
import CustomerDetail from './pages/CustomerDetail.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Services from './pages/Services.jsx';
import Workflows from './pages/Workflows.jsx';
import WorkflowKanban from './pages/WorkflowKanban.jsx';
import CreateWorkflow from './pages/CreateWorkflow.jsx';
import Invoices from './pages/Invoices.jsx';
import CreateInvoice from './pages/CreateInvoice.jsx';
import InvoiceDetail from './pages/InvoiceDetail.jsx';
import Reports from './pages/Reports.jsx';
import Inventory from './pages/Inventory.jsx';
import Finance from './pages/Finance.jsx';
import Orders from './pages/Orders.jsx';
import CreateOrder from './pages/CreateOrder.jsx';
import OrderDetail from './pages/OrderDetail.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: '/leads',
        element: <Leads />,
      },
      {
        path: '/leads/:id',
        element: <LeadDetail />,
      },
      {
        path: '/customers',
        element: <Customers />,
      },
      {
        path: '/customers/:id',
        element: <CustomerDetail />,
      },
      {
        path: '/products',
        element: <Products />,
      },
      {
        path: '/products/:id',
        element: <ProductDetail />,
      },
      {
        path: '/services',
        element: <Services />,
      },
      {
        path: '/workflows',
        element: <Workflows />,
      },
      {
        path: '/workflows/create',
        element: <CreateWorkflow />,
      },
      {
        path: '/workflows/:id',
        element: <WorkflowKanban />,
      },
      {
        path: '/orders',
        element: <Orders />,
      },
      {
        path: '/orders/create',
        element: <CreateOrder />,
      },
      {
        path: '/orders/:id',
        element: <OrderDetail />,
      },
      {
        path: '/invoices',
        element: <Invoices />,
      },
      {
        path: '/invoices/create',
        element: <CreateInvoice />,
      },
      {
        path: '/invoices/:id',
        element: <InvoiceDetail />,
      },
      {
        path: '/inventory',
        element: <Inventory />,
      },
      {
        path: '/finance',
        element: <Finance />,
      },
      {
        path: '/reports',
        element: <Reports />,
      },
      // Add more routes here
    ],
  },
]);

export default router;

