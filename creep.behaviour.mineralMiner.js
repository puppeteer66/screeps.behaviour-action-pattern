const mod = new Creep.Behaviour('mineralMiner');
module.exports = mod;
mod.determineTarget = creep => {
    let notDeterminated = source => {
        let hasThisSource = data => data.determinatedTarget === source.id;
        let existingBranding = _.find(Memory.population, hasThisSource);
        return !existingBranding;
    };
    const source = _.find(creep.room.minerals, notDeterminated);
    if( source ) {
        creep.data.determinatedTarget = source.id;
    }
    if( SAY_ASSIGNMENT ) creep.say(String.fromCharCode(9935), SAY_PUBLIC);
};
const super_run = Creep.behaviour.miner.run;
mod.run = function(creep) {
    return super_run(creep, {determineTarget: mod.determineTarget});
};
