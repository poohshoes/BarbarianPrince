function mapInfo()
{
	this.widthInTiles = 20;
	this.heightInTiles = 23;
	this.tile1Center = new v2(178,161);
	this.tileSize = new v2(68, 78);
}

var canvas;
var context;
var imagesToLoad = [];
var images = [];
var map = new mapInfo();

var mapFileName = "map.jpg";
var playerFileName = "player.png";
var moveArrowFileName = "moveArrow.png";

var food = 5;
var gold = 0;

var party = [];

// Player position in tiles
var playerTilePosition = new v2(0, 0);
var playerDrawOffset = new v2(-8, -25);

var state;

window.onload = loadContent;

// Todo(ian): 2 hex movement if mounted.  3 hex flying movement.
// Todo(ian): click on tile to move, highlight movement options.
// Todo(ian): sleeping / nighttime animation

function loadContent()
{
    party.push({});
    party[0].name = "Cal Arath";
    party[0].title = "Barbarian Prince";
    party[0].weaponName = "Bonebiter";
    party[0].combatSkill = 8;
    party[0].maxEndurance = 9;
    party[0].currentEndurance = 9;
    party[0].witAndWiles = d6();
    if(party[0].witAndWiles = 1)
    {
        party[0].witAndWiles = 2;
    }
    party[0].mounted = false;
	gold = getWealthFromCode(2);
    
    var spawn = d6();
    if(spawn == 1)
    {
        playerTilePosition.x = 0;
        playerTilePosition.y = 0;
    }
    else if(spawn == 2)
    {
        playerTilePosition.x = 6;
        playerTilePosition.y = 0;
    }
    else if(spawn == 3)
    {
        playerTilePosition.x = 8;
        playerTilePosition.y = 0;
    }
    else if(spawn == 4)
    {
        playerTilePosition.x = 12;
        playerTilePosition.y = 0;
    }
    else if(spawn == 5)
    {
        playerTilePosition.x = 14;
        playerTilePosition.y = 0;
    }
    else if(spawn == 6)
    {
        playerTilePosition.x = 18;
        playerTilePosition.y = 0;
    }
    
	canvas = document.getElementById('canvasId');
    canvas.addEventListener("click", onClick, true);
    canvas.addEventListener("keypress", onKeyPress, true);
    canvas.addEventListener("mousemove", onMouseMove, true);
	context = canvas.getContext("2d");

    state = new Object();
    state.type = 'event';
    state.eventNumber = 001;
    
    imagesToLoad.push(mapFileName);
    imagesToLoad.push(playerFileName);
    loadImagesThenStart();
    // Note(ian): Don't do anything after load images then draw as it relies on events to fire off Draw.
}

function loadImagesThenStart()
{
    if(imagesToLoad.length > 0)
    {
        var name = imagesToLoad.pop();
        images[name] = new Image();
        images[name].onload = loadImagesThenStart;
        images[name].src = "images/" + name;
    }
    else
    {
        main();
    }
}

function main()
{
	drawAndUpdate();
	requestAnimationFrame(main);
}

