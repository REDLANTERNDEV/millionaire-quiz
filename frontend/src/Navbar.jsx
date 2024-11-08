const Navbar = () => {
  return (
    <nav className="flex flex-row bg-[#2C0269] p-4 items-end justify-between">
      <div className="justify-start">
        <a href="http://">Logo</a>
      </div>
      <div className="flex flex-row space-x-8 pr-12">
        <a href="http://">Ana Sayfa</a>
        <a href="http://">Github</a>
        <a href="http://">İletişim</a>
      </div>
    </nav>
  );
};
export default Navbar;
