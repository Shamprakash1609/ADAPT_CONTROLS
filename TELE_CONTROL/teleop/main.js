const rclnodejs = require('rclnodejs');
const fs = require('fs');
const http = require('http');

let node, publisher;

async function main() {
  // Initialize ROS 2 environment
  await rclnodejs.init();

  node = new rclnodejs.Node('cmd_vel_publisher');
  publisher = node.createPublisher('geometry_msgs/msg/Twist', '/cmd_vel');
  node.spin();

  function publishTwist(linear, angular) {
    const twist = rclnodejs.createMessageObject('geometry_msgs/msg/Twist');
    twist.linear.x = linear;
    twist.angular.z = angular;
    publisher.publish(twist);
  }

  const server = http.createServer((req, res) => {
    if (req.url === '/') {
      fs.readFile('index.html', (err, data) => {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.write(data);
        res.end();
      });
    } else if (req.url === '/styles.css') {
      fs.readFile('styles.css', (err, data) => {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.write(data);
        res.end();
      });
    } else if (req.url === '/script.js') {
      fs.readFile('script.js', (err, data) => {
        if (err) throw err;
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.write(data);
        res.end();
      });
    } else if (req.url === '/sendTwist' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const { linear, angular } = JSON.parse(body);
        publishTwist(linear, angular);
        res.writeHead(200);
        res.end();
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  server.listen(8000, '0.0.0.0', () => {
    console.log('Server running at http://0.0.0.0:8000/');
  });

  // Handle Ctrl+C to quit gracefully
  process.on('SIGINT', async () => {
    console.log('Shutting down...');
    await node.shutdown();
    process.exit(0);
  });
}

main();

// const rosnodejs = require('rosnodejs');
// const fs = require('fs');
// const http = require('http');

// let nh, publisher;

// async function main() {
//   // Initialize ROS environment
//   await rosnodejs.initNode('/cmd_vel_publisher');

//   nh = rosnodejs.nh;
//   publisher = nh.advertise('/cmd_vel', 'geometry_msgs/Twist');

//   function publishTwist(linear, angular) {
//     const twist = new rosnodejs.require('geometry_msgs').msg.Twist();
//     twist.linear.x = linear;
//     twist.angular.z = angular;
//     publisher.publish(twist);
//   }

//   const server = http.createServer((req, res) => {
//     if (req.url === '/') {
//       fs.readFile('index.html', (err, data) => {
//         if (err) throw err;
//         res.writeHead(200, { 'Content-Type': 'text/html' });
//         res.write(data);
//         res.end();
//       });
//     } else if (req.url === '/styles.css') {
//       fs.readFile('styles.css', (err, data) => {
//         if (err) throw err;
//         res.writeHead(200, { 'Content-Type': 'text/css' });
//         res.write(data);
//         res.end();
//       });
//     } else if (req.url === '/script.js') {
//       fs.readFile('script.js', (err, data) => {
//         if (err) throw err;
//         res.writeHead(200, { 'Content-Type': 'application/javascript' });
//         res.write(data);
//         res.end();
//       });
//     } else if (req.url === '/sendTwist' && req.method === 'POST') {
//       let body = '';
//       req.on('data', (chunk) => {
//         body += chunk.toString();
//       });
//       req.on('end', () => {
//         const { linear, angular } = JSON.parse(body);
//         publishTwist(linear, angular);
//         res.writeHead(200);
//         res.end();
//       });
//     } else {
//       res.writeHead(404);
//       res.end();
//     }
//   });

//   server.listen(8000, '0.0.0.0', () => {
//     console.log('Server running at http://0.0.0.0:8000/');
//   });

//   // Handle Ctrl+C to quit gracefully
//   process.on('SIGINT', async () => {
//     console.log('Shutting down...');
//     rosnodejs.shutdown();
//     process.exit(0);
//   });
// }

// main();



