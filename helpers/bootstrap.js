import dotenv from 'dotenv'


import { random, setEnvValue, generateKeyPair, __dirname } from './generators.js';
import auth0 from 'auth0';

dotenv.config(`${__dirname}/.env`)

var mgmtClient = new auth0.ManagementClient({
  domain: process.env.DOMAIN,
  clientId: process.env.MGMT_CLIENT_ID,
  clientSecret: process.env.MGMT_CLIENT_SECRET,
  scope: 'read:clients create:clients update:clients create:client_grants',
});

//default
var callbackUrl = "https://jwt.io";

var pkjwtClientId = "";
var resourceIdentifier = "";



(async() => {
    try {
        
         
        await createPrivateKeyJwtClient();
        await createNativeClient();
        await createSpaClient();
        await createResourceServer();
        await createRegularWebAppClient();
        await createPkJWTRSClientGrant();
        await createJARClientClientSecret();
        await createJARClientWithPrivateKeyJwtAuth();
         
        
    } catch (error) {
        console.log(error);
        console.log(error.originalError);
    }

})();


async function createPrivateKeyJwtClient(){

  var pks = generateKeyPair();

    var pkJwtClientTemplate = `
{
    "is_token_endpoint_ip_header_trusted": false,
    "name": "PKJWT_CLIENT${random()}",
    "is_first_party": true,
    "oidc_conformant": true,
    "sso_disabled": false,
    "cross_origin_auth": false,
    "refresh_token": {
      "expiration_type": "non-expiring",
      "leeway": 0,
      "infinite_token_lifetime": true,
      "infinite_idle_token_lifetime": true,
      "token_lifetime": 31557600,
      "idle_token_lifetime": 2592000,
      "rotation_type": "non-rotating"
    },
    "callbacks": [
      "${callbackUrl}", "http://localhost:3750/resume-transaction"
    ],
    "native_social_login": {
      "apple": {
        "enabled": false
      },
      "facebook": {
        "enabled": false
      }
    },
    "jwt_configuration": {
      "alg": "RS256",
      "lifetime_in_seconds": 36000,
      "secret_encoded": false
    },
    "client_aliases": [],
    "app_type": "regular_web",
    "grant_types": [
      "authorization_code",
      "implicit",
      "refresh_token",
      "client_credentials"
    ],
    "client_authentication_methods": {
      "private_key_jwt": {
        "credentials": [
          {
            "name": "key_1",
            "credential_type": "public_key",
            "pem": ${JSON.stringify(pks.publicKey)}
          }
        ]
      }
    }
  }
`;


    
    setEnvValue("PVT_KEY", JSON.stringify(pks.privateKey));
    const client = await mgmtClient.createClient(pkJwtClientTemplate);
    console.log(client);
    pkjwtClientId = client.client_id;
    setEnvValue("PKJWT_CLIENT_ID", client.client_id)
    setEnvValue("PKJWT_REDIRECT_URI", callbackUrl);
    


}

