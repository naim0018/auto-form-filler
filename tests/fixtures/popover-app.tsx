// Regression fixture uses the unchanged SelectPopover copied from the user's project.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import SelectPopover from './SelectPopover';

function App() {
  const [consoleName, setConsole] = useState('PlayStation 5 (PS5)');
  const [game, setGame] = useState('FC 24');
  const [registeringAs, setRegisteringAs] = useState('Player — I want to compete');
  const [actions, setActions] = useState(0);
  return <form onSubmit={event => { event.preventDefault(); setActions(value => value + 1); }}>
    <h1>Fan Registration — original SelectPopover</h1>
    <SelectPopover id="favoriteConsole" label="Favorite Game Console" value={consoleName} onChange={setConsole} options={['PlayStation 5 (PS5)', 'Xbox Series X', 'PC']} />
    <SelectPopover id="favoriteGame" label="Favorite Football Game Title(s)" value={game} onChange={setGame} options={['FC 24', 'FC 25', 'eFootball']} />
    <SelectPopover id="registeringAs" label="Registering As" value={registeringAs} onChange={setRegisteringAs} options={['Player — I want to compete', 'Fan — I want to watch', 'Volunteer']} />
    <button type="button" onClick={() => setActions(value => value + 1)}>Cancel</button>
    <button type="submit">Submit</button>
    <output id="state">{JSON.stringify({ consoleName, game, registeringAs, actions })}</output>
  </form>;
}
createRoot(document.getElementById('root')!).render(<App />);
