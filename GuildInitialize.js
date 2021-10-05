//AUTHOR: GIEVEN#8031
//LAST UPDATED: 1/15/2021
//DESCRIPTION: Handle the intitialization of new guilds
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

const Discord = require('discord.js');

module.exports = {
    Initialize: async function(guild, owner, Callback){
        let user = owner.user;
        let defaultGenColor = '#009900';
        let defaultErrColor = '#E31230';

        /*
        Types:
            //string    |   Get all array results
            //bool      |   Confirm input is true/false
            //hex       |   Confirm hexadecimal value
            //channels  |   Get all array results, confirm valid channels
            //channel   |   Get first array result after root, confirm valid channel
            //prefix    |   Only first string after root
            //ignore    |   ignore
        */
       //requireSet 0 = false 1 = true 2 = adds requirements
        let guildParameters = [
            {//0
                root:'id',
                value:`${guild.id}`,
                type:'ignore',
                requireSet:0
            },{//1
                root:'disabledCommands',
                value:undefined,
                type:'ignore',
                requireSet:0
            },{//2
                root:'members',
                value:undefined,
                type:'ignore',
                requireSet:0
            },{//3
                root:'nsfwEnabled',
                value:false,
                type:'bool',
                requireSet:0
            },{//4
                root:'nsfwBlacklist',
                value:undefined,
                type:'string',
                requireSet:0
            },{//5
                root:'generalBotColor',
                value:defaultGenColor,
                type:'hex',
                requireSet:0
            },{//6
                root:'errorColor',
                value:defaultErrColor,
                type:'hex',
                requireSet:0
            },{//7
                root:'adminRoles',
                value:undefined,
                type:'roles',
                requireSet:1
            },{//8
                root:'standardRoles',
                value:undefined,
                type:'roles',
                requireSet:1
            },{//9
                root:'botEnforcementEnabled',
                value:false,
                type:'bool',
                requireSet:2
            },{//10
                root:'timeoutChannel',
                value:undefined,
                type:'channel',
                requireSet:2
            },{//11
                root:'badBoiRole',
                value:undefined,
                type:'role',
                requireSet:2
            },{//12
                root:'autoRoleEnabled',
                value:false,
                type:'bool',
                requireSet:2
            },{//13
                root:'autoRole',
                value:undefined,
                type:'role',
                requireSet:2
            },{//14
                root:'commandPrefix',
                value:'>',
                type:'prefix',
                requireSet:0
            },{//15
                root:'guild',
                value:guild,
                type:'ignore',
                requireSet:0
            }
        ]
        if (user.dmChannel == null) {guild.owner.user.createDM();}

        await user.send(`
        Hi I'm Elulu, I just need to have some variables set before I can be fully functional in your server ${guild.name}.\n\n
        The syntax for setting a variable is:
        \`\`\`VariableName Value1, Value2, Value3, ect,\`\`\`\n
        For variables related to channels and roles you must put a comma after every value is complete, even if there's only one.\n\n
        Channel variables must be given the channel's ID and not the name like with roles, if you don't know how to get channel IDs here's a resource:\n https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-\n\n
        Please don't put spaces in the variable names, something like "General Bot Color" would become "GeneralBotColor". Capitalization doesn't matter though.`);

        await user.send(`\`\`\`
        Prefix Codes:\n
        !! : Required and Not Set
        ++ : Enabling Adds Requirements
        <> : Good to Go\`\`\``);

        await user.send(`Whenever you're done just say done and if everything is properly set I'll be good to go!\nYou can type "show" to show the list of variables again.`);
        await user.send(GetParamString(guildParameters, user));

        const collector = user.dmChannel.createMessageCollector(message => message.author.bot === false, { idle: 300000 });

        collector.on('collect', async message => {
            collector.resetTimer();
            let messageArray = String(message).split(' ');

            if (messageArray[0].toLowerCase() === 'done'){
                if (CheckParams(guildParameters) === true){
                    await user.send(`Looks like I'm good to go, see ya in the server!`);
                    await user.dmChannel.delete();
                    collector.stop();
                    return;
                }else{
                    await user.send(`There's still some variables you have to set`);
                    await user.send(GetParamString(guildParameters, user));
                    return;
                }
            }

            if(messageArray[0].toLowerCase() === 'show'){
                await user.send(GetParamString(guildParameters, user));
                return;
            }

            for (let i = 0; i < guildParameters.length; i++){
                if (messageArray[0].toLowerCase() === guildParameters[i].root.toLowerCase()){
                    messageArray.splice(0, 1);

                    if(!messageArray[0]){
                        await user.send(`You can't just pass through nothing.`);
                        return;
                    }

                    switch(guildParameters[i].type.toLowerCase()){
                        case "string":
                            let string = '';

                            for (let i = 0; i < messageArray.length; i++){
                                string = string + `${messageArray[i]} `;
                            }
                            guildParameters[i].value = string;
                            guildParameters[i].requireSet = 0;
                            await user.send(`Set variable.`);
                            break;

                        case "bool":
                            if (messageArray[0].toLowerCase() === 'false' || messageArray[0].toLowerCase() === 'true'){
                                guildParameters[i].value = messageArray[0].toLowerCase() === 'false' ? false : true;
                            }else{
                                await user.send(`I will only accept a true or false input for ${guildParameters[i].root}.`);
                                return;
                            }

                            guildParameters[i].value === true ? guildParameters[i].requireSet = 0 : guildParameters[i].requireSet = 2;

                            if(guildParameters[i].root === 'botEnforcementEnabled'){
                                if(guildParameters[i].value === true){
                                    if(!guildParameters[10].value) {guildParameters[10].requireSet = 1;}
                                    if(!guildParameters[11].value) {guildParameters[11].requireSet = 1;}
                                }else{
                                    if(!guildParameters[10].value) {guildParameters[10].requireSet = 2;}
                                    if(!guildParameters[11].value) {guildParameters[11].requireSet = 2;}
                                }
                                
                            }

                            if(guildParameters[i].root === 'autoRoleEnabled'){
                                if(guildParameters[i].value === true){
                                    if(!guildParameters[13].value) {guildParameters[13].requireSet = 1;}
                                }else{
                                    if(!guildParameters[13].value) {guildParameters[13].requireSet = 2;}
                                }
                                
                            }
                            await user.send(`Set variable.`);
                            break;

                        case "hex":
                            let isValid = /^#([A-Fa-f0-9]{3}$)|([A-Fa-f0-9]{6}$)/.test(messageArray[0])
                            if(isValid){
                                guildParameters[i].value = messageArray[0];
                            }else{
                                await user.send(`You need to provide a valid hexadecimal value for ${guildParameters[i].root}`);
                                return;
                            }
                            await user.send(`Set variable.`);
                            break;

                        case "channels":
                            let channelArray = [];
                            let channelIds = SeparateByComma(messageArray)

                            if(!channelIds){
                                await user.send(`Please put a comma after ever value for role and channel variables`);
                                return;
                            }

                            for(let i = 0; i < channelIds.length; i++){
                                let channel = await guild.channels.cache.find(channel => channel.id === channelIds[i]);
                                if (!channel){
                                    await user.send(`There was an issue finding a channel with the given ID(s)`);
                                    return;
                                }
                                channelArray[channelArray.length] = channel.id;
                            }

                            guildParameters[i].value = channelArray;
                            guildParameters[i].requireSet = 0;
                            await user.send(`Set variable.`);
                            break;

                        case "channel":
                            let channelId = SeparateByComma(messageArray)[0];

                            if(!channelId){
                                await user.send(`Please put a comma after ever value for role and channel variables`);
                                return;
                            }

                            let channel = await guild.channels.cache.find(channel => channel.id === channelId);

                            if (!channel){
                                await user.send(`There was an issue finding a channel with the given ID`);
                                return;
                            }

                            guildParameters[i].value = channelId
                            guildParameters[i].requireSet = 0;
                            await user.send(`Set variable.`);
                            break;

                        case "prefix":
                            if(messageArray[0]){
                                guildParameters[i].value = messageArray[0];
                            }else{
                                await user.send(`You need to provide something to set as the command prefix`);
                                return;
                            }
                            await user.send(`Set variable.`);
                            break;

                        case "roles":
                            let roleArray = [];
                            let roleNames = SeparateByComma(messageArray);
                            
                            if(!roleNames){
                                await user.send(`Please put a comma after ever value for role and channel variables`);
                                return;
                            }

                            for(let i = 0; i < roleNames.length; i++){
                                let role = await guild.roles.cache.find(role => role.name.toLowerCase() === roleNames[i].toLowerCase());
                                if (!role){
                                    await user.send(`There was an issue finding a role with the given name(s)`);
                                    return;
                                }
                                roleArray[roleArray.length] = role.id;
                            }

                            guildParameters[i].value = roleArray;
                            guildParameters[i].requireSet = 0;
                            await user.send(`Set variable.`);
                            break;

                        case "role":
                            let roleName = SeparateByComma(messageArray)[0];

                            if(!roleName){
                                await user.send(`Please put a comma after ever value for role and channel variables`);
                                return;
                            }

                            let role = await guild.roles.cache.find(role => role.name.toLowerCase() === roleName.toLowerCase());

                            if (!role){
                                await user.send(`There was an issue finding a channel with the given name`);
                                return;
                            }

                            guildParameters[i].value = role.id;
                            guildParameters[i].requireSet = 0;
                            await user.send(`Set variable.`);
                            break;

                        default:
                            break;
                    }
                }
            }
        })

        collector.on('end', async (_, reason) => {
            if (reason === 'idle') {
              await user.send('You\'ve been idle for too long, I\'m closing the connection. Type "Initialize" in your server to restart the process.');
              await user.dmChannel.delete();
            }else{
                Callback(ParamArrayToObject(guildParameters, guildParameters[15].value));
            }
        })
    },

    
}

