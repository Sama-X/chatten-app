import './App.css';
import 'antd/dist/antd.css';

import Router from './router/index'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        {/* <IndexBox></IndexBox> */}
        <Router></Router>
      </header>
    </div>
  );
}

export default App;
