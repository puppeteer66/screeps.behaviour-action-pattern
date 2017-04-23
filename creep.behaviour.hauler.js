const mod = new Creep.Behaviour('hauler');
module.exports = mod;
mod.inflowActions = (creep) => {
    return [
        Creep.action.uncharging,
        Creep.action.picking,
        Creep.action.withdrawing,
        Creep.action.reallocating
    ];
};
mod.outflowActions = (creep) => {
    let priority = [
        Creep.action.feeding,
        Creep.action.charging,
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
mod.needEnergy = (creep) => creep.sum < creep.carryCapacity / 2;
mod.nextAction = function(creep){
    if( creep.pos.roomName != creep.data.homeRoom && Game.rooms[creep.data.homeRoom] && Game.rooms[creep.data.homeRoom].controller ) {
        Creep.action.travelling.assignRoom(creep, creep.data.homeRoom);
        return;
    }
    if (this.needEnergy(creep))
        return this.selectInflowAction(creep);
    else
        return this.selectAction(creep, this.outflowActions(creep));
};
mod.strategies.picking = {
    name: `picking-${mod.name}`,
    energyOnly: false
};
