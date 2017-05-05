/* Task List
- start putting in the travel encounters
- road travel and getting lostSave
- river crossings, getting lost, and peing in partial positions.
- combat with more player characters.
- negotiate and evade
- combat surprise round
- bribe rules
- 2 hex movement if mounted.  3 hex flying movement.
- sleeping / nighttime animation
- Replace this with a measurement of the height using the current font.
- Surprise, Escape, and Routs.
- put in the gold splitting when you get gold
*/

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
var tileHighlightGreyFileName = "tileHighlightGrey.png";
var tileHighlightYellowFileName = "tileHighlightYellow.png";

var day = 1;
var food = 5;
var gold = 0;

var party = [];

var playerTilePosition = new v2(0, 0);
var playerDrawOffset = new v2(-8, -25);

var combat = {};
resetCombatState();
var activity = {}
clearActivity();

var ui = new Object();
ui.interacting = null;
ui.hot = null;
ui.nextHot = null;

var debugTextMax = 20;
var debugText = [debugTextMax];

window.onload = initialize;
window.addEventListener("keypress", onKeyPress, true);

var lineHeight = 18;

var isSplittingGold = false;
var goldToSplit = 0;
Phase = {
	playerAction: 0,
    mercenaryCheck : 1,
    hunting : 2,
	starvation: 3,
	dayEnd: 4
}

var phase = Phase.playerAction;

var debugDisplay = false;
var defaultTextStyle = new textStyle('Courier New', 14, 'black');
var debugTextStyle = new textStyle('Lucida Console', 10, '#000000ff');

function clearActivity()
{
	activity.canEnd = false;
	activity.active = false;
	activity.text = [];
	activity.options = [];
	activity.characters = [];
}

function addDebugText(text)
{
    if(debugText.length == debugTextMax)
    {
        debugText.shift();
    }
    debugText.push(text);
}

function initialize()
{	
	resetGame();
 
	canvas = document.getElementById('canvasId');
    canvas.addEventListener("click", onClick, true);
    canvas.addEventListener("mousemove", onMouseMove, true);
	context = canvas.getContext("2d");
	setTextStyle(defaultTextStyle);
 
    imagesToLoad.push(mapFileName);
    imagesToLoad.push(playerFileName);
	imagesToLoad.push(tileHighlightGreyFileName);
	imagesToLoad.push(tileHighlightYellowFileName);
    loadImagesThenStart();
    // Note(ian): Don't do anything after load images then draw as it relies on events to fire off Draw.
}