function ParamArrayToObject(guildParms, guild){
    adminRoleArray = [];
    standardRoleArray = [];
    timeoutChannel = guild.channels.cache.get(guildParms[10].value);
    badBoiRole = guild.roles.cache.get(guildParms[11].value);
    autoRole = guild.roles.cache.get(guildParms[13].value);

    for(let i = 0; i < guildParms[7].value.length; i++){
        adminRoleArray[adminRoleArray.length] = guild.roles.cache.get(guildParms[7].value[i]);
    }

    for(let i = 0; i < guildParms[8].value.length; i++){
        standardRoleArray[standardRoleArray.length] = guild.roles.cache.get(guildParms[8].value[i]);
    }

    guildObject = {
        id:guildParms[0].value,
        DisabledCommands:guildParms[1].value,
        Members:guildParms[2].value,
        NSFWEnabled:guildParms[3].value,
        NSFWBlacklist:guildParms[4].value,
        GeneralBotColor:guildParms[5].value,
        ErrorColor:guildParms[6].value,
        AdminRoles:adminRoleArray,
        StandardRoles:standardRoleArray,
        BotEnforcementEnabled:guildParms[9].value,
        TimeoutChannel:timeoutChannel,
        BadBoiRole:badBoiRole,
        AutoRoleEnabled:guildParms[12].value,
        AutoRole:autoRole,
        CommandPrefix:guildParms[14].value,
        Guild:guild
    }

    return guildObject;
}

function SeparateByComma(messageArray){
    let stringArray = [];
    let stringComb = '';
    for (let i = 0; i < messageArray.length; i++){
        if (messageArray[i].slice(-1) === ','){
            stringArray[stringArray.length] = stringComb + messageArray[i].replace(',', '');
            stringComb = '';
        }else{
            stringComb = stringComb + `${messageArray[i]} `;
        }
    }

    return stringArray;
}

function GetParamString(guildParms, user){
    let string = ``;
    let fullString = ``;

    for(let i = 0; i < guildParms.length; i++){
        string = `${guildParms[i].requireSet === 0 ? '<> ': guildParms[i].requireSet === 1 ? '!! ' : '++ '}${guildParms[i].root}:\t\t${guildParms[i].value}\n\n`;

        if(guildParms[i].type === 'ignore') {string = '';}
        fullString = fullString + string;
    } 

    const embed = new Discord.MessageEmbed()
            .setTitle('Server Variables:')
            .setColor('#009900')
            .setDescription(fullString)

    return embed;
}

function CheckParams(guildParms){
    let passed = true;

    for (let i = 0; i < guildParms.length; i++){
        if (guildParms[i].requireSet === 1){
            passed = false;
            return;
        }
    }
    return passed
}
