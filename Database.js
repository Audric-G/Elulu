//AUTHOR: GIEVEN#8031
//LAST UPDATED: 1/15/2021
//DESCRIPTION: Manages all the communications with the Database.
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const mysql = require('mysql');
const auth = require('./Auth.json');

var pool = mysql.createPool({
  connectionLimit : 25,
  host: auth.dbHost,
  user: auth.dbUser,
  password: auth.dbPass,
  database: auth.db,
  socketPath: auth.socketPathName
});

function ExecuteQuery(query, callback) {
  pool.getConnection(function (error, connection) {
    if (!!error) {
      console.error(error);
      return callback(new Error(error));
    } else if (connection) {
      connection.query(query, function(error, rows) {
        if (!!error) {
          console.warn('There was an issue with a database query.');
          return callback(new Error(error));
        }
        callback(null, rows);
      });
    }
    connection.release();
  });
}

module.exports = {
    AddUser: function(DiscordMember) {
      console.log('attempting to add a user');
      let query = `INSERT INTO DiscordUser ( id ) VALUES 
        ( '${DiscordMember.User.id}');`
      
      ExecuteQuery(query, function(error, result) {
        if (!!error) {
          console.error('There was an error adding a user: ' + error);
        }
      });
    },

    AddGuild: function(guildObj) {
      console.log('attempting to add a guild.');
      
      let guildJSON = JSON.stringify(guildObj);

      let query = `INSERT INTO DiscordGuild 
                    ( id, guild ) 
                    VALUES 
                    ( '${guildObj.id}', '${guildJSON}' );`

      ExecuteQuery(query, function(error, result) {
        if (!!error) {
          console.error('There was an error adding a guild: ' + error);
        }
      });
    },

    UpdateGuild: function(guildObj) {
      console.log('Updating guild DB info');
      query = `UPDATE DiscordGuild
                SET
                  guild = ${JSON.stringify(guildObj)}
                WHERE 
                  id = ${guildObj.id};`
      
      ExecuteQuery(query, function(error, queryResult){
        if(!!error){
          callback(error)
          return
        }
      })
    },
      

    GetUser: function(id, callback) {
      console.log('attempting User query.');
      let query = (`SELECT * FROM DiscordUser WHERE id = ${id};`);

      ExecuteQuery(query, function(error, queryResult) {
        if(!!error) {
          callback(error);
          return
        }
        callback(null, queryResult);
      });
    },

    GetGuild: function(id, callback) {
      console.log('attempting a Guild query.');
      let query = (`SELECT * FROM DiscordGuild WHERE id = ${id}`);

      ExecuteQuery(query, function(error, queryResult) {
        if (!!error) {
          callback(error);  
        }
        callback(null, queryResult);
      });
    },

    RemoveUser: function(id) {

      console.log(`server ${id} was removed from the collection`);
    },

    RemoveGuild: function(id) {

      //console.log(`user ${GetUser.user.username} was removed from the collection`);
    }
};