function resetGame()
{
	clearActivity();
	resetCombatState();
	
	party.length = 0;
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
   
    phase = Phase.playerAction;
	setEvent('e', 001);
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

function isValidTilePosition(tilePosition)
{
    return isValidTilePosition(tilePosition.x, tilePosition.y);
}

function isValidTilePosition(x, y)
{
    return x >= 0 && x < map.widthInTiles - 1 && y >= 0 && y < map.heightInTiles - 1;
}

function conciousPlayerCount()
{
	var numConciousPlayers = 0;
	for (var partyIndex = 0; partyIndex < party.length; partyIndex++)
	{
		if (party[partyIndex].currentEndurance > 1)
		{
			numConciousPlayers++;
		}
	}
	return numConciousPlayers;
}

function drawAndUpdate()
{
    keysPressed = nextKeysPressed;
    nextKeysPressed = {};
    mouseClicked = nextMouseClicked;
    nextMouseClicked = false;
    
	if (keysPressed[tildeKeyCode])
	{
		debugDisplay = !debugDisplay;
	}
	
    context.clearRect(0, 0, canvas.width, canvas.height);
		
	if (debugDisplay)
	{
        setTextStyle(debugTextStyle);
        var y = 12;
        for(var debugIndex = debugText.length - 1;
            debugIndex >= 0;
            debugIndex--)
        {
            context.fillText(debugText[debugIndex], 10, y);
            y += 12;
        }
		setTextStyle(defaultTextStyle);   
	}
    else if(conciousPlayerCount() == 0)
    {
		drawText(10, 10, 'You died, press Enter to start a new game', 'default');
		if (keysPressed[enterKeyCode])
		{
			resetGame();
		}
	}
	else if (isSplittingGold)
	{
		// Make a list of people who expect a split and allow toggling them on and off.
		// The looters come and go as a group so you should have to select all or none of them?
	}
    else if(combat.active)
    {
		var overflowIsEnemies = combat.combatants.length > party.length;
		var numArenas = Math.min(combat.combatants.length, party.length);
		if (!combat.combatInitialized)
		{
			combat.combatInitialized = true;
			
			for (var arenaIndex = 0; arenaIndex < numArenas; arenaIndex++)
			{
				var arena = {};
				arena.unitList = [];
				arena.unitList[0] = party[arenaIndex];
				arena.unitList[1] = combat.combatants[arenaIndex];
				combat.combatArenas[arenaIndex] = arena;
			}
			var maxUnits = Math.max(combat.combatants.length, party.length);
			var arenaIndex = 0;
			for (var unitIndex = numArenas; unitIndex < maxUnits; unitIndex++)
			{
				var arena = combat.combatArenas[arenaIndex];
				if (numArenas < party.length)
				{
					arena.unitList[arena.unitList.length] = party[unitIndex];
				}
				else
				{
					arena.unitList[arena.unitList.length] = combat.combatants[unitIndex];
				}
				
				arenaIndex++;
				arenaIndex %= numArenas;
			}
		}
		
		var arenaSectionSize = new v2(canvas.width / numArenas, canvas.height / 4);
		
		for (var arenaIndex = 0; arenaIndex < numArenas; arenaIndex++)
		{
			var arena = combat.combatArenas[arenaIndex];
			for (var unitIndex = 0; unitIndex < arena.unitList.length; unitIndex++)
			{
				var unit = arena.unitList[unitIndex];
				
				var verticalSectionIndex = 3;
				if (unitIndex == 0)
				{
					verticalSectionIndex = 2;
				}
				else if (unitIndex == 1)
				{
					verticalSectionIndex = 1;
				}
				else if (overflowIsEnemies)
				{
					verticalSectionIndex = 0;
				}
				
				var topLeft = new v2(arenaIndex * arenaSectionSize.x, verticalSectionIndex * arenaSectionSize.y);
				var bottomRight = new v2(topLeft.x + arenaSectionSize.x, topLeft.y + arenaSectionSize.y);
				if (unitIndex > 1)
				{
					var numOverflowUnits = arena.unitList.length - 2;
					var overflowWidth = arenaSectionSize.x / numOverflowUnits;
					var overflowIndex = unitIndex - 2;
					topLeft.x += overflowWidth * overflowIndex;
					bottomRight.x -= overflowWidth * (numOverflowUnits - overflowIndex - 1);
				}
				
				//drawLine(topLeft.x, topLeft.y, bottomRight.x, bottomRight.y, 'red');
				
				var name = unit.name;
				var textPosition = v2Copy(topLeft);
				var unitMaxWidth = bottomRight.x - topLeft.x;
				var nameStyle = new textStyle(defaultTextStyle.name, defaultTextStyle.size, defaultTextStyle.color);
				var textWidth = context.measureText(name).width;
				for (; textWidth > unitMaxWidth; )
				{
					nameStyle.size--;
					setTextStyle(nameStyle);
					textWidth = context.measureText(name).width;
				}
				textPosition.x += (unitMaxWidth - textWidth) / 2.0;
				drawText(textPosition.x, textPosition.y, name, 'default');
				setTextStyle(defaultTextStyle);
				textPosition.y += lineHeight;
				drawText(textPosition.x, textPosition.y, unit.combatSkill);
				textPosition.y += lineHeight;
				drawText(textPosition.x, textPosition.y, unit.currentEndurance + '/' + unit.maxEndurance, 'default');
			}
		}
		
		// Apply the combat.
		if (keysPressed[enterKeyCode])
		{
			for (var arenaIndex = 0; arenaIndex < numArenas; arenaIndex++)
			{
				var arena = combat.combatArenas[arenaIndex];
				for (var attackTurn = 0; attackTurn <= 1; attackTurn++)
				{
					var overflowAttackTurn;
					var playerAttackTurn;
					var victim;
					var victimIndex = attackTurn;
					if (combat.playerStrikesFirst)
					{
						victimIndex++;
					}
					victimIndex = victimIndex % 2;
					victim = arena.unitList[victimIndex];
					if (combat.playerStrikesFirst)
					{
						playerAttackTurn = 0;
						if (overflowIsEnemies)
						{
							overflowAttackTurn = 1;
						}
						else
						{
							overflowAttackTurn = 0;
						}
					}
					else 
					{
						playerAttackTurn = 1;
						if (overflowIsEnemies)
						{
							overflowAttackTurn = 0;
						}
						else
						{
							overflowAttackTurn = 1;
						}
					}
					for (var unitIndex = 0; unitIndex < arena.unitList.length; unitIndex++)
					{
						var unit = arena.unitList[unitIndex];
						
						if(unit.currentEndurance > 1 &&
							((unitIndex == 0 && attackTurn == playerAttackTurn) ||
						     (unitIndex == 1 && attackTurn != playerAttackTurn) ||
						     (unitIndex > 1 && attackTurn == overflowAttackTurn)))
					   {
						    var unitCombatSkill = unit.combatSkill - unit.starvation;
						    var victimCombatSkill = victim.combatSkill - victim.starvation;
						    var attackValue = unitCombatSkill - victimCombatSkill;
						    // +2 Target of strike has wounds equalling half or more his endurance
							if (victim.currentEndurance <= (victim.maxEndurance / 2))
							{
								attackValue += 2;
							}
							// -1 Striker has one or more wounds
							if (unit.currentEndurance != unit.maxEndurance)
							{
								attackValue--;
							}
							// -1 Striker has wounds equalling half or more his endurance (in addition to the above)
							if (unit.currentEndurance <= (unit.maxEndurance / 2))
							{
								attackValue--;
							}
							attackValue += d6() + d6();
							
							// Note(ian): Because the wound table has a -1 entry we had to shift it up 1 so it could start at 0.
							attackValue++;
							
							var wounds = 0;
							if (attackValue >= 0 && attackValue < woundTable.length)
							{
								wounds = woundTable[attackValue];
							}
							
							victim.currentEndurance -= wounds;
					   }
					}	
				}
			}
			
			// Evaluate the combat state and arena unit positions.
			var numConciousEnemies = 0;
			for (var enemyIndex = 0; enemyIndex < combat.combatants.length; enemyIndex++)
			{
				if (combat.combatants[enemyIndex].currentEndurance > 1)
				{
					numConciousEnemies++;
				}
			}
			
			if (conciousPlayerCount() == 0)
			{
			}
			else if (numConciousEnemies == 0)
			{
				var goldGained = 0;
				for (var enemyIndex = 0; enemyIndex < combat.combatants.length; enemyIndex++)
				{
					var enemy = combat.combatants[enemyIndex];
					goldGained += getWealthFromCode(enemy.wealth);
				}
				gold += goldGained;
				resetCombatState();
				clearActivity();
			}
			else
			{
				// Todo(ian): Highlight arenas in red if they have not valid targets (and prevent processing the round);
				// Todo(ian): make sure the max number of possible arenas is being used.
				// Todo(ian): Give the players the ability to drag and drop units.
				for (var arenaIndex = 0; arenaIndex < numArenas; arenaIndex++)
				{
					var arena = combat.combatArenas[arenaIndex];
					var enemy = arena.unitList[1];
					if (overflowIsEnemies &&
						enemy.currentEndurance <= 1)
					{
						var matchFound = false;
						for (var unitIndex = 2; unitIndex < arena.unitList.length && !matchFound; unitIndex++)
						{
							var unit = arena.unitList[unitIndex];
							if (unit.currentEndurance > 1)
							{
								matchFound = true;
								var temp = arena.unitList[1];
								arena.unitList[1] = arena.unitList[unitIndex];
								arena.unitList[unitIndex] = temp;
							}
						}
					}
				}
			}
		}
	}
    else if(activity.active)
    {
        var panel = new Object();
        panel.AtY = 0;
        panel.AtX = 0;
        
		drawWrappedText(panel, activity.text, canvas.width);
		
		for (var optionIndex = 0; optionIndex < activity.options.length; optionIndex++)
		{
			var option = activity.options[optionIndex];
			var clicked = doButton(panel, option.text);
			if (clicked)
			{				
				if (option.type == ActivityOptionType.EndActivity)
				{
					clearActivity();
				}
				else if (option.type == ActivityOptionType.Random)
				{
					processOption(option.outcomes);
				}
				else if (option.type == ActivityOptionType.Hire)
				{
					for (var hireIndex = 0; hireIndex < option.numToHire; hireIndex++)
					{
						var character = activity.characters[hireIndex];
						gold -= character.dailyFee;
						character.advancePay = true;
						party[party.length] = character;
					}
					clearActivity();
				}
				else if (option.type == ActivityOptionType.Event)
				{
					setEvent(option.letter, option.number);
				}
			}
		}
		
		if(activity.canEnd && continueButtonPressed())
		{
			clearActivity();
		}
    }
    else if (phase == Phase.mercenaryCheck)
	{
		if ((playerTilePosition.y == 0 && playerTilePosition.x != 13) ||
			(playerTilePosition.y == 1 && (playerTilePosition.x == 2 || playerTilePosition.x == 4)))
		{
			phase = phase.hunting;
			setEvent('e', 2);
		}
	}
	else if (phase == Phase.hunting)
	{
		if (isTown() || isCastle() || isTemple())
		{
			/*
			Hunting is prohibited in any hex with a town, castle, or temple.
			Purchased Meals (r215d): if you are in a town, castle, or village you can purchase food for each character in
			your party. Normal cost is 1 gold piece per character for food that day. Animals cost 1 gold piece per day to
			feed at the stables of the town/castle/village. If you don't purchase food, you must eat stores, as hunting is
			prohibited in these hexes.
			Food Stores (r215e): food units can be stored and transported (r206) by yourself, other characters, and/or
			mounts. Food stores can be purchased in a town, castle or village for 1 gold piece per food unit, but only if you
			spent the entire day in the hex. Each food unit is one (1), load to transport.
			Animal Fodder (r215f): animals can graze and eat fodder for themselves in any terrain where hunting is
			possible except swamps (i.e., in farmland, countryside, forest, or hills). No hunting, stores or purchases are
			necessary. If you spend the entire day in a town, castle or temple hex you must stable your animals which cost
			one (1) gold piece for food, unless you provide the stable with food stores (two units per animal) to feed them.
			Note: the cost of food is separate from the cost of lodging. In towns, castles and temples you must also pay for
			lodging; see r217.
			
			r217 Lodging in Towns, Castles and Temples
			If your party finishes the day in a town, castle or temple hex, after eating you normally buy lodging for your
			party. Each room costs one gold piece for the night. You and any priests, monks, magicians, wizards, or
			witches in your party each require a single room. All other followers can share, two per room, if you wish.
			Animals are placed in stables at one gold piece per mount.
			If you decide to not purchase rooms (due to lack of funds, or a desire to save money), you must roll two dice for
			each character in your party, and then subtract your wit & wiles from the result. If the total is "4" or more, the
			character deserts - he refuses to serve such a penurious leader! If a mount is without stables, roll one die for
			each mount, a 4 or higher means thieves steal the mount during the night, it is permanently lost.
			*/
			phase = Phase.starvation;
		}
		else
		{
			var tileType = terrain[playerTilePosition.x, playerTilePosition.y];
			if (!(tileType == Terrain.farmland ||
				tileType == Terrain.countryside ||
				tileType == Terrain.forest ||
				tileType == Terrain.hill ||
				tileType == Terrain.swamp))
			{
				phase = Phase.starvation;
			}
			else
			{
				if (doButton(panel, 'Don\'t hunt'))
				{
					phase = Phase.starvation;
				}
				
				if (doButton(panel, 'Hunt'))
				{
					// Todo(ian): Let the player select the hunter and assistants.
					var hunter = party[0];
					var huntCheckDice = d6() + d6();
					var hunterCombatSkill = hunter.combatSkill - hunter.starvation;
					var foodUnits = hunterCombatSkill + Math.floor(hunter.currentEndurance / 2) - huntCheckDice;
					if (hunter.isGuide)
					{
						foodUnits++;
					}
					if (huntCheckDice == 12)
					{
						var wounds = d6();
						hunter.currentEndurance -= wounds;
					}
					if (hunter.currentEndurance > 1)
					{
						// Todo: you can also get the food units if your hunting party had assistants.
						food += foodUnits;
					}
					// Todo: If you rested in the hex today you can select assistant hunters, each adds +1 to the food units and an additional +1 if they are a guide.
					
					if (tileType == Terrain.farmland)
					{
						var check = d6();
						if (check == 5)
						{
							setEvent('e', 17);
						}
						else if (check == 6)
						{
							setEvent('e', 50);// Todo: we are supposed to add 2 to the die roll in this event
						}
					}
					
					phase = Phase.starvation;
				}
			}
		}
		
		phase = Phase.starvation;
	}
	else if (phase == Phase.starvation)
	{
		// Todo(ian): Ability to abandon party members / mounts at any time (except when they are about to divy up gold per gold sharing rules.)
				
		var tileType = terrain[playerTilePosition.x, playerTilePosition.y];
		var requiredFood = 0;
		for (var partyIndex = 0; partyIndex < party.length; partyIndex++)
		{
			requiredFood++;
			var isFarmCountryForestOrHill =
				tileType == Terrain.farmland ||
				tileType == Terrain.countryside ||
				tileType == Terrain.forest ||
				tileType == Terrain.hill;
			if (!isFarmCountryForestOrHill &&
				party[partyIndex].mounted == true)
			{
				requiredFood += 2;
			}
		}
		if (tileType == Terrain.desert && !isOasis())
		{
			requiredFood *= 2;
		}
		
		var desertion = false;
		var starvation = 0;
		var actionSelected = false;
		if (doButton(panel, 'Don\'t Eat'))
		{
			actionSelected = true;
			desertion = true;
			starvation = 1;
		}
		if (0 < food && food < requiredFood &&
			doButton(panel, 'Partition remaining food'))
		{
			actionSelected = true;
			desertion = true;
			food = 0;
		}
		if (food >= requiredFood && doButton(panel, 'Eat'))
		{
			actionSelected = true;
			food -= requiredFood;
			starvation = -1;
		}
		if (food >= 2 * requiredFood && doButtion(panel, 'Double Meal'))
		{
			actionSelected = true;
			food -= 2 * requiredFood;
			starvation = -2;
		}
		
		if (actionSelected)
		{
			for (var partyIndex = party.length - 1; partyIndex > 0; partyIndex--)
			{
				var partyMember = party[partyIndex];
				partyMember.starvation += starvation;
				if (partyMember.starvation < 0)
				{
					partyMember.starvation = 0;
				}
				if (desertion && partyIndex != 0)
				{
					var desertionCheck = d6() + d6() - party[0].witAndWiles;
					if (desertionCheck >= 4)
					{
						party.splice(partyIndex, 1);
					}
				}
			}
	
			phase = Phase.dayEnd;	
		}
		
		/*		
		Character Starvation (r216b): if a character goes, without food for a day, on the following day his ability to carry loads (r206) is halved, with fractions rounded down, and his combat skill is reduced by one. If he goes without food again, load carrying and combat skill is reduced again. When food is available and eaten again,
		each day's normal meal also eliminates the effect of one day of starvation. A double meal can be eaten to eliminate the effect of two days of starvation, but triple or larger meals have no additional effect. A character cannot die of starvation within the scope of the game, but after a certain point progressive starvation makes him nearly worthless!
		Mount Starvation; if animals (mounts) in the party go without food, their carrying capacity is halved for each day of starvation, just like characters. When carrying capacity reaches zero, the mount dies. If a winged mount goes without food, it is unable to fly. Unlike characters, as soon as a mount gets a normal meal, it recovers from all starvation effects. */
		phase = Phase.dayEnd
	}
	else if (phase == Phase.dayEnd)
	{		
		addDebugText("End Of Day");
		phase = Phase.playerAction;
		
		var partySalary = 0;
		for (var partyIndex = 1; partyIndex < party.length; partyIndex++)
		{
			var partyMember = party[partyIndex];
			if (partyMember.advancePay)
			{
				partyMember.advancePay = false;
			}
			else
			{
				partySalary += partyMember.dailyFee;
			}
		}
		
		gold -= partySalary;		
		day++;
	}
    else 
	{
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
        
        // Tile under mouse.
		var hotTile;
        {
            var mouseRelativeToFirstTileCenter = v2Subtract(mousePosition, firstTileCenter);
            var evenGrid = v2HadamardDivision(mouseRelativeToFirstTileCenter, map.tileSize);
            var evenGridRounded = v2Copy(evenGrid);
            evenGridRounded.x /= 2;
            v2RoundAssign(evenGridRounded);
            evenGridRounded.x *= 2;
            var evenGridDistance = v2Length(v2Subtract(evenGrid, evenGridRounded));
            
            var oddGrid = new v2(evenGrid.x, evenGrid.y - 0.5);
            var oddGridRounded = v2Copy(oddGrid);
            oddGridRounded.x -= 1;
            oddGridRounded.x /= 2;
            v2RoundAssign(oddGridRounded);
            oddGridRounded.x *= 2;
            oddGridRounded.x += 1;
            var oddGridDistance = v2Length(v2Subtract(oddGrid, oddGridRounded));
            
            hotTile = evenGridRounded;
            if(oddGridDistance < evenGridDistance)
            {
                hotTile = oddGridRounded;
            }
        }
		
		// Highlight Valid Moves
		{
			var moveTiles = [];
            moveTiles.push(new v2(playerTilePosition.x, playerTilePosition.y - 1));
            if(playerTilePosition.x % 2 == 0)
            {
                moveTiles.push(new v2(playerTilePosition.x + 1, playerTilePosition.y - 1));
                moveTiles.push(new v2(playerTilePosition.x - 1, playerTilePosition.y - 1));
            }
            moveTiles.push(new v2(playerTilePosition.x + 1, playerTilePosition.y));
            moveTiles.push(new v2(playerTilePosition.x - 1, playerTilePosition.y));
            if(playerTilePosition.x % 2 == 1)
            {
                moveTiles.push(new v2(playerTilePosition.x + 1, playerTilePosition.y + 1));
                moveTiles.push(new v2(playerTilePosition.x - 1, playerTilePosition.y + 1));
            }
            moveTiles.push(new v2(playerTilePosition.x, playerTilePosition.y + 1));
            for(var tileIndex = 0;
                tileIndex < moveTiles.length;
                tileIndex++)
            {
                var tile = moveTiles[tileIndex];
                if(tile.x >= 0 && tile.x < map.widthInTiles - 1 && tile.y >= 0 && tile.y < map.heightInTiles - 1)
                {
                    if(!v2Equals(tile, hotTile))
                    {
                        var center = getDrawLocationFromTile(firstTileCenter, tile, new v2(images[tileHighlightGreyFileName].width, images[tileHighlightGreyFileName].height), new v2(0, 0));
                        context.drawImage(images[tileHighlightGreyFileName], center.x, center.y);
                    }
					else
					{
						var center = getDrawLocationFromTile(firstTileCenter, hotTile, new v2(images[tileHighlightYellowFileName].width, images[tileHighlightYellowFileName].height), new v2(0, 0));
						context.drawImage(images[tileHighlightYellowFileName], center.x, center.y);
						
						if(mouseClicked)
						{
							phase = Phase.mercenaryCheck;
							
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
							var lostSaveRoll = d6() + d6();
							addDebugText("Lost Save: " + lostSaveRoll + " (needed below " + lostSave + ").");
							if(lostSaveRoll >= lostSave)
							{
								// TODO(ian): lose any remaining moves if mounted
								addDebugText("You Got Lost");
								terrainEvent(currentTerrainType);
							}
							else
							{
								var newTerrainType = terrain[hotTile.y][hotTile.x];
								terrainEvent(newTerrainType);
								playerTilePosition = hotTile;
							}
						}
                    }
                }
            }
		}
        
        var playerPosition = getDrawLocationFromTile(firstTileCenter, playerTilePosition, new v2(images[playerFileName].width, images[playerFileName].height), playerDrawOffset);
        context.drawImage(images[playerFileName], playerPosition.x, playerPosition.y);
        		
        // Todo(ian): Draw these on the canvas.
        document.getElementById('remainingFood').innerHTML = food;
        document.getElementById('hitPoints').innerHTML = party[0].currentEndurance + "/" + party[0].maxEndurance;
        document.getElementById('gold').innerHTML = gold;
        		
		// for(var y = 0; y < terrain.length; y++)
        // {
            // for(var x = 0; x < terrain[y].length; x++)
            // {
				// if ((y == 0 && x != 13) ||
					// (y == 1 && (x == 2 || x == 4)))
				// {
					
					// //var center = getDrawLocationFromTile(firstTileCenter, new v2(x, y), new v2(0, 0), new v2(0, 0));
					// //drawCircle(10, center.x, center.y, '#a07a39')
				// }
			// }
		// }
		
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
                drawCircle(10, center.x, center.y, color)
            }
        }*/
    }
}

