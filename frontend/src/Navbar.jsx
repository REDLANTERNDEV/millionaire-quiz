import { Link } from 'react-router-dom';
const Navbar = () => {
  return (
    <nav className="flex flex-col sm:flex-row bg-[#2C0269] p-4 items-center sm:items-center sm:justify-between">
      <div className="mb-2 sm:mb-0 font-semibold">
        <Link to="/">
          <img src="/kmoi.svg" className="w-12 h-12" alt="Logo"></img>
        </Link>
      </div>
      <div className="flex flex-col font-semibold sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 sm:pr-6">
        <Link to="/" className="hover:text-yellow-400">
          Ana Sayfa
        </Link>
        <Link
          target="_blank"
          to="https://github.com/REDLANTERNDEV/millionaire-quiz"
          className="hover:text-yellow-400"
        >
          Github
        </Link>
        <Link to="/contact" className="hover:text-yellow-400 font-semibold">
          İletişim
        </Link>
      </div>
    </nav>
  );
};
export default Navbar;
