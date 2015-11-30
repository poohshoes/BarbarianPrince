function mapInfo()
{
	this.widthInTiles = 20;
	this.heightInTiles = 23;
	this.tile1Center = new vector2(178,161);
	this.tileSize = new vector2(68, 78);
}

function vector2(x, y)
{
	this.x = x;
	this.y = y;
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
var playerPosition = new vector2(0, 0);
var playerDrawOffset = new vector2(-8, -25);

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

	canvas = document.getElementById('canvasId');
	context = canvas.getContext("2d");

    imagesToLoad.push(mapFileName);
    imagesToLoad.push(playerFileName);
    loadImagesThenDraw();
}

function loadImagesThenDraw()
{
    if(imagesToLoad.length > 0)
    {
        var name = imagesToLoad.pop();
        images[name] = new Image();
        images[name].onload = loadImagesThenDraw;
        images[name].src = "images/" + name;
    }
    else
    {
        draw();
    }
}

function endTurn()
{	
    if(food > 0)
    {
		food--;
    }
	draw();	
}

function moveSouth()
{
	if(playerPosition.y < map.heightInTiles - 1)
	{
		playerPosition.y++;
		endTurn();
	}
}

function moveNorth()
{
	if(playerPosition.y > 0)
	{
		playerPosition.y--;
		endTurn();
	}
}

function moveSouthEast()
{
	if((playerPosition.x < map.widthInTiles - 1) && (isOnEvenTile() || playerPosition.y < map.heightInTiles - 1))
	{
		if(!isOnEvenTile())
        {
			playerPosition.y++;
        }
		playerPosition.x++;
		endTurn();
	}
}

function moveSouthWest()
{
	if(playerPosition.x > 0 && (isOnEvenTile() || playerPosition.y < map.heightInTiles - 1))
	{
		if(!isOnEvenTile())
        {
			playerPosition.y++;
        }
		playerPosition.x--;
		endTurn();
	}
}

function moveNorthEast()
{
	if((playerPosition.x < map.widthInTiles - 1) && (!isOnEvenTile() || playerPosition.y > 0))
	{
		if(isOnEvenTile())
        {
			playerPosition.y--;
        }
		playerPosition.x++;
		endTurn();
	}
}

function moveNorthWest()
{
	if(playerPosition.x > 0 && (!isOnEvenTile() || playerPosition.y > 0))
	{
		if(isOnEvenTile())
        {
			playerPosition.y--;
        }
		playerPosition.x--;
		endTurn();
	}
}

function isOnEvenTile()
{
	return (playerPosition.x % 2 == 0)
}

function draw()
{
    var optimalTopLeftMapLocation = new vector2(0, 0);
	optimalTopLeftMapLocation.x = map.tile1Center.x + (map.tileSize.x * playerPosition.x);
	optimalTopLeftMapLocation.y = map.tile1Center.y + (map.tileSize.y * playerPosition.y);
	if(!isOnEvenTile())
	{
		optimalTopLeftMapLocation.y += 0.5 * map.tileSize.y;	
	}
	optimalTopLeftMapLocation.x -= 0.5 * canvas.width;
	optimalTopLeftMapLocation.y -= 0.5 * canvas.height;
    
    var safeTopLeftMapLocation = new vector2(optimalTopLeftMapLocation.x, optimalTopLeftMapLocation.y);
	if(safeTopLeftMapLocation.x < 0)
		safeTopLeftMapLocation.x = 0;
	if(safeTopLeftMapLocation.y < 0)
		safeTopLeftMapLocation.y = 0;
	if(safeTopLeftMapLocation.x + canvas.width > images[mapFileName].width)
		safeTopLeftMapLocation.x = images[mapFileName].width - canvas.width;
	if(safeTopLeftMapLocation.y + canvas.height > images[mapFileName].height)
		safeTopLeftMapLocation.y = images[mapFileName].height - canvas.height;    
    
	context.drawImage(images[mapFileName], safeTopLeftMapLocation.x, safeTopLeftMapLocation.y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
	
	var playerImageX = Math.round(0.5*canvas.width - 0.5*images[playerFileName].width + (optimalTopLeftMapLocation.x - safeTopLeftMapLocation.x) + playerDrawOffset.x);
	var playerImageY = Math.round(0.5*canvas.height - 0.5*images[playerFileName].height + (optimalTopLeftMapLocation.y - safeTopLeftMapLocation.y) + playerDrawOffset.y);
	context.drawImage(images[playerFileName], playerImageX, playerImageY);
	
	document.getElementById('remainingFood').innerHTML = food;
	document.getElementById('hitPoints').innerHTML = party[0].currentEndurance + "/" + party[0].maxEndurance;
	document.getElementById('gold').innerHTML = gold;
    
    for(var x = 0; x < terrain.length; x++)
    {
        for(var y = 0; y < terrain[x].length; y++)
        {
            // 0 - Farmland
            // 1 - Countryside
            // 2 - Forset
            // 3 - Hills
            // 4 - Mountains
            // 5 - Swamp
            // 6 - Desert
            
        }
    }
}

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

function d6()
{
	return Math.floor(Math.random()*6) + 1;
}

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
var terrain = [
[1,4,4,2,2,1,1,3,4,3,3,2,1,5,0,0,3,4,4,4]];

canvas.addEventListener("mousedown", doMouseDown, true);
function doMouseDown(event)
{
    update();
    draw();
}