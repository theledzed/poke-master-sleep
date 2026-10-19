import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { App } from './App';

export interface RenderResult {
  html: string;
}

/**
 * Server-Side Rendering entry point
 * Generates the full initial HTML markup for Pokémon Sleep Master
 */
export function render(): RenderResult {
  const html = ReactDOMServer.renderToString(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  return { html };
}
