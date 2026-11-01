import Contact from './Contact';
import MainPage from './MainPage';
import { usePathname } from './router';

const routes = {
  '/contact': Contact,
  '/': MainPage,
};

const App = () => {
  const pathname = usePathname();
  // Case-insensitive and ignores a trailing slash, like the previous router
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '').toLowerCase() : pathname;
  const Page = routes[path];
  return Page ? <Page /> : null;
};

export default App;
