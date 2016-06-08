// This is a nascent testing/development framework, to facilitate testing things 
// inside Snap.
// The idea is to add all new intermediate data items or functions as member of
// the global ZBlocks object, one at a time. Basically - one property for
// every "line" of a traditional program.
// That property will come with a description and with tests.
// The tests can then be aggregated into a list of booleans, and we can use the
// `all` operator inside Snap to verify that everything works.

// Define one global variable with an `addProp` method.
if (!window.ZBlocks) window.ZBlocks = { 
  name: 'ZBlocks', 
  addProp: prop => {
    const name = prop.name;
    // If I accidentally try to reuse the same property name
    if (ZBlocks[name]) throw Error(
      `ZBlocks error: ${name} is already defined`);
    ZBlocks[name] = prop;
    return true;
  }
};




// A programming method/property

ZBlocks.addProp({
  name: 'coolFunction',
  value: '...',
  desc: '',
  longDesc: '',
  test: ()=> {
    // Test ZBlocks[name] here
    return true;  // success
  }
});