async function createJARClientClientSecret(){

  var pks = generateKeyPair();

    var pkJARClientTemplate = `
{
    "is_token_endpoint_ip_header_trusted": false,
    "name": "JAR_CLIENT${random()}",
    "is_first_party": true,
    "oidc_conformant": true,
    "sso_disabled": false,
    "cross_origin_auth": false,
    "refresh_token": {
      "expiration_type": "non-expiring",
      "leeway": 0,
      "infinite_token_lifetime": true,
      "infinite_idle_token_lifetime": true,
      "token_lifetime": 31557600,
      "idle_token_lifetime": 2592000,
      "rotation_type": "non-rotating"
    },
    "callbacks": [
      "${callbackUrl}", "http://localhost:3750/resume-transaction"
    ],
    "native_social_login": {
      "apple": {
        "enabled": false
      },
      "facebook": {
        "enabled": false
      }
    },
    "jwt_configuration": {
      "alg": "RS256",
      "lifetime_in_seconds": 36000,
      "secret_encoded": false
    },
    "client_aliases": [],
    "app_type": "regular_web",
    "grant_types": [
      "authorization_code",
      "implicit",
      "refresh_token",
      "client_credentials"
    ],
    "signed_request_object": {
        "credentials": [
          {
            "name": "key_1",
            "credential_type": "public_key",
            "pem": ${JSON.stringify(pks.publicKey)}
          }
        ]
    }
  }
`;


    
    setEnvValue("JAR_PVT_KEY", JSON.stringify(pks.privateKey));
    const client = await mgmtClient.createClient(pkJARClientTemplate);
    console.log(client);
    setEnvValue("PKJAR_CLIENT_ID", client.client_id)
    setEnvValue("PKJAR_CLIENT_SECRET", client.client_secret)
    setEnvValue("PKJAR_REDIRECT_URI", callbackUrl);
    


}
async function createJARClientWithPrivateKeyJwtAuth(){

  var pksAuth = generateKeyPair();

  var pksSAR = generateKeyPair();

    var pkJwtClientTemplate = `
{
    "is_token_endpoint_ip_header_trusted": false,
    "name": "JARPKJWT_CLIENT${random()}",
    "is_first_party": true,
    "oidc_conformant": true,
    "sso_disabled": false,
    "cross_origin_auth": false,
    "refresh_token": {
      "expiration_type": "non-expiring",
      "leeway": 0,
      "infinite_token_lifetime": true,
      "infinite_idle_token_lifetime": true,
      "token_lifetime": 31557600,
      "idle_token_lifetime": 2592000,
      "rotation_type": "non-rotating"
    },
    "callbacks": [
      "${callbackUrl}", "http://localhost:3750/resume-transaction"
    ],
    "native_social_login": {
      "apple": {
        "enabled": false
      },
      "facebook": {
        "enabled": false
      }
    },
    "jwt_configuration": {
      "alg": "RS256",
      "lifetime_in_seconds": 36000,
      "secret_encoded": false
    },
    "client_aliases": [],
    "app_type": "regular_web",
    "grant_types": [
      "authorization_code",
      "implicit",
      "refresh_token",
      "client_credentials"
    ],
    "client_authentication_methods": {
      "private_key_jwt": {
        "credentials": [
          {
            "name": "keyAuth",
            "credential_type": "public_key",
            "pem": ${JSON.stringify(pksAuth.publicKey)}
          }
        ]
      }
    },
    "signed_request_object": {
        "credentials": [
          {
            "name": "keySAR",
            "credential_type": "public_key",
            "pem": ${JSON.stringify(pksSAR.publicKey)}
          }
        ]
    }
  }
`;

    
    setEnvValue("FORJAR_TEAUTH_PVT_KEY", JSON.stringify(pksAuth.privateKey));
    setEnvValue("FORJAR_SAR_PVT_KEY", JSON.stringify(pksSAR.privateKey));
    const client = await mgmtClient.createClient(pkJwtClientTemplate);
    console.log(client);
    setEnvValue("PKJARJWT_CLIENT_ID", client.client_id)
    setEnvValue("PKJARJWT_REDIRECT_URI", callbackUrl);
    


}


async function createRegularWebAppClient(){

    var regularWebAppClientTemplate = `
{
    "is_token_endpoint_ip_header_trusted": false,
    "name": "RWA_CLIENT_${random()}",
    "is_first_party": true,
    "oidc_conformant": true,
    "sso_disabled": false,
    "cross_origin_auth": false,
    "refresh_token": {
      "expiration_type": "non-expiring",
      "leeway": 0,
      "infinite_token_lifetime": true,
      "infinite_idle_token_lifetime": true,
      "token_lifetime": 31557600,
      "idle_token_lifetime": 2592000,
      "rotation_type": "non-rotating"
    },
    "allowed_clients": [],
    "callbacks": [
      "${callbackUrl}"
    ],
    "native_social_login": {
      "apple": {
        "enabled": false
      },
      "facebook": {
        "enabled": false
      }
    },
    "jwt_configuration": {
      "alg": "RS256",
      "lifetime_in_seconds": 36000,
      "secret_encoded": false
    },
    "token_endpoint_auth_method": "client_secret_post",
    "app_type": "regular_web",
    "grant_types": [
      "authorization_code",
      "implicit",
      "refresh_token",
      "client_credentials"
    ],
    "custom_login_page_on": false
  }
`;
    const client = await mgmtClient.createClient(regularWebAppClientTemplate);
    console.log(client);
    setEnvValue("RWA_CLIENT_ID", client.client_id)
    setEnvValue("RWA_CLIENT_SECRET", client.client_secret);
    setEnvValue("RWA_REDIRECT_URI", callbackUrl)

}


