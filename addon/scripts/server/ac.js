const system = server.registerSystem(0, 0);

/* 

Made by Imrglop

imrglopyt.000webhostapp.com/releases.html

github.com/Imrglop/GCD-AntiCheat

*/

var clipBlocks = [ // Too many clip blocks will lag the server, make sure you only put solid blocks
  "stone",
  //"bedrock", 
  "dirt", 
  "grass", 
  //"quartz_block", 
  "planks", 
  //"wood", 
  //"log", 
  //"concrete", 
  //"stained_hardened_clay"
];

var unbreakable = [
  "invisiblebedrock",
  "end_portal",
  "end_gateway",
  "barrier",
  "bedrock",
  "border_block",
  "structure_block",
  "structure_void",
  "end_portal_frame",
  "light_block",
];  

var illegalItems = [
  "glowingobsidian",
  "end_portal",
  "end_gateway",
  "invisiblebedrock",
  "netherreactor",
  "barrier",
  "structure_block",
  "command_block",
  "structure_void",
  "underwater_torch",
  "lit_furnace",
  "reserved6",
  "info_update",
  "spawn_egg",
  "fire"
]
  
var xrayBlocks = [
  "iron_ore",
  "gold_ore",
  "diamond_ore",
  "lapis_ore",
  "redstone_ore",
  "coal_ore",
  "emerald_ore",
  "quartz_ore",
  "nether_gold_ore",
  "ancient_debris"
]
  
var config = {

  "debugMode":true,
  "kickPlayerOnFlag":true, //whether to kick or respawn a player whenever they get flagged
  "maxCrystals":10, // for anti auto-crystal / crystalaura
  "showHealthOnActionbar":0,

  "maxFlyTime":100, // max semi-ticks to fly before getting kicked
    "flyCheckEnabled": true,

  "maxAPPSExtent":30,
  "maxTimesFlagged":8,
  "automaticBan": true, // automatic ban when they exceed maxtimesflagged amount

  "maxReach":3.5, 
   /* 
   latency cannot be measured, setting max reach to 3 is not recommended
   Reach measurement is not exact 
   */
  
    "maxReachUses":3, // max times they can hit an entity far away before getting flagged

  "maxDPPSExtent":10, // nuker: blocks to break in a single tick
    "NukerAffectedByTPS": true, // Recommended to keep at true

  "sharpnessCheck":true, // check how much damage a player deals
    "maxDamage": 30,

  "movementCheck":true, // anti Speed, Bhop, glide, jetpack, etc
    "allowElytras": true, // allow elytras in the movement check and fly check
    "movementCheckCooldown": 2, // At least 2
    "movementCheckTolerance": 3.04 // How much they can move within a tick (1/20 of a second usually)

}
    
var disconnect = {
  "nuker":"§cYou have been kicked for Cheating-Nuker / Block Cheats. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  //"afk":"You have been idle for more than ${config.maxAfkTimeInTicks/60/20} minutes. §7§oDon't worry, you will not be banned or punished any further§r.",
  "reach":"§cYou have been kicked for Cheating/Reach. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  "fly":"§cYou have been kicked for Cheating/Fly. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  "spawnitem":"§cYou have been kicked for Cheating/Spawning Items. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  "macro":"§cYou have been kicked for Cheating/Killaura or AutoClicker. If you keep doing so, you may get banned.§r If you believe this is an error, contact the server administrators.",
  "adventurebypass":"§cYou have been kicked for Cheating-AdventureBypass / Block Cheats. If you keep doing so, you may get banned. §r If you believe this is an error, contact the server administrators.",
  "crystalaura":"§cYou have been kicked for Cheating / CrystalAura.",
  "toomanypackets":"You are sending too many packets. :("
}

var ServerStats = {
    TPS: 20, // Needed to stop certain false flags just because it's laggy
    MSPT: 50
}

var MSPTTimings = {
    thisTime: Date.now(),
    lastTime: Date.now()
}

