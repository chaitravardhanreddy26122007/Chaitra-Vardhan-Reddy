const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Set EJS as template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware for parsing JSON and urlencoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public/
app.use(express.static(path.join(__dirname, 'public')));

// Path to the tasks/files directory
const filesDir = path.join(__dirname, 'files');

// Ensure files directory exists
if (!fs.existsSync(filesDir)) {
  fs.mkdirSync(filesDir, { recursive: true });
}

// -------------------------------------------------------------
// WEB ROUTES (Server-side rendering matching reference screenshot)
// -------------------------------------------------------------

// Home route: Lists all task files
app.get('/', (req, res) => {
  fs.readdir(filesDir, (err, files) => {
    if (err) {
      console.error('Error reading files directory:', err);
      return res.status(500).send('Internal Server Error reading tasks.');
    }
    // Filter out system files or hidden folders if any, but keep .txt files including '.txt'
    const taskFiles = files.filter(f => !f.startsWith('.git') && f !== 'node_modules');
    res.render('index', { files: taskFiles });
  });
});

// React Component Demo route: Shows interactive Kanban Board and ShareDialog
app.get('/demo', (req, res) => {
  const filename = req.query.filename || 'Q3-product-roadmap.txt';
  res.render('demo', { filename });
});

// Dedicated Kanban Board route
app.get('/kanban', (req, res) => {
  res.redirect('/demo');
});

// Create task route: Writes task to ./files/<title>.txt
app.post('/create', (req, res) => {
  const rawTitle = req.body.title !== undefined ? req.body.title.trim() : '';
  const details = req.body.details || '';

  // In the reference implementation: title spaces are removed and .txt is appended
  // If title is empty, it becomes '.txt' (which matches the exact '.txt' card in the screenshot)
  let filename = rawTitle ? rawTitle.split(' ').join('') : '';
  if (!filename.endsWith('.txt')) {
    filename = filename + '.txt';
  }

  // Sanitize filename to avoid path traversal
  const safeFilename = path.basename(filename);
  const targetPath = path.join(filesDir, safeFilename);

  fs.writeFile(targetPath, details, (err) => {
    if (err) {
      console.error('Error creating task file:', err);
      return res.status(500).send('Failed to write task file.');
    }
    res.redirect('/');
  });
});

// View task details route: Reads content of ./files/<filename>
app.get('/file/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const targetPath = path.join(filesDir, safeFilename);

  fs.readFile(targetPath, 'utf-8', (err, filedata) => {
    if (err) {
      console.error('Error reading task file:', err);
      return res.status(404).render('show', { 
        filename: safeFilename, 
        filedata: 'Error: Task file not found or could not be read.' 
      });
    }
    res.render('show', { filename: safeFilename, filedata });
  });
});

// Edit filename form route
app.get('/edit/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  res.render('edit', { filename: safeFilename });
});

// Update filename route: Renames ./files/<previous> to ./files/<new>
app.post('/edit', (req, res) => {
  const prevFilename = path.basename(req.body.previous || '');
  let newTitle = (req.body.new || '').trim();

  if (!newTitle) {
    return res.redirect('/');
  }

  // Format new filename
  let newFilename = newTitle.split(' ').join('');
  if (!newFilename.endsWith('.txt')) {
    newFilename = newFilename + '.txt';
  }
  newFilename = path.basename(newFilename);

  const oldPath = path.join(filesDir, prevFilename);
  const newPath = path.join(filesDir, newFilename);

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      console.error('Error renaming file:', err);
    }
    res.redirect('/');
  });
});

// Delete task route
app.post('/delete/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const targetPath = path.join(filesDir, safeFilename);

  fs.unlink(targetPath, (err) => {
    if (err) {
      console.error('Error deleting task file:', err);
    }
    res.redirect('/');
  });
});

// Also support GET /delete/:filename for quick links
app.get('/delete/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const targetPath = path.join(filesDir, safeFilename);

  fs.unlink(targetPath, (err) => {
    if (err) {
      console.error('Error deleting task file:', err);
    }
    res.redirect('/');
  });
});

// -------------------------------------------------------------
// REST API ENDPOINTS (For AJAX / client-side integrations)
// -------------------------------------------------------------

// API: List all tasks with preview
app.get('/api/tasks', (req, res) => {
  fs.readdir(filesDir, async (err, files) => {
    if (err) return res.status(500).json({ error: 'Failed to list tasks' });
    
    const taskFiles = files.filter(f => !f.startsWith('.git') && f !== 'node_modules');
    const tasks = await Promise.all(taskFiles.map(async (filename) => {
      try {
        const content = await fs.promises.readFile(path.join(filesDir, filename), 'utf-8');
        return { filename, preview: content.slice(0, 100), fullContent: content };
      } catch (e) {
        return { filename, preview: '', fullContent: '' };
      }
    }));
    res.json({ success: true, count: tasks.length, tasks });
  });
});

// API: Get specific task details
app.get('/api/tasks/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  fs.readFile(path.join(filesDir, safeFilename), 'utf-8', (err, filedata) => {
    if (err) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, filename: safeFilename, content: filedata });
  });
});

// API: Create task via JSON
app.post('/api/tasks', (req, res) => {
  const rawTitle = req.body.title !== undefined ? req.body.title.trim() : '';
  const details = req.body.details || '';

  let filename = rawTitle ? rawTitle.split(' ').join('') : '';
  if (!filename.endsWith('.txt')) {
    filename = filename + '.txt';
  }
  const safeFilename = path.basename(filename);

  fs.writeFile(path.join(filesDir, safeFilename), details, (err) => {
    if (err) return res.status(500).json({ error: 'Failed to write task' });
    res.status(201).json({ success: true, filename: safeFilename, message: 'Task created successfully' });
  });
});

// API: Delete task via API
app.delete('/api/tasks/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  fs.unlink(path.join(filesDir, safeFilename), (err) => {
    if (err) return res.status(500).json({ error: 'Failed to delete task' });
    res.json({ success: true, message: 'Task deleted successfully' });
  });
});

// -------------------------------------------------------------
// SERVER INITIALIZATION
// -------------------------------------------------------------

const PRIMARY_PORT = process.env.PORT || 3000;
const server = app.listen(PRIMARY_PORT, () => {
  console.log(`====================================================`);
  console.log(`Task Manager Server running on: http://localhost:${PRIMARY_PORT}`);
  console.log(`====================================================`);
});

// Also bind to port 9000 if available, so both 3000 and 9000 work out of the box!
if (PRIMARY_PORT != 9000) {
  try {
    const secondaryServer = app.listen(9000, () => {
      console.log(`Dual-port support: Also listening on http://localhost:9000`);
    });
    secondaryServer.on('error', (err) => {
      // If 9000 is occupied or restricted, gracefully continue on PRIMARY_PORT
      console.log(`(Port 9000 notice: Primary port ${PRIMARY_PORT} is active)`);
    });
  } catch (err) {
    // Ignore secondary port bind error
  }
}
