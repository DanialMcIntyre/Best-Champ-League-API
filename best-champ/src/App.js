import './App.css';
import {useState} from 'react'
import axios from 'axios';
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

function App() {

  const API_KEY = "RGAPI-5a661454-d029-4bed-8a92-61de0b11c8e6"

  var [playerData, setPlayerData] = useState({})
  var [matchHistoryData, setMatchHistoryData] = useState({})

  //Gets player data from API
  async function searchForPlayer(name) {
    const link = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + name + "?api_key=" + API_KEY;

    //Gets info from API
    axios.get(link).then(function (response) {
      setPlayerData(response.data)
      //When gets player data, also get match history
      searchForMatches(response.data.puuid)
    }).catch(function (error) {
      console.log(error);
    })
  }

  //Gets match history of player from API
  async function searchForMatches(puuid) {
    const link = "https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/" + puuid + "/ids?start=0&count=5&api_key=" + API_KEY;

    //Gets info from API
    axios.get(link).then(function (response) {
      setMatchHistoryData(response.data)
      matchHistoryData = Object.values(matchHistoryData);
    }).catch(function (error) {
      console.log(error);
    })
  }

  //Gets specific match information at certain index, returns JSON
  async function getSpecificMatch(matches, index) {

    const link = "https://americas.api.riotgames.com/lol/match/v5/matches/" + matches[index] + "?api_key=" + API_KEY;
    axios.get(link).then(function (response) {
      let matchInfo = JSON.stringify(response.data);
      getSpecificMatchData(matchInfo);
      return matchInfo;
    }).catch(function (error) {
      console.log(error);
    })
  }

  async function getSpecificMatchData(match) {
    //Puts match info in variable
    var data = JSON.parse(match);

    let participants = data.metadata.participants;
    let yourPlayerIndex = 0;

    //Gets all info for player
    for (let i = 0; i < participants.length; i++) {
      if (participants[i] === playerData.puuid) {
        yourPlayerIndex = i;
      }
    }
    let yourPlayer = data.info.participants[yourPlayerIndex];

    let champion = yourPlayer.championName;
    let lane = yourPlayer.lane;
    let kills = yourPlayer.kills;
    let deaths = yourPlayer.deaths;
    let assists = yourPlayer.assists;
    console.log(yourPlayer);
    console.log("You played " + champion);
    console.log("Your lane was " + lane);
    console.log("You had a kda of " + kills + "/" + deaths + "/" + assists);
  }

  //Puts info into variables
  var playerID = playerData.id
  var playerPUUID = playerData.puuid
  var playerName = playerData.name
  let imgString = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/"
  imgString = imgString + "Aatrox" + "_0.jpg"
  
  getSpecificMatch(matchHistoryData, 0);

  function MyForm() {
    const [name, setName] = useState("");
  
    //When form is submitted
    const handleSubmit = (event) => {
      event.preventDefault();

      //Reset player data
      playerData = {}
      
      //Continues checking API as long as object doesn't have any info
      if (Object.keys(playerData).length === 0) {
        searchForPlayer(name)
      }

    }
  
    return (
      <Box 
          component="form"
          sx={{
            position: "relative",
          }}
          noValidate
          autoComplete="off"
          onSubmit={handleSubmit}
        > 
          <Box>
            <TextField id="outlined-basic" label="Summoner Name" variant="standard" type="text" value={name} onChange={(e) => setName(e.target.value)}
              sx={{
                width: "50%"
              }}
            />
            <IconButton color="primary" aria-label="upload picture" component="label" onClick={handleSubmit}
              sx={{
                m: 0, 
                position: "absolute",
                top: "50%", 
                msTransform: "translateY(-50%)", 
                transform: "translateY(-50%)",
              }}
            >
              <SearchIcon></SearchIcon>            
            </IconButton>

            
          </Box>
        </Box>
    )
  }
  
  return (
    
    <div className="App">
      <div className="content">
        <h1>Best Champion Finder!</h1>
            
        <MyForm />
        <img src={imgString} alt="Your best champion" id="champImg"/>
        <p>Player ID: {playerID}</p>
        <p>Player Puuid: {playerPUUID}</p>
        <p>Player Name: {playerName}</p>
        
      </div>
    </div>
  );
  
}

export default App;
