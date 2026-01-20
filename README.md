# 🛡️ WebView Turnstile Test

> A React Native Expo app that demonstrates how to configure a WebView to pass Cloudflare Turnstile challenges.

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   📱 WebView  ──────►  🌐 Website  ──────►  ✅ Turnstile    │
│                                                             │
│   Configured to appear as a real Safari browser             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤔 What is Cloudflare Turnstile?

Cloudflare Turnstile is a CAPTCHA alternative that verifies users are human without requiring them to solve puzzles. It uses various signals to determine if a visitor is legitimate, including:

- 🔍 Browser fingerprinting
- ⚙️ JavaScript environment analysis
- 🖱️ User behavior patterns
- 🍪 Cookie and session analysis
- 🌐 Network characteristics

---

---

## ❌ Why Standard WebViews Fail Turnstile

```
┌──────────────────────────────────────────────────────────────────────┐
│                    🔴 Standard WebView Detection                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   navigator.webdriver = true        ←── 🚨 BOT FLAG!                 │
│   User-Agent contains "wv"          ←── 🚨 WebView detected!         │
│   Missing browser plugins           ←── 🚨 Suspicious!               │
│   No shared cookies                 ←── 🚨 Isolated environment!     │
│   Inconsistent JS environment       ←── 🚨 Not a real browser!       │
│                                                                      │
│                         ⬇️ RESULT ⬇️                                  │
│                                                                      │
│                    ❌ TURNSTILE CHALLENGE FAILED                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

By default, WebViews expose several signals that identify them as automated/embedded browsers:

1. **`navigator.webdriver` flag** - Set to `true` in automated browsers
2. **Missing browser features** - Plugins, permissions API, etc.
3. **Inconsistent user agent** - WebView user agents often contain "wv" or other identifiers
4. **Missing cookies** - No shared cookie storage with the system browser
5. **JavaScript environment differences** - Missing or incorrect browser APIs

---

## ✅ Techniques Used in This App

```
┌──────────────────────────────────────────────────────────────────────┐
│                    🟢 Our Configured WebView                          │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   navigator.webdriver = undefined   ←── ✅ Looks normal!             │
│   User-Agent = Real Safari          ←── ✅ Authentic!                │
│   Plugins array present             ←── ✅ Like real browser!        │
│   Shared cookies enabled            ←── ✅ Persistent sessions!      │
│   Complete JS environment           ←── ✅ All APIs present!         │
│                                                                      │
│                         ⬇️ RESULT ⬇️                                  │
│                                                                      │
│                    ✅ TURNSTILE CHALLENGE PASSED                      │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 🎭 1. Custom User Agent

```javascript
const USER_AGENT_IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
```

**Default WebView UA vs Custom Safari UA:**

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  ❌ DEFAULT WEBVIEW USER-AGENT (Detectable as WebView)                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)                         │
│  AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148                         │
│                                                                                 │
│  ⚠️  Missing: Version/17.0                                                      │
│  ⚠️  Missing: Safari/604.1                                                      │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│  ✅ OUR CUSTOM USER-AGENT (Looks like real Safari)                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)                         │
│  AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1
│                                                                                 │
│  ✅ Has: Version/17.0      (Safari version number)                              │
│  ✅ Has: Safari/604.1      (Safari engine identifier)                           │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

| Component | Default WebView | Real Safari | Status |
|-----------|-----------------|-------------|--------|
| Base Mozilla | ✅ Present | ✅ Present | Match |
| AppleWebKit | ✅ Present | ✅ Present | Match |
| Mobile | ✅ Present | ✅ Present | Match |
| `Version/17.0` | ❌ Missing | ✅ Present | 🚨 Detectable! |
| `Safari/604.1` | ❌ Missing | ✅ Present | 🚨 Detectable! |

> 💡 **Why it works:** The default WebView UA is missing `Version/X.X` and `Safari/XXX.X` which makes it obvious to bot detection that it's a WKWebView rather than the actual Safari browser. By adding these components, the WebView becomes indistinguishable from Safari based on the User-Agent string alone.

---

### 🤖 2. Removing the WebDriver Flag

```javascript
Object.defineProperty(navigator, 'webdriver', {
  get: () => undefined,
});
```

> 💡 **Why it works:** The `navigator.webdriver` property is the most common bot detection signal. In automated browsers (Selenium, Puppeteer, WebDriver), this property is set to `true`. By overriding it to `undefined`, we match the behavior of a normal browser where this property doesn't exist or is undefined.

---

### 📱 3. Correct Platform Detection

```javascript
Object.defineProperty(navigator, 'platform', {
  get: () => 'iPhone',
});
```

> 💡 **Why it works:** Turnstile checks that the platform matches the user agent. If the user agent claims to be Safari on iPhone but `navigator.platform` returns something else, it's flagged as suspicious. We ensure consistency.

---

### 🔌 4. Mocking Browser Plugins

```javascript
Object.defineProperty(navigator, 'plugins', {
  get: () => [1, 2, 3, 4, 5],
});
```

> 💡 **Why it works:** Real browsers have a `plugins` array (even if empty on mobile). WebViews sometimes expose this differently. By providing a non-empty array, we appear more like a real browser.

---

### 🌍 5. Language Settings

```javascript
Object.defineProperty(navigator, 'languages', {
  get: () => ['en-US', 'en'],
});
```

> 💡 **Why it works:** Browser fingerprinting includes language preferences. Real browsers always have this populated. An empty or missing `languages` array is suspicious.

