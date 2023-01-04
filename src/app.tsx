import React from "react";
import "./App.css";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "./prism.css";
// TODO build simple editor with syntax highlighting.

function App() {
  Prism.manual = true;
  const [code, setCode] = React.useState(
    `\n//Tell the Solidity compiler what version to use
pragma solidity ^0.4.8;

//Declares a new contract
contract SimpleStorage {
    //Storage. Persists in between transactions
    uint x;

    //Allows the unsigned integer stored to be changed
    function set(uint newValue) {
        x = newValue;
    }
    
    //Returns the currently stored unsigned integer
    function get() returns (uint) {
        return x;
    }
}`
  );

  const _highlight = (code: string) => {
    const html = Prism.highlight(code, Prism.languages.js, "js");
    Prism.highlightAll();
    return html;
  };
  return (
    <div id="container-main">
      <h1 id="headline">Solc In the Broswer!</h1>
      <div id="code-container">
        <h3 id="depedencies-disclaimer">
          *support openzeppelin depedencies(wip)
        </h3>
        <Editor
          className="code-style-container"
          id="text-code"
          highlight={(code) => _highlight(code)}
          value={code}
          onValueChange={(code) => setCode(code)}
          tabSize={4}
          preClassName="language-solidity"
          padding={10}
          style={{
            fontFamily: '"Fira code", "Fira Mono", monospace',
            fontSize: 12,
          }}
        ></Editor>
      </div>
      <button id="button-compile">compile</button>
    </div>
  );
}

export default App;
