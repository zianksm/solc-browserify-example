import React, { useEffect, useRef, useState } from "react";
import "./App.css";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import "./prism.css";
import { Solc, CompilerOutput } from "solc-browserify";
import "@fontsource/roboto-mono"; // Defaults to weight 400.
import { Button } from "./button";
// TODO finish compiler logic and add card to show & copy abi, bytecode

const contractToken = "Compiled_Contracts";

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

  const logRef = useRef<any>();
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [terminalValue, setTerminalValue] = useState<string>("");
  const [compiler, setCompiler] = useState<Solc>();
  const [isCompiling, setCompilingStatus] = useState<boolean>();
  const [output, setOutput] = useState<CompilerOutput>();

  const _highlight = (code: string) => {
    const html = Prism.highlight(code, Prism.languages.js, "js");
    return html;
  };

  const handleCompilerOutput = (_output: CompilerOutput) => {
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
    if (isCompiling || !isInitialized) {
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
    setTerminalValue((prev) => prev.concat("\nfetching compiler binary..."));

    const compiler = new Solc((solc) => {
      setCompiler(solc);
      setIsInitialized(true);
      setTerminalValue((prev) => prev?.concat("\ncompiler initialized"));
    });
  }, []);

  useEffect(() => {
    logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [terminalValue]);

  const handleTerminalClear = () => {
    setTerminalValue("");
  };

  const handleEditorClear = () => {
    setCode("");
  };

  const handleAbI = () => {
    const contracts = output?.contracts[contractToken];
    const separator = "--------------------";

    let abi = "";

    for (const i in contracts) {
      abi = abi.concat(
        separator,
        " ",
        i,
        " v \n\n",

        JSON.stringify(contracts[i].abi, undefined, 2),
        "\n\n"
      );
    }
    setTerminalValue(abi);
  };

  return (
    <div id="container-main">
      <h1 className="sentence" id="headline">
        Solc In the Broswer!
      </h1>
      <p className="sentence" id="depedencies-disclaimer">
        *support openzeppelin depedencies(wip)
      </p>

      <div id="code-container">
        <div id="editor">
          <span>
            <Button name="clear" onClick={handleEditorClear}></Button>

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
          </span>
          <span>
            <Button name="clear" onClick={handleTerminalClear}></Button>

            {output !== undefined ? (
              <span>
                <Button onClick={handleAbI} name="ABI"></Button>
              </span>
            ) : (
              ""
            )}

            <textarea
              ref={logRef}
              readOnly={true}
              id="terminal"
              className="code-style-container"
              value={terminalValue}
            ></textarea>
          </span>
        </div>
      </div>
      <Button name="compile" id="button-compile" onClick={compile}></Button>
    </div>
  );
}

export default App;
