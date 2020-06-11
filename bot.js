
var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var nomList = [];
var nameList =[];
var drawList = [];
var bulkNom = [];
var linkList = [];
var randList = [];
var lastWeekList = [];
var devDebug = [];
var bulkNomParts = [];
var numNomCdwn;
var BKP = [];
var Mods = ["Gaming Mistress", "DomPrez", "Codex", "Logicspren", "griffmac", "Dev"]
var numNom;
var backup;
var nomLog;
var clearNom;
var weeksOnJob;
var wait = false;
numNom = 0;
bulkNom.lenght=0;
drawList.lenght=0;
const fs = require("fs");
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth.token,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
    
});

bot.on('message', function (user, userID, channelID, message, evt, nickname, client) {
    // It will listen for messages that will start with `!`

    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
        switch(cmd) {
            // 
            case 'nom':
                if (channelID == "675416092868608042" || channelID == "708325238685040731" || channelID == "662363425728495629") {
                    nickname=user.toString();
                    Nomination(message, nickname);
                    bot.sendMessage({
                    to: channelID,
                    message: nomLog
                });
                }                
            break;

            case 'smite':
                if (channelID == "675416092868608042" || channelID == "708325238685040731" || channelID == "662363425728495629") {
                    ClearNom(user);
                    bot.sendMessage({
                        to: channelID,
                        message: smiteLog
                    })
                }
            break;

            case 'draw':
                if (channelID == "675416092868608042" || channelID == "708325238685040731" || channelID == "662363425728495629") {
                    var drawNumb = message.slice(5);
                    drawNumb = parseInt(drawNumb, 10);
                    if (Number.isInteger(drawNumb) == true) {
                        drawNom(drawNumb, user);    
                    } else {
                        drawList = "The !draw command must have the number of nominations to be drawn."
                    }
                    bot.sendMessage({
                        to: channelID,
                        message: drawList
                    })
                }
            break;

            case 'nominations':
                if (channelID == "675416092868608042" || channelID == "708325238685040731" || channelID == "662363425728495629") {
                    showNomination(userID);
                    bulkNom = bulkNom.join("\n");
                    bot.sendMessage({
                    to: userID,
                    message: bulkNom
                    })
                }  
            break;

            case 'debug': 
                nickname=user.toString();
                debug(nickname)
                bot.sendMessage({
                    to: channelID,
                    message: devDebug
                })
            break;

            case 'remove':
                if (channelID == "675416092868608042" || channelID == "708325238685040731" || channelID == "662363425728495629") {
                    nickname=user.toString();
                    removeNom(nickname);
                    bot.sendMessage({
                        to: channelID,
                        message: output
                    })
                }
            break;

            case 'test':
                if (user == "LucaM") {
                    var testNumb = message.slice(5);
                    testDraw(user, testNumb);
                    bot.sendMessage({
                        to: channelID,
                        message: testNumb + " Nominations were made"
                    })
                }
            break;

            case 'delete':
                if (user == "LucaM") {
                    deleteMessage();
                    bot.deleteMessage({
                        channelID: channelID,
                        messageID: messageID
                    });
                    
                }
            break;

            case 'backup':
                if (user == "LucaM") {
                    backup();
                    bot.sendMessage({
                        to: channelID,
                        message: numNom
                    })          
                }
            break;
         }
     }
});

