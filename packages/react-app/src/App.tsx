import './App.css';
import { SideBar, MainScreen } from './components';
import Onboard from "bnc-onboard";
import Web3 from "web3";

let web3;

function App() {

  return (
    <div className="App">
      <SideBar />
      <MainScreen />
    </div>
  );
}

// const onboard = Onboard({
//   dappId: "16b95b38-9869-4d58-b978-82322a52ff6d",
//   networkId: 1,
//   subscriptions: {
//     wallet: wallet => {
//       web3 = new Web3(wallet.provider)
//     }
//   }
// });

export default App;
