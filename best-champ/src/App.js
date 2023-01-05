import './App.css';
import {useState} from 'react'
import axios from 'axios';
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

function App() {

  const API_KEY = "RGAPI-23007888-47d6-4389-96c0-7b19e30e2202"

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

  //Gets specific information from each match
  async function matchHistoryList(matches) {

    //Makes empty array for all the matches
    var matchList = new Array(Object.keys(matches).length)

    //Loops through all the matches and gets necessary info
    for(let i = 0; i < Object.keys(matches).length; i++) {

      const link = "https://americas.api.riotgames.com/lol/match/v5/matches/" + matches[i] + "?api_key=" + API_KEY;

      //Gets info from API
      axios.get(link).then(function (response) {
        matchList.splice(i, 0, response.data)
      }).catch(function (error) {
        console.log(error);
      })
    }
    return matchList
  }

  //Puts info into variables
  var playerID = playerData.id
  var playerPUUID = playerData.puuid
  var playerName = playerData.name

  var matchList = matchHistoryList(matchHistoryData)
  
  console.log(matchList)

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

  function Analytics() {
    return (
      <Box 
        sx={{
          positon: "relative"
        }}
        >
        <img src="https://images.contentstack.io/v3/assets/blt731acb42bb3d1659/blt0d029ccdb18a4299/5db0601ba6470d6ab91ce5be/RiotX_ChampionList_xayah.jpg?quality=90&width=250" alt="Your best champion"/>
                      
      </Box>
      
    ) 
  }
  
  return (
    
    <div className="App">
      <div className="content">
        <h1>Best Champion Finder!</h1>
            
        <MyForm />
        <Analytics />
        <p>Player ID: {playerID}</p>
        <p>Player Puuid: {playerPUUID}</p>
        <p>Player Name: {playerName}</p>
        
      </div>
    </div>
  );
  
}

export default App;
