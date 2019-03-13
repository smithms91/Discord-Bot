const Discord = require("discord.js");
const { prefix, token, giphyToken, weatherAPI, steamAPI } = require("./config.json");
const client = new Discord.Client();
const GphApiClient = require('giphy-js-sdk-core');
const mysql = require('mysql');
const axios = require('axios');
const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'discord_points',
});

giphy = GphApiClient(giphyToken);
connection.connect();

client.once('ready', () => {
  console.log("Ready.");
})

/* User commands ($commands) */
client.on('message', message => {
  if(message.author.bot) return;
  if(message.content.indexOf(prefix) !== 0) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  /* $help - DM */
  if(command == "help") {
    message.author.send("```Hey " + message.author.tag + ", here are the commands.```");
    message.author.send("```General Commands\n$hi @username\n$pet @username\n$hug @username\n$punch @username\n$slap @username\n$flip - Flips a coin\n$urban [term] - Urban Dictionary\n$fortnite [platform] [username] - Fortnite Lifetime Stats\n\nGamble Commands\n$play - Only users in Discord before March 8th 2019\n$points - View current points\n$bet [amount] - Win 2x or lose\n$number [1-10] - Cost 100 to play, hit exact number win 1000\n$number [1-10] [betAmount] - Hit exact, win 10x betAmount\n$pay @username [amount]\n\nAdmin Commands\n$give @username amount - Give player points\n$kick @username - Kick user from server\n$ban @username - Ban user from server\n```");
  }

  /* $hi @username -> Says Hi */
  if(command == "hi") {
    if(message.mentions.members.first()) {
      let member = message.mentions.members.first();
      giphy.search('gifs', {'q': 'hello'}).then((response) => {
        let totalResponses = response.data.length;
        let responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
        let responseFinal = response.data[responseIndex];

        message.channel.send(`Hey ${member}, ${message.author} says hello!`, {
          files: [responseFinal.images.fixed_height.url]
        });
      }).catch(() => {
        message.channel.send("I'm confused.");
      })
    } else {
      message.channel.send("Enter a username.");
    }
  }

  /* $pet @username */
  if(command == "pet") {
    if(message.mentions.members.first()) {
      let member = message.mentions.members.first();
      giphy.search('gifs', {'q': 'petting'}).then((response) => {
        let totalResponses = response.data.length;
        let responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
        let responseFinal = response.data[responseIndex];

        message.channel.send(`${message.author} pets ${member}.  Weird flex.`, {
          files: [responseFinal.images.fixed_height.url]
        });

      }).catch(() => {
        message.channel.send("I'm confused.");
      })
    } else {
      message.channel.send("Enter a username.");
    }
  }

  /* $punch @username */
  if(command == "punch") {
    if(message.mentions.members.first()) {
      let member = message.mentions.members.first();
      giphy.search('gifs', {'q': 'punching'}).then((response) => {
        let totalResponses = response.data.length;
        let responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
        let responseFinal = response.data[responseIndex];

        message.channel.send(`${message.author} punched ${member}.  Wow.`, {
          files: [responseFinal.images.fixed_height.url]
        });
      }).catch(() => {
        message.channel.send("I'm confused.");
      })
    } else {
      message.channel.send("Enter a username.");
    }
  }

  /* $slap @username */
  if(command == "slap") {
    if(message.mentions.members.first()) {
      let member = message.mentions.members.first();
      giphy.search('gifs', {'q': 'slapping'}).then((response) => {
        let totalResponses = response.data.length;
        let responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
        let responseFinal = response.data[responseIndex];

        message.channel.send(`${message.author} slaps ${member}.  What will ${member} do next!?`, {
          files: [responseFinal.images.fixed_height.url]
        });
      }).catch(() => {
        message.channel.send("I'm confused.");
      })
    } else {
      message.channel.send("Enter a username.");
    }
  }

  /* $hug @username */
  if (command == "hug") {
    if(message.mentions.members.first()) {
      let member = message.mentions.members.first();
      giphy.search('gifs', {'q': 'hug'}).then((response) => {
        let totalResponses = response.data.length;
        let responseIndex = Math.floor((Math.random() * 10) + 1) % totalResponses;
        let responseFinal = response.data[responseIndex];
        let responses = [`${message.author} hugs ${member}.  :hug:`, `${message.author} gives ${member} a hug.`, `${member} gets a hug from ${message.author}`];
        let rand = Math.floor(Math.random() * responses.length);
  
        message.channel.send(`${responses[rand]}`, {
          files: [responseFinal.images.fixed_height.url]
        });
  
      }).catch(() => {
        message.channel.send("I'm confused.");
      })
    } else {
      message.channel.send("Enter a username.");
    }
  }

  /* $flip -> Heads or tails */
  if(command == "flip") {
    let coin = Math.floor((Math.random() * 2) + 1);
    if (coin == 1) {
      message.channel.send("```Heads```");
    } else {
      message.channel.send("```Tails```");
    }
  }

  /* $points -> View your points */
  if(command == "points") {
    connection.query(`SELECT * FROM points WHERE name='${message.member.user.tag}'`, (errors, result, field) => {
      if (result.length > 0) {
        message.channel.send(`You have ${result[0].points} points!`);
      } else {
        message.channel.send(`User doesn't exist!`);
      }
    })
  }

  /* $play -> Start playing with 1000 tokens. */
  if(command == "play") {
    connection.query(`SELECT * FROM points WHERE name='${message.member.user.tag}'`, (errors, result, field) => {
      if (result.length > 0) {
        message.channel.send(`You are already playing. You have ${result[0].points} points!`);
      } else {
        connection.query(`INSERT INTO points(name, points) VALUES('${message.member.user.tag}', '1000')`);
        message.channel.send(`Nice! We gave you 1000 tokens to start betting with. Don't spend them all at once, or do!`);
      }
    })
  }

  /* $bet X - Win 2x - 25% Chance */
  if (command == "bet") {
    let value = parseInt(args[0]);
    let odds = Math.random();
    if(!isNaN(value)) {
      connection.query(`SELECT * FROM points WHERE name='${message.member.user.tag}'`, (error, result, field) => {
        let currentPoints = parseInt(result[0].points);
        let winPoints = parseInt(currentPoints + (value * 2));
        let losePoints = parseInt(currentPoints - value);
        if (value > currentPoints) {
          message.channel.send(`You dont have enough points!!`);
        } else {
          if (odds >= .75) {
            connection.query(`UPDATE points SET points="${winPoints}" WHERE name="${message.member.user.tag}"`);
            message.channel.send(`You Win ${value * 2} points! You have ${winPoints} in total!`);
          } else {
            connection.query(`UPDATE points SET points="${losePoints}" WHERE name="${message.member.user.tag}"`);
            message.channel.send(`You Lost ${value} points! You have ${losePoints} in total!`);
          }
        }
      });
    } else {
      message.channel.send(`Enter a number!`);
    }
  }

  /* $pay @username [amount] -> Pay a user */
  if(command == "pay") {
    let payee = message.mentions.members.first().user.tag;
    let payer = message.member.user.tag;
    let amount = parseInt(args[1]);
    if(!isNaN(amount)) {
      /* This is the user RECEIVING payment */
      connection.query(`SELECT * FROM points WHERE name='${payee}'`, (error, result, field) => {
        if(result.length > 0) {
          let currentPoints = parseInt(result[0].points);
          connection.query(`UPDATE points SET points="${currentPoints + amount}" WHERE name="${payee}"`);
        } else {
          message.channel.send(`That user doesn't exist!`);
        }
      });

      /* This is the user SENDING payment */
      connection.query(`SELECT * FROM points WHERE name='${payer}'`, (error, result, field) => {
        if(result.length > 0) {
          let currentPoints = parseInt(result[0].points);
          if(currentPoints < amount) {
            message.channel.send("You don't have enough points!");
          } else {
            connection.query(`UPDATE points SET points="${currentPoints - amount}" WHERE name="${payer}"`);
            message.channel.send(`${payer} gave ${payee} ${amount} points! What a nice guy!`);
          }
        } else {
          message.channel.send(`That user doesn't exist!`);
        }
      });
    } else {
      message.channel.send(`Enter a number!`);
    }

    

  }

  /* $number [1-10] -> Cost 100 to play, hit exact number win 1000 */
  /* $number [1-10] betAmount -> If you hit exact win 10x betAmount. */
  if (command == "number") {
    let number = parseInt(args[0]);
    let randomNumber = Math.floor((Math.random() * 10) + 1);
    if(args.length <= 1) {
      if(number < 1 || number > 10 || isNaN(number)) {
        message.channel.send(`Your number is invalid. Pick a number 1-10.`);
      } else {
        connection.query(`SELECT * FROM points WHERE name='${message.member.user.tag}'`, (error, result, field) => {
          if (result.length > 0) {
            let currentPoints = result[0].points;
            if(currentPoints < 100) {
              message.channel.send("You don't have enough points!");
            } else {
              if (number == randomNumber) {
                message.channel.send(`You Win 1000 points! Good Job! Your total is: ${currentPoints + 1000}`);
                connection.query(`UPDATE points SET points="${currentPoints + 1000}" WHERE name="${message.member.user.tag}"`);
              } else {
                message.channel.send(`You lost 100 points! Try Again! Your total is: ${currentPoints - 100}`);
                connection.query(`UPDATE points SET points="${currentPoints - 100}" WHERE name="${message.member.user.tag}"`);
              }
            }
          } else {
            message.channel.send("You aren't playing yet. Type $play !");
          }
        })
      }
    } else {
      let betAmount = parseInt(args[1]);
      if(number < 1 || number > 10) {
        message.channel.send(`Your number is invalid. Pick a number 1-10.`);
      } else {
        connection.query(`SELECT * FROM points WHERE name='${message.member.user.tag}'`, (error, result, field) => {
          if (result.length > 0) {
            let currentPoints = result[0].points;
            if(betAmount > currentPoints) {
              message.channel.send("You don't have enough credits.");
            } else {
              if (number == randomNumber) {
                message.channel.send(`You Win ${betAmount * 10} points! Good Job! Your total is: ${currentPoints + (betAmount * 10)}`);
                connection.query(`UPDATE points SET points="${currentPoints + (betAmount * 10)}" WHERE name="${message.member.user.tag}"`);
              } else {
                message.channel.send(`You lost ${betAmount} points! Try Again! Your total is: ${currentPoints - betAmount}`);
                connection.query(`UPDATE points SET points="${currentPoints - betAmount}" WHERE name="${message.member.user.tag}"`);
              }
            }
          } else {
            message.channel.send("You aren't playing yet. Type $play !");
          }
        });
      }
    }
  }

  /* $kick [user] -> (Permissions Only) */
  if(command == "kick") {
    if(message.mentions.members.first()) {
      let member = message.mentions.members.first();
      if(message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])) {
        member.kick().then((member) => {
          message.channel.send(`:wave: Goodbye ${member.displayName}! :wave:`);
        })
      }
    } else {
      message.channel.send(`Enter a username`);
    }
  }

  /* $ban [user] -> (Permissions Only) */
  if(command == "ban") {
    if(message.mentions.members.first()) {
      let member = message.mentions.members.first();
      if(message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])) {
        member.ban().then((member) => {
          message.channel.send(`:wave: Goodbye ${member.displayName}! :wave:`);
        })
      }
    } else {
      message.channel.send(`Enter a username`);
    }
  }

  /* $give [username] [amount] -> (Admin Only) */
  if (command == "give") {
    if(!message.mentions.members.first()) {
      message.channel.send(`You didn't declare a name!`);
    } else {
      let userGettingCredits = message.mentions.members.first().user.tag;
      let value = parseInt(args[1]);
      if(!isNaN(value)) {
        if(message.member.hasPermission(['KICK_MEMBERS', 'BAN_MEMBERS'])) {
          connection.query(`SELECT * FROM points WHERE name='${userGettingCredits}'`, (errors, result, field) => {
            if (result.length > 0) {
              let points = result[0].points; /* Current Points */
              let newPoints = parseInt(points) + parseInt(value); /* New Points */
              connection.query(`UPDATE points SET points="${newPoints}" WHERE name="${userGettingCredits}"`);
              message.channel.send(`You have been given ${value} points, ${userGettingCredits}. Type $help for more info.`);
            } else {
              connection.query(`INSERT INTO points(name, points) VALUES('${userGettingCredits}', '${value}')`);
              message.channel.send(`You have been given ${value} points, ${userGettingCredits}. Type $help for more info.`);
            }
          })
        } else {
          message.channel.send("You don't have permission to use this command!");
        }
      } else {
        message.channel.send("Enter a number!");
      }
    }
  }

  /* $urban word -> Urban Dictionary */
  if(command == "urban") {
    let word = "";
    for(let i = 0; i < args.length; i++) {
      word += `${args[i]} `;
    }
    let url = `http://api.urbandictionary.com/v0/define?term=${word}`;
    axios.get(url).then((response) => {
      let definition = response.data.list[0].definition;
      message.channel.send("```" + definition + "```");
    })
  }

  /* $weather [zipcode] -> Local weather by zipcode */
  if(command == "weather") {
    let city = args[0];
    //built-in function
    console.log ( isNaN(city) );
    if(isNaN(city)) {
      axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${weatherAPI}`).then((response) => {
        console.log(response.data.weather[0]);
      })
    } else {
      axios.get(`http://api.openweathermap.org/data/2.5/weather?zip=${city},us&APPID=${weatherAPI}`).then((response) => {
        console.log(response.data.weather[0]);
      })
    }
  }

  // /* $weather [city] -> Local weather by zipcode */
  // if(command == "weather") {
  //   let zipcode = args[0];
  //   axios.get(`http://api.openweathermap.org/data/2.5/weather?zip=${zipcode},us&APPID=${weatherAPI}`).then((response) => {
  //     console.log(response.data.wind);
  //     // console.log(response.wind);
  //   })
  // }

  /* $vac [username] -> Steam Data */
  // if(command == "vac") {
  //   let username = args[0];
  //   let url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamAPI}&vanityurl=${username}`;
  //   axios.get(url).then((response) => {
      
  //   }).get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamAPI}&steamids=${steamid}`).then((response) => {
  //     console.log(response);
  //   });

  //   axios.all([
  //     axios.get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${steamAPI}&vanityurl=${username}`),
  //     axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamAPI}&steamids=${steamid}`)
  //   ]).then(axios.spread((data1, data2) => {
  //     console.log(data1);
  //     console.log(data2);
  //   }));


  // }

  /* $fortnite [platform] [username] - Fortnite Lifetime Stats */
  if(command == "fortnite") {
    let platform = args[0];
    let username = args[1];
    let url = `https://api.fortnitetracker.com/v1/profile/${platform}/${username}`

    axios.get(url, {
      headers: {
        "TRN-Api-Key": "422c4273-3ca4-40e1-9c03-63088df1dbff"
      }
    }).then((response) => {
      console.log(response.data.lifeTimeStats);
      let kills = response.data.lifeTimeStats[10].value;
      let wins = response.data.lifeTimeStats[8].value;
      let kda = response.data.lifeTimeStats[11].value;
      let gamesplayed = response.data.lifeTimeStats[7].value;
      message.channel.send("```" + `\n${username} Stats\n\nKills: ${kills}\nK/D: ${kda}\nWins: ${wins}\nGames Played: ${gamesplayed}` + "```");
    })
  }
})

/* User joins channel */
client.on('guildMemberAdd', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find(ch => ch.name === 'chat-room');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  connection.query(`SELECT * FROM points WHERE name='${member.user.tag}'`, (errors, result, field) => {
    if (result.length > 0) {
      channel.send(`Welcome back, ${member.user.tag}. You still have ${result[0].points} points!`);
    } else {
      connection.query(`INSERT INTO points(name, points) VALUES('${member.user.tag}', '1000')`);
      channel.send(`You have been given 1000 tokens, ${member.user.tag}. Type $gamble for more info.`);
    }
  });
});

/* User leaves channel */
client.on('guildMemberRemove', member => {
  // Send the message to a designated channel on a server:
  const channel = member.guild.channels.find(ch => ch.name === 'chat-room');
  // Do nothing if the channel wasn't found on this server
  if (!channel) return;
  // Send the message, mentioning the member
  channel.send(`Goodbye, ${member.user.tag}. Come again soon!`);
});

client.login(token);