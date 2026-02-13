import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';

// Use a real Safari mobile user agent to avoid bot detection
const USER_AGENT_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';

export default function App() {
  const [url, setUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [showWebView, setShowWebView] = useState(false);
  const webViewRef = useRef(null);

  const handleGo = () => {
    let finalUrl = inputUrl.trim();
    if (finalUrl && !finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }
    if (finalUrl) {
      setUrl(finalUrl);
      setShowWebView(true);
    }
  };

  const handleBack = () => {
    setShowWebView(false);
    setUrl('');
  };

  if (showWebView && url) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.urlText} numberOfLines={1}>
              {url}
            </Text>
          </View>
          <View style={styles.webviewContainer}>
            <WebView
              ref={webViewRef}
              source={{ uri: url }}
              style={styles.webview}
              // Essential settings
              javaScriptEnabled={true}
              domStorageEnabled={true}

              // User agent to appear as real Safari browser
              userAgent={USER_AGENT_IOS}

              // Allow all content
              mixedContentMode="always"
              allowsInlineMediaPlayback={true}
              mediaPlaybackRequiresUserAction={false}

              // Enable features that Turnstile may check
              allowsBackForwardNavigationGestures={true}
              allowsLinkPreview={true}
              sharedCookiesEnabled={true}

              // https://developers.cloudflare.com/turnstile/get-started/mobile-implementation/#network-access
              originWhitelist={["http://*", "https://*", "about:blank", "about:srcdoc"]}
            />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.inputContainer}
        >
          <Text style={styles.title}>WebView Browser</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter URL (e.g., google.com)"
            value={inputUrl}
            onChangeText={setInputUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            onSubmitEditing={handleGo}
          />
          <TouchableOpacity style={styles.goButton} onPress={handleGo}>
            <Text style={styles.goButtonText}>Go</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  inputContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  goButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  urlText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 10,
  },
  webviewContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});