function resetCombatState()
{	          
	combat.active = false;
	combat.playerStrikesFirst = true;
	combat.surpriseAdvantage = 'none';
	combat.bribe = 0;
	combat.combatants = [];
	combat.combatArenas = [];
	combat.combatInitialized = false;
}

function processOption(optionMatrix)
{
	if(optionMatrix != null)
	{                
		var optionIndex = d6() - 1;
		var selectedOption = optionMatrix[optionIndex];
		if(selectedOption.length == 3)
		{
			combat.bribe = selectedOption[2];
		}
		setEvent(selectedOption[0], selectedOption[1]);
	}
}

function getCharacter(name, combatSkill, endurance, wealth)
{
    var result = {};
    result.name = name;
    result.combatSkill = combatSkill;
    result.currentEndurance = endurance;
	result.maxEndurance = endurance;
    result.wealth = wealth;
	result.dailyFee = 0;
	result.advancePay = false;
	result.sharePay = false;
    return result;
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

function continueButtonPressed()
{
    return keysPressed[ascii(" ")] || keysPressed[enterKeyCode] || mouseClicked;
}

function doButton(panel, text)
{
    var result = false;
    
    var style = 'default';
    var size = new v2(context.measureText(text).width, lineHeight);
    if(panel.AtX <= mousePosition.x && mousePosition.x <= (panel.AtX + size.x) &&
       panel.AtY <= mousePosition.y && mousePosition.y <= (panel.AtY + size.y))
    {
        style = 'highlight';
        if(mouseClicked)
        {
            result = true;
        }
    }
    
    doText(panel, text, style);    
    nextRow(panel, lineHeight);
    
    return result;
}

function nextRow(panel, rowHeight)
{
    panel.AtX = 0;
    panel.AtY += rowHeight;
}

function doText(panel, text, style)
{
	drawText(panel.AtX, panel.AtY, text, style);
    panel.AtX += context.measureText(text).width;
}

function drawText(x, y, text, style)
{
	var oldFillStyle = context.fillStyle;
    if(style == 'highlight')
    {
        context.fillStyle = 'blue';
    }
    //Note(ian): Javascript is draws text up instead of down from the position so we add lineHeight.
    context.fillText(text, x, y + lineHeight);
    //drawCircle(2, panel.AtX, panel.AtY, '#000000')
	context.fillStyle = oldFillStyle;
}

function drawWrappedText(panel, text)
{
    if(panel == null)
    {
        panel = new Object();
        panel.AtY = 0;
        panel.AtX = 0;
    }
    
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
            if(partIndex == 0)
            {
                var standardTab = 40;
                panel.AtX = standardTab;
            }
            else
            {
                panel.AtX += spaceWidth;
            }
            var partWidth = context.measureText(parts[partIndex]).width;
            if( (panel.AtX + partWidth) > canvas.width)
            {
                nextRow(panel, lineHeight);
            }
            
            doText(panel, parts[partIndex]);
        }
        nextRow(panel, lineHeight);
        nextRow(panel, lineHeight);
    }
}

