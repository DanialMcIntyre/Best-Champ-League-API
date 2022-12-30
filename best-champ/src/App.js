import './App.css';
import {useState} from 'react'
import axios from 'axios';
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';

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

  var id = playerData.id
  var name = playerData.name

  return (
    
    <div className="App">
      <div className="content">
        <h1>Best Champion Finder!</h1>
    
        <Box
          component="form"
          sx={{
            position: "relative",
          }}
          noValidate
          autoComplete="off"
        > 
          <Box
          >
            <TextField id="outlined-basic" label="Summoner Name" variant="standard"
              sx={{
                width: "50%"
              }}
            />
            <IconButton color="primary" aria-label="upload picture" component="label"
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

        
        
        
        <p>{id}</p>
        <p>{name}</p>
      </div>
    </div>
  );
  
}

export default App;
