const app = require('../app');
const port = 3000;
const syncDatabase = require('../bin/sync-database');

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);

    syncDatabase().then(() => {
        console.log('Database sync');
    });
});