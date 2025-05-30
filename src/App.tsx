import React from "react";
import "./App.css";
import AuthComponent from "./components/auth/AuthComponent";
import Wizard from "./components/wizard/Wizard";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Document Chat with AWS Bedrock</h1>
      </header>
      <main>
        <AuthComponent>
          <Wizard />
        </AuthComponent>
      </main>
      <footer>
        <p>Powered by AWS Bedrock and Amazon S3</p>
      </footer>
    </div>
  );
}

export default App;
