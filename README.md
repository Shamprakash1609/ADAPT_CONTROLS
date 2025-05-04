# 🤖 Telepresence Robot Control Panel (ROS + WebSockets + WebRTC)

> A browser-based control interface for navigating a ROS-powered telepresence robot remotely using WebSockets, ROSBridge, and WebRTC video streaming.

---

## 📽️ Demo Videos

| Type | Preview | Link |
|------|---------|------|
| 📍 **Real Robot Navigation** | [Demo Preview](./Teleop/robot movement.mp4)|
| 🗺️ **Map Navigation View** | [![Watch Video](https://img.youtube.com/vi/YOUR_MAP_VIDEO_ID/0.jpg)](https://youtube.com/watch?v=YOUR_MAP_VIDEO_ID) |

> ⚠️ *Replace the YouTube IDs with your actual video links.*

---

## 📸 Screenshots

### 🔄 Robot Moving in Map (Web Interface)
![Robot on Map](./images/robot-map-screenshot.png) <!-- Replace this -->

### 🎥 Live Tablet Camera Feed in Browser
![Camera Feed](./images/camera-feed-screenshot.png) <!-- Replace this -->

---

## 🔧 System Architecture


graph TD
A[Browser UI] -->|WebSocket| B[Node.js Server]
B -->|rosnodejs / roslibjs| C[ROSBridge WebSocket Server]
B -->|WebRTC / WS| D[Tablet Camera Feed]
C --> E[Robot Topics (/cmd_vel, /odom, /goal)]
