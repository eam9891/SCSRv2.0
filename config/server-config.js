module.exports = {
    server: {
        host: '192.168.1.122',
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