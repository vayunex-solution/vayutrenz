// Socket Registry - Manages io instance to avoid circular dependencies
let io = null;

const setIO = (ioInstance) => {
    io = ioInstance;
};

const getIO = () => io;

module.exports = { setIO, getIO };