function drawAndUpdate()
{
    keysPressed = nextKeysPressed;
    nextKeysPressed = {};
    mouseClicked = nextMouseClicked;
    nextMouseClicked = false;
    
    if(state.type == 'none')
    {
        // TODO(ian): Do click to move.
        var topLeftMapPosition = v2Add(map.tile1Center, v2Hadamard(map.tileSize, playerTilePosition));
        if(!isOnEvenTile())
        {
            topLeftMapPosition.y += 0.5 * map.tileSize.y;	
        }
        topLeftMapPosition.x -= 0.5 * canvas.width;
        topLeftMapPosition.y -= 0.5 * canvas.height;
        if(topLeftMapPosition.x < 0)
        {
            topLeftMapPosition.x = 0;
        }
        if(topLeftMapPosition.y < 0)
        {
            topLeftMapPosition.y = 0;
        }
        if(topLeftMapPosition.x + canvas.width > images[mapFileName].width)
        {
            topLeftMapPosition.x = images[mapFileName].width - canvas.width;
        }
        if(topLeftMapPosition.y + canvas.height > images[mapFileName].height)
        {
            topLeftMapPosition.y = images[mapFileName].height - canvas.height;    
        }
        context.drawImage(images[mapFileName], topLeftMapPosition.x, topLeftMapPosition.y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
        
        var firstTileCenter = v2Subtract(map.tile1Center, topLeftMapPosition);
        
        var playerPosition = getDrawLocationFromTile(firstTileCenter, playerTilePosition, new v2(images[playerFileName].width, images[playerFileName].height), playerDrawOffset);
        context.drawImage(images[playerFileName], playerPosition.x, playerPosition.y);
        
        var tileUnderMouse = 
        
        // Todo(ian): Draw these on the canvas.
        document.getElementById('remainingFood').innerHTML = food;
        document.getElementById('hitPoints').innerHTML = party[0].currentEndurance + "/" + party[0].maxEndurance;
        document.getElementById('gold').innerHTML = gold;
        
        /*for(var y = 0; y < terrain.length; y++)
        {
            for(var x = 0; x < terrain[y].length; x++)
            {
                // 0 - Farmland
                // 1 - Countryside
                // 2 - Forset
                // 3 - Hills
                // 4 - Mountains
                // 5 - Swamp
                // 6 - Desert
                var color = '#FFFFFF';
                switch(terrain[y][x])
                {
                    case 0:
                        color = '#a07a39';
                        break;
                    case 1:
                        color = '#d9b886';
                        break;
                    case 2:
                        color = '#54603a';
                        break;
                    case 3:
                        color = '#d49557';
                        break;
                    case 4:
                        color = '#434739';
                        break;
                    case 5:
                        color = '#bf8b7f';
                        break;
                    case 6:
                        color = '#fdeddc';
                        break;
                }
                
                var center = getDrawLocationFromTile(firstTileCenter, new v2(x, y), new v2(0, 0), new v2(0, 0));
                var radius = 10;
                context.beginPath();
                context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
                context.fillStyle = color;
                context.fill();
            }
        }*/
    }
    else if(state.type == 'event')
    {
        context.font = '14pt Courier New';
        context.fillStyle = 'black';
        if(state.eventNumber == 1)
        {
            var text = [];
            text[0] =
"Evil events have overtaken your Northlands Kingdom. Your father, the old king, is dead - assassinated by rivals \
to the throne. These usurpers now hold the palace with their mercenary royal guard. You have escaped, and \
must collect 500 gold pieces to raise a force to smash them and retake your heritage. Furthermore, the \
usurpers have powerful friends overseas. If you can't return to take them out in ten weeks, their allies will arm \
and you will lose your kingdom forever."
            text[1] =
"To escape the mercenary and royal guard, your loyal body servant Ogab smuggled you into a merchant \
caravan to the southern border. \
Now, at dawn you roll out of the merchant wagons into a ditch, dust off your clothes, loosen your swordbelt, and \
get ready to start the first day of your adventure."
            text[2] =
"Important Note: if you finish actions for a day on any hex north of the Tragoth River, the mercenary royal \
guardsmen may find you."; 
//Todo(ian): See e002 after normal events are concluded, but before you take your evening meal(r215).";
            drawWrappedText(text, canvas.width, 18, 0, 0);
            
            if(continueButtonPressed())
            {
                state.type = 'none';
            }
        }
        else
        {
            context.fillText("Event " + state.eventNumber + " not found.", 10, 25);
        }
    }
}

function continueButtonPressed()
{
    return keysPressed[ascii(" ")] || keysPressed[enterKeyCode] || mouseClicked;
}

function drawWrappedText(text, maxWidth, lineHeight, x, startY)
{
    var currentString = '';
    var y = startY;
    var spaceWidth = context.measureText(' ').width;
    for(var textIndex = 0;
        textIndex < text.length;
        textIndex++)
    {
        var parts = text[textIndex].split(' ');
        for(var partIndex = 0;
            partIndex < parts.length;
            partIndex++)
        {
            var partWidth = context.measureText(parts[partIndex]).width;
            var currentStringWidth = context.measureText(currentString).width;
            if(currentString == '')
            {
                currentString = parts[partIndex];
            }
            else if(currentStringWidth + partWidth + spaceWidth <= maxWidth)
            {
                currentString += ' ' + parts[partIndex];
            }
            else
            {
                y += lineHeight;
                context.fillText(currentString, x, y);
                
                currentString = parts[partIndex];
            }
        }
        
        y += lineHeight;
        context.fillText(currentString, x, y);
        currentString = '';
        y += lineHeight;
    }
}

function endTurn()
{	
    // TODO(ian): Advance day counter (70 days total)
    if(food > 0)
    {
		food--;
    }
	draw();	
}

function moveSouth()
{
	if(playerTilePosition.y < map.heightInTiles - 1)
	{
        var newTile = new v2(playerTilePosition.x, playerTilePosition.y + 1);
        tryMoveTo(newTile);
		endTurn();
	}
}

function moveNorth()
{
	if(playerTilePosition.y > 0)
	{
        var newTile = new v2(playerTilePosition.x, playerTilePosition.y - 1);
        tryMoveTo(newTile);
		endTurn();
	}
}

function moveSouthEast()
{
	if((playerTilePosition.x < map.widthInTiles - 1) && (isOnEvenTile() || playerTilePosition.y < map.heightInTiles - 1))
	{
        var newTile = new v2(playerTilePosition.x + 1, playerTilePosition.y);
		if(!isOnEvenTile())
        {
			newTile.y++;
        }        
        tryMoveTo(newTile);
		endTurn();
	}
}

function moveSouthWest()
{
	if(playerTilePosition.x > 0 && (isOnEvenTile() || playerTilePosition.y < map.heightInTiles - 1))
	{
        var newTile = new v2(playerTilePosition.x - 1, playerTilePosition.y);
		if(!isOnEvenTile())
        {
			newTile.y++;
        }
        tryMoveTo(newTile);
		endTurn();
	}
}

function moveNorthEast()
{
	if((playerTilePosition.x < map.widthInTiles - 1) && (!isOnEvenTile() || playerTilePosition.y > 0))
	{
        var newTile = new v2(playerTilePosition.x + 1, playerTilePosition.y);
		if(isOnEvenTile())
        {
			newTile.y--;
        }
        tryMoveTo(newTile);
		endTurn();
	}
}

function moveNorthWest()
{
	if(playerTilePosition.x > 0 && (!isOnEvenTile() || playerTilePosition.y > 0))
	{
        var newTile = new v2(playerTilePosition.x - 1, playerTilePosition.y);
		if(isOnEvenTile())
        {
			newTile.y--;
        }
        tryMoveTo(newTile);
		endTurn();
	}
}

function isOnEvenTile()
{
	return (playerTilePosition.x % 2 == 0)
}

function tryMoveTo(newTile)
{
    // 0 - Farmland
    // 1 - Countryside
    // 2 - Forset
    // 3 - Hills
    // 4 - Mountains
    // 5 - Swamp
    // 6 - Desert
    var currentTerrainType = terrain[playerTilePosition.y][playerTilePosition.x];
    
    // TODO(ian): Handle these cases.
    // 7 - Cross River
    // 8 - On Road
    // 9 - Airborne
    // 10 - Rafting
    
    var lostSave = travelTableLost[currentTerrainType]; 
    if(d6() + d6() >= lostSave)
    {
        // You are lost, lol
        // TODO(ian): lose any remaining moves if mounted
        terrainEvent(currentTerrainType);
    }
    else
    {
        var newTerrainType = terrain[newTile.y][newTile.x];
        terrainEvent(newTerrainType);
        playerTilePosition = newTile;
    }
}

function terrainEvent(terrainType)
{
    var eventSave = travelTableEvent[terrainType];
    if(d6() + d6() >= eventSave)
    {
        var chanceIndex = d6() - 1;
        var eventLetter = 'r';
        if(chanceIndex == 0 && terrainType == 0)
        {
            eventLetter = 'e';
        }
        var eventNumber = travelTableNumbers[terrainType][chanceIndex];
        setEvent(eventLetter, eventNumber);
    }
}

function setEvent(letter, number)
{
    if(letter == 'r' && number >= 231 && number <= 280)
    {
        var newLetter = 'e';
        var travelEventIndex = d6() - 1;
        var newNumber = travelEvents[number - 231][travelEventIndex];
        setEvent(newLetter, newNumber);
    }
    else if(letter == 'r' && number == 230)
    {
        var travelEventIndex = d6() + d6() - 2;
        var newNumber = raftTravelEventNumbers[travelEventIndex];
        var newLetter = 'e';
        if(travelEventIndex == 6)
        {
            newLetter = 'r';
        }
        setEvent(newLetter, newNumber);
    }
    else if(letter == 'e')
    {
        state.type = 'event';
        state.eventNumber = number;
    }
    else
    {
        window.alert("Event not handled " + letter + number);
    }
}

function getDrawLocationFromTile(firstTileCenter, tilePosition, size, offset)
{
    var result = v2Add(firstTileCenter, offset);
    v2AddAssign(result, v2Hadamard(map.tileSize, tilePosition));
    v2SubtractAssign(result, v2Multiply(size, 0.5));
    if(!(tilePosition.x % 2 == 0))
    {
        result.y += 0.5 * map.tileSize.y;
    }
    return result;
}

//
// === INPUT ===
//

var nextMouseClicked = false;
var mouseClicked = false;
function onClick(event)
{
    nextMouseClicked = true;
}

var mousePosition = new v2(0, 0);
function onMouseMove(event)
{
    mousePosition = new v2(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
}

var nextKeysPressed = {};
var keysPressed;
function onKeyPress(event)
{
	nextKeysPressed[event.keyCode] = true;
}

var enterKeyCode = 13;

function ascii(character)
{
    var result = character.charCodeAt(0);
    return result;
}

//
// === MATH ===
//

function d6()
{
	return Math.floor(Math.random()*6) + 1;
}

function v2(x, y)
{
    if(isNaN(x))
    {
        x = 0;
    }
    if(isNaN(y))
    {
        y = 0;
    }
    this.x = x;
    this.y = y;
}

function v2Multiply(one, scalar)
{
    var result = new v2();
    result.x = one.x * scalar;
    result.y = one.y * scalar;
    return result;
}

function v2MultiplyAssign(v2, scalar)
{
    v2.x *= scalar;
    v2.y *= scalar;
}

function v2Hadamard(one, two)
{
    var result = new v2();
    result.x = one.x * two.x;
    result.y = one.y * two.y;
    return result;
}

function v2Divide(one, scalar)
{
    var result = new v2();
    result.x = one.x / scalar;
    result.y = one.y / scalar;
    return result;
}

function v2DivideAssign(one, scalar)
{
    one.x = one.x / scalar;
    one.y = one.y / scalar;
}

function v2Add(one, two)
{
    var result = new v2();
    result.x = one.x + two.x;
    result.y = one.y + two.y;
    return result;
}

function v2AddAssign(one, two)
{
    one.x += two.x;
    one.y += two.y;
}

function v2Subtract(one, two)
{
    var result = new v2();
    result.x = one.x - two.x;
    result.y = one.y - two.y;
    return result;
}

function v2SubtractAssign(one, two)
{
    one.x -= two.x;
    one.y -= two.y;
}

function v2Length(a)
{
    var result = Math.pow(a.x, 2) + Math.pow(a.y, 2);
    result = Math.sqrt(result);
    return result;
}

function v2Inner(a, b)
{
    return Result = a.x*b.x + a.y*b.y;
}

function v2NormalizeAssign(a)
{
    if(a.x != 0 || a.y != 0)
    {
        v2DivideAssign(a, v2Length(a));
    }
}

function v2Normalize(a)
{
    var result = v2Copy(a);
    if(a.x != 0 || a.y != 0)
    {
        result = v2Divide(a, v2Length(a));
    }
    return result;
}

function v2Copy(v)
{
    return new v2(v.x, v.y);
}

function angleToV2(a)
{
    return new v2(-Math.cos(a), -Math.sin(a));
}

//
// == TABLES
//

// 0 - Farmland
// 1 - Countryside
// 2 - Forset
// 3 - Hills
// 4 - Mountains
// 5 - Swamp
// 6 - Desert
var terrain = [
[1,4,4,2,2,1,1,3,4,3,3,2,1,5,0,0,3,4,4,4],
[1,2,2,2,1,1,1,2,1,2,3,2,5,1,5,1,3,4,4,4],
[4,2,2,4,4,4,4,2,2,3,5,3,1,1,2,4,4,1,4,3],
[1,3,4,4,4,1,1,4,3,1,1,4,2,2,2,2,1,4,3,1],
[3,3,1,4,2,3,2,2,1,1,4,1,1,3,4,4,4,4,1,3],
[6,6,6,3,3,2,1,3,1,4,4,4,3,3,4,6,4,4,1,4],
[3,3,3,6,1,1,1,2,1,2,3,4,4,6,6,6,6,4,4,3],
[1,1,1,2,2,1,1,2,2,1,3,3,6,6,6,6,6,3,4,4],
[1,1,2,2,2,5,2,2,1,0,3,3,6,6,6,6,3,4,4,3],
[1,1,2,1,1,2,5,1,1,3,1,1,3,3,6,3,6,4,4,3],
[2,1,1,5,5,5,2,2,2,3,4,4,4,3,3,4,3,3,1,4],
[1,1,5,1,1,1,2,2,3,1,3,4,2,3,3,3,4,3,3,4],
[1,5,5,1,2,1,5,2,2,1,3,1,4,2,1,1,3,3,3,3],
[5,5,2,2,2,1,1,2,5,1,4,4,1,0,1,1,1,1,1,1],
[5,2,2,1,1,1,2,2,2,5,1,3,1,0,0,1,2,2,1,2],
[2,0,1,1,2,2,2,0,0,5,1,1,0,1,1,1,2,5,2,5],
[2,0,0,1,1,1,1,1,1,1,2,1,1,2,2,5,2,2,2,2],
[2,1,1,0,2,0,1,1,2,2,1,2,1,1,2,2,1,3,1,1],
[1,1,0,0,0,0,0,1,1,3,5,2,1,2,2,1,3,1,1,1],
[1,2,1,0,1,1,1,1,1,4,2,2,1,1,2,1,1,2,2,2],
[1,2,1,2,1,1,2,1,1,4,4,1,1,5,2,2,5,2,0,0],
[1,0,0,0,2,1,1,1,3,4,4,2,1,5,5,5,2,0,0,0],
[2,1,0,0,1,1,2,1,3,3,4,4,1,5,5,5,1,1,0,0]];

// 0 - Farmland
// 1 - Countryside
// 2 - Forset
// 3 - Hills
// 4 - Mountains
// 5 - Swamp
// 6 - Desert
// 7 - Cross River
// 8 - On Road
// 9 - Airborne
// 10 - Rafting
var travelTableLost = [10, 9, 8, 8, 7, 5, 6, 8, 1000, 12, 1000];
var travelTableEvent = [8, 9, 9, 10, 9, 10, 10, 10, 9, 10, 10];
var travelTableNumbers = [
[009, 231, 232, 233, 234, 235],
[232, 236, 237, 238, 239, 240],
[232, 241, 242, 243, 244, 240],
[232, 245, 246, 247, 248, 249],
[232, 250, 251, 252, 253, 248],
[232, 254, 255, 256, 257, 258],
[259, 260, 261, 262, 263, 264],
[232, 265, 266, 267, 268, 269],
[270, 271, 272, 273, 274, 275],
[276, 277, 278, 279, 280, 281],
[230, 230, 230, 230, 230, 230]];

var travelEvents = [
[018, 018, 022, 022, 023, 130],
[003, 004, 005, 006, 007, 008],
[128, 128, 128, 128, 129, 017],
[049, 048, 032, 081, 050, 050],
[078, 078, 079, 079, 009, 009],
[009, 009, 050, 018, 022, 023],
[052, 055, 057, 051, 054, 052],
[077, 075, 075, 075, 076, 081],
[044, 046, 067, 064, 068, 069],
[078, 078, 078, 078, 079, 079],
[074, 074, 073, 009, 051, 128],
[071, 071, 052, 082, 080, 080],
[083, 083, 084, 084, 076, 075],
[165, 166, 065, 064, 087, 087],
[098, 102, 023, 051, 068, 022],
[028, 028, 058, 070, 055, 056],
[076, 076, 076, 075, 128, 128],
[118, 052, 059, 067, 066, 064],
[078, 078, 078, 085, 079, 079],
[099, 100, 023, 068, 101, 102],
[028, 028, 058, 055, 052, 054],
[078, 078, 079, 079, 088, 065],
[085, 085, 086, 086, 086, 095],
[022, 009, 073, 051, 051, 074],
[034, 082, 164, 052, 057, 098],
[091, 091, 094, 094, 092, 092],
[089, 089, 089, 090, 064, 093],
[078, 078, 078, 095, 095, 097],
[022, 129, 128, 051, 023, 068],
[028, 082, 055, 003, 004, 028],
[005, 120, 120, 120, 067, 066],
[034, 164, 164, 091, 091, 120],
[064, 064, 121, 121, 121, 093],
[078, 078, 078, 078, 096, 096],
[122, 122, 122, 009, 051, 074],
[123, 123, 057, 057, 052, 055],
[094, 094, 091, 091, 075, 084],
[083, 076, 077, 124, 124, 124],
[122, 122, 122, 125, 126, 127],
[018, 022, 023, 073, 009, 009],
[050, 051, 051, 051, 003, 003],
[004, 004, 005, 006, 006, 008],
[007, 007, 057, 130, 128, 128],
[049, 048, 081, 128, 129, 129],
[078, 078, 079, 079, 128, 129],
[102, 102, 103, 103, 104, 104],
[112, 112, 112, 112, 108, 108],
[106, 106, 105, 105, 079, 079],
[107, 109, 077, 101, 110, 111],
[099, 098, 100, 101, 064, 065]];

var raftTravelEventNumbers = [125, 226, 018, 129, 127, 128, 232, 051, 094, 091, 126];

// TODO(ian): Does this have an off by one error?
var wealthTable = [
[0,0,0,0,0,0],
[0,0,1,1,2,2],
[0,1,2,2,3,4],
[2,3,4,4,5,6],
[2,3,4,6,7,8],
[3,4,6,8,10,11],
[6,8,9,11,12,14],
[5,9,11,12,15,20],
[10,12,14,16,18,20],
[15,18,20,22,24,27],
[20,22,24,26,28,30],
[23,27,29,31,33,37],
[40,45,48,52,55,60],
[45,50,55,60,70,80],
[55,60,65,70,80,90],
[85,90,95,100,110,120],
[80,90,100,110,130,150]];

function getWealthFromCode(wealthCode)
{
	// todo - do letter codes as well
	var wealthCodeRow = 0;
	if(wealthCode <= 4)
		wealthCodeRow = wealthCode;
	else if(wealthCode < 7)
		wealthCodeRow = 5;
	else if(wealthCode < 10)
		wealthCodeRow = 6;
	else if(wealthCode < 12)
		wealthCodeRow = 7;
	else if(wealthCode < 15)
		wealthCodeRow = 8;
	else if(wealthCode < 21)
		wealthCodeRow = 9;
	else if(wealthCode < 25)
		wealthCodeRow = 10;
	else if(wealthCode < 30)
		wealthCodeRow = 11;
	else if(wealthCode < 50)
		wealthCodeRow = 12;
	else if(wealthCode < 60)
		wealthCodeRow = 13;
	else if(wealthCode < 70)
		wealthCodeRow = 14;
	else if(wealthCode < 100)
		wealthCodeRow = 15;
	else if(wealthCode < 110)
		wealthCodeRow = 16;
	else
		wealthCodeRow = 17;
	
	var wealthCodeColumn = d6() - 1;
	
	return wealthTable[wealthCodeRow][wealthCodeColumn];
}
