const mod = new Creep.Behaviour('remoteWorker');
module.exports = mod;
const super_run = mod.run;
mod.run = function(creep) {
    if (!Creep.action.avoiding.run(creep)) {
        super_run.call(this, creep);
    }
};
mod.inflowActions = (creep) => {
    return [
        Creep.action.picking,
        Creep.action.uncharging,
        Creep.action.withdrawing,
        Creep.action.harvesting
    ];
};
mod.outflowActions = (creep) => {
    return [
        Creep.action.repairing,
        Creep.action.building,
        Creep.action.recycling
    ];
};
mod.nextAction = function(creep) {
    const flag = creep.data.destiny && Game.flags[creep.data.destiny.targetName];
    if (!flag && (!creep.action || creep.action.name !== 'recycling')) {
        return this.assignAction(creep, 'recycling');
    } else if (creep.data.destiny.room === creep.pos.roomName) { // at target room
        if (creep.sum < creep.carryCapacity * 0.8) {
            // get some energy
            return this.selectInflowAction(creep);
        } else {
            return this.selectAction(creep, this.outflowActions(creep));
        }
    } else { // not at target room
        return this.gotoTargetRoom(creep);
    }
};
mod.gotoTargetRoom = function(creep) {
    const targetFlag = creep.data.destiny ? Game.flags[creep.data.destiny.targetName] : null;
    if (targetFlag) return Creep.action.travelling.assignRoom(creep, targetFlag.pos.roomName);
};
