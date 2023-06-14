import { FileSystemTree } from "@webcontainer/api";

const index_js_content = `
import express from 'express';
const app = express();
const port = 3111;

app.get('/', (req, res) => {
    res.send('Welcome to a WebContainers app! 🥳');
});

app.listen(port, () => {
    console.log(\`App is live at http://localhost:\${port}\`);
});
`.trim() + "\n";

const package_json_content = `
{
  "name": "example-app",
  "type": "module",
  "dependencies": {
    "express": "latest",
    "nodemon": "latest"
  },
  "scripts": {
    "start": "nodemon index.js"
  }
}
`.trim();

export const files = {
  "index.js": {
    file: {
      contents: index_js_content,
    },
  },
  "package.json": {
    file: {
      contents: package_json_content,
    },
  },
} satisfies FileSystemTree;
