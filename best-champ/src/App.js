import './App.css';
import {useState} from 'react'
import axios from 'axios';

function App() {

  const API_KEY = "RGAPI-365230e6-285d-4a78-9278-7679e5a6c24e"

  const [playerData, setPlayerData] = useState({})

  async function searchForPlayer() {
    var summonerName = "TheKartAgency";
    const link = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + summonerName + "?api_key=" + API_KEY;
  
    axios.get(link).then(function (response) {
      setPlayerData(response.data)
      console.log(playerData)
    }).catch(function (error) {
      console.log(error);
    })
  }

  searchForPlayer()

  return (
    
    <div className="App">
      <div className="content">
        <h1>Best Champion Finder!</h1>
        <p></p>
      </div>
    </div>
  );
  
}

export default App;