function drawCircle(radius, x, y, color)
{
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fillStyle = color;
    context.fill();
}

function drawLine(x1, y1, x2, y2, color)
{
	context.beginPath();
	context.moveTo(x1,y1);
	context.lineTo(x2, y2);
	context.strokeStyle = color;
	context.stroke();
}

function isOnEvenTile()
{
	return (playerTilePosition.x % 2 == 0)
}

function terrainEvent(terrainType)
{
    var eventSave = travelTableEvent[terrainType];
    var eventSaveRoll = d6() + d6();
    addDebugText("Event Save: " + eventSaveRoll + " (needed below " + eventSave + ").");
    if(eventSaveRoll >= eventSave)
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
    if(letter == 'r')
    {
        if(number >= 231 && number <= 280)
        {
            var newLetter = 'e';
            var travelEventIndex = d6() - 1;
            var newNumber = travelEvents[number - 231][travelEventIndex];
            setEvent(newLetter, newNumber);
        }
        else if(number == 230)
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
        else if(number == 300)
        {
			combat.active = true;
			combat.combatants = activity.characters;
            combat.playerStrikesFirst = true;
            combat.surpriseAdvantage = 'player';
        }
        else if(number == 301)
        {
			combat.active = true;
			combat.combatants = activity.characters;
            combat.playerStrikesFirst = true;
            var check = d6();
            if(party[0].witAndWiles >= check)
            {
                combat.surpriseAdvantage = 'player';
            }
        }
        else if(number == 302)
        {
			combat.active = true;
			combat.combatants = activity.characters;
            combat.playerStrikesFirst = true;
            var check = d6();
            if(party[0].witAndWiles > check)
            {
                combat.surpriseAdvantage = 'player';
            }
        }
        else if(number == 303)
        {
			combat.active = true;
			combat.combatants = activity.characters;
            combat.playerStrikesFirst = true;
            var check = d6();
			// Todo(ian): Is this check correct or should it be party.length?
            if(party[0].length < check)
            {
                combat.surpriseAdvantage = 'player';
            }
        }
        else if(number == 304)
        {
			combat.active = true;
			combat.combatants = activity.characters;
            combat.playerStrikesFirst = true;
        }
        else if(number == 305)
        {
			combat.active = true;
			combat.combatants = activity.characters;
            var check = d6();
            combat.playerStrikesFirst = party[0].witAndWiles >= check;
        }
        else if(number == 306)
        {
			combat.active = true;
			combat.combatants = activity.characters;
            var check = d6();
            combat.playerStrikesFirst = party[0].witAndWiles > check;
        }
        else if(number == 307)
        {
			combat.active = true;
			combat.combatants = activity.characters;
            combat.playerStrikesFirst = false;
        }
        else if(number == 308)
        {
			combat.active = true;
			combat.combatants = activity.characters;
            combat.playerStrikesFirst = false;
            var check = d6();
            if(party[0].witAndWiles < check)
            {
                combat.surpriseAdvantage = 'enemy';
            }
        }
        else if(number == 309)
        {
			combat.active = true;
			combat.combatants = activity.characters;
            combat.playerStrikesFirst = false;
            var check = d6();
            if(party[0].witAndWiles <= check)
            {
                combat.surpriseAdvantage = 'enemy';
            }
        }
        else if(number == 310)
        {
			combat.active = true;
			combat.combatants = activity.characters;
            combat.playerStrikesFirst = false;
            combat.surpriseAdvantage = 'enemy';
        }
        else if(number == 311)
        {            
            var direction;
            var newTilePosition
            do
            {
                isValidDirection = true;
                // 1-N, 2-NE, 3-SE, 4-S, 5-SW, 6-NW
                direction = d6();
                
                // Todo(ian): Test this position generating code.
                var newTilePosition = new v2(playerTilePosition.x, playerTilePosition.y);
                if(direction == 2 || direction == 3)
                {
                    newTilePosition.x++;
                }
                else if(direction == 5 || direction == 6)
                {
                    newTilePosition.x--;
                }
                
                if(direction == 1 ||
                   (playerTilePosition.x % 2 == 0 && (direction == 2 || direction == 6)))
                {
                    newTilePosition.y--;
                }
                else if(direction == 4 ||
                        (playerTilePosition.x % 2 == 1 && (direction == 3 || direction == 5)))
                {
                    newTilePosition.y++;
                }
                // Todo(ian): Prohibit escapes across a river unless you are all on winged mounts.
            } while(!isValidTilePosition(newTilePosition));
            
            playerTilePosition = newTilePosition;
            
			clearActivity();
        }
        else if(number == 325)
        {
            activity.text[activity.text.length] = "Characters lose interest in your party, encounter and event ends now.";
			activity.canEnd = true;
        }
		else if (number == 330)
		{
			/*r330 Battle Reference
			You are forced to fight with the characters encountered, roll two dice and go to the appropriate section: 2(or
			less)-r310; 3-r309; 4-r308; 5-r307; 6-r306; 7-r305; 8-r304;9-r303; 10-r302; 11-r301; 12(or more)-r300.*/
			var check = d6() + d6() - 2;
			var outcomes = [310, 309, 308, 307, 306, 305, 304, 303, 302, 301, 300];
			setEvent('r', outcomes[check]);
		}
		else if (number == 336)
		{
			/*r336 Plead Comrades
			You try to talk the character(s) into joining your party, as they seem sympathetic and interested. Roll one die, if
			your wit & wiles equals or exceeds the roll, they will join as followers; otherwise they leave and the event ends.*/
			activity.text[activity.text.length] = "You try to talk the character(s) into joining your party, as they seem sympathetic and interested.";
			var check = d6();
			if (party[0].witAndWiles >= check)
			{
				activity.text[activity.text.length] = "Wit & Wiles check passed, the characters join your party.";
				activity.canEnd = true;
				for (var characterIndex = 0; characterIndex < activity.characters.length; characterIndex++)
				{
					party[party.length] = activity.characters[characterIndex];
				}
			}
			else
			{
				activity.text[activity.text.length] = "Wit & Wiles check failed, the characters leave.";
				activity.text[activity.text.length] = "Characters lose interest in your party, encounter and event ends now.";
				activity.canEnd = true;
			}
        }
		else if (number == 337)
		{
			/*r337 Plead Comrades
			The character(s) encountered look unsavory, but willing to talk - you try to convince them to join your party. Roll
			one die, if your wit & wiles exceed the roll, they join as followers. Otherwise, roll one die again: 1-r325; 2-r330;
			3-r340; 4,5-r341; 6-r342.*/
			activity.text[activity.text.length] = "The character(s) encountered look unsavory, but willing to talk - you try to convince them to join your party.";
			var check = d6();
			if (party[0].witAndWiles > check)
			{
				activity.text[activity.text.length] = "Wit & Wiles check passed, the characters join your party.";
				activity.canEnd = true;
				for (var characterIndex = 0; characterIndex < activity.characters.length; characterIndex++)
				{
					party[party.length] = activity.characters[characterIndex];
				}
			}
			else
			{
				activity.text[activity.text.length] = "Wit & Wiles check failed.";
				var randomIndex = d6() - 1;
				var options = [325, 330, 340, 341, 341, 342];
				setEvent('r', options[randomIndex]);
			}
		}
		else if (number == 338)
		{			
			/*r338 Convince Hirelings
			Character(s) encountered look dubiously at you, but you try to convince them to join your party as henchmen.
			Roll one die; if your wit & wiles equals or exceeds the die roll, they will join your party as henchmen. You must
			pay them one gold piece per day if your wit & wiles exceed the die roll, or two gold pieces per day if your wit &
			wiles equaled the die roll. Today's pay must be given to each immediately. If more than one is encountered, you
			can hire some instead of all if you desire. Those who are not hired, or if you fail to convince them to join will
			pass by, ending the event.*/
			
			activity.text[activity.text.length] = "Character(s) encountered look dubiously at you, but you try to convince them to join your party as henchmen.";
			var witCheck = d6();
			if (party[0].witAndWiles >= witCheck)
			{
				var hirePrice = 1;
				if (party[0].witAndWiles == witCheck)
				{
					hirePrice = 2;
				}
				hireOption(hirePrice);
			}
			else
			{
				activity.text[activity.text.length] = "Wit & Wiles check failed, the characters leave.";
				activity.canEnd = true;
			}
		}
		else if (number == 339)
		{
			/*r339 Convince Hirelings
			Character(s) encountered look askance at you, and will pass you by (event ends) unless you stop to talk.
			If you stop to talk, you decide you should convince them to join your party as henchmen. Roll one die; if your wit
			& wiles exceeds the die roll, they will join at 2 gold pieces per day, with today's pay due right now. You can hire
			some instead of all if you desire.
			If you stopped to talk, but failed to convince them to join as hirelings, roll one die to determine their attitude:
			1,2,3-r325; 4,5,6-r330.*/
			activity.text[activity.text.length] = 'Character(s) encountered look askance at you, and will pass you by (event ends) unless you stop to talk.';
			addOptionEndActivity('Don\'t stop');
			addOptionEvent('Stop', 'r', 3391);
		}
		else if (number == 3391)
		{
			var check = d6();
			if (party[0].witAndWiles > check)
			{
				hireOption(2);
			}
			else
			{
				var attitudeCheck = d6() - 1;
				var outcomes = [325, 325, 325, 330, 330, 330];
				setEvent('r', outcomes[attitudeCheck]);				
			}
		}
		else if (number == 340)
		{
			/*r340 Looter
			Character(s) encountered look like they are in need of money. You can let them pass (encounter ends) or try to convince them to join you.  If you try to convince them, roll one die. If your wit & wiles equals or exceeds the die roll, they will join your party. They will remain as long as they get an equal share in any new gold you acquire (i.e., each gets as least as much as you). If you deny them their share, it is ^s if you failed to convince them to join, see below. If you fail to convince them to join (or later deny them an equal share in gold) they may become hostile, roll one
			die:
			1,2 They attack you personally in combat (r220), and have the first strike.
			3,4 They attack your party in combat (r220); see r330 for situation.
			5,6 They depart angry, but without fighting, event ends.*/
			activity.text[activity.text.length] = 'Character(s) encountered look like they are in need of money. You can let them pass (encounter ends) or try to convince them to join you.  If you try to convince them, roll one die. If your wit & wiles equals or exceeds the die roll, they will join your party. They will remain as long as they get an equal share in any new gold you acquire (i.e., each gets as least as much as you). If you deny them their share they may become hostile. If you fail to convince them to join (or later deny them an equal share in gold) they may become hostile.';
			addOptionEndActivity('Let them pass');
			addOptionEvent('Try to hire', 'r', 3401);
		}
		else if (number == 3401)
		{
			var witCheck = d6();
			if (party[0].witAndWiles >= witCheck)
			{
				for (var characterIndex = 0; characterIndex < activity.characters.length; chracaterIndex++)
				{
					var charachter = activity.characters[characterIndex];
					character.sharePay = true;
					party[party.length] = character;
				}
			}
			else
			{
				move this to a function and push the characters out of the party into the combat group when calling it for not getting an equal share
				var check = d6();
				if (check <= 2)
				{
					// Todo(ian): Implement them attacking you personally.
					// 1,2 They attack you personally in combat (r220), and have the first strike.
					setEvent('r', 308);
				}
				else if (check <= 4)
				{
					setEvent('r', 330);
				}
				else
				{
					activity.text[activity.text.length] = 'They depart angry, ut without fighting.';
					activity.canEnd = true;
				}
			}
			
			/*r341 Conversation
			In an extended period of talking, you gradually discover the interests and attitudes of the character(s) you
			encountered. This takes a good deal of time, you cannot travel any further today, and any other daily actions
			unfinished cannot be completed either. For the results of the talk, roll two dice
			2 A hired assassin surprises you into combat (r220) and always strikes at you personally.
			3 Bandits, who may surprise you, see r308.
			4 Arrogant and surly, the conversation turns into an argument, r305.
			5
			Character(s) needs 10 gold now, r331; if they join, they will leave your party in a next town,
			castle or temple you enter in any event.
			6 Character(s) ask for 5 gold now and employment, see r332.
			7 Character(s) willing to hire as henchmen, see r333.
			8 Character(s) looking for fun and profit, see r338.
			9 Character(s) fugitive from local justice, see r335.
			10 Character(s) down on luck, looking for a turn in fortunes, see r336.
			11 Character(s) obviously plundering mercenaries, see r340.
			12 Character(s) discover a common cause with you; see r334.*/
			
			/*r342 General Inquiry
			You are unsure of attitudes, and make some general inquiries to determine what these encountered characters
			seem interested in. Roll two dice:
			2 You unwittingly give insult; see r309.
			3 You are forced into combat, unwillingly; see r330.
			4 Character(s) interested in loot, see r340.
			5 Character(s) attempt attack on you, see r306.
			6 Character(s) uninterested in you, see r325.
			7 Character(s) reveal themselves gradually; you can either talk further (see r341) or let them
			pass (see r325).
			8 Character(s) are for hire; see r333.
			9 Character(s) may be for hire, see r339.
			10 Character(s) may be sympathetic to your cause, see r337.
			11 Character(s) uninterested, but may be for hire, see r338.
			12 Character(s) aloof, but might consider joining you, see r336*/
		}
        else
        {
            window.alert("Event not handled " + letter + number);
        }
    }
    else if(letter == 'e')
    {
		if(number == 1)
        {
			activity.active = true;
			activity.canEnd = true;
            activity.text[0] = "Evil events have overtaken your Northlands Kingdom. Your father, the old king, is dead - assassinated by rivals to the throne. These usurpers now hold the palace with their mercenary royal guard. You have escaped, and must collect 500 gold pieces to raise a force to smash them and retake your heritage. Furthermore, the usurpers have powerful friends overseas. If you can't return to take them out in ten weeks, their allies will arm and you will lose your kingdom forever."
            activity.text[1] = "To escape the mercenary and royal guard, your loyal body servant Ogab smuggled you into a merchant caravan to the southern border. Now, at dawn you roll out of the merchant wagons into a ditch, dust off your clothes, loosen your swordbelt, and get ready to start the first day of your adventure."
            activity.text[2] = "Important Note: if you finish actions for a day on any hex north of the Tragoth River, the mercenary royal guardsmen may find you.";
        }
        else if(number == 2)
        {
			var save = d6() - 3;
			addDebugText("Event 002 save " + save);
			if((playerTilePosition.x == 0 && playerTilePosition.y == 0) || (playerTilePosition.x == 14 && playerTilePosition.y == 0))
			{
				save += 1;
				addDebugText("Event 002 save++");
			}
			
			if(save <= 0)
			{
				var numMen = d6();
				if (numMen == 0)
				{
					addDebugText("Diced 0 men");
				}
				else
				{
					for(var i = 0;
						i < numMen;
						i++)
					{
						activity.characters[i] = getCharacter('Mercenary Royal Guardsmen', 5, 4, 4);
					}
					
					activity.active = true;
					activity.text[0] = "Mercenary Royal Guardsmen";
					activity.text[1] = activity.characters.length + " mercenary thugs, dressed by the usurpers as their royal guardsmen, are riding toward you! Each of which has a combat skill 5, endurance 4, wealth 4.";

					addOptionRandomOutcome('Negotiate', [
							['r', 327],
							['r', 328],
							['r', 329],
							['r', 323, 15],
							['r', 323, 25],
							['r', 306]]);
					addOptionRandomOutcome('Evade', [
							['r', 307],
							['r', 306],
							['r', 304],
							['r', 318],
							['r', 311],
							['r', 312],
							['r', 312]]);
					//Todo(ian): If your party all winged mounts, you can use a flying escape r313 instead of rolling for the evade option; if your entire party has mounts, add one (+1) to die roll. You can abandon un-mounted members of the party for this.    
					addOptionRandomOutcome('Fight', [
							['r', 300],
							['r', 301],
							['r', 303],
							['r', 304],
							['r', 305],
							['r', 306]]);
				}
			}
			else
			{
				addDebugText("Event 002 avoided.");
			}
        }
		else if (number == 18)
		{
			//e018 Priest
			activity.active = true;
			activity.characters[0] = getCharacter('Priest', 3, 3, 25);
			// todo(ian): draw the character instead of describing them
			activity.text[0] = "You encounter a local Priest riding on a donkey (equivalent to a horse as a mount), with combat skill 3, endurance 3, wealth 25. He seems aloof and not disposed to conversation, but he may be afraid of you . . .";
							
			/*Todo(ian): Note: if you do fight the Priest in combat, and kill him, roll one die. If a 5 or 6 results, he casts upon you the
			"mark of Cain". You must immediately roll once for each follower in your party, and any time the roll is greater
			than your wit & wiles the follower will immediately desert you. In addition, all Monks and Priests in the future will
			recognize the mark, and will not join your party. You can never attempt an audience (r211) with the high priest
			of any temple marked on the map, but may with high priests of any secret unmarked temples that you find.
			*/
			
			addOptionEndActivity('Let him pass');
			addOptionRandomOutcome('Talk', [
					['r', 336],
					['r', 336],
					['r', 337],
					['r', 341],
					['r', 342],
					['r', 325]
				]);
			addOptionRandomOutcome('Fight'[
					['r', 301],
					['r', 303],
					['r', 304],
					['r', 305],
					['r', 305],
					['r', 306]
				]);
		}
        else
        {
			addDebugText("Event not handled " + letter + number);
        }
    }
}

