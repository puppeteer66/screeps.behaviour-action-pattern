// base class for behaviours
const Behaviour = function(name) {
    this.name = name;
    this.actions = (creep) => []; // priority list of non resource based actions
    this.inflowActions = (creep) => []; // priority list of actions for getting resources
    this.outflowActions = (creep) => []; // priority list of actions for using resources
    this.assignAction = function(creep, action, assign, debouncePriority) {
        const valid = action.isValidAction(creep);
        if (global.DEBUG && global.TRACE) trace('Action', {actionName:action.name, behaviourName:this.name, creepName:creep.name, valid, Action:'isValidAction'});
        if (!valid) return false;

        const addable = action.isAddableAction(creep);
        if (global.DEBUG && global.TRACE) trace('Action', {actionName:action.name, behaviourName:this.name, creepName:creep.name, addable, Action:'isAddableAction'});
        if (!addable) return false;

        const assigned = a.assignDebounce ? a.assignDebounce(creep, debouncePriority) : a.assign(creep);
        if (assigned) {
            if (global.DEBUG && global.TRACE) trace(assigned ? 'Behaviour' : 'Action', {actionName:action.name, behaviourName:this.name, reepName:creep.name, assigned, Behaviour:'nextAction', Action:'assign'});
            creep.data.lastAction = action.name;
            creep.data.lastTarget = creep.target.id;
            return true;
        }
        return false;
    };

    this.selectInflowAction = function(creep) {
        const actionChecked = {};
        for (const action of this.inflowActions(creep)) {
            if (!actionChecked[action.name]) {
                actionChecked[action.name] = true;
                if (this.assignAction(creep, action, this.outflowActions(creep))) return;
            }
        }
        return Creep.action.idle.assign(creep);
    };
    this.selectAction = function(creep, actions) {
        const actionChecked = {};
        for (const action of actions) {
            if (!actionChecked[action.name]) {
                actionChecked[action.name] = true;
                if (this.assignAction(creep, action)) return;
            }
        }
        return Creep.action.idle.assign(creep);
    };
    this.nextAction = function(creep) {
        return this.selectAction(creep, this.actions(creep));
    };
    this.invalidAction = function(creep) {
        return !creep.action || creep.action.name === 'idle';
    };
    this.run = function(creep) {
        // Assign next Action
        if (invalidAction(creep)) {
            if (creep.data.destiny && creep.data.destiny.task && Task[creep.data.destiny.task] && Task[creep.data.destiny.task].nextAction) {
                Task[creep.data.destiny.task].nextAction(creep);
            }
            else {
                this.nextAction(creep);
            }
        }
        
        // Do some work
        if (creep.action && creep.target) {
            creep.action.step(creep);
        } else {
            logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
        }
    };
};
module.exports = Behaviour;