system.initialize = function() {
    if (config.debugMode) {
        var scriptLoggerConfig = this.createEventData("minecraft:script_logger_config");
        scriptLoggerConfig.data.log_errors = true;
        scriptLoggerConfig.data.log_information = true;
        scriptLoggerConfig.data.log_warnings = true;
        this.broadcastEvent("minecraft:script_logger_config", scriptLoggerConfig);
        server.log("Debug Mode Enabled");
    }

    function cmdCallback(results) {
        let statusMessage = results.data.statusMessage;
        let subbed = (statusMessage.split(" "));
        if (subbed[0] == undefined) return;
        if (subbed[1] != "0") {
            config.maxFlyTime = Number(subbed[1])
        }
    }

    system.executeCommand("scoreboard players test maxflytime GCD -2147483648", (commandResults) => cmdCallback(commandResults))

    function setShowHealth(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))
        config.showHealthOnActionbar = Number(subbed[1])
    }

    system.executeCommand("scoreboard players test showhealth GCD -2147483648", (commandResults) => setShowHealth(commandResults))

    function maxTimesFlagged(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) != 0) {
            config.maxTimesFlagged = Number(subbed[1])
        }
    }
    }

    system.executeCommand("scoreboard players test maxtimesflagged GCD -2147483648", (commandResults) => maxTimesFlagged(commandResults))

    function maxDPPSExtent(results) {

        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) > 1) {
            config.maxDPPSExtent = Number(subbed[1])
        }
    }
    }
    

    system.executeCommand("scoreboard players test nukertolerance GCD -2147483648", (commandResults) => maxDPPSExtent(commandResults))

    function setKickStatus(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) > 0) {
            config.kickPlayerOnFlag = false
        } else {
            config.kickPlayerOnFlag = true
        }
    }
    }
    

    system.executeCommand("scoreboard players test neverkick GCD -2147483648", (commandResults) => setKickStatus(commandResults))

    function setDebugMode(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) > 0) {
            config.debugMode = true
        } else {
            config.debugMode = false
        }
    }
    }

    system.executeCommand("scoreboard players test debugmode GCD -2147483648", (commandResults) => setDebugMode(commandResults))

    function setMaxCrystals(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) > 1) {
            config.setMaxCrystals = Number(subbed[1])
        }
    }
    }

    system.executeCommand("scoreboard players test maxcrystals GCD -2147483648", (commandResults) => setMaxCrystals(commandResults))

    function setMaxReachTimes(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) > 0) {
            config.maxReachUses = Number(subbed[1])
        }
    }
    }

    system.executeCommand("scoreboard players test maxreachtimes GCD -2147483648", (commandResults) => setMaxReachTimes(commandResults))

    function setMaxDamage(results) {
        let statusMessage = results.data.statusMessage
        let subbed = (statusMessage.split(" "))

        if (Number(subbed[1]) != null) {
        if (Number(subbed[1]) > 0) {
            config.maxDamage = Number(subbed[1])
        }
    }
    }

    system.executeCommand("scoreboard players test maxdamage GCD -2147483648", (commandResults) => setMaxDamage(commandResults))
    
}

var currentTick = 0;

var playerPositions = new Array( /* [array position, object player], ... */ );

// Functions

function authorisePunishment() {
    if (config.kickPlayerOnFlag == true) {
        return true;
    }
    return false;
}

//

function broadcast(text, tag) {
    server.log(`Broadcast: ${text.toString()}`)
    let realTag
    if (tag) {
        realTag = tag
    } else realtag = "GCDAdmin";
    execute(`tellraw @a[tag=${realTag}] {"rawtext":[{"text":"§r§6[GCD]§2 ${text}"}]}`)
}

function arrayContains(array, item) {
    if (array instanceof Array)
        for (let i = 0; i < array.length; i++) {
            if (array[i] == item) {
                return true;
            }
        }
    return false;
}