function hireOption(var hirePrice)
{
	activity.text[activity.text.length] = "The character(s) agree to join your party at a price of " + hirePrice + " gold per day each.  Todays fee must be paid immediately.  How many would you like to hire?";
	
	addOptionEndActivity('None');
	for (var characterIndex = 1; characterIndex <= activity.characters.length; characterIndex++)
	{
		var character = activity.characters[characterIndex];
		character.dailyFee = hirePrice;
		var totalImmediatePrice = hirePrice * characterIndex;
		if (totalImmediatePrice <= gold)
		{
			addOptionHire(characterIndex);
		}
	}
}

ActivityOptionType = {
    Random : 0,
    EndActivity : 1,
	Hire: 2,
	Event: 3
}

function addOptionEndActivity(text)
{
	var option = {};
	option.type = ActivityOptionType.EndActivity;
	option.text = text;
	activity.options[activity.options.length] = option;
}

function addOptionRandomOutcome(text, outcomes)
{
	var option = {};
	option.type = ActivityOptionType.Random;
	option.text = text;
	option.outcomes = outcomes;
	activity.options[activity.options.length] = option;
}

function addOptionHire(numToHire)
{
	var option = {};
	option.type = ActivityOptionType.Hire;
	option.numToHire  = numToHire;
	activity.options[activity.options.length] = option;
}

