const path = require('path');

module.exports = {
    target: 'node',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'lbaquotes-discord.js'
    }
};
