import { Link } from "expo-router";
import { Button, Image, Text, View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useEffect, useState } from 'react';
import { Constants } from "expo-constants";
import { openAuthSessionAsync } from "expo-web-browser";
import {
  exchangeCodeAsync,
  fetchUserInfoAsync,
  makeRedirectUri,
  useAuthRequest,
  useAutoDiscovery,
  AuthRequest,
  AuthSessionResult
} from 'expo-auth-session';
import { useAuth } from "@/context/AuthProvider";

export default function AccountScreen() {
  const { updateUser } = useAuth();
  /**
   * This will hold the access token and the user details after successful authorization
   */
  const [authResponse, setAuthResponse] = useState<any>(null);

  useEffect(() => {
    updateUser(authResponse);
  }, [authResponse])

  /**
   * This is a helper function from expo-auth-session to retrieve the URLs used for authorization
   */
  const fusionAuthUrl = process.env.EXPO_PUBLIC_FUSIONAUTH_URL || '';
  console.log(fusionAuthUrl);
  const discovery = useAutoDiscovery(fusionAuthUrl);
  console.log(discovery);

  /**
   * Creating a new Redirect URI using the scheme configured in app.json.
   * Expo Go will override this with a local URL when developing.
   */
  const appScheme = process.env.EXPO_PUBLIC_APP_SCHEME || '';
  const redirectUri = makeRedirectUri({
    scheme: appScheme,
    path: 'redirect',
  });

  console.log(redirectUri);
  
  /**
   * useAuthRequest() is another helper function from expo-auth-session that handles the authorization request.
   * It returns a promptLogin() function that should be called to initiate the process.
   */
  const fusionAuthClientId = process.env.EXPO_PUBLIC_FUSIONAUTH_CLIENT_ID || '';
  const [requestLogin, responseLogin, promptLogin] = useAuthRequest({
    clientId: fusionAuthClientId,
    scopes: ['openid', 'offline_access', 'email', 'profile'],
    usePKCE: true,
    redirectUri,
  }, discovery);

  /**
   * To log the user out, we redirect to the end session endpoint
   *
   * @return {void}
   */
  const logout = () => {
    const params = new URLSearchParams({
      client_id: fusionAuthClientId,
      post_logout_redirect_uri: redirectUri,
    });

    if (discovery) {
      openAuthSessionAsync(discovery.endSessionEndpoint + '?' + params.toString(), redirectUri)
        .then((result) => {
          if (result.type !== 'success') {
            handleError(new Error('Please, confirm the logout request and wait for it to finish.'));
            console.error(result);
            return;
          }
          setAuthResponse(null);
        });
    }
  };

  /**
   * Auxiliary function to handle displaying errors
   *
   * @param {Error} error
   */
  const handleError = (error: Error) => {
    console.error(error);
    alert(error.message);
  };

  /**
   * This will handle login and register operations
   *
   * @param {AuthRequest} request
   * @param {AuthSessionResult} response
   */
  const handleOperation = (request: AuthRequest, response: AuthSessionResult) => {
    if (!response) {
      return;
    }

    /**
     * If something wrong happened, we call our error helper function
     */
    if (response.type !== 'success') {
      handleError(new Error(`Operation failed: ${response.type}`));
      return;
    }

    /**
     * If the authorization process worked, we need to exchange the authorization code for an access token.
     */
    if (discovery) {
      exchangeCodeAsync({
        clientId: fusionAuthClientId,
        code: response.params.code,
        extraParams: {
          code_verifier: request.codeVerifier as string,
        },
        redirectUri,
      }, discovery).then((response) => {
        // Now that we have an access token, we can call the /oauth2/userinfo endpoint
        fetchUserInfoAsync(response, discovery).then((userRecord) => setAuthResponse({
          accessToken: response.accessToken,
          user: userRecord,
        })).catch(handleError);
      }).catch(handleError);
    }
  };

  /*
   * This is a React Hook that will call the handleOperation() method
   * whenever the login process redirects from the browser to our app.
   */
  useEffect(() => {
    if (requestLogin && responseLogin) {
      handleOperation(requestLogin, responseLogin);
    }
  }, [responseLogin]);

  console.log(authResponse);

  return (
    <View style={styles.container} >
      <View style={styles.hRow}>
        {(authResponse) ? (
            <>
              <Text style={styles.headerEmail}>{authResponse.user.email}</Text>
              <TouchableOpacity disabled={!requestLogin} onPress={() => logout()}>
                <Text style={styles.buttonLg}>Log out</Text>
              </TouchableOpacity>
            </>
        ) : (
            <>
              <TouchableOpacity disabled={!requestLogin} onPress={() => promptLogin()}>
                <Text style={styles.buttonLg}>Log in</Text>
              </TouchableOpacity>
            </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  hRow: {
    display: 'flex',
    alignItems: 'flex-end',
    flex: 1,
    rowGap: 10,
  },
  headerEmail: {
    color: '#096324',
  },
  buttonLg: {
    backgroundColor: '#096324',
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    borderRadius: 10,
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingVertical: 5,
    textDecorationLine: 'none',
    overflow: 'hidden',
  },
});
