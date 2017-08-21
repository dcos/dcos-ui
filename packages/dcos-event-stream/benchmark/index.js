import MesosEventManager from "../index";

MesosEventManager.stream.subscribe(
  function() {},
  function() {
    console.log("Error");
  },
  function() {
    console.log("Translator onCompleted");
  }
);

process.stdin.resume();
