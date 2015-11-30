function mapInfo()
{
	this.widthInTiles = 20;
	this.heightInTiles = 23;
	this.tile1Center = new v2(178,161);
	this.tileSize = new v2(68, 78);
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
var playerTilePosition = new vector2(0, 0);
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
    canvas.addEventListener("mousedown", doMouseDown, true);

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
	if(playerTilePosition.y < map.heightInTiles - 1)
	{
		playerTilePosition.y++;
		endTurn();
	}
}

function moveNorth()
{
	if(playerTilePosition.y > 0)
	{
		playerTilePosition.y--;
		endTurn();
	}
}

function moveSouthEast()
{
	if((playerTilePosition.x < map.widthInTiles - 1) && (isOnEvenTile() || playerTilePosition.y < map.heightInTiles - 1))
	{
		if(!isOnEvenTile())
        {
			playerTilePosition.y++;
        }
		playerTilePosition.x++;
		endTurn();
	}
}

function moveSouthWest()
{
	if(playerTilePosition.x > 0 && (isOnEvenTile() || playerTilePosition.y < map.heightInTiles - 1))
	{
		if(!isOnEvenTile())
        {
			playerTilePosition.y++;
        }
		playerTilePosition.x--;
		endTurn();
	}
}

function moveNorthEast()
{
	if((playerTilePosition.x < map.widthInTiles - 1) && (!isOnEvenTile() || playerTilePosition.y > 0))
	{
		if(isOnEvenTile())
        {
			playerTilePosition.y--;
        }
		playerTilePosition.x++;
		endTurn();
	}
}

function moveNorthWest()
{
	if(playerTilePosition.x > 0 && (!isOnEvenTile() || playerTilePosition.y > 0))
	{
		if(isOnEvenTile())
        {
			playerTilePosition.y--;
        }
		playerTilePosition.x--;
		endTurn();
	}
}

function isOnEvenTile()
{
	return (playerTilePosition.x % 2 == 0)
}

function draw()
{
    var optimalTopLeftMapLocation = new v2(0, 0);
	optimalTopLeftMapLocation.x = map.tile1Center.x + (map.tileSize.x * playerTilePosition.x);
	optimalTopLeftMapLocation.y = map.tile1Center.y + (map.tileSize.y * playerTilePosition.y);
	if(!isOnEvenTile())
	{
		optimalTopLeftMapLocation.y += 0.5 * map.tileSize.y;	
	}
	optimalTopLeftMapLocation.x -= 0.5 * canvas.width;
	optimalTopLeftMapLocation.y -= 0.5 * canvas.height;
    
    var safeTopLeftMapLocation = new v2(optimalTopLeftMapLocation.x, optimalTopLeftMapLocation.y);
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
    
    var cameraPixelPosition = new v2(0, 0);
    /*
    var playerPixelPosition = v2Hadamard(playerTilePosition, map.tileSize);
    v2SubtractAssign(playerPixelPosition, cameraPixelPosition);
    v2AddAssign(playerPixelPosition, playerDrawOffset);
    playerPixelPosition.x -= 0.5*images[playerFileName].width;
    playerPixelPosition.y -= 0.5*images[playerFileName].height;
	context.drawImage(images[playerFileName], Math.round(playerPixelPosition.x), Math.round(playerPixelPosition.y));
	*/
    
    /* Todo(ian): What should the coordinate system look like?
        - 0,0 would be the center of tile 0, 0?
        - then if you are 5 tiles east you add 5 tile widths.
        - but we also need to look at wether your tile evenness is equal to the frame tile evenness
    */
    
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
            
            var center = cameraPixelPosition + (new v2(x, y) * map.tileSize);
            if(x % 2 == 0)
            {
                center.y += 0.5 * map.tileSize.y;
            }
            var radius = 10;
            context.beginPath();
            context.arc(center.x, center.y, radius, 0, 2 * Math.PI);
            context.fillStyle = 'green';
            context.fill();
            //context.lineWidth = 0;
            //context.strokeStyle = '#003300';
            //context.stroke();
        }
    }
}

//
// === INPUT ===
//

function doMouseDown(event)
{
    update();
    draw();
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

// 7 - Cross River
// 8 - On Road
// 9 - Airborne
// 10 - Rafting
var terrain = [
[1,4,4,2,2,1,1,3,4,3,3,2,1,5,0,0,3,4,4,4]];

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
