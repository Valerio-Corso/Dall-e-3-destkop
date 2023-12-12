// const { app, BrowserWindow } = require('electron');
const { app, BrowserWindow, ipcMain, dialog } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile('index.html');

  ipcMain.handle('save-dialog', async (event, data) => {
    const { canceled, filePath } = await dialog.showSaveDialog({
        title: 'Save Image',
        defaultPath: 'image.png',
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg'] }]
    });

    return { canceled, filePath };
});
}

const fs = require('fs');

ipcMain.on('write-file', (event, { filePath, buffer }) => {
    fs.writeFile(filePath, Buffer.from(buffer), (err) => {
        if (err) {
            console.error('Failed to save the file:', err);
        } else {
            console.log('File saved successfully');
        }
    });
});

app.whenReady().then(createWindow);
