const Navbar = () => {
  return (
    <nav className="flex flex-col sm:flex-row bg-[#2C0269] p-4 items-center sm:items-end sm:justify-between">
      <div className="mb-2 sm:mb-0">
        <a href="http://">Logo</a>
      </div>
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 sm:pr-6">
        <a href="#" className="hover:text-yellow-400">
          Ana Sayfa
        </a>
        <a
          target="_blank"
          href="https://github.com/REDLANTERNDEV/millionaire-quiz"
          className="hover:text-yellow-400"
        >
          Github
        </a>
        <a href="/contact" className="hover:text-yellow-400">
          İletişim
        </a>
      </div>
    </nav>
  );
};
export default Navbar;
