const getFixtureResponses = (methodFixtureMap, fixtureResponses) =>
  Object.keys(methodFixtureMap).reduce((acc, curr) => {
    const index = Object.keys(methodFixtureMap).indexOf(curr);
    acc[curr] = {
      event: "success",
      success: { response: fixtureResponses[index] },
    };

    return acc;
  }, {});

export default getFixtureResponses;
