#!/usr/bin/env node

/* eslint-disable no-console, camelcase */
import dotenv from 'dotenv'
dotenv.config()

import http from "http"

const server = http.createServer().listen(8988);

import  open from "open";
import { Issuer, generators } from 'openid-client';

server.removeAllListeners('request');


server.once('listening', () => {
  (async () => {
    const issuer = await Issuer.discover(`https://${process.env.DOMAIN}`);
    const { address, port } = server.address();
    const hostname = "127.0.0.1"

    console.log(hostname);
    
    const client = new issuer.Client({
        client_id: process.env.NATIVE_CLIENT_ID,
        response_types: ["code"],
        redirect_uris: [`http://${hostname}`],
        token_endpoint_auth_method: 'none',
      });
    const code_verifier = generators.codeVerifier();
    const code_challenge = generators.codeChallenge(code_verifier);
    const redirect_uri = `http://${hostname}:${port}`;

    server.on('request', async (req, res) => {
      res.setHeader('connection', 'close');
      const params = client.callbackParams(req);
      if (Object.keys(params).length) {
        const tokenSet = await client.callback(
          redirect_uri, params, { code_verifier, response_type: 'code' },
        );

        console.log('got', tokenSet);
        console.log('id token claims', tokenSet.claims());

        const userinfo = await client.userinfo(tokenSet);
        console.log('userinfo', userinfo);

        res.end('you can close this now');
        server.close();
      }
    });

    await open(client.authorizationUrl({
      redirect_uri,
      code_challenge,
      code_challenge_method: 'S256',
      scope: 'openid email',
    }), { wait: false });
  })().catch((err) => {
    console.error(err);
    process.exitCode = 1;
    server.close();
  });
});