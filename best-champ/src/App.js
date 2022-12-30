import './App.css';
import {useState} from 'react'
import axios from 'axios';
import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import ReactDOM from 'react-dom/client';

function App() {

  const API_KEY = "RGAPI-26c24b2e-0397-46bb-9474-d9d744090b0c"

  const [playerData, setPlayerData] = useState({})

  async function searchForPlayer(name) {

    var summonerName = name;
    const link = "https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/" + summonerName + "?api_key=" + API_KEY;

    //Gets info from API
    axios.get(link).then(function (response) {
      setPlayerData(response.data)
      console.log(playerData)
    }).catch(function (error) {
      console.log(error);
    })
  }

  var id = playerData.id
  var name = playerData.name

  

  

  function MyForm() {
    const [name, setName] = useState("");
  
    const handleSubmit = (event) => {
      event.preventDefault();
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
        
        
        
        <p>{id}</p>
        <p>{name}</p>
      </div>
    </div>
  );
  
}

export default App;
