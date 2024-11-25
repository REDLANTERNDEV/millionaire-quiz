import Navbar from './Navbar';
import './index.css';
const Contact = () => {
  return (
    <div>
      <Navbar />
      <div className="gap-2 flex flex-col">
        <h1 className="items-center align-middle justify-center flex mt-5 font-extrabold text-4xl">
          İletişim
        </h1>
        {/* <a className="pl-5 pt-3" href="mailto:">
          <h3 className="w-16 pl-1 font-extrabold text-2xl bg-green-500 inline-block">
            Mail
          </h3>
        </a> */}
        <a
          className="pl-5 pt-3"
          href="https://github.com/REDLANTERNDEV"
          target="_blank"
        >
          <h3 className="w-24 pl-1 font-extrabold text-2xl bg-green-500 inline-block">
            Github
          </h3>
        </a>
      </div>
    </div>
  );
};
export default Contact;