function Nomination(message, nick){ //Receives the message to store the nomination
    var n = message.indexOf("https://discordapp.com/channels/");
    var m = message.indexOf("https://", (n+1))
    nom=message.slice(4,n);
    itemLog=nameLog=true;
    var lstwknom;

    if (wait == true) {
        nomLog = votingTime();
        return nomLog
    }
    
    if (n == (-1)) {
        nomLog = ("Entry not added, link is not from #hero-finished-items, or the link was not found")
        return nomLog
    }
    

    if (m != (-1)) {
        nomLog = ("Entry not added, please nom only one link")
        return nomLog
    }

    var link = message.slice(n)
    link = "<" + link + ">"
    backup();
    for (var i = 0; i <= numNom; i++) { //Loops through all nominations
        if (nomList[i] == nom || linkList[i] == link){ //This checks if the item was already nominated. Either by name or Link
            nomLog = ("Entry not added, item already nominated");
            return(nomLog);
        }
    
        if (nameList[i] == nick && nameList[i]!="LucaM") { //Checks if the user already nominated
            nomLog = ("Entry not added, you already nominated an item");
            return(nomLog);
        }
    }

    checkCooldown();
    for (var j = 0 ; j < (lastWeekList.length-1) ; j=j+2) {// Loops through all nominations made before the last draw, and compares them to the new nomination. Either name or link
        var nomi = lastWeekList[i]
        var lnk = lastWeekList[i+1]
        if (nomi == nom || lnk == link) {
            nomLog = "This item is on a cooldown. Try again next week!"
        return nomLog
        }
    }
    
    //If both the user and the item is not found in the database or wasn't nominatedin the last week, makes the nomination
    Item(nom);
    Nickname(nick);
    Link(link);
    numNom++;
    nomLog = ("<:ballotbox:709914385828675644> **Entry number " + numNom + "** added by " + nick);
    BKP = " | " + nick + " | " + nom + " | " + link + "\n"
    fs.appendFile('nominations.txt', BKP, (err) => { 
        if (err) throw err; 
    }) 

    return(nomLog);
}

function ClearNom(nickname){ //Clears all nominations and names from the database

    if(isMod(nickname)) {
        wait = false
        if (numNom == 0) {
            smiteLog = "There is nothing left to smite."
            return smiteLog
        } else { 
            nomList = [];
            nameList = [];
            linkList = [];
            drawList = [];
            bulkNom = [];
            numNom = 0;
            //fs.writeFile('nominations.txt', "", (err) => { 
            //    if (err) throw err; 
            //})
            return smiteLog = "Entries have been cleared!";
        }
    } else {
        smiteLog="You do not have permission to use this command."
        return smiteLog
    }
      
    
}

