import logo from './logo.svg';
import './MainPage.css';

function MainPage() {
  return (
    <div className="MainPage">
      <header className="MainPage-header">
              <img src={logo} className="MainPage-logo" alt="logo" />
        <p>
          Edit src/App.js and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default MainPage;
