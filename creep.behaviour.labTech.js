const mod = new Creep.Behaviour('labTech');
module.exports = mod;
mod.inflowActions = (creep) => {
    return [
        Creep.action.reallocating,
        Creep.action.uncharging,
        Creep.action.picking,
        Creep.action.withdrawing
    ];
};
mod.outflowActions = (creep) => {
    let priority = [
        Creep.action.charging,
        Creep.action.feeding,
        Creep.action.fueling,
        Creep.action.storing
    ];
    if ( creep.sum > creep.carry.energy ||
            ( !creep.room.situation.invasion &&
                global.SPAWN_DEFENSE_ON_ATTACK && creep.room.conserveForDefense && creep.room.relativeEnergyAvailable > 0.8)) {
        priority.unshift(Creep.action.storing);
    }
    if (creep.room.structures.urgentRepairable.length > 0 ) {
        priority.unshift(Creep.action.fueling);
    }
    return priority;
};
const super_nextAction = mod.nextAction;
mod.nextAction = function(creep) {
    if( creep.pos.roomName != creep.data.homeRoom && Game.rooms[creep.data.homeRoom] && Game.rooms[creep.data.homeRoom].controller ) {
        return Creep.action.travelling.assignRoom(creep, creep.data.homeRoom);
    }
    return super_nextAction(creep);
};
