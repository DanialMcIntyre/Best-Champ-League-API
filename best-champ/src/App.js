import './App.css';
import {useState} from 'react'
import axios from 'axios';
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

function App() {

  const API_KEY = "RGAPI-26c24b2e-0397-46bb-9474-d9d744090b0c"

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
    const link = "https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/" + puuid + "/ids?start=0&count=100&api_key=" + API_KEY;

    //Gets info from API
    axios.get(link).then(function (response) {
      setMatchHistoryData(response.data)
    }).catch(function (error) {
      console.log(error);
    })
  }

  //Puts info into variables
  var playerID = playerData.id
  var playerPUUID = playerData.puuid
  var playerName = playerData.name

  var matches = Object.values(matchHistoryData);
  
  console.log(matches)

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
     
        <p>Player ID: {playerID}</p>
        <p>Player Puuid: {playerPUUID}</p>
        <p>Player Name: {playerName}</p>
        <p>{matches}</p>
      </div>
    </div>
  );
  
}

export default App;
