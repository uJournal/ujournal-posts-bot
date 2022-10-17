const { main } = require("./main");

try {
  main();
} catch (error) {
  console.log("error", error);
}