function Item (nom) { //pushes the nomination to the list
    //nomList[numNom] = nom;
    nom = nom.replace(/`|\n/g, "");
    nomList.push(nom);
    return;
}

function Nickname (user) { // pushes the user to the list
    //nameList[numNom]=user
    nameList.push(user)
    return;
}

function Link (link) { // pushes the link to the list
    //linkList[numNom]=link
    linkList.push(link)
    return
}
    
function showNomination() { // shows all nominations, with names and numbers
    bulkNom = [];
    var i

    if (wait == true) {
        bulkNom = votingTime();
        return bulkNom
    }
    backup();
    
    if (numNom<1) {
        bulkNom[0] = "There is no nomination"
        return bulkNom
    }

    for (i = 0; i < numNom; i++) {
        bulkNom[i] = "• **{" + (i+1) + "}:** " + nameList[i] + " nominated " + nomList[i] /*+ " --> " + linkList[i]*/ + "\n";
    }
    bulkNom[i+1] = numNom + " Entries"
    return bulkNom;
}

function drawNom(numb, nickname) { // Takes a given number and draw from the array that number of randomly choosen nominations
    if (wait == true) {
        drawList = votingTime();
        return drawList
    }

    if(isMod(nickname)) {
        drawList = [];
        randList = [];
        var rand;
        var i=0;
        var confirmation;

        backup();

        if (numNom < 1) {
                drawList = "Nomination list is empty, now you can nominate items!"
                return drawList
            }
    
        if (numb <= 0) { // If the number given is higher than the number of nominations. Error
            drawList = "Draw number must be a positive number"
            return drawList
        }

        if (numb > numNom) { // If the number given is higher than the number of nominations. Error
            drawList = "Draw number must be lower than " + numNom
            return drawList
        }

        do{
            confirmation = true;

            rand = getRndInteger()
        
            for (var j = 0 ; j <= i ; j++) { // Checks if the rand number was already used. So it doesn't draw the same nomination twice.
                if (randList[j] == rand) {
                    confirmation = false
                } 
            }
            if (confirmation == true && nomList[rand] != undefined) { // Builds the draw list
                drawList[i] =  "• {" + (i+1) + "} " +  nomList[rand] + " -- " + linkList[rand] + "\n"
                randList.push(rand)
                i++
            }
        }while (i<numb)
        drawList[i+1] = numb + " nominations were drawn"
        drawList = drawList.join("\n");
        lastWeekList = [];
        for (var i = 0 ; i<= numNom ; i++) { //Builds the list that holds all nominations, for the cooldown feature.
            lastWeekList[i] = " | " + nomList[i] + " | " + linkList[i]
        }
        fs.appendFile('cooldown.txt', lastWeekList, (err) => { //Write in a file cooldown.txt the nominations of the week
            if (err) throw err; 
        })
        wait = true
        weeksOnJob++
        //clearNom();
        return drawList
    } else {
        drawList="You do not have permission to use this command."
        return drawList
    }
    

}

function getRndInteger() { // Creates a random number between 0 and the number of nominations, including itself
        do {
            var rand = Math.floor((Math.random() * 100)); // This creates a number between 0 and 99
        } while (rand > numNom)
        return rand
}

function removeNom(nickname) { // Remove the nomination from the username

    if (wait == true) {
        output = votingTime();
        return output
    }
    clearNom = false;
    if (numNom == 0) {
        BKP = fs.readFileSync('nominations.txt','utf8')
        BKP=BKP.split(" | ")
        BKP.splice(0,1)
        var x = BKP.length
        numNom = x/3
        backup();
    }

    for (var i = 0 ; i <= numNom ; i++) {
        if (nameList[i] == nickname) {
            clearNom=true
            nameList.splice(i,1)
            linkList.splice(i,1)
            nomList.splice(i,1)
            numNom--
        }
        
    }

    if (clearNom == true) {
        output = "Your nomination was removed! You can now nominate again."
        return output
    } else {
        output = "Your nomination was not found"
        return output
    }
}

function debug(nickname) { // Gives the ammount of weeks the bot s running

    if (nickname == "LucaM"){
        devDebug[j+1] = "\nNo accidents for " + weeksOnJob + " weeks"
    }
    return devDebug
}

function testDraw(nickname, number) { // Gives an X number of nominations to the bot, for testing purposes
    if (nickname == "LucaM") {
        for (var i=1;i<=number;i++) {
            var message = "!nom item" + i + " https://discordapp.com/channels/514655903186944027/705512500027850855/link" + i
            var nick = "LucaM" + i
            Nomination(message, nick)
        }
    }
}

function votingTime() { // Closes all user commands during voting time
    var inVoting = "Nominations are closed. Be sure to go vote for your favorite winners on Patreon!\n<https://www.patreon.com/the_griffons_saddlebag/posts?filters[tag]=Poll&filters[tier_id]=3102723>"
    return inVoting
}

function deleteMessage() { // Trying to delete messages
    getMessage = function (input, callback) {
        this._req('get', Endpoints.MESSAGES(input.channelID, input.messageID), function(err, res) {
            handleResCB("Unable to get message", err, res, callback);
        });
    }
}

function backup() { // Read the nominations file and brings it all to the program
    ClearNom("Dev");

    BKP = fs.readFileSync('nominations.txt','utf8')
    BKP=BKP.split(" | ")
    BKP.splice(0,1)
    var x = BKP.length
    numNom = x/3
    x--
    ///*
    for (i=0;i<x;i=i+3) {
        Nickname(BKP[i])
        Item(BKP[i+1])
        Link(BKP[i+2])
    }
    //*/
    return numNom
}

function isMod(nick) { // Loops trough the Mod list, and returns wether the user os a mod or not
    for (i=0;i<(Mods.length-1);i++) {
        if (nick==Mods[i]) {
            return true
        }
    }

    return false
}

function checkCooldown() { // Reads the cooldown.txt file and brings it to the program
    lastWeekList = fs.readFileSync('cooldown.txt','utf8')
    lastWeekList=lastWeekList.split(" | ")
    lastWeekList.splice(0,1)
    var x = lastWeekList.length
    numNomCdwn = x/2
    x--
    return numNomCdwn
} 