module.exports = {
    server: {
        host: '137.49.183.137',
        port: process.env.PORT || 80
    },
    serial: {
        path: "/dev/ttyUSB1",
        baud: 115200
    },
    serial1: {
        path: "/dev/ttyACM0",
        baud: 115200
    }
};