---

### 🚫 6. Removing Chrome Object

```javascript
window.chrome = undefined;
```

> 💡 **Why it works:** Safari doesn't have the `window.chrome` object that Chrome/Chromium browsers have. Since we're pretending to be Safari, having this object would be inconsistent and trigger detection.

---

### 🔐 7. Permissions API Mock

```javascript
if (!navigator.permissions) {
  navigator.permissions = {
    query: () => Promise.resolve({ state: 'granted' }),
  };
}
```

> 💡 **Why it works:** Modern browsers have a Permissions API. Some WebViews don't implement this fully. Providing a basic mock prevents errors and matches expected browser behavior.

---

### 👆 8. Touch Support

```javascript
Object.defineProperty(navigator, 'maxTouchPoints', {
  get: () => 5,
});
```

> 💡 **Why it works:** Mobile devices report touch capabilities. iPhones support multi-touch with 5 touch points. This matches what a real iPhone would report.

---

### 🍪 9. Shared Cookies

```javascript
sharedCookiesEnabled={true}
thirdPartyCookiesEnabled={true}
```

> 💡 **Why it works:** Turnstile uses cookies for session tracking and to remember verified users. Enabling shared cookies allows the WebView to:
> - Persist Turnstile verification across sessions
> - Share cookies with Safari (on iOS)
> - Allow third-party cookie access needed by Turnstile's iframe

---

### 📲 10. Proper Content Mode

```javascript
contentMode="mobile"
```

> 💡 **Why it works:** Ensures the WebView renders as a mobile browser, matching the user agent claim. Desktop content mode with mobile user agent would be inconsistent.

---

### 💾 11. Cache Enabled

```javascript
cacheEnabled={true}
incognito={false}
```

> 💡 **Why it works:** Real browsers cache content and maintain state. Incognito/private mode or disabled caching is sometimes associated with automated access patterns.

---

### ⏱️ 12. JavaScript Injection Timing

```javascript
injectedJavaScriptBeforeContentLoaded={INJECTED_JAVASCRIPT}
```

> 💡 **Why it works:** The JavaScript is injected **before** the page loads, ensuring that when Turnstile's scripts run, our overrides are already in place. If injected after, Turnstile might have already captured the original values.

```
┌─────────────────────────────────────────────────────────────────┐
│                     ⏱️ Injection Timeline                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   1️⃣  WebView starts loading page                               │
│         │                                                       │
│         ▼                                                       │
│   2️⃣  Our JS injected (navigator.webdriver = undefined, etc.)   │
│         │                                                       │
│         ▼                                                       │
│   3️⃣  Page HTML loads                                           │
│         │                                                       │
│         ▼                                                       │
│   4️⃣  Turnstile script runs - sees our modified environment ✅  │
│         │                                                       │
│         ▼                                                       │
│   5️⃣  Challenge passed! 🎉                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 WebView Configuration Summary

| Property | Value | Purpose |
|----------|-------|---------|
| `javaScriptEnabled` | `true` | ⚙️ Required for Turnstile to function |
| `domStorageEnabled` | `true` | 💾 Allows localStorage/sessionStorage |
| `userAgent` | Safari iOS UA | 🎭 Appear as real Safari browser |
| `sharedCookiesEnabled` | `true` | 🍪 Persist verification state |
| `thirdPartyCookiesEnabled` | `true` | 🍪 Allow Turnstile iframe cookies |
| `cacheEnabled` | `true` | 💾 Normal browser behavior |
| `contentMode` | `"mobile"` | 📱 Match user agent platform |
| `allowsBackForwardNavigationGestures` | `true` | 👆 Browser-like UX |

---

## ⚠️ Important Notes

### 📚 This is for Educational Purposes

This implementation demonstrates how browser fingerprinting works and how WebViews can be configured to appear more like standard browsers. Use this knowledge responsibly.

### 🎲 Not 100% Guaranteed

Cloudflare continuously updates Turnstile's detection mechanisms. While these techniques significantly improve pass rates, they may not work in all scenarios, especially if:

- 🔄 Cloudflare adds new detection methods
- 🛡️ The site has additional bot protection layers
- 🌐 Network-level signals indicate automation
- 🖱️ Behavioral analysis detects non-human patterns

### 📱 iOS Simulator vs Real Device

```
┌─────────────────────────────────────────────────────────────────┐
│                 📱 Device Comparison                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   iOS Simulator                    Real iPhone                  │
│   ─────────────                    ───────────                  │
│   ⚠️ Virtual network               ✅ Real network              │
│   ⚠️ No hardware sensors           ✅ Accelerometer, etc.       │
│   ⚠️ Detectable characteristics    ✅ Authentic device          │
│   ⚠️ May fail some checks          ✅ Best success rate         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

For best results, test on a real iOS device.

---

## 🚀 Running the App

```bash
# 📦 Install dependencies
npm install

# 🎬 Start Expo
npx expo start

# 📱 Press 'i' to open in iOS Simulator
# Or scan QR code with Expo Go on a real device
```

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `react-native-webview` | 🌐 WebView component |
| `react-native-safe-area-context` | 📱 Safe area handling for notch/home indicator |

---

## 📄 License

MIT

---

<div align="center">

Made with ❤️ for educational purposes

```
    ╔═══════════════════════════════════════╗
    ║   Happy browsing! 🎉                  ║
    ╚═══════════════════════════════════════╝
```

</div>
