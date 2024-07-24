const rclnodejs = require('rclnodejs');
const fs = require('fs');
const http = require('http');
const path = require('path');

// ROS 2 setup
let node, publisher, mapData, goalPublisher;

async function initializeRos() {
  await rclnodejs.init();
  node = new rclnodejs.Node('robot_control_node');
  publisher = node.createPublisher('geometry_msgs/msg/Twist', '/cmd_vel');
  goalPublisher = node.createPublisher('geometry_msgs/msg/PoseStamped', '/goal_pose');
  node.createSubscription('nav_msgs/msg/OccupancyGrid', '/map', (msg) => { mapData = msg; });
  node.spin();
}

function publishTwist(linear, angular) {
  const twist = rclnodejs.createMessageObject('geometry_msgs/msg/Twist');
  twist.linear = { x: linear, y: 0, z: 0 };
  twist.angular = { x: 0, y: 0, z: angular };
  publisher.publish(twist);
}

function publishGoal(goalMsg) {
  const goal = rclnodejs.createMessageObject('geometry_msgs/msg/PoseStamped');
  goal.header = goalMsg.header;
  goal.pose = goalMsg.pose;
  goalPublisher.publish(goal);
}

// HTTP server setup
function setupHttpServer() {
  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      serveStaticFile(res, 'public/index.html', 'text/html');
    } else if (req.url === '/styles.css') {
      serveStaticFile(res, 'public/styles.css', 'text/css');
    } else if (req.url === '/index.js') {
      serveStaticFile(res, 'public/index.js', 'application/javascript');
    } else if (req.url === '/full-map.html') {
      serveStaticFile(res, 'public/full-map.html', 'text/html');
    } else if (req.url === '/full-map.js') {
      serveStaticFile(res, 'public/full-map.js', 'application/javascript');
    } else if (req.url === '/sendTwist' && req.method === 'POST') {
      handlePostRequest(req, res, publishTwist);
    } else if (req.url === '/sendGoal' && req.method === 'POST') {
      handlePostRequest(req, res, publishGoal);
    } else if (req.url === '/map' && req.method === 'GET') {
      serveMapData(res);
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  server.listen(8000, '0.0.0.0', () => {
    console.log('Server running at http://0.0.0.0:8000/');
  });
}

function serveStaticFile(res, fileName, contentType) {
  fs.readFile(path.join(__dirname, fileName), (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end(`Error loading ${fileName}`);
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    }
  });
}

function handlePostRequest(req, res, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (data.linear !== undefined && data.angular !== undefined) {
        callback(data.linear, data.angular);
        res.writeHead(200);
        res.end('Command sent');
      } else {
        res.writeHead(400);
        res.end('Invalid parameters');
      }
    } catch (error) {
      res.writeHead(400);
      res.end('Invalid JSON data');
    }
  });
}

function serveMapData(res) {
  if (mapData) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mapData));
  } else {
    res.writeHead(404);
    res.end('Map data not available');
  }
}

process.on('SIGINT', async () => {
  await rclnodejs.shutdown();
  process.exit(0);
});

initializeRos().then(setupHttpServer).catch(error => {
  console.error('Error initializing ROS 2:', error);
  process.exit(1);
});
