import './App.css';
import {useState} from 'react'
import axios from 'axios';
import * as React from 'react';
import { useEffect } from 'react';
import background from "./images/background.jpg";

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
  async function getMatchData() {
    axios.get("http://localhost:4000/matchHistory", { params: {username: searchText}})
      .then(function (response) {
        setMatchData(response.data);
      }).catch(function (error) {
        console.log(error);
      })
  }

  //Gets specific stats from past games
  function getPlayerDataFromMatches() {
    if (matchData.length !== undefined) {
      console.log(matchData.length)
      const numOfMatches = matchData.length;
      const puuid = playerData.puuid;

      //Player info from games
      let playerNumber = [];
      let playerChamps = [];
      let playerRoles = [];
      let playerKills = [];
      let playerDeaths = [];
      let playerAssists = [];

      //Find player position in list of players (ex: 3 of 10)
      for (let i = 0; i < numOfMatches; i++) {
        for (let n = 0; n < 10; n++) {
          if (matchData[i].metadata.participants[n] === puuid) {
            playerNumber.push(n);
          }
        }
      }

      //Finds players previous played champions from recent games
      for (let i = 0; i < numOfMatches; i++) {
        let champ = matchData[i].info.participants[playerNumber[i]].championName
        playerChamps.push(champ);
      }

      //Finds players roles from recent games
      for (let i = 0; i < numOfMatches; i++) {
        let role = matchData[i].info.participants[playerNumber[i]].teamPosition
        playerRoles.push(role);
      }

      //Finds players KDA from recent games      
      for (let i = 0; i < numOfMatches; i++) {
        let kills = matchData[i].info.participants[playerNumber[i]].kills
        playerKills.push(kills);
        let deaths = matchData[i].info.participants[playerNumber[i]].deaths
        playerDeaths.push(deaths);
        let assists = matchData[i].info.participants[playerNumber[i]].assists
        playerAssists.push(assists);
      }
      console.log(playerNumber)
      console.log(playerChamps)
      console.log(playerRoles)
      console.log(playerKills)
      console.log(playerDeaths)
      console.log(playerAssists)
    }
  }

  useEffect(() => {
    console.log(playerData);
    console.log(matchData);
    }, [playerData, matchData]); 

  getPlayerDataFromMatches()


  //Puts info into variables
  var playerID = playerData.id
  var playerPUUID = playerData.puuid
  var playerName = playerData.name
  let iconID = playerData.profileIconId;
  if (iconID === undefined) {
    iconID = 0;
  }
  var bestChamp = "Leblanc"
  var skinNumber = 5;
  let iconString = "http://ddragon.leagueoflegends.com/cdn/13.11.1/img/profileicon/" + iconID + ".png"
  let imgString = "http://ddragon.leagueoflegends.com/cdn/img/champion/loading/" + bestChamp + "_" + skinNumber + ".jpg"

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      onButtonClick(event);
    }
  }

  function Analytics() {

    return (
      <div className="flex-container">
        <div className="spacer"></div>
        <div className="child1">
          <div className="flex-playerinfo"> 
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
    <div style={{ backgroundImage: `url(${background})` }}>
      <div className="App">
        <div className="content">
          <div className = "font-face-league">
            <div className = "title">
              <h1>Best Champion Finder!</h1>
            </div>
            <input type="text" onChange = {e => setSearchText(e.target.value)} onKeyDown = {e => handleKeyDown(e)}/>
            <button onClick = {e => onButtonClick(e)}>Search for player</button>

            <div>
              {
              JSON.stringify(playerData.status) === "404" ?
              <>
              <p>Please enter a valid username!</p>
              </>
              :
              JSON.stringify(playerData) !== '{}' ?
              <Analytics/>
              :
              <><p>No player data</p></>}
            </div>
            
            <br />
          </div>
        </div>
      </div>
    </div>
  );
  
}

export default App;
