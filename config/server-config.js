module.exports = {
    server: {
        host: '192.168.0.136',
        port: process.env.PORT || 80
    },
    serial: {
        path: "/dev/ttyACM0",
        baud: 115200
    }
};

