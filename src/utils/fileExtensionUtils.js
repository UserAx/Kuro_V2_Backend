const extractor = (name) => {
    const fileNameChunks = (name.split('.')).reverse();
    return fileNameChunks[0];
}

const renameExt = (name, ext) => {
    const fileNameChunks = (name.split('.'));
    fileNameChunks.pop();
    return fileNameChunks.join(``).concat(`.${ext}`);
}

module.exports = {extractor, renameExt};
