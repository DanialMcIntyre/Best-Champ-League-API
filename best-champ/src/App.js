import './App.css';
import {useState} from 'react'
import axios from 'axios';
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

function App() {

  const API_KEY = "RGAPI-120b2925-70da-4712-adb6-65ac65adb4b0"

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
      matchHistoryData = Object.values(matchHistoryData);
    }).catch(function (error) {
      console.log(error);
    })
  }
  //
  //Gets specific match information at certain index, returns JSON
  function getSpecificMatch(matches, index) {
    return new Promise((resolve, reject) => {
      const link = "https://americas.api.riotgames.com/lol/match/v5/matches/" + matches[index] + "?api_key=" + API_KEY;
      axios.get(link).then(function (response) {
        let matchInfo = JSON.stringify(response.data);
          let result = getSpecificMatchData(matchInfo);
          setTimeout(() => {
            resolve(result)
            }, 1)
      }).catch(function (error) {
        console.log(error);
      })
    })
  }

  function getSpecificMatchData(match) {
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

    let matchchampion = yourPlayer.championName;
    let matchlane = yourPlayer.lane;
    let matchkills = yourPlayer.kills;
    let matchdeaths = yourPlayer.deaths;
    let matchassists = yourPlayer.assists;
    let thismatch = {champion : matchchampion, lane : matchlane, kills : matchkills, deaths : matchdeaths, assists : matchassists}
    return thismatch
  }
  
  async function getAllMatches() {
    const matchArr = [];
    for(let i = 0; i < 20; i++) {
      matchArr.push(await getSpecificMatch(matchHistoryData, i));
    }
    return matchArr
  }
  async function receiveData() {
      const matches = await getAllMatches();
      console.log(matches)
      //let imgString = "http://ddragon.leagueoflegends.com/cdn/img/champion/loading/"
      //imgString = imgString + match1.champion + "_0.jpg"
      //document.getElementById("champImg").setAttribute("src", imgString)
      return //match1.champion
  }

  receiveData();
  //Puts info into variables
  var playerID = playerData.id
  var playerPUUID = playerData.puuid
  var playerName = playerData.name
  let imgString = "http://ddragon.leagueoflegends.com/cdn/img/champion/loading/"
  imgString = imgString + "Aatrox_0.jpg"
  
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
      <div class="flex-container">
        <div class="child1"> 
          <img src={imgString} alt="Your best champion" id="champImg" display="inline"/>
        </div>
        
        <div class="child2">
          <p display="block">Player ID: {playerID}</p>
          <p display="block">Player Puuid: {playerPUUID}</p>
          <p display="block">Player Name: {playerName}</p>
        </div>
      </div>
    )
  }
  
  return (
    
    <div className="App">
      <div className="content">
        <h1>Best Champion Finder!</h1>
            
        <MyForm />
        <Analytics />
        
        
      </div>
    </div>
  );
  
}

export default App;
