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
var images = {};
var map = new mapInfo();

var mapFileName = "map.jpg";
var playerFileName = "player.png";
var moveArrowFileName = "moveArrow.png";

var maxHitPoints = 9;
var hitPoints = maxHitPoints;
var food = 5;
var gold = 0;

// Player position in tiles
var playerPosition = new vector2(0, 0);
var playerDrawOffset = new vector2(-8, -25);

window.onload = loadContent;
	
function loadContent()
{
	canvas = document.getElementById('canvasId');
	context = canvas.getContext("2d");
	gold = getWealthFromCode(2);

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
	endTurnFoodProcessing();
	draw();	
}

function endTurnFoodProcessing()
{
	if(food > 0)
    {
		food--;
    }
}

function moveSouth()
{
	if(canMoveSouth())
	{
		playerPosition.y++;
		endTurn();
	}
}

function moveNorth()
{
	if(canMoveNorth())
	{
		playerPosition.y--;
		endTurn();
	}
}

function moveSouthEast()
{
	if(canMoveEast() && (isOnEvenTile() || canMoveSouth()))
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
	if(canMoveWest() && (isOnEvenTile() || canMoveSouth()))
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
	if(canMoveEast() && (!isOnEvenTile() || canMoveNorth()))
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
	if(canMoveWest() && (!isOnEvenTile() || canMoveNorth()))
	{
		if(isOnEvenTile())
        {
			playerPosition.y--;
        }
		playerPosition.x--;
		endTurn();
	}
}

function canMoveEast()
{
	return (playerPosition.x < map.widthInTiles - 1)
}

function canMoveWest()
{
	return (playerPosition.x > 0)
}

function canMoveNorth()
{
	return (playerPosition.y > 0)
}

function canMoveSouth()
{
	return (playerPosition.y < map.heightInTiles - 1)
}

function isOnEvenTile()
{
	return (playerPosition.x % 2 == 0)
}

function draw()
{
	// Clear the canvas
	//canvas.width = canvas.width;

	var optimalTopLeftMapLocation = calculateMapPosition();
	var safeTopLeftMapLocation = calculateLegalDrawPosition(optimalTopLeftMapLocation);
	context.drawImage(images[mapFileName], safeTopLeftMapLocation.x, safeTopLeftMapLocation.y, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
	
	var playerImageX = Math.round(0.5*canvas.width - 0.5*images[playerFileName].width + (optimalTopLeftMapLocation.x - safeTopLeftMapLocation.x) + playerDrawOffset.x);
	var playerImageY = Math.round(0.5*canvas.height - 0.5*images[playerFileName].height + (optimalTopLeftMapLocation.y - safeTopLeftMapLocation.y) + playerDrawOffset.y);
	context.drawImage(images[playerFileName], playerImageX, playerImageY);
	
	updateFoodDisplay();
	updateHitPointDisplay();
	updateGoldDisplay();
}

function calculateMapPosition()
{
	var topLeftMapLocation = new vector2(0, 0);
	topLeftMapLocation.x = map.tile1Center.x + (map.tileSize.x * playerPosition.x);
	topLeftMapLocation.y = map.tile1Center.y + (map.tileSize.y * playerPosition.y);

	if(!isOnEvenTile())
	{
		topLeftMapLocation.y += 0.5 * map.tileSize.y;	
	}

	topLeftMapLocation.x -= 0.5 * canvas.width;
	topLeftMapLocation.y -= 0.5 * canvas.height;
	return topLeftMapLocation;
}

function calculateLegalDrawPosition(unsafeDrawLocation)
{
	var safeDrawLocation = new vector2(unsafeDrawLocation.x, unsafeDrawLocation.y);

	if(safeDrawLocation.x < 0)
		safeDrawLocation.x = 0;
	if(safeDrawLocation.y < 0)
		safeDrawLocation.y = 0;
	if(safeDrawLocation.x + canvas.width > images[mapFileName].width)
		safeDrawLocation.x = images[mapFileName].width - canvas.width;
	if(safeDrawLocation.y + canvas.height > images[mapFileName].height)
		safeDrawLocation.y = images[mapFileName].height - canvas.height;
		
	return safeDrawLocation;
}

function updateFoodDisplay()
{
	document.getElementById('remainingFood').innerHTML = food;
}

function updateHitPointDisplay()
{
	document.getElementById('hitPoints').innerHTML = hitPoints + "/" + maxHitPoints;
}

function updateGoldDisplay()
{
	document.getElementById('gold').innerHTML = gold;
}


	
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
