
import dotenv from 'dotenv'
dotenv.config()
import open from "open";
import { Issuer, generators } from 'openid-client';

import readline from "readline";
import * as jose from 'jose'

import pkg from 'node-jose';
const { JWK } = pkg;

const auth0Issuer = await Issuer.discover(`https://${process.env.DOMAIN}`);
//console.log('Discovered issuer %s %O', issuer.issuer, issuer.metadata);
console.log(auth0Issuer);
var privateKey = process.env.JAR_PVT_KEY;


(async () => {
    try {

        var keystore = JWK.createKeyStore();
        await keystore.add(privateKey, "pem");
        const client = new auth0Issuer.Client({
            client_id: process.env.PKJAR_CLIENT_ID,
            client_secret : process.env.PKJAR_CLIENT_SECRET,
            token_endpoint_auth_method: 'client_secret_post',
            post_logout_redirect_uris: ["https://jwt.io"],
            request_object_signing_alg : 'RS256',
            response_types : ["id_token", "code"],
            redirect_uri : process.env.PKJWT_REDIRECT_URI
            

        }, keystore.toJSON(true));

        auth0Issuer.log = console;


        var req = await client.requestObject({ response_type: "code", scope: "openid profile", 
        redirect_uri : process.env.PKJAR_REDIRECT_URI });
        console.log(req);

        const url = await client.authorizationUrl({
            request: req
        });

        console.log(url);
        // Specify app arguments
        await open(url, { app: ['google chrome'] });
        const code = await askQuestion("Please enter the code from the response? ");
        console.log(code);
        const params = { "code": code, "iss": auth0Issuer.issuer };
        const tokenSet = await client.callback(process.env.PKJAR_REDIRECT_URI, params, {});

        console.log(tokenSet);
    }
    catch(e) {
        console.log(e);
    }


    }) ();


    function askQuestion(query) {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        return new Promise(resolve => rl.question(query, ans => {
            rl.close();
            resolve(ans);
        }))
    }