function PlayerMoveEvent (plr, playerPosition, currentPosition) {
    let tags = system.getComponent(plr, "minecraft:tag");

    if (plr.speedFlagD == undefined) {
        plr.speedFlagD = 0;
        return;
    }

    if (!tags) return;
    if (!arrayContains(tags.data, "GCDAdmin") && plr.hasElytra == false) {
        
        let moveXZ = (Math.abs(playerPosition[0] - currentPosition[0])) + (Math.abs(playerPosition[2] - currentPosition[2]))
        let moveY = (currentPosition[1] - playerPosition[1]);

        /*
        normally: 0.2212...
        sprinting: 0.3825...
        sprint jumping: .. 1.1

        jumping: Y = 0.373...
        flying: Y = 0.375...
        */
        
        if (config.debugMode == true) execute(`title @a actionbar §3XZ:§b ${moveXZ}
        §3Y:§b ${moveY}`)

        let LogicalMovementCheckTolerance = ((config.movementCheckTolerance * 20) / ServerStats.TPS); // Anti false speed flag based on the TPS

        if (moveXZ > LogicalMovementCheckTolerance || moveY > LogicalMovementCheckTolerance) {
            if (moveXZ > 40) {
                // teleported probably
                return;
            }


            let posComponent = system.getComponent(plr, "minecraft:position")

            plr.speedFlagD++;

            if (!(arrayContains(tags.data, "speedFlag")) && plr.speedFlagD >= 2) {
                plr.speedFlagD = 0;
                posComponent.data.x = playerPosition[0] // playerPosition is the past position
                posComponent.data.y = playerPosition[1]
                posComponent.data.z = playerPosition[2]
                system.applyComponentChanges(plr, posComponent); 
                if (system.hasComponent(plr, 'minecraft:nameable')) {
                    let name = system.getComponent(plr, 'minecraft:nameable').data.name
                    broadcast(`Player §e${name}§2 failed §aSpeed§c (Velocity:${moveXZ.toString()}) (Max: ${LogicalMovementCheckTolerance})`, 'speednotify');
                    execute(`tag @a[name="${name}"] add speedFlag`)
                }
            }

            // apply the changes to the player position instead of relying on commands

            //execute(`tp @a[tag=!speedFlag, name="${system.getComponent(plr, "minecraft:nameable").data.name}"] ${playerPosition[0]} ${playerPosition[1]} ${playerPosition[2]}`)
            
        }
        // Is non admin
        //execute(`say ${Math.abs(playerPosition[0] - currentPosition[0])}, ${Math.abs(playerPosition[1] - currentPosition[1])} ${Math.abs(playerPosition[2] - currentPosition[2])}`)
    }
}


function execute(command) {
    system.executeCommand(command, () => {});
}

//

// Listen For Events

system.listenForEvent("minecraft:entity_use_item", function(eventData) {

    if (eventData.data.item_stack.item === "minecraft:end_crystal") {
        let pos = system.getComponent(eventData.data.entity, "minecraft:position").data
        execute(`scoreboard players add @p[x=${pos.x}, y=${pos.y}, z=${pos.z}] crystals 1`)
    }

    let result = false;

    for (let i=0; i<illegalItems.length; i++) {

        if (eventData.data.item_stack.item === "minecraft:"+illegalItems[i]) {
            let pos = system.getComponent(eventData.data.entity, "minecraft:position").data
            execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ clear @p`)
            execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ tell @a[tag=itemcheatnotify] §r@s[r=10000] §eused an illegal item (minecraft:${illegalItems[i]}).§r`)
            execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ scoreboard players add @s timesflagged 1`)
            if (authorisePunishment() == true) {
                execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c] ~ ~ ~ kick @s ${disconnect.spawnitem}`)
            }
            result = true;
        }

        if (result) return;
    }
})

system.listenForEvent("minecraft:entity_hurt", function(eventData) {
    if (!config.sharpnessCheck || !(eventData.data.attacker)) return;
    if (eventData.data.damage)
        if (eventData.data.attacker)
            if (eventData.data.attacker.__identifier__ == "minecraft:player") {
                let maxDmg = config.maxDamage // + system.getComponent(eventData.data.attacker, "minecraft:attack").data.damage;
                let attacker = eventData.data.attacker;
                if (system.hasComponent(attacker, "minecraft:position") && eventData.data.damage > maxDmg) {
                    let pos = system.getComponent(attacker, "minecraft:position").data;
                    execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ scoreboard players add @s[tag=!GCDAdmin] timesflagged 1`)
                    execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ clear @s[tag=!GCDAdmin]`)
                    if (authorisePunishment) execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ kick @s[tag=!GCDAdmin] ${disconnect.spawnitem}`);
                    execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}] ~ ~ ~ tell @a[tag=miscnotify] §r§6[GCD] §a@s[r=222]§r suspicious amount of damage: ${eventData.data.damage}`)
                }
    }
});

