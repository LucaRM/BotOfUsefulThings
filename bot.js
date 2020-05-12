
var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
var nomList = [];
var nameList =[];
var drawList = [];
var bulkNom = [];
var linkList = [];
var randList = [];
var numNom;
var itemLog, nameLog;
var nomLog;
var clearNom;
numNom = 0;
bulkNom.lenght=0;
drawList.lenght=0;
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
bot.on('message', function (user, userID, channelID, message, evt, nickname, roles) {
    // It will listen for messages that will start with `!`


    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        args = args.splice(1);
        switch(cmd) {
            // 
            case 'nom':
                nickname=user.toString();
                Nomination(message, nickname);
                bot.sendMessage({
                    to: channelID,
                    message: nomLog
                });
                
            break;

            case 'smite':
                ClearNom();
                bot.sendMessage({
                    to: channelID,
                    message: 'Entries have been cleared!'
                })
            break;

            case 'draw':
                var drawNumb = message.slice(5);
                drawNumb = parseInt(drawNumb, 10);
                if (Number.isInteger(drawNumb) == true) {
                    drawNom(drawNumb);    
                } else {
                    drawList = "The !draw command must have the number of nominations to be drawn."
                }
                

                bot.sendMessage({
                    to: channelID,
                    message: drawList
                })
            break;

            case 'nominations':
                showNomination(); 
                bot.sendMessage({
                    to: channelID,
                    message: bulkNom
                })
            break;

            case 'debug':
                bot.sendMessage({
                    to: channelID,
                    message: nameList + " \n " + nomList + " \n " + linkList
                })
            break;

            case 'remove':
                nickname=user.toString();
                removeNom(nickname);
                bot.sendMessage({
                    to: channelID,
                    message: output
                })
            break;

            case 'role':
                bot.sendMessage({
                    to: channelID,
                    message: "Your role is: " + roles
                })
            break;

         }
     }


    
});


function Nomination(message, nick){
    var n = message.indexOf("https://");
    nom=message.slice(4,n);
    itemLog=nameLog=true;
    
    if (n == (-1)) {
        nomLog = ("Entry not added, link not found")
        return nomLog
    }

    var link = message.slice(n)
    link = "<" + link + ">"

    for (var i = 0; i < numNom+1; i++) { //Loops through all nominations
        if (nomList[i] == nom || linkList[i] == link){ //This checks if the item was already nominated. Either by name or Link
            nomLog = ("Entry not added, item already nominated");
            return(nomLog);
        }
    
        if (nameList[i] == nick) { //Checks if the user already nominated
            nomLog = ("Entry not added, you already nominated an item");
            return(nomLog);
        }
    }
    
    if (itemLog == true && nameLog == true) { //If both the user and the item is not found in the database, makes the nomination
        Item(nom);
        Nickname(nick);
        Link(link);
        numNom++;
        nomLog = ("Entry number " + numNom + " added by " + nick + " :ballotbox:");
        return(nomLog);
    }
}

function ClearNom(){ //Clears all nominations and names from the database

    /*
    if(message.member.roles.some(r=>["Discord Master"].includes(r.name)) ) {
        // has one of the roles
      } else {
        // has none of the roles
      }
    */
      
    nomList = [];
    nameList = [];
    numList = [];
    linkList = [];
    drawList = [];
    bulkNom = [];
    drawList = [];
    numNom = 0;
    return;
}

function Item (nom) { //pushes the nomination to the list
    //nomList[numNom] = nom;
    nomList.push(nom)
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

    if (numNom==0) {
        bulkNom[0] = "There is no nomination"
        return bulkNom

    }

    for (i = 0; i < numNom; i++) {
        bulkNom[i] = "• " + (i+1) + " Entry: " + nameList[i] + " nominated " + nomList[i] + " --> " + linkList[i] + "\n";
    }
    bulkNom[i+1] = numNom + " Entries"
    bulkNom = bulkNom.join("\n");
    return bulkNom;
}

function drawNom(numb) { // Takes a given number and draw from the array that number of randomly choosen nominations
    drawList = [];
    randList = [];
    var rand;
    var i=0;
    var confirmation;
    
    if (numb < 0) { // If the number given is higher than the number of nominations. Error
        drawList = "Draw number must be a positive number"
        return drawList
    }

    if (numb > numNom) { // If the number given is higher than the number of nominations. Error
        drawList = "Draw number must be lower than " + numNom
        return drawList
    }

    if (numNom == 0) {// If there are no nominations. Error
        drawList = "Nomination list is empty, now you can nominate items!"
        return drawList
    }

    do{
        confirmation = true;

        rand = getRndInteger(numb)
        
        for (var j = 0 ; j <= i ; j++) { // Checks if the rand number was already used. So it doesn't draw the same nomination twice.
            if (randList[j] == rand) {
                confirmation = false
            } 
        }
        
        if (confirmation == true && nomList[rand] != undefined) { // Builds the draw list
            drawList[i] =  "• {" + (i+1) + "} " +  nomList[rand] + " -- " + linkList[rand]
            randList.push(rand)
            i++
        }
    }while (i!=numb)
    drawList[i+1] = numb + " nominations were drawn"
    drawList = drawList.join("\n");    
    return drawList

}

function getRndInteger(max) { // Creates a random number between 0 and the number of nominations, including itself
    max=max+1
    return Math.floor(Math.random() * (max - 0) ) + 0;
}

function removeNom(nickname) {
    clearNom = false;
    for (var i = 0 ; i <= numNom ; i++) {
        if (nameList[i] == nickname) {
            clearNom=true
            for (var l = i ; l <= (numNom-(i+1)) ; l++) {
                nameList[l] = nameList[l+1]
                linkList[l] = linkList[l+1]
                nomList[l] = nomList[l+1]
            }
            nameList.pop()
            linkList.pop()
            nomList.pop()
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