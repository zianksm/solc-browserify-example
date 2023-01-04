import React, { useEffect, useState } from "react";
import "./App.css";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "./prism.css";
import { Solc, CompilerOutput } from "solc-browserify";
import "@fontsource/roboto-mono"; // Defaults to weight 400.
// TODO finish compiler logic and add card to show & copy abi, bytecode

function App() {
  Prism.manual = true;
  const [code, setCode] = React.useState(
    `\n// SPDX-License-Identifier: MIT

//Tell the Solidity compiler what version to use
pragma solidity ^0.8.0;

//Declares a new contract
contract SimpleStorage {
    //Storage. Persists in between transactions
    uint x;

    //Allows the unsigned integer stored to be changed
    function set(uint newValue) public {
        x = newValue;
    }
    
    //Returns the currently stored unsigned integer
    function get() public view returns (uint) {
        return x;
    }
}`
  );

  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [terminalValue, setTerminalValue] = useState<string>();
  const [compiler, setCompiler] = useState<Solc>();
  const [isCompiling, setCompilingStatus] = useState<boolean>();
  const [output, setOutput] = useState<CompilerOutput>();

  const _highlight = (code: string) => {
    const html = Prism.highlight(code, Prism.languages.js, "js");
    return html;
  };

  const handleCompilerOutput = (_output: CompilerOutput) => {
    console.log(_output);
    const errors = _output.errors ?? [];

    let erorrLen = 0;
    let warningLen = 0;
    const errorLenToken = "$errors";
    const warningToken = "$warnings";

    let msg = `\ncompiled with ${errorLenToken} errors and ${warningToken} warnings :`;

    for (const error of errors) {
      if (error.severity === "warning") {
        warningLen++;
      }

      if (error.severity === "error") {
        erorrLen++;
      }

      msg = msg.concat("\n", error.formattedMessage);
    }

    msg = msg.replace(errorLenToken, erorrLen.toString());
    msg = msg.replace(warningToken, warningLen.toString());

    setTerminalValue((prev) => prev?.concat(msg));
  };

  const compile = async () => {
    if (isCompiling && !isInitialized) {
      return;
    }

    setTerminalValue((prev) => prev?.concat("\ncompiling..."));
    setCompilingStatus(true);
    const compilerOutput = await compiler?.compile(code);
    console.log(compilerOutput);
    setOutput(compilerOutput);
    setCompilingStatus(false);
    handleCompilerOutput(compilerOutput as CompilerOutput);
  };

  useEffect(() => {
    setTerminalValue("fetching compiler binary...");

    const compiler = new Solc((solc) => {
      setCompiler(solc);
      setIsInitialized(true);
      setTerminalValue((prev) => prev?.concat("\ncompiler initialized"));
    });
  }, []);

  return (
    <div id="container-main">
      <h1 className="sentence" id="headline">
        Solc In the Broswer!
      </h1>
      <div id="code-container">
        <h3 className="sentence" id="depedencies-disclaimer">
          *support openzeppelin depedencies(wip)
        </h3>
        <div id="editor">
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
          <textarea
            readOnly={true}
            id="terminal"
            className="code-style-container"
            value={terminalValue}
          ></textarea>
        </div>
      </div>
      <button onClick={compile} id="button-compile">
        compile
      </button>
    </div>
  );
}

export default App;
