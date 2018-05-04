module.exports = {
    server: {
        host: '137.49.183.232',
        port: process.env.PORT || 80
    },
    serial: {
        path: "/dev/ttyUSB0",
        baud: 115200
    },
    serial1: {
        path: "/dev/ttyACM0",
        baud: 115200
    }
};