system.listenForEvent("minecraft:entity_death", function(eventData) {
    if (eventData.data.entity.__identifier__ == "minecraft:player") {
        let tag = system.getComponent(eventData.data.attacker, "minecraft:tag");
        if (!(arrayContains(tag.data, "speedFlag"))) {
            // does not contain speedflag tag
            tag.data.push("speedFlag"); // stop them from getting flagged by just respawning
            system.applyComponentChanges(plr, tag);
        }
    }
});

//            //
// Reach Check //
//            //

system.listenForEvent("minecraft:entity_created", function(eventData) {
    const {
        data: {
            entity
        }
    } = eventData;
    
    if (entity.__identifier__ === "minecraft:player" && system.hasComponent(entity, "minecraft:position")) {

        if (system.hasComponent(entity, "minecraft:nameable")) {
            if (system.getComponent(entity, "minecraft:nameable").data.name != "") {
                execute(`tag @a add GCD_VERIFY1392`)
                execute(`scoreboard players set @a[scores={reachflags=!0}] reachflags 0`);

                let posObj = system.getComponent(entity, "minecraft:position");
                let posArray = [posObj.data.x, posObj.data.y, posObj.data.z]
                let x = {posArray, entity};
                playerPositions[playerPositions.length] = x;
            }
        }
    
    }

    if (entity.__identifier__ === "gcd:view_server_stats") {
        execute(`tell @a[tag=GCDAdmin] §r${JSON.stringify(ServerStats, null, "    ")}"`);
        system.destroyEntity(entity);
    }

});

system.listenForEvent("minecraft:player_destroyed_block", function(eventData) {

    let pos = system.getComponent(eventData.data.player, "minecraft:position").data;

    let playerName = system.getComponent(eventData.data.player, "minecraft:nameable").data.name;

    execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}, name="${playerName}"] ~ ~ ~ execute @s[tag=!GCDAdmin, m=a] ~ ~ ~ tell @a[tag=miscnotify] §r§6[GCD]§e @s[r=1000]§e was flagged for §cAdventureBypass§e.`);

    execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}, name="${playerName}"] ~ ~ ~ execute @s[tag=!GCDAdmin, m=a] ~ ~ ~ scoreboard players add @s timesflagged 1`);

    if (authorisePunishment) execute(`execute @p[x=${pos.x.toString()}, y=${pos.y.toString()}, z=${pos.z.toString()}, name="${playerName}"] ~ ~ ~ execute @s[tag=!GCDAdmin, m=a] ~ ~ ~ kick @s ${disconnect.adventurebypass}`);

    for (let i = 0; i < xrayBlocks.length; i++) {
        if (eventData.data.block_identifier === "minecraft:"+xrayBlocks[i]) {
            var str = xrayBlocks[i].split("_").join(" ");
            broadcast(`(X-Ray) §e${playerName} §7mined ore §e${str}§7.`, `xraynotify`);
        }
    }

    let blockpos = eventData.data.block_position;
    
    for (let i = 0; i < unbreakable.length; i++) {
        if (eventData.data.block_identifier === "minecraft:"+unbreakable[i]) {
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ tell @a[tag=instabreaknotify] §r§6[GCD]§a@s[tag=!GCDAdmin] §cwas flagged for Survival Block Cheats, breaking §e${eventData.data.block_identifier}§c.`)
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ kill`)
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ scoreboard players add @s timesflagged 1`)
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ tellraw @s {"rawtext":[{"text":"§cYou have been flagged for Block Cheats / InstaBreak.§r"}]}`)
        }
    }

 
    let distX = (Math.abs(pos.x - blockpos.x))
    let distY = (Math.abs(pos.y - blockpos.y))
    let distZ = (Math.abs(pos.z - blockpos.z))

    let maxblockreach = 6.5

    // InfiniteBlockReach

    if (distX >= maxblockreach || distY >= maxblockreach || distZ >= maxblockreach) {
        execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[m=s, tag=!GCDAdmin] ~ ~ ~ tell @a[tag=blockreachnotify] §r§6[GCD]§e @s[tag=!GCDAdmin] §cwas flagged for Survival Block Reach, reaching ${distX.toString()} x ${distY.toString()} y ${distZ.toString()} z blocks.`)
        execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ scoreboard players add @s[m=s, tag=!GCDAdmin] timesflagged 1`)
    }
    
    execute(`scoreboard players add @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] DPPS 1`)
    
});

