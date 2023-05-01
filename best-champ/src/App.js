import './App.css';
import {useState} from 'react'
import axios from 'axios';
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

function App() {

  const API_KEY = "RGAPI-e0d6a1d1-5340-4b84-bab1-e7a3fe159e5b"

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
    var data = JSON.parse(match);

    let participants = data.metadata.participants;
    console.log(participants);
  }

  //Puts info into variables
  var playerID = playerData.id
  var playerPUUID = playerData.puuid
  var playerName = playerData.name

  getSpecificMatch(matchHistoryData, 1);
  

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
