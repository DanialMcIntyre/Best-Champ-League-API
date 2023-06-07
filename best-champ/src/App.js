import './App.css';
import {useState} from 'react'
import axios from 'axios';
import * as React from 'react';
import { useEffect } from 'react';

function App() {

  //Text box
  const [searchText, setSearchText] = useState("");

  //Player data
  var [playerData, setPlayerData] = useState({})
  //List of matches with details
  var [matchData, setMatchData] = useState({})

  //When user searches for player
  function onButtonClick(event) {
    getPlayerData()
    getMatchData()
  }

  //Finds player data
  function getPlayerData() {
    axios.get("http://localhost:4000/playerData", { params: {username: searchText}})
    .then(function (response) {
      setPlayerData(response.data);
    }).catch(function (error) {
      console.log(error);
    })
  }

  //Gets match details of past games
  function getMatchData() {
    axios.get("http://localhost:4000/matchHistory", { params: {username: searchText}})
      .then(function (response) {
        setMatchData(response.data);
      }).catch(function (error) {
        console.log(error);
      })
    }

  useEffect(() => {
    console.log(playerData);
    console.log(matchData);
    }, [playerData, matchData]); 

  //Puts info into variables
  var playerID = playerData.id
  var playerPUUID = playerData.puuid
  var playerName = playerData.name
  let iconString = "http://ddragon.leagueoflegends.com/cdn/13.11.1/img/profileicon/0.png"
  let imgString = "http://ddragon.leagueoflegends.com/cdn/img/champion/loading/Aatrox_0.jpg"
  var bestChamp = "Aatrox"

  function Analytics() {

    return (
      <div class="flex-container">
        <div class="spacer"></div>
        <div class="child1">
          <div class="flex-playerinfo"> 
            <img src={iconString} alt="Your icon" id="iconImg" display="flex" />
            <p display="flex" id="playername">{playerName}</p> 
          </div>
          <img width="100%" src={imgString} alt="Your best champion" id="champImg" display="inline"/>
        </div>
        <div id="midspacer"></div>
        <div className="child2">
          <h1 id="title">Your Best Champ is: {bestChamp} </h1>
          <div className="analytics"> 
            <p display="block" className="analytics">Player ID: {playerID}</p>
            <p display="block" className="analytics">Player Puuid: {playerPUUID}</p>

          </div>
        </div>
        <div className="spacer"></div>
      </div>
    )
  }
  
  return (
    
    <div className="App">
      <div className="content">
        <h1>Best Champion Finder!</h1>
        <input type="text" onChange = {e => setSearchText(e.target.value)}/>
        <button onClick = {e => onButtonClick(e)}>Search for player</button>
        <Analytics/>
        <br />
        
      </div>
    </div>
  );
  
}

export default App;