system.listenForEvent("minecraft:player_attacked_entity", function(eventData) {

        let attacked = eventData.data.attacked_entity;

        let player = eventData.data.player;

        if (!system.hasComponent(attacked, "minecraft:health")) return;
        if (!system.hasComponent(attacked, "minecraft:position")) return;
        if (!system.hasComponent(attacked, "minecraft:collision_box")) return;

        let attackedpos = system.getComponent(attacked, "minecraft:position").data;

        let attackerpos = system.getComponent(eventData.data.player, "minecraft:position").data;
		
        let attackedhealth = system.getComponent(attacked, "minecraft:health").data;
		
    if (attackedpos != undefined) {
        let hitbox = [0.0, 0.0]; // width x height
            if (system.hasComponent(attacked, "minecraft:collision_box")) { // does entity have a collision box component?
                let hitboxC = system.getComponent(attacked, "minecraft:collision_box");
                hitbox[0] = hitboxC.data.width;
                hitbox[1] = hitboxC.data.height;
            } else return; // if not, don't run this code
            
            let distX = Math.abs(attackedpos.x - attackerpos.x) - hitbox[0]; // width hitbox is subtracted from it

            let distY = Math.abs(attackedpos.y - attackerpos.y) - hitbox[1]; // remove height hitbox

            let distZ = Math.abs(attackedpos.z - attackerpos.z) - hitbox[0];

            if (distX < 0) distX = 0;
            if (distY < 0) distY = 0;
            if (distZ < 0) distZ = 0;

            let distall = ((distX + distZ) / 2) - hitbox[0] // get the more "rounded" version of the range

            if (distall < 0) distall = 0;

        

        if (attackedhealth.value != undefined) {

            if (config.showHealthOnActionbar == 1) {

                execute(`title @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] actionbar §cHealth: ${(attackedhealth.value).toString()} / ${attackedhealth.max}`);

            }
        }

        execute(`scoreboard players add @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] APPS 1`)
        
            if (config.debugMode) {
            
                execute(`title @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] actionbar reach: ${distX.toString()} ${distY.toString()} ${distZ.toString()}}`)

            }

            if (distX >= config.maxReach || distZ >= config.maxReach || distall >= config.maxReach - 0.5) {

                let nameable = system.getComponent(player, "minecraft:nameable").data.name;

                // Patch to fix creative mode and admin flagging

                execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ scoreboard players add @s[tag=!GCDAdmin, m=!c, name="${nameable}"] reachflags 1`);

                execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}", scores={reachflags=${config.maxReachUses.toString()}..}] ~ ~ ~ tell @a[tag=reachnotify] §r@s[r=10000]§c failed Reach (x ${distX.toString().substring(0, 3)} y ${distY.toString().substring(0, 3)} z ${distZ.toString().substring(0, 3)} xz: ${distall.toString().substring(0, 3)})§r`)

                execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}", scores={reachflags=${config.maxReachUses.toString()}..}] ~ ~ ~ scoreboard players add @s timesflagged 1`)
                
                if (authorisePunishment() == true) {

                    execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}", scores={reachflags=${config.maxReachUses.toString()}..}] ~ ~ ~ tellraw @s {"rawtext":[{"text":"§cYou have been flagged for Cheating.§r"}]}`)

                    execute(`execute @p[x=${(attackerpos.x).toString()}, y=${(attackerpos.y).toString()}, z=${(attackerpos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin, m=!c, name="${nameable}", scores={reachflags=${config.maxReachUses.toString()}..}] ~ ~ ~ kill @s`)
                
                }
            }

        }
    

})