async function createNativeClient(){


  var nativeClientTemplate = `
  {
    "is_token_endpoint_ip_header_trusted": false,
    "name": "Native_Device_FLow_Test-${random()}",
    "is_first_party": true,
    "oidc_conformant": true,
    "sso_disabled": false,
    "cross_origin_auth": false,
    "refresh_token": {
      "expiration_type": "non-expiring",
      "leeway": 0,
      "infinite_token_lifetime": true,
      "infinite_idle_token_lifetime": true,
      "token_lifetime": 2592000,
      "idle_token_lifetime": 1296000,
      "rotation_type": "non-rotating"
    },
    "allowed_clients": [],
    "callbacks": [
      "${callbackUrl}"
    ],
    "native_social_login": {
      "apple": {
        "enabled": false
      },
      "facebook": {
        "enabled": false
      }
    },
    "jwt_configuration": {
      "alg": "RS256",
      "lifetime_in_seconds": 36000,
      "secret_encoded": false
    },
    "token_endpoint_auth_method": "none",
    "app_type": "native",
    "grant_types": [
      "authorization_code",
      "implicit",
      "refresh_token",
      "urn:ietf:params:oauth:grant-type:device_code"
    ],
    "custom_login_page_on": false
  }
  `;

    const client = await mgmtClient.createClient(nativeClientTemplate);
    console.log(client);
    setEnvValue("NATIVE_CLIENT_ID", client.client_id)


}

async function createSpaClient(){


  var spaClientTemplate = `
  {
    "is_token_endpoint_ip_header_trusted": false,
    "name": "SPA_Test_Client-${random()}",
    "is_first_party": true,
    "oidc_conformant": true,
    "sso_disabled": false,
    "cross_origin_auth": false,
    "refresh_token": {
      "expiration_type": "non-expiring",
      "leeway": 0,
      "infinite_token_lifetime": true,
      "infinite_idle_token_lifetime": true,
      "token_lifetime": 2592000,
      "idle_token_lifetime": 1296000,
      "rotation_type": "non-rotating"
    },
    "allowed_clients": [],
    "callbacks": [
      "${callbackUrl}"
    ],
    "native_social_login": {
      "apple": {
        "enabled": false
      },
      "facebook": {
        "enabled": false
      }
    },
    "jwt_configuration": {
      "alg": "RS256",
      "lifetime_in_seconds": 36000,
      "secret_encoded": false
    },
    "token_endpoint_auth_method": "none",
    "app_type": "spa",
    "grant_types": [
      "authorization_code",
    "implicit",
    "refresh_token"
    ],
    "custom_login_page_on": false
  }
  `;

    const client = await mgmtClient.createClient(spaClientTemplate);
    console.log(client);
    setEnvValue("NON_CONFIDENTIAL_CLIENT_ID", client.client_id)
    


}


async function createResourceServer(){

  var resourceServerTemplate = `
  {
    "name": "MY_API_${random()}",
    "identifier": "urn:my:api:${random()}",
    "token_lifetime": 86400,
    "token_lifetime_for_web": 7200,
    "skip_consent_for_verifiable_first_party_clients": true,
    "signing_alg": "RS256",
    "scopes": [
      {
        "value": "read:all_stats",
        "description": "read all data"
      },
      {
        "value": "read:stats",
        "description": "read my own stats"
      },
      {
        "value": "upload:stats",
        "description": "Upload Stats"
      }
    ]  
  }`
    const rs = await mgmtClient.createResourceServer(resourceServerTemplate)
    console.log(rs);
    setEnvValue("AUD", rs.identifier)
    resourceIdentifier = rs.identifier;
    setEnvValue("AUD_SCOPES", "read:all_stats upload:stats");


}

async function createPkJWTRSClientGrant(){

  
   const pkjwtClientGrant = await mgmtClient.createClientGrant( {
    "client_id": pkjwtClientId,
    "audience": resourceIdentifier,
    "scope" : ["read:stats", "upload:stats"]
   });

   console.log(pkjwtClientGrant);
  
}
