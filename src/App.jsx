import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './layouts/Layout';
import { routes } from './routes';
import { Toaster } from 'sonner';

function createRouteConfig(routes) {
  return routes.map((route) => {
    const routeConfig = {
      path: route.path,
      element: route.element,
    };

    if (route.index) {
      routeConfig.index = route.index;
    }

    if (route.children && route.children.length > 0) {
      routeConfig.children = createRouteConfig(route.children);
    }

    return routeConfig;
  });
}

// Create the router with nested route support
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: createRouteConfig(routes)
  }
]);

function App() {
  return (
    <>
      <Toaster richColors position='bottom-left'/>
      <RouterProvider router={router} />;
    </>
  ) 
}

export default App;
