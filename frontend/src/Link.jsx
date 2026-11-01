import { navigate } from './router';

const Link = ({ to, onClick, ...props }) => {
  const handleClick = (event) => {
    onClick?.(event);
    // Let the browser handle modified clicks (new tab, etc.)
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    navigate(to);
    window.scrollTo(0, 0);
  };

  return <a href={to} onClick={handleClick} {...props} />;
};

export default Link;
