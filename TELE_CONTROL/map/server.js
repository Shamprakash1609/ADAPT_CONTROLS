const rclnodejs = require('rclnodejs');
const fs = require('fs');
const http = require('http');
const path = require('path');

let node, publisher, mapData, goalPublisher;

async function main() {
  // Initialize ROS 2 environment
  await rclnodejs.init();

  node = new rclnodejs.Node('robot_control_node');
  publisher = node.createPublisher('geometry_msgs/msg/Twist', '/cmd_vel');
  goalPublisher = node.createPublisher('geometry_msgs/msg/PoseStamped', '/goal_pose');

  // Subscribe to the map topic
  const mapSubscription = node.createSubscription(
    'nav_msgs/msg/OccupancyGrid',
    '/map',
    (msg) => {
      mapData = msg;
    }
  );

  // Start spinning the node in the background
  node.spin();

  function publishTwist(linear, angular) {
    const twist = rclnodejs.createMessageObject('geometry_msgs/msg/Twist');
    twist.linear = rclnodejs.createMessageObject('geometry_msgs/msg/Vector3');
    twist.angular = rclnodejs.createMessageObject('geometry_msgs/msg/Vector3');
    twist.linear.x = linear;
    twist.linear.y = 0;
    twist.linear.z = 0;
    twist.angular.x = 0;
    twist.angular.y = 0;
    twist.angular.z = angular;
    publisher.publish(twist);
  }

  function publishGoal(goalMsg) {
    const goal = rclnodejs.createMessageObject('geometry_msgs/msg/PoseStamped');
    goal.header.frame_id = goalMsg.header.frame_id;
    goal.header.stamp.sec = goalMsg.header.stamp.sec;
    goal.header.stamp.nanosec = goalMsg.header.stamp.nanosec;
    goal.pose.position.x = goalMsg.pose.position.x;
    goal.pose.position.y = goalMsg.pose.position.y;
    goal.pose.position.z = goalMsg.pose.position.z;
    goal.pose.orientation.x = goalMsg.pose.orientation.x;
    goal.pose.orientation.y = goalMsg.pose.orientation.y;
    goal.pose.orientation.z = goalMsg.pose.orientation.z;
    goal.pose.orientation.w = goalMsg.pose.orientation.w;
    goalPublisher.publish(goal);
  }

  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading index.html');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      });
    } else if (req.url === '/styles.css') {
      fs.readFile(path.join(__dirname, 'styles.css'), (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading styles.css');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(data);
      });
    } else if (req.url === '/script.js') {
      fs.readFile(path.join(__dirname, 'script.js'), (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Error loading script.js');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(data);
      });
    } else if (req.url === '/sendTwist' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const { linear, angular } = JSON.parse(body);
          if (typeof linear !== 'number' || typeof angular !== 'number') {
            throw new Error('Invalid twist parameters');
          }
          publishTwist(linear, angular);
          res.writeHead(200);
          res.end('Twist command sent');
        } catch (error) {
          res.writeHead(400);
          res.end('Invalid JSON data or twist parameters');
        }
      });
    } else if (req.url === '/sendGoal' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const goalMsg = JSON.parse(body);
          if (typeof goalMsg.pose.position.x !== 'number' || typeof goalMsg.pose.position.y !== 'number') {
            throw new Error('Invalid coordinates');
          }
          publishGoal(goalMsg);
          res.writeHead(200);
          res.end('Goal sent');
        } catch (error) {
          res.writeHead(400);
          res.end('Invalid JSON data or coordinates');
        }
      });
    } else if (req.url === '/map' && req.method === 'GET') {
      if (mapData) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mapData));
      } else {
        res.writeHead(404);
        res.end('Map data not available');
      }
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  server.listen(8000, '0.0.0.0', () => {
    console.log('Server running at http://0.0.0.0:8000/');
  });

  // Handle Ctrl+C to quit gracefully
  process.on('SIGINT', async () => {
    await rclnodejs.shutdown();
    process.exit(0);
  });
}

main().catch((error) => {
  process.exit(1);
});


// const rosnodejs = require('rosnodejs');
// const fs = require('fs');
// const http = require('http');
// const path = require('path');

// let node, publisher, mapData, goalPublisher;