system.listenForEvent("minecraft:block_destruction_stopped", function(eventData) {

        let pos = system.getComponent(eventData.data.player, "minecraft:position").data;
    
        let blockpos = eventData.data.block_position;

        let distX = (Math.abs(pos.x - blockpos.x))
        
        let distY = (Math.abs(pos.y - blockpos.y))
        
        let distZ = (Math.abs(pos.z - blockpos.z))

        let distall = (distX + distZ) / 2
    
        let maxblockreach = 15
    
        // InfiniteBlockReach Check 2 //
    
        if (distX >= maxblockreach || distY >= maxblockreach || distZ >= maxblockreach || distall >= maxblockreach) {
            execute(`execute @p[x=${(pos.x).toString()}, y=${(pos.y).toString()}, z=${(pos.z).toString()}] ~ ~ ~ execute @s[tag=!GCDAdmin] ~ ~ ~ tell @a[tag=blockreachnotify] §r§6[GCD]§e @s[tag=!GCDAdmin] §cfailed InfiniteBlockReach, reaching ${distX.toString().substring(0, 3)} x ${distY.toString().substring(0, 3)} y ${distZ.toString().substring(0, 3)} z blocks.`)
        }
});

system.update = function() {

    //bookmark:update

    MSPTTimings.thisTime = Date.now();

    ServerStats.MSPT = MSPTTimings.thisTime - MSPTTimings.lastTime;

    ServerStats.TPS = (Number((1000/ServerStats.MSPT).toFixed(1)));

    if (currentTick === 0) {
        execute(`function gcd/setup`)
    }
    
    if (currentTick % 2 == 0) {

        execute(`scoreboard players set @a[scores={crystals=${config.maxCrystals.toString()}..}] crystals -5`)

        if (authorisePunishment) {
            //system.executeCommand(`testfor @a[scores={crystals=${config.maxCrystals.toString()}..}]`, (cc) => {if (cc.data.victims) {
                execute(`kick @a[scores={crystals=-5}] ${disconnect.crystalaura}`);
                
            //}})
        }

        execute(`scoreboard players add @a[scores={crystals=-5}] timesflagged 1`);
        execute(`scoreboard players set @a[scores={crystals=-5}] crystals 0`)

        execute(`scoreboard players remove @a[scores={crystals=2..}] crystals 2`);
    }

    // FLIGHT
    if (config.flyCheckEnabled && currentTick % 5 === 0) {


        execute(`execute @a[scores={flytime=${config.maxFlyTime}..}, tag=!GCDAdmin, m=!c] ~ ~ ~ tell @a[tag=flynotify] §r§6[GCD] §a@s[tag=!GCDAdmin] was flagged for flight, they have been kicked.`)

        execute(`scoreboard players set @a[scores={flytime=${config.maxFlyTime}..}, tag=!GCDAdmin, m=!c] flytime -333`)

        execute(`scoreboard players add @a[scores={flytime=-333}, tag=!GCDAdmin, m=!c] timesflagged 1`)

        if (authorisePunishment() == true) {

            execute(`kick @a[scores={flytime=-333}, tag=!GCDAdmin, m=!c] ${disconnect.fly}`)
        
        }

        execute(`execute @a[scores={flytime=${config.maxFlyTime}..}, tag=!GCDAdmin] ~ ~ ~ tell @a[tag=flynotify] §r§6[GCD] §a@s[tag=!GCDAdmin] was flagged for flight, they have been kicked.`)

        execute(`scoreboard players set @a[scores={flytime=${config.maxFlyTime}..}, tag=!GCDAdmin] flytime -333`)

        execute(`scoreboard players add @a[scores={flytime=-333}, tag=!GCDAdmin] timesflagged 1`)


    }

    execute(`scoreboard players add @a timesflagged 0`)

    execute(`scoreboard players add @a flytime 0`)

    if (currentTick % config.movementCheckCooldown === 0) {
        execute(`tag @a remove speedFlag`);

        for (i in playerPositions) {
            const obj = playerPositions[i];
            if (!(obj.entity)) {
                delete playerPositions[i];
                delete obj;
                return;
            }
            if (!(system.isValidEntity(obj.entity))) {
                delete playerPositions[i];
                delete obj;
                return;
            }

            let plr = obj.entity;

            if (config.allowElytras) {

                let armor_container = system.getComponent(plr, "minecraft:armor_container")
                if (armor_container == undefined) return;
                let hand_container = system.getComponent(plr, "minecraft:hand_container").data[0];
                if (!hand_container) return;
                if (!(system.hasComponent(plr, "minecraft:tag"))) return;
                let tagComponent = system.getComponent(plr, "minecraft:tag");

                if (armor_container.data[1].item !== "minecraft:elytra") {
                    plr.hasElytra = false;
                    if (arrayContains(tagComponent.data, "hasElytra")) {
                        execute(`tag ${system.getComponent(plr, "minecraft:nameable").data.name}")} remove hasElytra`);
                    }
                }

                else if (armor_container.data[1].item === "minecraft:elytra" && hand_container.item === "minecraft:fireworks") {
                    // if they have an elytra give them a tag and set a boolean value that they do have an elytra
                    plr.hasElytra = true;
                    if (!arrayContains(tagComponent.data, "hasElytra")) {
                        tagComponent.data[tagComponent.data.length] = "hasElytra";
                        system.applyComponentChanges(plr, tagComponent);
                    }
                }

            }

        }
    }

    if (currentTick % 20 === 0) {
        execute(`execute @a[scores={flytime=${Math.floor(config.maxFlyTime*0.35).toString()}..}, tag=!GCDAdmin, m=!c] ~ ~ ~ execute @s ~ ~ ~ detect ~-1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~ air 0 execute @s ~ ~-1 ~ detect ~1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~ air 0 execute @s ~ ~ ~ detect ~ ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~ air 0 tell @a[tag=flynotify] §r§6[GCD]§e @s[r=20000]§c is possibly flying.§r`)
        execute(`execute @a[scores={flytime=${Math.floor(config.maxFlyTime*0.35).toString()}..}, tag=!GCDAdmin, m=!c] ~ ~ ~ execute @s ~ ~ ~ detect ~-1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~ air 0 execute @s ~ ~-1 ~ detect ~1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~ air 0 execute @s ~ ~ ~ detect ~ ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~ air 0 effect @s instant_damage 1 0`)
        execute(`execute @a[scores={flytime=${Math.floor(config.maxFlyTime*0.35).toString()}..}, tag=!GCDAdmin, m=!c] ~ ~ ~ execute @s ~ ~ ~ detect ~-1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~ air 0 execute @s ~ ~-1 ~ detect ~1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~ air 0 execute @s ~ ~ ~ detect ~ ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~ air 0 spreadplayers ~ ~ 0 1 @s`)
    }

   if (currentTick % 8 === 0) {
        execute(`scoreboard players remove @a[scores={flytime=1..}] flytime 1`)
    } else if (currentTick % 2 === 0) {
        let KATolerance = ((config.maxAPPSExtent * 20) / ServerStats.TPS)
        execute(`scoreboard players remove @a[scores={APPS=1..}] APPS 1`)
        execute(`scoreboard players add @a[scores={APPS=..-1}] APPS 1`)
        execute(`execute @a[scores={APPS=${Math.floor(KATolerance)}}..},tag=!GCDAdmin] ~ ~ ~ tell @a[tag=killauranotify] §r§e @s §cwas flagged for Killaura.§r`)
        execute(`scoreboard players set @a[scores={APPS=${Math.floor(KATolerance)}..},tag=!GCDAdmin] APPS -5`)
        execute(`scoreboard players add @a[scores={APPS=-5},tag=!GCDAdmin] timesflagged 1`)

        // NUKER
        let MaxNukerValueExtent
        if (config.NukerAffectedByTPS == true) {
            MaxNukerValueExtent = Math.floor((config.maxDPPSExtent / 20) * ServerStats.TPS);
        } else {
            MaxNukerValueExtent = config.maxDPPSExtent;
        }

        execute(`execute @a[scores={DPPS=${MaxNukerValueExtent}..}, tag=!GCDAdmin] ~ ~ ~ execute @s ~ ~ ~ tell @a[tag=nukernotify] §r§e @s §cwas flagged for Nuker.§r`)
        execute(`scoreboard players set @a[scores={DPPS=${MaxNukerValueExtent}..}, tag=!GCDAdmin], tag=!GCDAdmin] DPPS -5`)
        execute(`scoreboard players add @a[scores={DPPS=${MaxNukerValueExtent}..}] timesflagged 1`)

        //

        if (config.flyCheckEnabled)
            execute(`execute @e[type=player, tag=!GCDAdmin, m=!c, tag=!hasElytra] ~ ~ ~ detect ~ ~-2 ~ air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~ air 0 execute @s ~ ~-1 ~ detect ~1 ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~ air 0 execute @s ~ ~ ~ detect ~ ~-1 ~1 air 0 execute @s ~ ~ ~ detect ~-1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~1 ~-1 ~-1 air 0 execute @s ~ ~ ~ detect ~ ~-1 ~ air 0 scoreboard players add @s flytime 1`)

        execute(`tell @a[tag=GCDConfig] §r§fGCD Config (/function gcd/help): §a${JSON.stringify(config, null, " ")})`);   

        execute(`tag @a remove GCDConfig`);
    }

    // KILLAURA

    if (authorisePunishment() == true) {
        execute(`kick @a[scores={APPS=-5},tag=!GCDAdmin] ${disconnect.macro}`)
        if (config.NukerAffectedByTPS)
            execute(`kick @a[scores={DPPS=${config.maxDPPSExtent.toString()}..}, tag=!GCDAdmin] ${disconnect.nuker}`)
        else
            execute(`kick @a[scores={DPPS=${Math.floor((config.maxDPPSExtent / 20) * ServerStats.TPS)}..}, tag=!GCDAdmin] ${disconnect.nuker}`);
    }

    //

    

    if (currentTick === 20) {
        execute('tellraw @a[tag=GCDAdmin] {"rawtext":[{"text":"[GCD] by Imrglop loaded. Do §3/function gcd/help§r for commands."}]}');
        broadcast(`GCD Config: ${JSON.stringify(JSON.stringify(config, null, " "))}`, "GCDAdmin")
    }

    execute("scoreboard players add @a[scores={flytime=..-2}] flytime 2");
    execute("scoreboard players add @a[scores={flytime=..-1}] flytime 1");

    currentTick ++;

    //TimesFlagged Kick

    if (config.maxTimesFlagged)
        execute(`kick @a[scores={timesflagged=${config.maxTimesFlagged.toString()}..}, tag=!GCDAdmin] §4You have been permanently banned for §cCheating§4. Please contact the server administrators to appeal or if you think this is an error.§r`)
    
    execute(`scoreboard players reset @a DPPS`)

    //execute(`scoreboard players remove @a[scores={crystals=2..}] crystals 1`)

    execute(`kick @a[tag=GCDBanned] §cYou have been banned from the server.§r`)

    if (config.movementCheck)
        for (i in playerPositions) {
            const obj = playerPositions[i];
            if (!(obj.entity)) {
                delete playerPositions[i];
                delete obj;
                return;
            }
            if (!(system.isValidEntity(obj.entity))) {
                delete playerPositions[i];
                delete obj;
                return;
            }

            const plrPosComponent = system.getComponent(obj.entity, "minecraft:position");

            if (!plrPosComponent) return;
            
            const plrPosition = plrPosComponent.data;

            let pastPos = obj.posArray;
            
            let thisPos = [plrPosition.x, plrPosition.y, plrPosition.z]

            if (thisPos[0] != pastPos[0] || thisPos[1] != pastPos[1] || thisPos[2] != pastPos[2]) {

                PlayerMoveEvent(obj.entity, pastPos, thisPos);

            }

            obj.posArray = thisPos;

        }
    MSPTTimings.lastTime = Date.now();
}

system.shutdown = function() {
    server.log(`[GCD] Shutting down AC..`);
}

server.log("[GCD] by Imrglop loaded.");

// by Imrglop
