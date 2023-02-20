import logo from './logo.svg';
import './App.css';
import IndexBox from './components/index/index.js'
import 'antd/dist/reset.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <IndexBox></IndexBox>
      </header>
    </div>
  );
}

export default App;