function addOptionEvent(text, letter, number)
{
	var option = {}
	option.type = ActivityOptionType.Event;
	option.text = text;
	option.letter = letter;
	option.number = number;
	activity.options[activity.options.length] = option;
}



function textStyle(name, size, color)
{
	this.name = name;
	this.size = size;
	this.color = color;
}

function setTextStyle(textStyle)
{
	var newFont = textStyle.size + 'pt ' + textStyle.name;
    context.font = newFont;
    context.fillStyle = textStyle.color;
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
var tildeKeyCode = 96;

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

function v2Equals(one, two)
{
    return one.x == two.x && one.y == two.y;
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

function v2HadamardDivision(one, two)
{
    var result = new v2();
    result.x = one.x / two.x;
    result.y = one.y / two.y;
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

function v2Round(v)
{
    var result = new v2(Math.round(v.x), Math.round(v.y));
    return result;
}

function v2RoundAssign(v)
{
    v.x = Math.round(v.x);
    v.y = Math.round(v.y);
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

function isOasis()
{
	// Note(ian): Add one so we can use the positions as they appear on the map.
	var x = playerTilePosition.x + 1;
	var y = playerTilePosition.y + 1;
	var result = 
		(x == 2  && y == 6) ||
		(x == 16 && y == 7) ||
		(x == 14 && y == 9) ||
		(x == 16 && y == 9);
	return result;
}

function isTown()
{
	// Note(ian): Add one so we can use the positions as they appear on the map.
	var x = playerTilePosition.x + 1;
	var y = playerTilePosition.y + 1;
	var result = 
		(x ==  1 && y == 1) ||
		(x == 15 && y == 1) ||
		(x == 10 && y == 4) ||
		(x ==  1 && y == 9) ||
		(x == 10 && y == 9) ||
		(x == 14 && y == 15) ||
		(x ==  2 && y == 16) ||
		(x ==  9 && y == 16) ||
		(x ==  4 && y == 19) ||
		(x ==  7 && y == 19) ||
		(x == 17 && y == 20) ||
		(x ==  4 && y == 22);
	return result;
}

function isTemple()
{
	// Note(ian): Add one so we can use the positions as they appear on the map.
	var x = playerTilePosition.x + 1;
	var y = playerTilePosition.y + 1;
	var result = 
		(x == 18 && y == 5) ||
		(x == 13 && y == 9) ||
		(x == 7 && y == 11) ||
		(x == 20 && y == 18) ||
		(x == 10 && y == 21);
	return result;
}

function isRuin()
{
	// Note(ian): Add one so we can use the positions as they appear on the map.
	var x = playerTilePosition.x + 1;
	var y = playerTilePosition.y + 1;
	var result = 
		(x ==  9 && y == 1) ||
		(x ==  2 && y == 6) ||
		(x == 20 && y == 9);
	return result;
}

function isCastle()
{
	// Note(ian): Add one so we can use the positions as they appear on the map.
	var x = playerTilePosition.x + 1;
	var y = playerTilePosition.y + 1;
	var result = 
		(x == 12 && y == 12) ||
		(x ==  3 && y == 23) ||
		(x == 19 && y == 23);
	return result;
}

// Note(ian): This is supposed to have a -1 entry so we cheat and push everything up by one.
// -1,3,5,8,11 One wound
// 10,12,13,17 Two wounds
// 14 Three wounds
// 16,18,19 Five wounds
// 20 Six wounds
//               -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
var woundTable = [1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0,  2,  1,  2,  2,  3,  0,  5,  2,  5,  5,  6];


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
