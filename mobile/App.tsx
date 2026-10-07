import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, BackHandler, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";

const APP_URL = "https://hotel-easy-pass.onrender.com";

const MobileWebView = WebView as unknown as React.ComponentType<any>;

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const handler = BackHandler.addEventListener("hardwareBackPress", () => {
      webViewRef.current?.goBack();
      return true;
    });
    return () => handler.remove();
  }, []);

  const retry = () => {
    setFailed(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  if (failed) {
    return (
      <SafeAreaView style={styles.center}>
        <StatusBar style="auto" />
        <Text style={styles.title}>Hotel Easy Pass</Text>
        <Text style={styles.message}>We couldn't reach the app right now. Check your connection and try again.</Text>
        <TouchableOpacity style={styles.button} onPress={retry}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#0f766e" />
        </View>
      )}
      <MobileWebView
        ref={webViewRef as any}
        source={{ uri: APP_URL }}
        style={styles.webview}
        originWhitelist={["https://*", "http://*"]}
        javaScriptEnabled
        domStorageEnabled
        cacheEnabled
        sharedCookiesEnabled
        thirdPartyCookiesEnabled
        setSupportMultipleWindows={false}
        allowsBackForwardNavigationGestures
        onLoadStart={() => { setLoading(true); setFailed(false); }}
        onLoadEnd={() => { setLoading(false); setRefreshing(false); }}
        onError={() => { setLoading(false); setRefreshing(false); setFailed(true); }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); webViewRef.current?.reload(); }}
            tintColor="#0f766e"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffffff" },
  webview: { flex: 1 },
  loader: {
    position: "absolute", zIndex: 10, top: 0, left: 0, right: 0,
    height: 3, backgroundColor: "#e2e8f0"
  },
  center: {
    flex: 1, alignItems: "center", justifyContent: "center",
    padding: 28, backgroundColor: "#ffffff"
  },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 12 },
  message: { textAlign: "center", fontSize: 16, lineHeight: 24, color: "#475569", marginBottom: 24 },
  button: { backgroundColor: "#0f766e", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12 },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "700" }
});