// async function main() {
//   // Initialize ROS environment
//   await rosnodejs.initNode('/robot_control_node');
//   const nh = rosnodejs.nh;

//   publisher = nh.advertise('/cmd_vel', 'geometry_msgs/Twist');
//   goalPublisher = nh.advertise('/goal_pose', 'geometry_msgs/PoseStamped');

//   // Subscribe to the map topic
//   const mapSubscription = nh.subscribe('/map', 'nav_msgs/OccupancyGrid', (msg) => {
//     mapData = msg;
//   });

//   function publishTwist(linear, angular) {
//     const twist = new rosnodejs.messageType('geometry_msgs/Twist')();
//     twist.linear.x = linear;
//     twist.linear.y = 0;
//     twist.linear.z = 0;
//     twist.angular.x = 0;
//     twist.angular.y = 0;
//     twist.angular.z = angular;
//     publisher.publish(twist);
//   }

//   function publishGoal(goalMsg) {
//     const goal = new rosnodejs.messageType('geometry_msgs/PoseStamped')();
//     goal.header.frame_id = goalMsg.header.frame_id;
//     goal.header.stamp = goalMsg.header.stamp;
//     goal.pose = goalMsg.pose;
//     goalPublisher.publish(goal);
//   }

//   const server = http.createServer((req, res) => {
//     if (req.url === '/') {
//       fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
//         if (err) {
//           res.writeHead(500);
//           res.end('Error loading index.html');
//           return;
//         }
//         res.writeHead(200, { 'Content-Type': 'text/html' });
//         res.end(data);
//       });
//     } else if (req.url === '/styles.css') {
//       fs.readFile(path.join(__dirname, 'styles.css'), (err, data) => {
//         if (err) {
//           res.writeHead(500);
//           res.end('Error loading styles.css');
//           return;
//         }
//         res.writeHead(200, { 'Content-Type': 'text/css' });
//         res.end(data);
//       });
//     } else if (req.url === '/script.js') {
//       fs.readFile(path.join(__dirname, 'script.js'), (err, data) => {
//         if (err) {
//           res.writeHead(500);
//           res.end('Error loading script.js');
//           return;
//         }
//         res.writeHead(200, { 'Content-Type': 'application/javascript' });
//         res.end(data);
//       });
//     } else if (req.url === '/sendTwist' && req.method === 'POST') {
//       let body = '';
//       req.on('data', (chunk) => {
//         body += chunk.toString();
//       });
//       req.on('end', () => {
//         try {
//           const { linear, angular } = JSON.parse(body);
//           if (typeof linear !== 'number' || typeof angular !== 'number') {
//             throw new Error('Invalid twist parameters');
//           }
//           publishTwist(linear, angular);
//           res.writeHead(200);
//           res.end('Twist command sent');
//         } catch (error) {
//           res.writeHead(400);
//           res.end('Invalid JSON data or twist parameters');
//         }
//       });
//     } else if (req.url === '/sendGoal' && req.method === 'POST') {
//       let body = '';
//       req.on('data', (chunk) => {
//         body += chunk.toString();
//       });
//       req.on('end', () => {
//         try {
//           const goalMsg = JSON.parse(body);
//           if (typeof goalMsg.pose.position.x !== 'number' || typeof goalMsg.pose.position.y !== 'number') {
//             throw new Error('Invalid coordinates');
//           }
//           publishGoal(goalMsg);
//           res.writeHead(200);
//           res.end('Goal sent');
//         } catch (error) {
//           res.writeHead(400);
//           res.end('Invalid JSON data or coordinates');
//         }
//       });
//     } else if (req.url === '/map' && req.method === 'GET') {
//       if (mapData) {
//         res.writeHead(200, { 'Content-Type': 'application/json' });
//         res.end(JSON.stringify(mapData));
//       } else {
//         res.writeHead(404);
//         res.end('Map data not available');
//       }
//     } else {
//       res.writeHead(404);
//       res.end('Not found');
//     }
//   });

//   server.listen(8000, '0.0.0.0', () => {
//     console.log('Server running at http://0.0.0.0:8000/');
//   });

//   // Handle Ctrl+C to quit gracefully
//   process.on('SIGINT', async () => {
//     await rosnodejs.shutdown();
//     process.exit(0);
//   });
// }

// main().catch((error) => {
//   process.exit(1);
// });
