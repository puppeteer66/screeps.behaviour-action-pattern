const mod = new Creep.Behaviour('recycler');
module.exports = mod;
const super_invalidAction = mod.invalidAction;
mod.invalidAction = function(creep) {
    if (super_invalidAction(creep) || creep.action.name !== recycling) {
        delete creep.data.targetId;
        delete creep.data.path;
        return true;
    }
    return false;
};
mod.nextAction = function(creep) {
    this.assignAction(creep, 'recycling');
};
