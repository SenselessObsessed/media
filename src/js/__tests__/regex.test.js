test("should be a true", () => {
  const testCaseOne = /^-?\d{1,2}\.\d{5}, ?-?\d{1,2}\.\d{5}$/gm.test(
    "51.50851, -0.12572",
  );
  const testCaseTwo = /^-?\d{1,2}\.\d{5}, ?-?\d{1,2}\.\d{5}$/gm.test(
    "51.50851,-0.12572",
  );

  const testCaseThree = /^\[-?\d{1,2}\.\d{5}, ?-?\d{1,2}\.\d{5}\]$/gm.test(
    "[51.50851, -0.12572]",
  );

  expect(testCaseOne).toBeTruthy();
  expect(testCaseTwo).toBeTruthy();
  expect(testCaseThree).toBeTruthy();
});

test("should be a false", () => {
  const testCaseOne = /^-?\d{1,2}\.\d{5}, ?-?\d{1,2}\.\d{5}$/gm.test(
    "51.50851 -0.1257",
  );
  const testCaseTwo = /^-?\d{1,2}\.\d{5}, ?-?\d{1,2}\.\d{5}$/gm.test(
    "5,-0.12572",
  );

  const testCaseThree = /^\[-?\d{1,2}\.\d{5}, ?-?\d{1,2}\.\d{5}\]$/gm.test(
    "51.50851, -0.12572]",
  );

  expect(testCaseOne).toBeFalsy();
  expect(testCaseTwo).toBeFalsy();
  expect(testCaseThree).toBeFalsy();
});
