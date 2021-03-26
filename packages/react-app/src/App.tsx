import React from 'react';
import logo from './logo.svg';
import './App.css';
import { SideBar, MainScreen } from './components';

function App() {
  return (
    <div className="App">
      <SideBar />
      <MainScreen />
    </div>
  );
}

export default App;
