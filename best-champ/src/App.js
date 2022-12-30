import './App.css';
import {useState} from 'react'
import axios from 'axios';

function App() {

  const API_KEY = "RGAPI-26c24b2e-0397-46bb-9474-d9d744090b0c"

  const [playerData, setPlayerData] = useState({})

  async function searchForPlayer() {

    var summonerName = "TheKartAgency";
    const link = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + summonerName + "?api_key=" + API_KEY;

    //Gets info from API
    axios.get(link).then(function (response) {
      setPlayerData(response.data)
      console.log(playerData)
    }).catch(function (error) {
      console.log(error);
    })
  }

  //Continues checking API as long as object doesn't have any info
  if (Object.keys(playerData).length === 0) {
    searchForPlayer()
  }

  var id = playerData.id
  var name = playerData.name

  return (
    
    <div className="App">
      <div className="content">
        <h1>Best Champion Finder!</h1>
        <p>{id}</p>
        <p>{name}</p>
      </div>
    </div>
  );
  
}

export default App;
